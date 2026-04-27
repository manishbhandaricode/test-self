"""Vercel Serverless Function for the spending analyzer report."""

from __future__ import annotations

import contextlib
import io
import json
import sys
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from spending_analyzer import (  # noqa: E402
    SAMPLE_EXPENSES,
    build_report_data,
    load_expenses,
    reset_monthly_budget,
    reset_expenses,
    set_monthly_budget,
)


class handler(BaseHTTPRequestHandler):
    """HTTP handler used by Vercel's Python runtime."""

    def _send_json(self, payload: dict[str, Any], status_code: int = 200) -> None:
        response_body = json.dumps(payload).encode("utf-8")

        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_body)))
        self.end_headers()
        self.wfile.write(response_body)

    def do_GET(self) -> None:
        """Return a sample budget report for the static dashboard."""
        reset_monthly_budget()
        reset_expenses()

        # The console functions print validation errors. Capture them here so
        # API responses remain clean JSON.
        with contextlib.redirect_stdout(io.StringIO()):
            errors = load_expenses(SAMPLE_EXPENSES)

        report = build_report_data()
        self._send_json({"ok": not errors, "errors": errors, "report": report})

    def do_POST(self) -> None:
        """Return a budget report for posted expense records.

        Expected JSON shape:
        {
            "expenses": [
                {
                    "Date": "2026-04-01",
                    "Category": "Groceries",
                    "Amount": 125.75,
                    "Description": "Weekly supermarket run"
                }
            ]
        }
        """
        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length)

        try:
            payload = json.loads(raw_body or b"{}")
        except json.JSONDecodeError:
            self._send_json({"ok": False, "errors": ["Request body must be valid JSON."]}, 400)
            return

        budget_records = payload.get("budget")
        if budget_records is not None and not isinstance(budget_records, dict):
            self._send_json({"ok": False, "errors": ["'budget' must be an object."]}, 400)
            return

        expense_records = payload.get("expenses")
        if not isinstance(expense_records, list):
            self._send_json({"ok": False, "errors": ["'expenses' must be a list."]}, 400)
            return

        reset_expenses()
        errors = []
        if budget_records is not None:
            errors.extend(set_monthly_budget(budget_records))

        with contextlib.redirect_stdout(io.StringIO()):
            errors.extend(load_expenses(expense_records))

        status_code = 400 if errors else 200
        self._send_json(
            {"ok": not errors, "errors": errors, "report": build_report_data()},
            status_code,
        )
