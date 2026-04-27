"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AppState,
  Category,
  MOBILE_ITEMS,
  NAV_ITEMS,
  PAYMENT_MODES,
  PaymentMode,
  QUICK_CATEGORIES,
  Report,
  Theme,
  Transaction,
  View,
  calculateReport,
  category,
  clamp,
  currentMonth,
  demoState,
  emptyState,
  formatDate,
  money,
  monthLabel,
  today,
  transaction,
} from "@/lib/finance";

const STORAGE_KEY = "rupeeflow-next-state-v1";
const THEME_KEY = "rupeeflow-next-theme";
const MONTH_KEY = "rupeeflow-next-month";

type Filters = {
  search: string;
  category: string;
  from: string;
  to: string;
  min: string;
  max: string;
  sort: "newest" | "oldest" | "highest" | "lowest";
};

type Toast = {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

const initialFilters: Filters = {
  search: "",
  category: "All",
  from: "",
  to: "",
  min: "",
  max: "",
  sort: "newest",
};

const pageMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
};

const cardMotion = {
  initial: { opacity: 0, y: 16, scale: 0.985 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] },
};

export default function RupeeFlowDashboard() {
  const [state, setState] = useState<AppState>(emptyState);
  const [theme, setTheme] = useState<Theme>("dark");
  const [view, setView] = useState<View>("Overview");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [expenseModal, setExpenseModal] = useState<Transaction | "new" | null>(null);
  const [categoryModal, setCategoryModal] = useState<Category | "new" | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    const savedTheme = (localStorage.getItem(THEME_KEY) as Theme | null) || "dark";
    const savedMonth = localStorage.getItem(MONTH_KEY) || currentMonth();
    if (savedState) {
      try {
        setState(JSON.parse(savedState) as AppState);
      } catch {
        setState(emptyState);
      }
    }
    setTheme(savedTheme);
    setSelectedMonth(savedMonth);
    setHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (!hydrated) return;
    localStorage.setItem(THEME_KEY, theme);
  }, [hydrated, theme]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(MONTH_KEY, selectedMonth);
  }, [hydrated, selectedMonth]);

  const report = useMemo(() => calculateReport(state, selectedMonth), [state, selectedMonth]);
  const isEmpty = state.salary <= 0 && state.transactions.length === 0;
  const filteredTransactions = useMemo(() => filterTransactions(report.monthTransactions, filters), [report.monthTransactions, filters]);

  function toast(message: string, actionLabel?: string, onAction?: () => void) {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message, actionLabel, onAction }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 4200);
  }

  function savePlan(salary: number, monthlyBudget: number) {
    setState((current) => ({ ...current, salary, monthlyBudget }));
    setPlanOpen(false);
    toast(monthlyBudget > salary ? "Plan saved. Budget is higher than salary." : "Monthly plan updated.");
  }

  function saveExpense(input: Omit<Transaction, "id">, existingId?: string) {
    if (existingId) {
      setState((current) => ({
        ...current,
        transactions: current.transactions.map((item) => (item.id === existingId ? { ...input, id: existingId } : item)),
      }));
      toast("Expense updated.");
    } else {
      setState((current) => ({ ...current, transactions: [transaction(input.merchant, input.amount, input.category, input.date, input.description, input.paymentMode), ...current.transactions] }));
      toast("Expense added.");
    }
    setExpenseModal(null);
  }

  function saveCategory(name: string, limit: number, icon: string, color: string, existingId?: string) {
    const normalized = name.trim();
    const duplicate = state.categories.some((item) => item.name.toLowerCase() === normalized.toLowerCase() && item.id !== existingId);
    if (duplicate) {
      toast("Category already exists.");
      return false;
    }
    setState((current) => ({
      ...current,
      categories: existingId
        ? current.categories.map((item) => (item.id === existingId ? { ...item, name: normalized, limit, icon, color } : item))
        : [...current.categories, category(normalized, limit, icon || normalized[0] || "-", color)],
    }));
    setCategoryModal(null);
    toast(existingId ? "Category updated." : "Category created.");
    return true;
  }

  function deleteTransaction(item: Transaction) {
    setState((current) => ({ ...current, transactions: current.transactions.filter((transactionItem) => transactionItem.id !== item.id) }));
    toast("Expense deleted.", "Undo", () => {
      setState((current) => ({ ...current, transactions: [item, ...current.transactions] }));
      toast("Expense restored.");
    });
  }

  function deleteCategory(item: Category) {
    setState((current) => ({
      ...current,
      categories: current.categories.filter((categoryItem) => categoryItem.id !== item.id),
      transactions: current.transactions.map((transactionItem) => (transactionItem.category === item.name ? { ...transactionItem, category: "Other" } : transactionItem)),
    }));
    toast("Category deleted. Matching expenses moved to Other.");
  }

  function loadDemo() {
    setState(demoState(selectedMonth));
    setView("Overview");
    toast("Sample dashboard loaded.");
  }

  function resetDashboard() {
    setState(emptyState);
    setResetOpen(false);
    setView("Overview");
    toast("Dashboard reset.");
  }

  return (
    <div className="min-h-screen text-[var(--text)]">
      <AppShell
        view={view}
        setView={setView}
        theme={theme}
        setTheme={setTheme}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        openExpense={() => setExpenseModal("new")}
      >
        <AnimatePresence mode="wait">
          <motion.main key={view} {...pageMotion}>
            {isEmpty && view === "Overview" ? (
              <EmptyState openPlan={() => setPlanOpen(true)} loadDemo={loadDemo} />
            ) : (
              <PageContent
                view={view}
                report={report}
                state={state}
                filters={filters}
                setFilters={setFilters}
                filteredTransactions={filteredTransactions}
                openExpense={(item) => setExpenseModal(item || "new")}
                openCategory={(item) => setCategoryModal(item || "new")}
                openPlan={() => setPlanOpen(true)}
                deleteTransaction={deleteTransaction}
                deleteCategory={deleteCategory}
                loadDemo={loadDemo}
                reset={() => setResetOpen(true)}
                setTheme={setTheme}
                theme={theme}
              />
            )}
          </motion.main>
        </AnimatePresence>
      </AppShell>

      <button
        aria-label="Add Expense"
        onClick={() => setExpenseModal("new")}
        className="fixed bottom-24 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[var(--accent)] text-2xl font-black text-[#03140e] shadow-[0_18px_44px_color-mix(in_srgb,var(--accent),transparent_70%)] transition hover:-translate-y-1 active:scale-95 md:hidden"
      >
        +
      </button>

      <MobileBottomNav view={view} setView={setView} openExpense={() => setExpenseModal("new")} />

      <AnimatePresence>
        {expenseModal && (
          <AddExpenseModal
            item={expenseModal === "new" ? null : expenseModal}
            categories={state.categories}
            onClose={() => setExpenseModal(null)}
            onSave={saveExpense}
          />
        )}
        {categoryModal && (
          <AddCategoryModal
            item={categoryModal === "new" ? null : categoryModal}
            onClose={() => setCategoryModal(null)}
            onSave={saveCategory}
          />
        )}
        {planOpen && <EditPlanDrawer salary={state.salary} monthlyBudget={state.monthlyBudget} onClose={() => setPlanOpen(false)} onSave={savePlan} />}
        {resetOpen && <ConfirmResetModal onClose={() => setResetOpen(false)} onReset={resetDashboard} />}
      </AnimatePresence>

      <ToastStack toasts={toasts} dismiss={(id) => setToasts((items) => items.filter((item) => item.id !== id))} />
    </div>
  );
}

