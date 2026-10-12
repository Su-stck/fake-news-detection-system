"""
streamlit_app.py
----------------
A minimal Streamlit web app to demo the trained model.

Run after training:
    streamlit run streamlit_app.py
"""

import os

import streamlit as st
import joblib
from preprocess import clean_text

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

st.set_page_config(page_title="Fake News Detector", page_icon="📰")


@st.cache_resource
def load_artifacts():
    model = joblib.load(os.path.join(BASE_DIR, "models", "model.pkl"))
    vectorizer = joblib.load(os.path.join(BASE_DIR, "models", "vectorizer.pkl"))
    return model, vectorizer


st.title("📰 Fake News Detector")
st.write("Paste a news headline or article below to check if it looks REAL or FAKE.")

text = st.text_area("News text", height=200, placeholder="Paste article text here...")

if st.button("Check"):
    if not text.strip():
        st.warning("Please paste some text first.")
    else:
        cleaned = clean_text(text)

        if len(cleaned.split()) < 6:
            st.warning(
                "That's too short for a reliable prediction. "
                "Paste a full headline or a few sentences of article text instead of a bare keyword or phrase."
            )
        else:
            model, vectorizer = load_artifacts()
            vec = vectorizer.transform([cleaned])
            pred = model.predict(vec)[0]

            if pred == 1:
                st.success("✅ This looks REAL.")
            else:
                st.error("🚩 This looks FAKE.")

st.caption("Note: This is a college minor project demo, not a certified fact-checking tool.")
