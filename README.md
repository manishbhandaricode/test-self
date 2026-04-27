# Spending Analyzer and Budget Tracker

A dependency-free Python budget tracker with a Vercel-ready static dashboard
and Python serverless API.

## Local Console Usage

Run the original console report:

```bash
python spending_analyzer.py
```

## Vercel Usage

This project is ready to deploy on Vercel:

- `index.html` serves the browser dashboard.
- `api/report.py` serves the Python serverless function at `/api/report`.
- `vercel.json` marks the project as a Vercel project configuration.

Deploy with:

```bash
vercel
```
