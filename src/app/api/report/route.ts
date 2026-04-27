import { NextResponse } from "next/server";
import { calculateReport, currentMonth, demoState, emptyState, type AppState } from "@/lib/finance";

export const runtime = "nodejs";

export async function GET() {
  const month = currentMonth();
  const state = demoState(month);
  return NextResponse.json({
    ok: true,
    report: calculateReport(state, month),
  });
}

export async function POST(request: Request) {
  let payload: Partial<AppState> & { month?: string };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: ["Request body must be valid JSON."] }, { status: 400 });
  }

  const month = typeof payload.month === "string" ? payload.month : currentMonth();
  const state: AppState = {
    salary: Number(payload.salary) || emptyState.salary,
    monthlyBudget: Number(payload.monthlyBudget) || emptyState.monthlyBudget,
    categories: Array.isArray(payload.categories) ? payload.categories : emptyState.categories,
    transactions: Array.isArray(payload.transactions) ? payload.transactions : emptyState.transactions,
  };

  return NextResponse.json({
    ok: true,
    report: calculateReport(state, month),
  });
}
