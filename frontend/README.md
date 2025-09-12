Frontend (Vite + React)

Quickstart

1. Install Node 16+ and npm/yarn.
2. From `frontend/` install dependencies:

   npm install

3. Start dev server:

   npm run dev

Configuration

- The frontend expects the backend API at `http://127.0.0.1:8001` by default. To change, set environment variable `VITE_API_BASE` when running Vite.

Example:

VITE_API_BASE="http://127.0.0.1:8000" npm run dev

Notes

This is a minimal UI to visualize sample Publications and Student Feedback records. Expand with routing, authentication, and visual components (Plotly) in later tasks.