function AppShell({
  children,
  view,
  setView,
  theme,
  setTheme,
  selectedMonth,
  setSelectedMonth,
  openExpense,
}: {
  children: ReactNode;
  view: View;
  setView: (view: View) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  openExpense: () => void;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[264px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen border-r border-[var(--border)] bg-[color-mix(in_srgb,var(--surface),transparent_4%)] p-4 lg:block">
        <div className="mb-8 flex items-center gap-3 px-2 pt-2">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] font-black text-[#03140e]">RF</div>
          <div>
            <strong className="block text-lg">RupeeFlow</strong>
            <span className="text-sm text-[var(--text-muted)]">Finance command center</span>
          </div>
        </div>
        <nav className="grid gap-2" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              className={cx(
                "flex min-h-11 items-center gap-3 rounded-2xl px-4 text-left text-sm font-semibold text-[var(--text-muted)] transition duration-150 hover:bg-[var(--accent-soft)] hover:text-[var(--text)]",
                view === item && "bg-[var(--accent-soft)] text-[var(--text)] shadow-[0_14px_34px_color-mix(in_srgb,var(--accent),transparent_88%)]",
              )}
            >
              <span className="grid h-7 w-7 place-items-center rounded-xl bg-[var(--card-strong)]">{iconFor(item)}</span>
              {item}
            </button>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:py-7">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">{monthLabel(selectedMonth)}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{view}</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Your money overview for this month.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              aria-label="Select month"
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="min-h-11 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-sm text-[var(--text)]"
            />
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <Button onClick={openExpense}>+ Add Expense</Button>
          </div>
        </header>
        <div className="mx-auto max-w-[1440px]">{children}</div>
      </div>
    </div>
  );
}

function PageContent(props: {
  view: View;
  report: Report;
  state: AppState;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  filteredTransactions: Transaction[];
  openExpense: (item?: Transaction) => void;
  openCategory: (item?: Category) => void;
  openPlan: () => void;
  deleteTransaction: (item: Transaction) => void;
  deleteCategory: (item: Category) => void;
  loadDemo: () => void;
  reset: () => void;
  setTheme: (theme: Theme) => void;
  theme: Theme;
}) {
  const { view, report } = props;
  if (view === "Transactions") return <TransactionsPage {...props} />;
  if (view === "Budgets") return <BudgetsPage {...props} />;
  if (view === "Insights") return <InsightsPage {...props} />;
  if (view === "Reports") return <ReportsPage {...props} />;
  if (view === "Settings") return <SettingsPage {...props} />;
  return (
    <div className="grid gap-6">
      <HeroSafeToSpendCard report={report} openExpense={() => props.openExpense()} openPlan={props.openPlan} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Monthly Salary" value={money(report.salary)} helper="Income this month" icon="₹" />
        <StatCard label="Spending Budget" value={money(report.monthlyBudget)} helper="Planned spend" icon="B" />
        <StatCard label="Total Spent" value={money(report.totalSpent)} helper={`${report.monthTransactions.length} transactions`} icon="S" />
        <StatCard label="Budget Left" value={money(report.budgetLeft)} helper="Safe-to-spend pool" icon="L" />
        <StatCard label="Savings Rate" value={`${Math.round(report.savingsRate)}%`} helper="Actual savings" icon="%" />
        <StatCard label="Projected Savings" value={money(report.projectedSavings)} helper="At current pace" icon="P" />
      </section>
      <SmartInsights report={report} />
      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Spending trend" subtitle="Daily expenses in the selected month.">
          <SpendingTrendChart transactions={report.monthTransactions} />
        </ChartCard>
        <ChartCard title="Category breakdown" subtitle="Spend against category limits.">
          <CategoryBreakdownChart report={report} />
        </ChartCard>
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <BudgetBurnRateCard report={report} />
        <FinancialPulseCard report={report} openPlan={props.openPlan} />
      </section>
      <BudgetHealthTable report={report} openCategory={props.openCategory} />
      <TransactionList transactions={report.monthTransactions.slice(0, 6)} openExpense={props.openExpense} deleteTransaction={props.deleteTransaction} compact />
    </div>
  );
}

function HeroSafeToSpendCard({ report, openExpense, openPlan }: { report: Report; openExpense: () => void; openPlan: () => void }) {
  const x = useMotionValue(20);
  const y = useMotionValue(20);
  const springX = useSpring(x, { stiffness: 120, damping: 24 });
  const springY = useSpring(y, { stiffness: 120, damping: 24 });
  const glow = useTransform([springX, springY], ([latestX, latestY]) => `radial-gradient(circle at ${latestX}% ${latestY}%, color-mix(in srgb, var(--accent), transparent 70%), transparent 34%)`);
  return (
    <motion.section
      {...cardMotion}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(((event.clientX - rect.left) / rect.width) * 100);
        y.set(((event.clientY - rect.top) / rect.height) * 100);
      }}
      className="relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[var(--card)] p-5 shadow-premium backdrop-blur-xl sm:p-7 lg:p-8"
    >
      <motion.div className="absolute inset-0 opacity-80" style={{ background: glow }} aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,color-mix(in_srgb,var(--accent-2),transparent_72%),transparent_34%)]" aria-hidden />
      <div className="relative grid items-end gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Safe to Spend</span>
            <StatusPill label={report.healthStatus} />
          </div>
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[clamp(2.7rem,9vw,5.8rem)] font-extrabold leading-[0.92] tracking-tight">
            {money(report.budgetLeft)}
          </motion.h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-soft)] sm:text-lg">
            {report.budgetLeft < 0
              ? `You are over budget by ${money(Math.abs(report.budgetLeft))}. Review critical categories before spending more.`
              : `${money(report.safeToSpendPerDay)}/day available for the rest of the month. You are ${report.healthStatus.toLowerCase()} this month.`}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <HeroChip label="Month progress" value={`${Math.round(report.monthProgressPercent)}%`} />
            <HeroChip label="Budget used" value={`${Math.round(report.budgetUsedPercent)}%`} />
            <HeroChip label="Projected savings" value={money(report.projectedSavings)} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={openExpense}>Add Expense</Button>
            <Button variant="secondary" onClick={openPlan}>
              Edit Plan
            </Button>
          </div>
        </div>
        <SavingsMeter report={report} />
      </div>
    </motion.section>
  );
}

