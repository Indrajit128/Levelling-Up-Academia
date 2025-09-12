from fastapi import FastAPI
from fastapi.responses import JSONResponse
import json
import os

app = FastAPI(title="AII MVP Backend")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

@app.get("/health")
async def health():
    return JSONResponse({"status": "ok"})

@app.get("/sample/publications")
async def sample_publications():
    path = os.path.join(DATA_DIR, "publications.json")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return JSONResponse({"count": len(data), "items": data})

@app.get("/sample/feedback")
async def sample_feedback():
    path = os.path.join(DATA_DIR, "feedback.json")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return JSONResponse({"count": len(data), "items": data})
