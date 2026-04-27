export type Theme = "dark" | "light";
export type View = "Overview" | "Transactions" | "Budgets" | "Insights" | "Reports" | "Settings";
export type PaymentMode = "UPI" | "Cash" | "Card" | "Bank";

export type Category = {
  id: string;
  name: string;
  limit: number;
  icon: string;
  color: string;
};

export type Transaction = {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  paymentMode: PaymentMode;
};

export type AppState = {
  salary: number;
  monthlyBudget: number;
  categories: Category[];
  transactions: Transaction[];
};

export type Report = {
  salary: number;
  monthlyBudget: number;
  totalSpent: number;
  budgetLeft: number;
  actualSavings: number;
  plannedSavings: number;
  savingsRate: number;
  budgetUsedPercent: number;
  monthProgressPercent: number;
  projectedTotalSpend: number;
  projectedSavings: number;
  daysRemaining: number;
  safeToSpendPerDay: number;
  categoryStats: Array<Category & { spent: number; remaining: number; usage: number }>;
  monthTransactions: Transaction[];
  healthStatus: "Excellent" | "Stable" | "Watch" | "Critical";
};

export const QUICK_CATEGORIES = ["Food", "Rent", "Transport", "Shopping", "Bills", "Subscriptions", "Health", "Other"];
export const PAYMENT_MODES: PaymentMode[] = ["UPI", "Cash", "Card", "Bank"];
export const NAV_ITEMS: View[] = ["Overview", "Transactions", "Budgets", "Insights", "Reports", "Settings"];
export const MOBILE_ITEMS: Array<View | "Add"> = ["Overview", "Transactions", "Add", "Insights", "Settings"];

export const emptyState: AppState = {
  salary: 0,
  monthlyBudget: 0,
  categories: [],
  transactions: [],
};

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function category(name: string, limit: number, icon = name[0] || "-", color = "#00E6A8"): Category {
  return { id: createId(), name, limit, icon, color };
}

export function transaction(
  merchant: string,
  amount: number,
  categoryName: string,
  date: string,
  description = "",
  paymentMode: PaymentMode = "UPI",
): Transaction {
  return { id: createId(), merchant, amount, category: categoryName, date, description, paymentMode };
}

export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function monthLabel(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(year, monthIndex - 1, 1));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(value));
}

export function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

export function daysInMonth(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, monthIndex, 0).getDate();
}

export function monthProgress(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const now = new Date();
  const total = daysInMonth(month);
  const current = now.getFullYear() === year && now.getMonth() + 1 === monthIndex ? now.getDate() : total;
  return (current / total) * 100;
}

export function daysRemaining(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const now = new Date();
  const total = daysInMonth(month);
  if (now.getFullYear() !== year || now.getMonth() + 1 !== monthIndex) return total;
  return Math.max(total - now.getDate() + 1, 1);
}