function SavingsMeter({ report }: { report: Report }) {
  const progress = clamp(report.savingsRate);
  const color = report.healthStatus === "Critical" ? "var(--danger)" : report.healthStatus === "Watch" ? "var(--warning)" : "var(--accent)";
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--text-muted)]">Savings meter</span>
        <strong className="text-xl">{Math.round(report.savingsRate)}%</strong>
      </div>
      <div className="relative h-40 overflow-hidden rounded-3xl bg-[color-mix(in_srgb,var(--accent),transparent_92%)]">
        <svg viewBox="0 0 220 140" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d="M 28 116 A 82 82 0 0 1 192 116" fill="none" stroke="color-mix(in srgb, var(--text), transparent 88%)" strokeWidth="17" strokeLinecap="round" pathLength="100" />
          <motion.path
            d="M 28 116 A 82 82 0 0 1 192 116"
            fill="none"
            stroke={color}
            strokeWidth="17"
            strokeLinecap="round"
            pathLength="100"
            initial={{ strokeDasharray: "0 100" }}
            animate={{ strokeDasharray: `${progress} 100` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <motion.div
          className="absolute bottom-8 left-1/2 h-1 w-24 origin-left rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, var(--text), ${color})` }}
          animate={{ rotate: -180 + (progress / 100) * 180 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center">
          <strong className="block text-2xl">{report.healthStatus}</strong>
          <span className="text-xs text-[var(--text-muted)]">Financial health</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ openPlan, loadDemo }: { openPlan: () => void; loadDemo: () => void }) {
  return (
    <motion.section {...cardMotion} className="grid min-h-[560px] items-center gap-8 rounded-3xl border border-[var(--border-strong)] bg-[var(--card)] p-6 shadow-premium backdrop-blur-xl lg:grid-cols-[minmax(0,1fr)_360px] lg:p-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Start with clarity</p>
        <h2 className="mt-4 max-w-4xl text-[clamp(2.4rem,8vw,5.4rem)] font-extrabold leading-none tracking-tight">Build your first money command center</h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-soft)] sm:text-lg">
          Add your salary and monthly spending budget. We will calculate your safe-to-spend amount, savings rate, budget health, and spending warnings.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button onClick={openPlan}>Create My Plan</Button>
          <Button variant="secondary" onClick={loadDemo}>
            Preview Sample Dashboard
          </Button>
        </div>
      </div>
      <motion.div
        initial={{ rotate: -8, scale: 0.92 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative min-h-80 rounded-3xl border border-[var(--border)] bg-[radial-gradient(circle_at_50%_22%,color-mix(in_srgb,var(--accent),transparent_58%),transparent_42%),var(--surface-elevated)] p-5"
      >
        <div className="absolute left-8 top-10 h-24 w-24 rounded-full border border-[var(--border)] bg-[var(--card)]" />
        <div className="absolute bottom-9 left-8 right-8 grid gap-3">
          <div className="h-3 rounded-full bg-[var(--accent)]" />
          <div className="h-3 w-3/4 rounded-full bg-[var(--accent-2)]" />
          <div className="h-3 w-1/2 rounded-full bg-[var(--warning)]" />
        </div>
      </motion.div>
    </motion.section>
  );
}

function TransactionsPage({ filters, setFilters, filteredTransactions, state, openExpense, deleteTransaction }: Parameters<typeof PageContent>[0]) {
  return (
    <div className="grid gap-6">
      <TransactionFilters filters={filters} setFilters={setFilters} categories={state.categories} />
      <TransactionList transactions={filteredTransactions} openExpense={openExpense} deleteTransaction={deleteTransaction} showExport />
    </div>
  );
}

function BudgetsPage({ report, state, openPlan, openCategory, deleteCategory }: Parameters<typeof PageContent>[0]) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="grid gap-6">
        <FinancialPulseCard report={report} openPlan={openPlan} />
        <BudgetHealthTable report={report} openCategory={openCategory} editable deleteCategory={deleteCategory} />
      </div>
      <CategoryManager categories={state.categories} openCategory={openCategory} deleteCategory={deleteCategory} />
    </div>
  );
}

