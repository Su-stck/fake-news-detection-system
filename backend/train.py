"""
train.py
--------
Trains and compares three classic ML models on the cleaned dataset, prints
evaluation metrics for each, and saves the best-performing model + vectorizer
to the models/ folder.

Run after preprocess.py has produced data/clean_data.csv:
    python train.py
"""

import json
import os
import time

import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "clean_data.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")


def main():
    if not os.path.exists(DATA_PATH):
        raise SystemExit(f"{DATA_PATH} not found. Run preprocess.py first.")

    df = pd.read_csv(DATA_PATH).dropna()

    X_train, X_test, y_train, y_test = train_test_split(
        df["clean_content"], df["label"], test_size=0.2, random_state=42, stratify=df["label"]
    )

    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000),
        "Naive Bayes": MultinomialNB(),
        "Linear SVM": LinearSVC(),
    }

    best_name, best_model, best_f1 = None, None, -1
    all_metrics = []

    for name, model in models.items():
        model.fit(X_train_vec, y_train)
        preds = model.predict(X_test_vec)

        acc = accuracy_score(y_test, preds)
        prec = precision_score(y_test, preds)
        rec = recall_score(y_test, preds)
        f1 = f1_score(y_test, preds)

        print(f"\n=== {name} ===")
        print(f"Accuracy:  {acc:.4f}")
        print(f"Precision: {prec:.4f}")
        print(f"Recall:    {rec:.4f}")
        print(f"F1-score:  {f1:.4f}")
        print("Confusion matrix:\n", confusion_matrix(y_test, preds))

        all_metrics.append({
            "name": name,
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1": round(float(f1), 4),
            "confusion_matrix": confusion_matrix(y_test, preds).tolist(),
        })

        if f1 > best_f1:
            best_name, best_model, best_f1 = name, model, f1

    print(f"\n>>> Best model: {best_name} (F1={best_f1:.4f})")
    print(
        "\nDetailed report for best model:\n",
        classification_report(y_test, best_model.predict(X_test_vec), target_names=["FAKE", "REAL"]),
    )

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(best_model, os.path.join(MODEL_DIR, "model.pkl"))
    joblib.dump(vectorizer, os.path.join(MODEL_DIR, "vectorizer.pkl"))
    with open(os.path.join(MODEL_DIR, "metrics.json"), "w") as fh:
        json.dump({
            "best_model": best_name,
            # the bundled synthetic set is ~5k rows; the Kaggle dataset is ~44k
            "is_demo_data": bool(len(df) < 20000),
            "train_rows": int(len(X_train)),
            "test_rows": int(len(X_test)),
            "trained_at": time.strftime("%Y-%m-%d %H:%M"),
            "models": all_metrics,
        }, fh, indent=2)
    print(f"\nSaved best model, vectorizer and metrics.json to '{MODEL_DIR}/'")


if __name__ == "__main__":
    main()
