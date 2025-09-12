Levelling Up Academia — Academic Impact Index (AII)

Overview

This repository contains an MVP scaffold for the Levelling Up Academia project (AII). It includes:
- Minimal FastAPI backend for health & sample endpoints
- Sample data in `data/` for Publications and Student Feedback
- `requirements.txt` and `Dockerfile` for local development

Quickstart

1. Create and activate a Python 3.10+ venv.
2. Install dependencies:

   # Install core (fast to install locally)
   pip install -r requirements.txt

# Optional: install heavy ML/extras (use CI or a machine with build tools)
   pip install -r requirements-extras.txt

3. Run the FastAPI dev server:

   uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000

Files

- `src/app/main.py`: Minimal FastAPI app with health and sample GET endpoints.
- `data/publications.json`: Sample publication records.
- `data/feedback.json`: Sample student feedback records.
- `requirements.txt`: Python dependencies.
- `Dockerfile`: Containerizes the FastAPI app.
- `.gitignore`: Common ignores.

Notes

This scaffold is intentionally minimal. Next steps: implement ingestion connectors, feature extraction scripts, and frontend dashboard.

Developer notes
- Use `requirements-core.txt` / `requirements-extras.txt` split to avoid heavy local builds on Windows.
- CI runs on Ubuntu and installs extras to ensure full tests run in a reproducible environment.