function InsightsPage({ report }: Parameters<typeof PageContent>[0]) {
  return (
    <div className="grid gap-6">
      <SmartInsights report={report} />
      <section className="grid gap-6 xl:grid-cols-2">
        <BudgetBurnRateCard report={report} />
        <ChartCard title="Category risks" subtitle="The categories most likely to need attention.">
          <CategoryBreakdownChart report={report} />
        </ChartCard>
      </section>
      <BudgetHealthTable report={report} />
    </div>
  );
}

function ReportsPage({ report }: Parameters<typeof PageContent>[0]) {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Income" value={money(report.salary)} helper="Monthly salary" icon="₹" />
        <StatCard label="Expense" value={money(report.totalSpent)} helper="Current month" icon="E" />
        <StatCard label="Projected Spend" value={money(report.projectedTotalSpend)} helper="At current pace" icon="P" />
        <StatCard label="Actual Savings" value={money(report.actualSavings)} helper="Salary minus spent" icon="S" />
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Monthly trend" subtitle="Spending accumulation by date.">
          <SpendingTrendChart transactions={report.monthTransactions} />
        </ChartCard>
        <ChartCard title="Income vs expense" subtitle="Salary, spend and savings comparison.">
          <IncomeExpenseBars report={report} />
        </ChartCard>
      </section>
    </div>
  );
}

function SettingsPage({ loadDemo, reset, theme, setTheme }: Parameters<typeof PageContent>[0]) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card title="Preferences" subtitle="Theme and dashboard behavior.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="secondary" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            Switch {theme === "light" ? "Dark" : "Light"} Mode
          </Button>
          <Button variant="secondary" onClick={loadDemo}>
            Preview Sample Dashboard
          </Button>
        </div>
      </Card>
      <Card title="Danger zone" subtitle="Reset local dashboard data.">
        <Button variant="danger" onClick={reset}>
          Reset Dashboard
        </Button>
      </Card>
    </div>
  );
}

function StatCard({ label, value, helper, icon }: { label: string; value: string; helper: string; icon: string }) {
  return (
    <motion.article {...cardMotion} className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft backdrop-blur transition hover:-translate-y-1 hover:border-[var(--border-strong)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</span>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--accent-soft)] font-black text-[var(--accent)]">{icon}</span>
      </div>
      <strong className="mt-4 block break-words text-[clamp(1.25rem,2vw,1.85rem)] font-bold tracking-tight">{value}</strong>
      <span className="mt-2 block text-sm text-[var(--text-muted)]">{helper}</span>
    </motion.article>
  );
}

function SmartInsights({ report }: { report: Report }) {
  return (
    <Card title="Smart Insights" subtitle="What needs attention and what to do next.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {buildInsights(report).map((item) => (
          <motion.article key={item.title} {...cardMotion} className="rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--accent-soft)] font-black text-[var(--accent)]">{item.icon}</span>
              <StatusPill label={item.status} />
            </div>
            <strong className="block text-base">{item.title}</strong>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{item.text}</p>
          </motion.article>
        ))}
      </div>
    </Card>
  );
}

