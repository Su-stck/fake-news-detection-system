"""
predict_cli.py
--------------
Quick command-line check of a single headline or article using the trained model.

Usage:
    python predict_cli.py "Scientists confirm the moon is made of cheese"
    python predict_cli.py            (then paste text when prompted)
"""

import os
import sys
import joblib
from preprocess import clean_text


BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def main():
    model = joblib.load(os.path.join(BASE_DIR, "models", "model.pkl"))
    vectorizer = joblib.load(os.path.join(BASE_DIR, "models", "vectorizer.pkl"))

    if len(sys.argv) > 1:
        text = " ".join(sys.argv[1:])
    else:
        text = input("Paste a news headline or article text:\n> ")

    cleaned = clean_text(text)

    if len(cleaned.split()) < 6:
        print(
            "\nThat's too short for a reliable prediction. "
            "Paste a full headline or a few sentences of article text instead of a bare keyword or phrase."
        )
        return

    vec = vectorizer.transform([cleaned])
    pred = model.predict(vec)[0]

    label = "REAL" if pred == 1 else "FAKE"
    print(f"\nPrediction: {label}")


if __name__ == "__main__":
    main()
