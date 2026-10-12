"""
api.py — Flask API for the Fake News Detector

Serves the model trained by train.py (models/model.pkl, models/vectorizer.pkl)
and reuses clean_text() from preprocess.py so text is cleaned exactly as it was
during training.

Run:
    python api.py                 -> http://localhost:5000

Endpoints:
    POST /api/predict   {"text": "..."}  ->
        {label, confidence, probabilities, cleaned_tokens, word_count,
         signals: [{word, weight, direction}]}
    GET  /api/metrics   evaluation numbers written by train.py
    GET  /api/health    {"status": "ok", "model_loaded": bool}

If frontend/dist exists (after `npm run build`), the site is also served from
http://localhost:5000 so the whole project runs from a single command.
"""

import json
import math
import os

import joblib
import numpy as np
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from preprocess import clean_text

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "models", "vectorizer.pkl")
METRICS_PATH = os.path.join(BASE_DIR, "models", "metrics.json")
DIST_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend", "dist"))

MIN_WORDS = 6   # matches the guard in predict_cli.py
MAX_CHARS = 20000

app = Flask(__name__, static_folder=None)
CORS(app)  # allow the Vite dev server (different port) to call this API

_model = None
_vectorizer = None


def get_model():
    global _model, _vectorizer
    if _model is None:
        if not (os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH)):
            raise FileNotFoundError(
                "No trained model found. Run preprocess.py and train.py first "
                "(or make_sample_data.py for demo data)."
            )
        _model = joblib.load(MODEL_PATH)
        _vectorizer = joblib.load(VECTORIZER_PATH)
    return _model, _vectorizer


def estimate_probabilities(clf, vec):
    """Return P(FAKE), P(REAL) for probability models and margin models (SVM)."""
    if hasattr(clf, "predict_proba"):
        p = clf.predict_proba(vec)[0]
        return float(p[0]), float(p[1])
    if hasattr(clf, "decision_function"):
        score = float(clf.decision_function(vec)[0])
        real = 1 / (1 + math.exp(-score))
        return 1 - real, real
    return None, None


def feature_weights(clf):
    """Per-feature weight; positive pushes toward REAL, negative toward FAKE."""
    if hasattr(clf, "coef_"):
        return np.asarray(clf.coef_).ravel()
    if hasattr(clf, "feature_log_prob_"):
        return clf.feature_log_prob_[1] - clf.feature_log_prob_[0]
    return None


def explain(clf, vectorizer, vec, top=8):
    """Words in this text that influenced the verdict most."""
    weights = feature_weights(clf)
    if weights is None:
        return []
    names = vectorizer.get_feature_names_out()
    row = vec.tocoo()
    items = []
    for idx, val in zip(row.col, row.data):
        w = float(weights[idx] * val)
        items.append({"word": str(names[idx]), "weight": round(w, 4),
                      "direction": "REAL" if w > 0 else "FAKE"})
    items.sort(key=lambda x: abs(x["weight"]), reverse=True)
    return items[:top]


@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()

    if not text:
        return jsonify({"error": "No text provided."}), 400
    if len(text) > MAX_CHARS:
        text = text[:MAX_CHARS]

    cleaned = clean_text(text)
    tokens = cleaned.split()

    if len(tokens) < MIN_WORDS:
        return jsonify({
            "error": "That's too short for a reliable prediction. "
                     "Paste a full headline or a few sentences of article text."
        }), 400

    try:
        clf, vectorizer = get_model()
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 503

    vec = vectorizer.transform([cleaned])
    pred = int(clf.predict(vec)[0])
    p_fake, p_real = estimate_probabilities(clf, vec)
    confidence = None if p_real is None else (p_real if pred == 1 else p_fake)

    return jsonify({
        "label": "REAL" if pred == 1 else "FAKE",
        "confidence": confidence,
        "probabilities": None if p_real is None else {"FAKE": p_fake, "REAL": p_real},
        "word_count": len(text.split()),
        "cleaned_tokens": tokens[:60],
        "signals": explain(clf, vectorizer, vec),
    })


@app.route("/api/metrics", methods=["GET"])
def metrics():
    if not os.path.exists(METRICS_PATH):
        return jsonify({"error": "metrics.json not found. Run train.py."}), 404
    with open(METRICS_PATH) as fh:
        return jsonify(json.load(fh))


@app.route("/api/health", methods=["GET"])
def health():
    loaded = os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH)
    return jsonify({"status": "ok", "model_loaded": loaded})


# ---- Optional: serve the built frontend (npm run build) from this same server ----
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def frontend(path):
    if not os.path.isdir(DIST_DIR):
        return jsonify({"message": "API is running. Start the frontend with `npm run dev` "
                                   "inside frontend/, or run `npm run build` to serve it here."})
    full = os.path.join(DIST_DIR, path)
    if path and os.path.isfile(full):
        return send_from_directory(DIST_DIR, path)
    return send_from_directory(DIST_DIR, "index.html")


if __name__ == "__main__":
    app.run(debug=True, port=int(os.environ.get("PORT", 5000)))
