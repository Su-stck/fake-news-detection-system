@echo off
REM One-command launcher (Windows): installs deps, builds the site, serves everything on :5000
cd /d "%~dp0backend"
pip install -r requirements.txt
if not exist models\model.pkl (
  python make_sample_data.py
  python preprocess.py
  python train.py
)
cd ..\frontend
call npm install
call npm run build
cd ..\backend
echo Open http://localhost:5000
python api.py
