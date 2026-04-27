"""Spending Analyzer and Budget Tracker.

This script demonstrates a simple monthly budget tracker using plain Python
data structures. It stores budget limits by category, records individual
expenses, summarizes spending, and prints a console report.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any


# Monthly budget limits by category.
# The keys are category names and the values are allocated monthly amounts.
monthly_budget: dict[str, float] = {
    "Housing": 1500.00,
    "Groceries": 450.00,
    "Transportation": 250.00,
    "Entertainment": 180.00,
    "Utilities": 220.00,
}


# Each expense is stored as a dictionary with Date, Category, Amount, and
# Description fields. A list keeps the records in the order they were added.
expenses: list[dict[str, Any]] = []


SAMPLE_EXPENSES: list[dict[str, Any]] = [
    {
        "Date": "2026-04-01",
        "Category": "Housing",
        "Amount": 1500,
        "Description": "Monthly rent",
    },
    {
        "Date": "2026-04-03",
        "Category": "Groceries",
        "Amount": "125.75",
        "Description": "Weekly supermarket run",
    },
    {
        "Date": "2026-04-07",
        "Category": "Transportation",
        "Amount": 48.50,
        "Description": "Fuel refill",
    },
    {
        "Date": "2026-04-12",
        "Category": "Entertainment",
        "Amount": 210,
        "Description": "Concert tickets",
    },
    {
        "Date": "2026-04-15",
        "Category": "Utilities",
        "Amount": 185.25,
        "Description": "Electric and water bill",
    },
]


def parse_amount(amount: float | int | str) -> float:
    """Convert an input amount to a valid positive float.

    Raises:
        ValueError: If the amount is not numeric or is less than or equal to 0.
    """
    try:
        parsed_amount = float(amount)
    except (TypeError, ValueError) as exc:
        raise ValueError("Amount must be a valid number.") from exc

    if parsed_amount <= 0:
        raise ValueError("Amount must be greater than zero.")

    return parsed_amount


def validate_date(date_text: str) -> str:
    """Validate a date string and return it in YYYY-MM-DD format.

    The program stores dates as strings to keep the expense records simple, but
    validation helps catch accidental invalid entries.
    """
    try:
        parsed_date = datetime.strptime(date_text, "%Y-%m-%d")
    except ValueError as exc:
        raise ValueError("Date must be in YYYY-MM-DD format.") from exc

    return parsed_date.strftime("%Y-%m-%d")


def add_expense(
    date: str,
    category: str,
    amount: float | int | str,
    description: str,
) -> bool:
    """Add a new expense record to the tracker.

    Args:
        date: Expense date in YYYY-MM-DD format.
        category: Budget category for the expense.
        amount: Expense amount. Numeric strings are accepted.
        description: Short note describing the purchase.

    Returns:
        True if the expense was added successfully, otherwise False.
    """
    if category not in monthly_budget:
        print(f"Error: '{category}' is not a valid budget category.")
        print(f"Valid categories: {', '.join(monthly_budget.keys())}")
        return False

    try:
        validated_date = validate_date(date)
        validated_amount = parse_amount(amount)
    except ValueError as error:
        print(f"Error: {error}")
        return False

    expense_record = {
        "Date": validated_date,
        "Category": category,
        "Amount": validated_amount,
        "Description": description.strip() or "No description",
    }
    expenses.append(expense_record)
    return True


def get_spending_summary() -> dict[str, float]:
    """Calculate total spending for every budget category."""
    summary = dict.fromkeys(monthly_budget, 0.00)

    for expense in expenses:
        category = expense["Category"]
        amount = expense["Amount"]
        summary[category] += amount

    return summary


def reset_expenses() -> None:
    """Clear all currently recorded expenses."""
    expenses.clear()


def load_expenses(expense_records: list[dict[str, Any]]) -> list[str]:
    """Load expense records and return any validation errors.

    This helper keeps the console app and the Vercel API using the same
    validation rules.
    """
    errors = []

    for index, expense_record in enumerate(expense_records, start=1):
        was_added = add_expense(
            str(expense_record.get("Date", "")),
            str(expense_record.get("Category", "")),
            expense_record.get("Amount", ""),
            str(expense_record.get("Description", "")),
        )
        if not was_added:
            errors.append(f"Expense #{index} could not be added.")

    return errors


def build_report_data() -> dict[str, Any]:
    """Build structured report data for web/API consumers."""
    spending_summary = get_spending_summary()
    categories = []
    total_budget = 0.00
    total_spent = 0.00

    for category, allocated_budget in monthly_budget.items():
        spent = spending_summary[category]
        remaining_balance = allocated_budget - spent
        categories.append(
            {
                "category": category,
                "budget": allocated_budget,
                "spent": spent,
                "remaining": remaining_balance,
                "overspent": remaining_balance < 0,
            }
        )
        total_budget += allocated_budget
        total_spent += spent

    return {
        "categories": categories,
        "totals": {
            "budget": total_budget,
            "spent": total_spent,
            "remaining": total_budget - total_spent,
        },
        "expenses": expenses,
    }


def format_currency(amount: float) -> str:
    """Format a number as a currency string."""
    return f"${amount:,.2f}"


def generate_report() -> None:
    """Print a formatted budget dashboard to the console."""
    spending_summary = get_spending_summary()

    print("\nMONTHLY SPENDING ANALYZER AND BUDGET TRACKER")
    print("=" * 70)
    print(
        f"{'Category':<18}"
        f"{'Budget':>14}"
        f"{'Spent':>14}"
        f"{'Remaining':>14}"
        f"  Status"
    )
    print("-" * 70)

    total_budget = 0.00
    total_spent = 0.00

    for category, allocated_budget in monthly_budget.items():
        spent = spending_summary[category]
        remaining_balance = allocated_budget - spent
        status = "OVERSPENT" if remaining_balance < 0 else "OK"

        print(
            f"{category:<18}"
            f"{format_currency(allocated_budget):>14}"
            f"{format_currency(spent):>14}"
            f"{format_currency(remaining_balance):>14}"
            f"  {status}"
        )

        if remaining_balance < 0:
            print(f"  Warning: {category} is over budget by {format_currency(abs(remaining_balance))}.")

        total_budget += allocated_budget
        total_spent += spent

    total_remaining = total_budget - total_spent

    print("-" * 70)
    print(
        f"{'TOTAL':<18}"
        f"{format_currency(total_budget):>14}"
        f"{format_currency(total_spent):>14}"
        f"{format_currency(total_remaining):>14}"
    )
    print("=" * 70)


if __name__ == "__main__":
    # Sample expenses show normal spending, overspending, and accepted numeric
    # strings. The report below uses these records to display the final output.
    load_expenses(SAMPLE_EXPENSES)

    # Basic error handling examples. These records will not be added.
    add_expense("2026-04-18", "Dining", 60, "Restaurant meal")
    add_expense("2026-04-20", "Groceries", "not-a-number", "Invalid amount example")

    generate_report()
