#!/usr/bin/env python3
"""
Run the Flask development server.
Usage: conda run -n venv_news python scripts/run_backend.py
"""
import subprocess
import sys
import os

os.chdir(os.path.join(os.path.dirname(__file__), ".."))
subprocess.run([sys.executable, "backend/run.py"])
