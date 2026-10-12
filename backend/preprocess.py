"""
preprocess.py
-------------
Loads the raw True.csv / Fake.csv files, cleans the text, and saves a single
combined, labelled CSV ready for training.

Run this after placing True.csv and Fake.csv inside the data/ folder:
    python preprocess.py
"""

import os
import re
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# A small built-in stopword list so this script has no extra downloads to fail on.
STOPWORDS = set("""
a about above after again against all am an and any are aren't as at be because
been before being below between both but by can't cannot could couldn't did
didn't do does doesn't doing don't down during each few for from further had
hadn't has hasn't have haven't having he he'd he'll he's her here here's hers
herself him himself his how how's i i'd i'll i'm i've if in into is isn't it
it's its itself let's me more most mustn't my myself no nor not of off on once
only or other ought our ours ourselves out over own same shan't she she'd
she'll she's should shouldn't so some such than that that's the their theirs
them themselves then there there's these they they'd they'll they're they've
this those through to too under until up very was wasn't we we'd we'll we're
we've were weren't what what's when when's where where's which while who
who's whom why why's with won't would wouldn't you you'd you'll you're you've
your yours yourself yourselves
""".split())

URL_RE = re.compile(r"https?://\S+|www\.\S+")
NON_ALPHA_RE = re.compile(r"[^a-z\s]")
MULTI_SPACE_RE = re.compile(r"\s+")


def clean_text(text: str) -> str:
    """Lowercase, strip URLs/punctuation/numbers, drop stopwords and short tokens."""
    text = str(text).lower()
    text = URL_RE.sub(" ", text)
    text = NON_ALPHA_RE.sub(" ", text)
    tokens = [t for t in text.split() if t not in STOPWORDS and len(t) > 2]
    text = " ".join(tokens)
    return MULTI_SPACE_RE.sub(" ", text).strip()


def load_and_prepare(true_csv: str, fake_csv: str) -> pd.DataFrame:
    true_df = pd.read_csv(true_csv)
    fake_df = pd.read_csv(fake_csv)

    true_df["label"] = 1  # REAL
    fake_df["label"] = 0  # FAKE

    df = pd.concat([true_df, fake_df], ignore_index=True)

    if "text" not in df.columns:
        raise ValueError(
            "Expected a 'text' column in the dataset. Found columns: "
            + str(df.columns.tolist())
        )

    # Combine title + body when a title column exists (Kaggle Fake/Real News dataset has one).
    if "title" in df.columns:
        df["content"] = df["title"].fillna("") + " " + df["text"].fillna("")
    else:
        df["content"] = df["text"].fillna("")

    df = df[["content", "label"]].dropna()
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)  # shuffle

    print("Cleaning text... this can take a minute on the full dataset.")
    df["clean_content"] = df["content"].apply(clean_text)
    df = df[df["clean_content"].str.len() > 0]

    return df[["clean_content", "label"]]


if __name__ == "__main__":
    data_dir = os.path.join(BASE_DIR, "data")
    os.makedirs(data_dir, exist_ok=True)
    true_path = os.path.join(data_dir, "True.csv")
    fake_path = os.path.join(data_dir, "Fake.csv")

    if not (os.path.exists(true_path) and os.path.exists(fake_path)):
        raise SystemExit(
            f"Could not find {true_path} and {fake_path}.\n"
            "Download the dataset (see README.md) and place both CSV files in the data/ folder,\n"
            "or run `python make_sample_data.py` to generate a synthetic demo dataset."
        )

    df = load_and_prepare(true_path, fake_path)
    out_path = os.path.join(data_dir, "clean_data.csv")
    df.to_csv(out_path, index=False)

    print(f"Saved {len(df)} cleaned rows to {out_path}")
    print(df["label"].value_counts())
