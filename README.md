# RupeeFlow Spending Analyzer

A premium Next.js, React, Tailwind CSS, and Node.js personal finance dashboard
for Indian rupee budgeting. It tracks monthly salary, spending budget, category
limits, real expenses, safe-to-spend, savings rate, projected savings, budget
burn, budget health, and smart insights.

The app uses the Next.js App Router, TypeScript, Framer Motion interactions,
Tailwind CSS, localStorage persistence, responsive desktop/mobile navigation,
modal and drawer workflows, SVG charts, transaction filtering/export, theme
persistence, and destructive reset confirmation with `RESET`.

## Local Web Usage

Install dependencies and run the Next.js development server:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Local Console Usage

Run the original console report:

```bash
python spending_analyzer.py
```

## Vercel Usage

This project is ready to deploy on Vercel:

- `src/app/page.tsx` serves the Next.js dashboard.
- `api/report.py` serves the Python serverless function at `/api/report`.
- `package.json` provides the Node.js build scripts Vercel detects.

Deploy with:

```bash
vercel
```