export function calculateReport(state: AppState, selectedMonth: string): Report {
  const monthTransactions = state.transactions.filter((item) => item.date.startsWith(selectedMonth));
  const totalSpent = monthTransactions.reduce((sum, item) => sum + Number(item.amount), 0);
  const salary = Number(state.salary) || 0;
  const monthlyBudget = Number(state.monthlyBudget) || 0;
  const budgetLeft = monthlyBudget - totalSpent;
  const actualSavings = salary - totalSpent;
  const plannedSavings = salary - monthlyBudget;
  const savingsRate = salary > 0 ? (actualSavings / salary) * 100 : 0;
  const budgetUsedPercent = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  const monthProgressPercent = monthProgress(selectedMonth);
  const projectedTotalSpend = monthProgressPercent > 0 ? (totalSpent / monthProgressPercent) * 100 : totalSpent;
  const projectedSavings = salary - projectedTotalSpend;
  const remainingDays = daysRemaining(selectedMonth);
  const safeToSpendPerDay = Math.max(budgetLeft / Math.max(remainingDays, 1), 0);
  const categoryStats = state.categories
    .map((item) => {
      const spent = monthTransactions
        .filter((transactionItem) => transactionItem.category === item.name)
        .reduce((sum, transactionItem) => sum + Number(transactionItem.amount), 0);
      return {
        ...item,
        spent,
        remaining: Number(item.limit) - spent,
        usage: item.limit > 0 ? (spent / item.limit) * 100 : 0,
      };
    })
    .sort((a, b) => b.usage - a.usage);
  const healthStatus =
    budgetLeft < 0 || budgetUsedPercent >= 100
      ? "Critical"
      : budgetUsedPercent > monthProgressPercent + 15
        ? "Watch"
        : savingsRate >= 35
          ? "Excellent"
          : "Stable";

  return {
    salary,
    monthlyBudget,
    totalSpent,
    budgetLeft,
    actualSavings,
    plannedSavings,
    savingsRate,
    budgetUsedPercent,
    monthProgressPercent,
    projectedTotalSpend,
    projectedSavings,
    daysRemaining: remainingDays,
    safeToSpendPerDay,
    categoryStats,
    monthTransactions,
    healthStatus,
  };
}

export function demoState(selectedMonth: string): AppState {
  const transactions: Array<[string, string, number, number, string, PaymentMode]> = [
    ["Rent", "Rent", 18000, 1, "Monthly rent", "Bank"],
    ["BigBasket groceries", "Food", 2650, 2, "Weekly groceries", "UPI"],
    ["Swiggy", "Food", 780, 3, "Dinner order", "UPI"],
    ["Zomato", "Food", 640, 4, "Lunch", "UPI"],
    ["Uber", "Transport", 520, 5, "Cab ride", "UPI"],
    ["Metro recharge", "Transport", 1000, 6, "Monthly commute", "UPI"],
    ["Electricity bill", "Bills", 1850, 7, "Power bill", "Bank"],
    ["Mobile recharge", "Bills", 399, 8, "Prepaid recharge", "UPI"],
    ["Netflix", "Subscriptions", 649, 9, "Streaming", "Card"],
    ["Spotify", "Subscriptions", 119, 10, "Music subscription", "Card"],
    ["Amazon", "Shopping", 2199, 11, "Home essentials", "Card"],
    ["Pharmacy", "Health", 1250, 12, "Medicines", "UPI"],
    ["Coffee", "Food", 320, 13, "Cafe meeting", "UPI"],
    ["Restaurant", "Food", 1850, 14, "Dining out", "Card"],
    ["Fuel", "Transport", 2500, 15, "Petrol refill", "Card"],
    ["UPI transfer", "Other", 900, 16, "Personal transfer", "UPI"],
    ["Gym", "Health", 999, 17, "Fitness class", "UPI"],
    ["Doctor visit", "Health", 1200, 18, "Consultation", "UPI"],
    ["Groceries", "Food", 3150, 20, "Monthly stock-up", "Card"],
    ["Miscellaneous", "Other", 750, 22, "Small purchases", "Cash"],
  ];

  return {
    salary: 80000,
    monthlyBudget: 45000,
    categories: [
      category("Rent", 18000, "R", "#38BDF8"),
      category("Food", 9000, "F", "#00E6A8"),
      category("Transport", 4000, "T", "#FBBF24"),
      category("Shopping", 5000, "S", "#FB7185"),
      category("Bills", 4000, "B", "#0284C7"),
      category("Subscriptions", 2000, "P", "#8B5CF6"),
      category("Health", 3000, "H", "#34D399"),
      category("Other", 5000, "O", "#94A3B8"),
    ],
    transactions: transactions.map(([merchant, categoryName, amount, day, description, paymentMode]) =>
      transaction(merchant, amount, categoryName, `${selectedMonth}-${String(day).padStart(2, "0")}`, description, paymentMode),
    ),
  };
}
