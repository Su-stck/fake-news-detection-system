#!/usr/bin/env bash
# One-command launcher (Mac/Linux): installs deps, builds the site, serves everything on :5000
set -e
cd "$(dirname "$0")/backend"
python3 -m pip install -q -r requirements.txt
[ -f models/model.pkl ] || { python3 make_sample_data.py && python3 preprocess.py && python3 train.py; }
cd ../frontend && npm install --no-audit --no-fund && npm run build
cd ../backend && echo "Open http://localhost:5000" && python3 api.py
