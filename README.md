# Spending Analyzer and Budget Tracker

A dependency-free Python budget tracker with a Vercel-ready premium dashboard,
monthly salary planning, editable spend targets, custom budget categories,
real expense entry, INR formatting, savings tracking, browser storage, and a
Python serverless API. The dashboard includes an interactive savings meter that
changes color as the savings rate improves or drops. It also supports light and
dark themes with high-contrast brand colors: `#092C95` for light mode and
`#07BB67` for dark mode. Plan fields preview live before saving, invalid plans
are blocked, and reset uses a destructive confirmation flow.

The web dashboard is designed as a personal finance SaaS command center with
an app shell, empty state onboarding, modals for expenses and categories, smart
insights, SVG charts, budget health, transaction search/filtering, and a
destructive reset confirmation flow.

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
