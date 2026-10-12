# The Verification Desk — Fake News Detection (full project)

Classifies a news headline or article as **REAL** or **FAKE**, shows the model's confidence and the
words that drove the verdict. Complete stack: ML training → Flask API → animated React website.

## Quick start (works out of the box)

A synthetic demo dataset and an already-trained model are included, so you can run it immediately.

**Mac/Linux:** `./start.sh`  **Windows:** double-click `start.bat`
→ open **http://localhost:5000** (the Flask server serves the built website too).

### Or run the two halves separately (best for development)

```bash
# terminal 1 — API
cd backend
pip install -r requirements.txt
python api.py                     # http://localhost:5000

# terminal 2 — website with hot reload
cd frontend
npm install
npm run dev                       # http://localhost:5173  (calls /api via Vite proxy)
```

## What was added / completed in this version

- **Backend:** `make_sample_data.py` (synthetic demo data so nothing needs downloading), absolute paths
  (scripts work from any folder), `train.py` now writes `models/metrics.json`, the API returns
  probabilities, the **words that influenced the verdict**, cleaned tokens, plus `/api/metrics`;
  the API can also serve the built website.
- **Frontend:** Lenis smooth scrolling, intro curtain, word-by-word headline reveals, scroll-linked
  parallax clippings, velocity-reactive ticker, animated counters, a **pinned scroll-story** that
  walks through the pipeline, an ink-stamp verdict with screen shake, confidence ring, influence
  bars, recent-checks history, live model-comparison section with confusion matrix, FAQ accordion,
  magnetic buttons and a custom cursor. Respects `prefers-reduced-motion`; responsive down to phones.

> **Important for your report:** the bundled data is *synthetic* (template-generated, ~94% accuracy by
> design). For real results download the Kaggle dataset below and retrain — the website's Results
> section updates automatically and drops the "demo data" banner.

---

## Project layout

```
fake_news_project/
├── start.sh / start.bat       # one-command launchers
├── backend/
│   ├── data/              # True.csv and Fake.csv (demo data included; replace with Kaggle)
│   ├── make_sample_data.py  # generates the synthetic demo dataset
│   ├── models/             # trained model + vectorizer are saved here
│   ├── preprocess.py       # text cleaning + dataset prep
│   ├── train.py             # trains & evaluates 3 models, saves the best one
│   ├── predict_cli.py       # command-line prediction on custom text
│   ├── api.py                # Flask API (+ serves built site)
│   ├── streamlit_app.py      # optional standalone Streamlit demo
│   └── requirements.txt
└── frontend/
    ├── src/App.jsx            # "The Verification Desk" UI
    ├── src/index.css
    └── package.json
```

Everything reads from and writes to the **same** `backend/models/` folder —
train once, and both `api.py` and `predict_cli.py` pick it up automatically.
No copying files between folders.

## 1. Set up the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows; use "source venv/bin/activate" on Mac/Linux
pip install -r requirements.txt
```

## 2. Get the dataset

Download **"Fake and Real News Dataset"** from Kaggle:
https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset

Place `True.csv` and `Fake.csv` directly inside `backend/data/`.

## 3. Clean the data and train the model

```bash
python preprocess.py
python train.py
```

`train.py` prints accuracy/precision/recall/F1 and a confusion matrix for
Logistic Regression, Naive Bayes, and Linear SVM, then saves the best one to
`backend/models/model.pkl` and `backend/models/vectorizer.pkl`.

## 4. Start the API

Still inside `backend/`:

```bash
python api.py
```

You should see `Running on http://127.0.0.1:5000`. Leave this running.

Check it's alive from another terminal:
```bash
curl http://localhost:5000/api/health
```

## 5. Start the React frontend

In a **new** terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the printed URL (usually `http://localhost:5173`). Paste a headline or
article and click **"Render a verdict."**

## Other ways to use the model

- **Command line:** `python predict_cli.py "some headline here"` (run from
  inside `backend/`)
- **Standalone Streamlit demo** (no React/Flask needed):
  ```bash
  streamlit run streamlit_app.py
  ```

## Troubleshooting

| Problem | Fix |
|---|---|
| `Could not find data\True.csv and data\Fake.csv` | Download the dataset (step 2) and place both files in `backend/data/`. |
| `data\clean_data.csv not found` | Run `python preprocess.py` before `train.py`. |
| `Could not find models/model.pkl...` in the API | Run `python preprocess.py` then `python train.py` before starting `api.py`. |
| "Couldn't reach the prediction server" in the browser | `api.py` isn't running, or crashed — check that terminal for errors. |
| `pyarrow` build fails when installing Streamlit | You're likely on a very new Python version. Either skip Streamlit (`pip install pandas numpy scikit-learn joblib flask flask-cors` only) or install Python 3.12 in a separate venv. |
| Website says "Couldn't reach the prediction server" | Start `python api.py` (dev mode proxies `/api` to port 5000). |
| Prediction seems random on very short input | Both `predict_cli.py` and the web app require at least 6 meaningful words — paste a full headline or a few sentences, not a bare keyword. |

## Design note

The frontend is a full scrolling site (React + Framer Motion + Lenis),
one component per section in `frontend/src/components/`
(Preloader, Cursor, Navbar, Hero, Ticker, Stats, HowItWorks, Detector, Metrics, TechStack, Faq, Footer).
The original sections, now extended:

- **Hero.jsx** — parallax headline that drifts as you scroll, staggered
  entrance animation, and a scroll-down CTA
- **HowItWorks.jsx** — four steps that fade/slide in as you scroll to them
- **Detector.jsx** — the working tool (paper-style input + ink-stamp verdict,
  same one that talks to the Flask API)
- **TechStack.jsx** — a staggered reveal grid
- **Navbar.jsx** — sticky nav with a scroll progress bar underneath it

Colors are CSS variables at the top of `frontend/src/index.css` (the `:root`
block) — change those to re-theme the whole site in one place.

## For your report

Use this as your architecture diagram:

```
React frontend (5173) --POST /api/predict--> Flask API (5000) --> scikit-learn model (TF-IDF + Logistic Regression/SVM)
```

This is a legitimate full-stack ML architecture, worth calling out explicitly
in your Technology Stack section: frontend, backend API, and ML layer are
cleanly separated.
