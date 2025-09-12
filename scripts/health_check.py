#!/usr/bin/env python3
"""Simple health check script for the AII MVP backend.

Usage:
  python scripts/health_check.py [URL]
If URL not provided, uses HEALTH_URL env var or default http://127.0.0.1:8001/health
"""
import sys
import os
import requests

DEFAULT_URL = "http://127.0.0.1:8001/health"

def main():
    url = DEFAULT_URL
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = os.environ.get("HEALTH_URL", DEFAULT_URL)

    try:
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        print(r.json())
    except requests.exceptions.RequestException as e:
        print("ERROR: request failed:\n", repr(e), file=sys.stderr)
        sys.exit(2)
    except Exception as e:
        print("ERROR:", repr(e), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