function BudgetHealthTable({
  report,
  openCategory,
  editable = false,
  deleteCategory,
}: {
  report: Report;
  openCategory?: (item?: Category) => void;
  editable?: boolean;
  deleteCategory?: (item: Category) => void;
}) {
  return (
    <Card
      title="Budget Health"
      subtitle="Limits, usage, and attention status by category."
      action={
        openCategory && (
          <Button variant="secondary" onClick={() => openCategory()}>
            Add Category
          </Button>
        )
      }
    >
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">
              <th className="py-3">Category</th>
              <th className="py-3 text-right">Limit</th>
              <th className="py-3 text-right">Spent</th>
              <th className="py-3 text-right">Remaining</th>
              <th className="py-3">Usage</th>
              <th className="py-3">Status</th>
              {editable && <th className="py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {report.categoryStats.map((item) => {
              const status = statusForUsage(item.usage);
              return (
                <tr key={item.id} className="border-t border-[var(--border)]">
                  <td className="py-4 font-semibold">{item.icon} {item.name}</td>
                  <td className="py-4 text-right">{money(item.limit)}</td>
                  <td className="py-4 text-right">{money(item.spent)}</td>
                  <td className="py-4 text-right">{money(item.remaining)}</td>
                  <td className="min-w-48 py-4"><Progress value={item.usage} color={status.color} label={`${Math.round(item.usage)}%`} /></td>
                  <td className="py-4"><StatusPill label={status.label} /></td>
                  {editable && (
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => openCategory?.(item)}>Edit</Button>
                        <Button variant="ghost" onClick={() => deleteCategory?.(item)}>Delete</Button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 lg:hidden">
        {report.categoryStats.map((item) => {
          const status = statusForUsage(item.usage);
          return (
            <div key={item.id} className="rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <strong>{item.icon} {item.name}</strong>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{money(item.remaining)} remaining</p>
                </div>
                <StatusPill label={status.label} />
              </div>
              <div className="mt-4"><Progress value={item.usage} color={status.color} label={`${Math.round(item.usage)}% used`} /></div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function TransactionList({
  transactions,
  openExpense,
  deleteTransaction,
  showExport = false,
  compact = false,
}: {
  transactions: Transaction[];
  openExpense: (item?: Transaction) => void;
  deleteTransaction: (item: Transaction) => void;
  showExport?: boolean;
  compact?: boolean;
}) {
  return (
    <Card
      title={compact ? "Recent Transactions" : "Transactions"}
      subtitle="Search, filter, edit, delete and export expenses."
      action={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => openExpense()}>Add Expense</Button>
          {showExport && <Button variant="secondary" onClick={() => exportCsv(transactions)}>Export CSV</Button>}
        </div>
      }
    >
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {transactions.length ? transactions.map((item) => (
              <tr key={item.id} className="border-t border-[var(--border)]">
                <td className="py-4"><strong>{item.merchant}</strong><p className="text-xs text-[var(--text-muted)]">{item.description || "No description"}</p></td>
                <td className="py-4"><span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-bold text-[var(--accent)]">{item.category}</span></td>
                <td className="py-4 text-right font-bold">{money(item.amount)}</td>
                <td className="py-4 text-[var(--text-muted)]">{formatDate(item.date)}</td>
                <td className="py-4 text-[var(--text-muted)]">{item.paymentMode}</td>
                <td className="py-4 text-right"><div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => openExpense(item)}>Edit</Button><Button variant="ghost" onClick={() => deleteTransaction(item)}>Delete</Button></div></td>
              </tr>
            )) : <tr><td className="py-6 text-[var(--text-muted)]">No transactions yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 lg:hidden">
        {transactions.length ? transactions.map((item) => (
          <motion.article layout key={item.id} className="rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
            <div className="flex justify-between gap-4">
              <div>
                <strong>{item.merchant}</strong>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{item.category} / {formatDate(item.date)} / {item.paymentMode}</p>
              </div>
              <strong>{money(item.amount)}</strong>
            </div>
            <p className="mt-3 text-sm text-[var(--text-muted)]">{item.description || "No description"}</p>
            <div className="mt-4 flex gap-2"><Button variant="ghost" onClick={() => openExpense(item)}>Edit</Button><Button variant="ghost" onClick={() => deleteTransaction(item)}>Delete</Button></div>
          </motion.article>
        )) : <p className="text-[var(--text-muted)]">No transactions yet.</p>}
      </div>
    </Card>
  );
}

function TransactionFilters({ filters, setFilters, categories }: { filters: Filters; setFilters: (filters: Filters) => void; categories: Category[] }) {
  return (
    <Card title="Transaction Controls" subtitle="Filter your ledger without losing context.">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
        <Input label="Search" value={filters.search} onChange={(value) => setFilters({ ...filters, search: value })} placeholder="Merchant or description" />
        <label className="grid gap-2 text-sm font-semibold text-[var(--text-muted)]">Category<select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })} className={inputClass()}><option>All</option>{categories.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>
        <Input label="From" type="date" value={filters.from} onChange={(value) => setFilters({ ...filters, from: value })} />
        <Input label="To" type="date" value={filters.to} onChange={(value) => setFilters({ ...filters, to: value })} />
        <Input label="Min" type="number" value={filters.min} onChange={(value) => setFilters({ ...filters, min: value })} />
        <Input label="Max" type="number" value={filters.max} onChange={(value) => setFilters({ ...filters, max: value })} />
        <label className="grid gap-2 text-sm font-semibold text-[var(--text-muted)]">Sort<select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value as Filters["sort"] })} className={inputClass()}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="highest">Highest</option><option value="lowest">Lowest</option></select></label>
      </div>
    </Card>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <Card title={title} subtitle={subtitle}>{children}</Card>;
}

function Card({ title, subtitle, children, action }: { title: string; subtitle: string; children: ReactNode; action?: ReactNode }) {
  return (
    <motion.section {...cardMotion} className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-soft backdrop-blur sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[clamp(1.15rem,2vw,1.55rem)] font-bold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}

function BudgetBurnRateCard({ report }: { report: Report }) {
  const warning = report.budgetUsedPercent > report.monthProgressPercent;
  return (
    <Card title="Budget Burn Rate" subtitle="Placed below the hero so the savings meter stays fully visible.">
      <Progress value={report.monthProgressPercent} label={`${Math.round(report.monthProgressPercent)}% month complete`} color="var(--accent-2)" />
      <div className="mt-5"><Progress value={report.budgetUsedPercent} label={`${Math.round(report.budgetUsedPercent)}% budget used`} color={warning ? "var(--warning)" : "var(--accent)"} /></div>
      <p className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 text-sm leading-6 text-[var(--text-soft)]">
        {warning ? "Budget is burning faster than the month. Slow discretionary spending." : "Budget burn is aligned with the month."}
      </p>
    </Card>
  );
}

function FinancialPulseCard({ report, openPlan }: { report: Report; openPlan: () => void }) {
  return (
    <Card title="Financial Pulse" subtitle="Salary, spending budget and planned savings." action={<Button variant="secondary" onClick={openPlan}>Edit Plan</Button>}>
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat label="Monthly Salary" value={money(report.salary)} />
        <MiniStat label="Spending Budget" value={money(report.monthlyBudget)} />
        <MiniStat label="Planned Savings" value={money(report.plannedSavings)} />
      </div>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4"><span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</span><strong className="mt-2 block text-xl">{value}</strong></div>;
}

function SpendingTrendChart({ transactions }: { transactions: Transaction[] }) {
  const points = trendPoints(transactions);
  if (!points.length) return <p className="text-sm text-[var(--text-muted)]">Add expenses to see a spending trend.</p>;
  const max = Math.max(...points.map((item) => item.amount), 1);
  const coords = points.map((point, index) => `${points.length === 1 ? 50 : (index / (points.length - 1)) * 100},${100 - (point.amount / max) * 78}`).join(" ");
  return (
    <svg className="h-72 w-full" viewBox="0 0 100 112" preserveAspectRatio="none" role="img" aria-label="Spending trend chart">
      <motion.polygon initial={{ opacity: 0, scaleY: 0.86 }} animate={{ opacity: 1, scaleY: 1 }} transition={{ duration: 0.7 }} points={`${coords} 100,104 0,104`} fill="color-mix(in srgb, var(--accent), transparent 84%)" />
      <motion.polyline initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} points={coords} fill="none" stroke="var(--accent)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="0,104 100,104" fill="none" stroke="var(--border)" strokeWidth="0.8" />
    </svg>
  );
}

function CategoryBreakdownChart({ report }: { report: Report }) {
  if (!report.categoryStats.length) return <p className="text-sm text-[var(--text-muted)]">Create categories to view the breakdown.</p>;
  const max = Math.max(...report.categoryStats.map((item) => item.spent), 1);
  return (
    <div className="grid gap-4">
      {report.categoryStats.slice(0, 8).map((item) => {
        const status = statusForUsage(item.usage);
        return (
          <div key={item.id} className="grid gap-2 sm:grid-cols-[132px_minmax(0,1fr)_96px] sm:items-center">
            <strong className="text-sm">{item.name}</strong>
            <Progress value={(item.spent / max) * 100} color={status.color} />
            <span className="text-sm text-[var(--text-muted)] sm:text-right">{money(item.spent)}</span>
          </div>
        );
      })}
    </div>
  );
}

function IncomeExpenseBars({ report }: { report: Report }) {
  const max = Math.max(report.salary, report.totalSpent, Math.abs(report.projectedSavings), 1);
  return (
    <div className="grid gap-5">
      {[
        ["Salary", report.salary, "var(--accent)"],
        ["Spent", report.totalSpent, "var(--warning)"],
        ["Projected Savings", report.projectedSavings, report.projectedSavings < 0 ? "var(--danger)" : "var(--accent-2)"],
      ].map(([label, value, color]) => (
        <div key={label as string}>
          <Progress value={(Math.abs(value as number) / max) * 100} color={color as string} label={`${label}: ${money(value as number)}`} />
        </div>
      ))}
    </div>
  );
}

function CategoryManager({ categories, openCategory, deleteCategory }: { categories: Category[]; openCategory: (item?: Category) => void; deleteCategory: (item: Category) => void }) {
  return (
    <Card title="Budget Categories" subtitle="Edit, delete, and extend your category system." action={<Button onClick={() => openCategory()}>Add Category</Button>}>
      <div className="grid gap-3">
        {categories.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
            <div><strong>{item.icon} {item.name}</strong><p className="text-sm text-[var(--text-muted)]">{money(item.limit)} monthly limit</p></div>
            <div className="flex gap-2"><Button variant="ghost" onClick={() => openCategory(item)}>Edit</Button><Button variant="ghost" onClick={() => deleteCategory(item)}>Delete</Button></div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Progress({ value, color = "var(--accent)", label }: { value: number; color?: string; label?: string }) {
  return (
    <div>
      {label && <div className="mb-2 flex justify-between gap-3 text-sm"><span className="text-[var(--text-muted)]">{label}</span></div>}
      <div className="h-2.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--accent),transparent_88%)]">
        <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${clamp(value)}%` }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
      </div>
    </div>
  );
}

function AddExpenseModal({ item, categories, onClose, onSave }: { item: Transaction | null; categories: Category[]; onClose: () => void; onSave: (input: Omit<Transaction, "id">, existingId?: string) => void }) {
  const [merchant, setMerchant] = useState(item?.merchant || "");
  const [amount, setAmount] = useState(item?.amount ? String(item.amount) : "");
  const [categoryName, setCategoryName] = useState(item?.category || categories[0]?.name || QUICK_CATEGORIES[0]);
  const [date, setDate] = useState(item?.date || today());
  const [description, setDescription] = useState(item?.description || "");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(item?.paymentMode || "UPI");
  const invalid = !merchant.trim() || Number(amount) <= 0 || !categoryName;
  return (
    <Modal title={item ? "Edit Expense" : "Add Expense"} subtitle="Track merchant, amount, category and payment mode." onClose={onClose}>
      <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); if (!invalid) onSave({ merchant: merchant.trim(), amount: Number(amount), category: categoryName, date, description, paymentMode }, item?.id); }}>
        <Input label="Merchant / Place" value={merchant} onChange={setMerchant} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Amount" type="number" value={amount} onChange={setAmount} required prefix="₹" />
          <label className="grid gap-2 text-sm font-semibold text-[var(--text-muted)]">Category<select className={inputClass()} value={categoryName} onChange={(event) => setCategoryName(event.target.value)}>{(categories.length ? categories.map((cat) => cat.name) : QUICK_CATEGORIES).map((name) => <option key={name}>{name}</option>)}</select></label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Date" type="date" value={date} onChange={setDate} required />
          <label className="grid gap-2 text-sm font-semibold text-[var(--text-muted)]">Payment mode<select className={inputClass()} value={paymentMode} onChange={(event) => setPaymentMode(event.target.value as PaymentMode)}>{PAYMENT_MODES.map((mode) => <option key={mode}>{mode}</option>)}</select></label>
        </div>
        <Input label="Description optional" value={description} onChange={setDescription} />
        <div className="flex flex-wrap gap-2">{QUICK_CATEGORIES.map((name) => <button key={name} type="button" onClick={() => setCategoryName(name)} className="rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm font-semibold">{name}</button>)}</div>
        {invalid && <p className="text-sm text-[var(--danger)]">Merchant, category and a positive amount are required.</p>}
        <div className="flex flex-wrap gap-3"><Button type="submit" disabled={invalid}>Save Expense</Button><Button type="button" variant="secondary" onClick={onClose}>Cancel Expense</Button></div>
      </form>
    </Modal>
  );
}

function AddCategoryModal({ item, onClose, onSave }: { item: Category | null; onClose: () => void; onSave: (name: string, limit: number, icon: string, color: string, existingId?: string) => boolean }) {
  const [name, setName] = useState(item?.name || "");
  const [limit, setLimit] = useState(item?.limit ? String(item.limit) : "");
  const [icon, setIcon] = useState(item?.icon || "");
  const [color, setColor] = useState(item?.color || "#00E6A8");
  const invalid = !name.trim() || Number(limit) < 0 || limit === "";
  return (
    <Modal title={item ? "Edit Category" : "Add Category"} subtitle="Create a reusable category limit." onClose={onClose}>
      <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); if (!invalid) onSave(name, Number(limit), icon, color, item?.id); }}>
        <Input label="Category name" value={name} onChange={setName} required />
        <Input label="Monthly limit" type="number" value={limit} onChange={setLimit} required prefix="₹" />
        <div className="grid gap-4 sm:grid-cols-2"><Input label="Icon / short code" value={icon} onChange={setIcon} placeholder="F" /><Input label="Color" type="color" value={color} onChange={setColor} /></div>
        {invalid && <p className="text-sm text-[var(--danger)]">Category name and a valid limit are required.</p>}
        <div className="flex flex-wrap gap-3"><Button type="submit" disabled={invalid}>Save Category</Button><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button></div>
      </form>
    </Modal>
  );
}

function EditPlanDrawer({ salary, monthlyBudget, onClose, onSave }: { salary: number; monthlyBudget: number; onClose: () => void; onSave: (salary: number, budget: number) => void }) {
  const [salaryValue, setSalaryValue] = useState(salary ? String(salary) : "");
  const [budgetValue, setBudgetValue] = useState(monthlyBudget ? String(monthlyBudget) : "");
  const invalid = Number(salaryValue) <= 0 || Number(budgetValue) < 0 || budgetValue === "";
  return (
    <Drawer title="Edit Plan" subtitle="Update your salary and monthly Spending Budget." onClose={onClose}>
      <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); if (!invalid) onSave(Number(salaryValue), Number(budgetValue)); }}>
        <Input label="Monthly salary" type="number" value={salaryValue} onChange={setSalaryValue} required prefix="₹" />
        <Input label="Monthly Spending Budget" type="number" value={budgetValue} onChange={setBudgetValue} required prefix="₹" />
        {Number(budgetValue) > Number(salaryValue) && Number(salaryValue) > 0 && <p className="rounded-2xl bg-[color-mix(in_srgb,var(--warning),transparent_86%)] p-3 text-sm text-[var(--warning)]">Your spending budget is higher than your salary.</p>}
        {invalid && <p className="text-sm text-[var(--danger)]">Salary must be greater than 0 and budget must be 0 or more.</p>}
        <Button type="submit" disabled={invalid}>Save Plan</Button>
      </form>
    </Drawer>
  );
}

function ConfirmResetModal({ onClose, onReset }: { onClose: () => void; onReset: () => void }) {
  const [value, setValue] = useState("");
  return (
    <Modal title="Reset dashboard?" subtitle="This will permanently delete your salary plan, budgets, categories, and expenses." onClose={onClose}>
      <div className="grid gap-4">
        <Input label="Type RESET to continue" value={value} onChange={setValue} placeholder="RESET" />
        <div className="flex flex-wrap gap-3"><Button variant="danger" disabled={value !== "RESET"} onClick={onReset}>Confirm Reset</Button><Button variant="secondary" onClick={onClose}>Cancel</Button></div>
      </div>
    </Modal>
  );
}

function Modal({ title, subtitle, children, onClose }: { title: string; subtitle: string; children: ReactNode; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-0 sm:place-items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.section role="dialog" aria-modal="true" aria-labelledby={`${title}-title`} initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }} className="max-h-[88vh] w-full overflow-auto rounded-t-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-premium sm:max-w-xl sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4"><div><h2 id={`${title}-title`} className="text-xl font-bold">{title}</h2><p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p></div><Button variant="ghost" onClick={onClose}>Close</Button></div>
        {children}
      </motion.section>
    </motion.div>
  );
}

function Drawer({ title, subtitle, children, onClose }: { title: string; subtitle: string; children: ReactNode; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <motion.aside role="dialog" aria-modal="true" aria-labelledby={`${title}-title`} initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }} className="ml-auto h-full w-full max-w-md overflow-auto border-l border-[var(--border)] bg-[var(--surface)] p-5 shadow-premium sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4"><div><h2 id={`${title}-title`} className="text-xl font-bold">{title}</h2><p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p></div><Button variant="ghost" onClick={onClose}>Close</Button></div>
        {children}
      </motion.aside>
    </motion.div>
  );
}

function ToastStack({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-[60] grid gap-3">
      <AnimatePresence>
        {toasts.map((item) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3 shadow-premium">
            <span className="text-sm font-semibold">{item.message}</span>
            {item.actionLabel && <button className="text-sm font-bold text-[var(--accent)]" onClick={() => { item.onAction?.(); dismiss(item.id); }}>{item.actionLabel}</button>}
            <button aria-label="Dismiss toast" className="text-[var(--text-muted)]" onClick={() => dismiss(item.id)}>x</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function MobileBottomNav({ view, setView, openExpense }: { view: View; setView: (view: View) => void; openExpense: () => void }) {
  return (
    <nav className="fixed bottom-3 left-3 right-3 z-30 grid grid-cols-5 gap-1 rounded-3xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface),transparent_4%)] p-2 shadow-premium backdrop-blur md:hidden" aria-label="Mobile navigation">
      {MOBILE_ITEMS.map((item) => (
        <button key={item} type="button" onClick={() => item === "Add" ? openExpense() : setView(item)} className={cx("min-h-12 rounded-2xl text-xs font-bold text-[var(--text-muted)] transition", view === item && "bg-[var(--accent)] text-[#03140e]")}>{item === "Add" ? "+" : iconFor(item as View)}<br />{item}</button>
      ))}
    </nav>
  );
}

function ThemeToggle({ theme, setTheme }: { theme: Theme; setTheme: (theme: Theme) => void }) {
  return (
    <button type="button" aria-label="Toggle theme" onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="relative min-h-11 min-w-28 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-sm font-bold">
      <motion.span layout className={cx("absolute top-2 grid h-7 w-7 place-items-center rounded-full bg-[var(--accent)] text-xs text-[#03140e]", theme === "light" ? "right-2" : "left-2")}>{theme === "light" ? "L" : "D"}</motion.span>
      <span className={cx("block", theme === "light" ? "pr-8" : "pl-8")}>{theme === "light" ? "Light" : "Dark"}</span>
    </button>
  );
}

function Button({ children, variant = "primary", type = "button", disabled, onClick }: { children: ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; type?: "button" | "submit"; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "min-h-11 rounded-2xl px-4 text-sm font-bold transition duration-150 hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45",
        variant === "primary" && "bg-[var(--accent)] text-[#03140e] shadow-[0_16px_40px_color-mix(in_srgb,var(--accent),transparent_78%)]",
        variant === "secondary" && "border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text)]",
        variant === "ghost" && "border border-[var(--border)] bg-transparent text-[var(--text-muted)]",
        variant === "danger" && "bg-[var(--danger)] text-white",
      )}
    >
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type = "text", required, placeholder, prefix }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string; prefix?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[var(--text-muted)]">
      {label}
      <span className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[var(--text-muted)]">{prefix}</span>}
        <input className={cx(inputClass(), prefix && "pl-8")} type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} />
      </span>
    </label>
  );
}

function HeroChip({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-strong)] p-4"><span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">{label}</span><strong className="mt-2 block text-base">{value}</strong></div>;
}

function StatusPill({ label }: { label: string }) {
  const tone = label.toLowerCase();
  return <span className={cx("inline-flex min-h-7 items-center rounded-full px-3 text-xs font-bold", tone === "watch" && "bg-[color-mix(in_srgb,var(--warning),transparent_84%)] text-[var(--warning)]", (tone === "critical" || tone === "overspent") && "bg-[color-mix(in_srgb,var(--danger),transparent_84%)] text-[var(--danger)]", !["watch", "critical", "overspent"].includes(tone) && "bg-[color-mix(in_srgb,var(--success),transparent_84%)] text-[var(--success)]")}>{label}</span>;
}

function buildInsights(report: Report) {
  const insights: Array<{ icon: string; status: string; title: string; text: string }> = [];
  if (report.budgetUsedPercent > report.monthProgressPercent + 15) insights.push({ icon: "!", status: "Watch", title: "Budget pace warning", text: "You are spending faster than the month is passing." });
  if (report.safeToSpendPerDay > 0) insights.push({ icon: "₹", status: "Healthy", title: "Safe daily spend", text: `You can spend ${money(report.safeToSpendPerDay)} per day and stay within budget.` });
  report.categoryStats.filter((item) => item.usage >= 100).slice(0, 1).forEach((item) => insights.push({ icon: "!", status: "Overspent", title: `${item.name} is over budget`, text: `${item.name} is over budget by ${money(Math.abs(item.remaining))}.` }));
  report.categoryStats.filter((item) => item.usage >= 90 && item.usage < 100).slice(0, 1).forEach((item) => insights.push({ icon: "!", status: "Critical", title: `${item.name} is almost exhausted`, text: `${item.name} is ${Math.round(item.usage)}% used. Slow down for the rest of the month.` }));
  report.categoryStats.filter((item) => item.usage >= 70 && item.usage < 90).slice(0, 1).forEach((item) => insights.push({ icon: "i", status: "Watch", title: `${item.name} needs attention`, text: `${item.name} is ${Math.round(item.usage)}% used. Keep it slower for the rest of the month.` }));
  if (report.actualSavings > report.plannedSavings) insights.push({ icon: "+", status: "Healthy", title: "Savings ahead of plan", text: "You are saving more than planned this month." });
  if (!insights.length) insights.push({ icon: "OK", status: "Healthy", title: "Stable month", text: "Your spending is currently balanced against your plan." });
  return insights.slice(0, 5);
}

function trendPoints(transactions: Transaction[]) {
  const map = new Map<string, number>();
  transactions.forEach((item) => map.set(item.date.slice(-2), (map.get(item.date.slice(-2)) || 0) + item.amount));
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([day, amount]) => ({ day, amount }));
}

function statusForUsage(usage: number) {
  if (usage >= 100) return { label: "Overspent", color: "var(--danger)" };
  if (usage >= 90) return { label: "Critical", color: "var(--danger)" };
  if (usage >= 70) return { label: "Watch", color: "var(--warning)" };
  return { label: "Healthy", color: "var(--accent)" };
}

function filterTransactions(transactions: Transaction[], filters: Filters) {
  return transactions
    .filter((item) => filters.category === "All" || item.category === filters.category)
    .filter((item) => !filters.search || `${item.merchant} ${item.description}`.toLowerCase().includes(filters.search.toLowerCase()))
    .filter((item) => !filters.from || item.date >= filters.from)
    .filter((item) => !filters.to || item.date <= filters.to)
    .filter((item) => !filters.min || item.amount >= Number(filters.min))
    .filter((item) => !filters.max || item.amount <= Number(filters.max))
    .sort((a, b) => {
      if (filters.sort === "oldest") return a.date.localeCompare(b.date);
      if (filters.sort === "highest") return b.amount - a.amount;
      if (filters.sort === "lowest") return a.amount - b.amount;
      return b.date.localeCompare(a.date);
    });
}

function exportCsv(transactions: Transaction[]) {
  const header = ["Merchant", "Category", "Amount", "Date", "Payment Mode", "Description"];
  const rows = transactions.map((item) => [item.merchant, item.category, item.amount, item.date, item.paymentMode, item.description]);
  const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "rupeeflow-transactions.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function iconFor(item: View) {
  return { Overview: "O", Transactions: "T", Budgets: "B", Insights: "I", Reports: "R", Settings: "S" }[item];
}

function inputClass() {
  return "min-h-11 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-[var(--text)]";
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
