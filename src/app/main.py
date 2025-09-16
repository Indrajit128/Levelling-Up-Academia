from fastapi import FastAPI
from fastapi.responses import JSONResponse
import json
import os
from fastapi import Body
from datetime import datetime
import re
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AII MVP Backend")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

USER_WEIGHTS_PATH = os.path.join(DATA_DIR, 'user_weights.json')

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


@app.post('/ai/analyze')
async def ai_analyze(payload: dict = Body(...)):
    """Lightweight, local 'AI' analysis endpoint.

    This is a deterministic, explainable helper that inspects the user's text
    and suggests simple weight adjustments for the AII rubric. It's intentionally
    lightweight so it requires no large ML deps and is safe to run locally.
    """
    text = (payload.get('text') or '').strip()
    if not text:
        return JSONResponse({"ok": False, "error": "empty prompt"}, status_code=400)

    # simple normalization and keyword extraction
    s = text.lower()
    tokens = re.findall(r"\\w+", s)
    stop = set(["the","and","is","in","of","to","a","for","on","with","that","this","as","by","an","are","we","be"]) 
    keywords = [t for t in tokens if t not in stop]
    kw_counts = {}
    for k in keywords:
        kw_counts[k] = kw_counts.get(k, 0) + 1

    sorted_kws = sorted(kw_counts.items(), key=lambda x: x[1], reverse=True)
    top_kws = [k for k,_ in sorted_kws[:8]]

    # rule-based suggestions
    suggested = {"research": 0, "teaching": 0, "collaboration": 0, "outreach": 0}
    reasons = []
    text_len = len(tokens)
    if any(k in kw_counts for k in ("citation", "citations", "impact", "h-index", "cites")):
        suggested['research'] += 10
        reasons.append('text mentions citations/impact \u2192 boost research')
    if any(k in kw_counts for k in ("teaching", "lecture", "student", "curriculum", "course")):
        suggested['teaching'] += 12
        reasons.append('mentions teaching or students \u2192 boost teaching')
    if any(k in kw_counts for k in ("collaborat", "team", "co-author", "coauthor", "partnership", "partner")):
        suggested['collaboration'] += 10
        reasons.append('mentions collaboration \u2192 boost collaboration')
    if any(k in kw_counts for k in ("media", "outreach", "blog", "press", "public")):
        suggested['outreach'] += 10
        reasons.append('mentions public outreach/media \u2192 boost outreach')

    # length-based heuristic: longer prompts often ask for balanced suggestions
    if text_len > 40:
        suggested = {k: int(v*0.7) for k,v in suggested.items()}
        reasons.append('long prompt \u2192 moderate adjustments')

    # produce a friendly reply
    reply = {
        'ok': True,
        'reply_text': f"Analyzed {text_len} tokens. Top keywords: {', '.join(top_kws[:5]) if top_kws else 'none'}.",
        'suggested_weights_delta': suggested,
        'explanation': reasons,
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }

    return JSONResponse(reply)


@app.get('/user/weights')
async def get_user_weights(user_id: str = 'default'):
    """Return stored weights for a user (defaults to 'default')."""
    try:
        if os.path.exists(USER_WEIGHTS_PATH):
            with open(USER_WEIGHTS_PATH, 'r', encoding='utf-8') as f:
                store = json.load(f)
        else:
            store = {}
        return JSONResponse({'ok': True, 'weights': store.get(user_id)})
    except Exception as e:
        return JSONResponse({'ok': False, 'error': str(e)}, status_code=500)


@app.post('/user/weights')
async def post_user_weights(payload: dict = Body(...)):
    """Save weights for a user. payload should include user_id and weights dict."""
    user_id = payload.get('user_id', 'default')
    weights = payload.get('weights')
    if not isinstance(weights, dict):
        return JSONResponse({'ok': False, 'error': 'weights must be a dict'}, status_code=400)
    try:
        if os.path.exists(USER_WEIGHTS_PATH):
            with open(USER_WEIGHTS_PATH, 'r', encoding='utf-8') as f:
                store = json.load(f)
        else:
            store = {}
        store[user_id] = weights
        with open(USER_WEIGHTS_PATH, 'w', encoding='utf-8') as f:
            json.dump(store, f, indent=2)
        return JSONResponse({'ok': True})
    except Exception as e:
        return JSONResponse({'ok': False, 'error': str(e)}, status_code=500)
