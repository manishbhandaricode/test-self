# RupeeFlow Spending Analyzer

A dependency-free personal finance SaaS-style dashboard for Indian rupee
budgeting. It tracks monthly salary, Spending Budget, categories, transactions,
safe-to-spend, savings rate, projected savings, budget burn, and smart insights.

The web dashboard includes an app shell, desktop sidebar, mobile bottom nav,
empty state onboarding, edit-plan drawer, expense/category modals, SVG charts,
budget health, transaction search/filter/sort/export, JSON import/export,
light/dark themes, toast notifications, undo delete, and destructive reset
confirmation with `RESET`.

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
