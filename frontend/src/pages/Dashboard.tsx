import { useMemo } from "react";
import { useFinanceStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { formatCurrency, monthKey, monthLabel } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, Wallet, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const StatCard = ({
  label,
  value,
  icon: Icon,
  tone,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  tone: "primary" | "success" | "destructive";
  trend?: string;
}) => {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-soft hover:shadow-elevated transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-display font-bold mt-2">{value}</p>
          {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
        </div>
        <div className={`h-11 w-11 rounded-xl grid place-items-center ${toneClasses}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { transactions, categories } = useFinanceStore();
  const user = useAuth((s) => s.user);

  const stats = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const expenseBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount));
    return Array.from(map.entries())
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId);
        return { name: cat?.name || "Unknown", amount, color: cat?.color || "#999", icon: cat?.icon || "•" };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories]);

  const monthly = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    transactions.forEach((t) => {
      const k = monthKey(t.date);
      const cur = map.get(k) || { income: 0, expense: 0 };
      cur[t.type] += t.amount;
      map.set(k, cur);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([k, v]) => ({ month: monthLabel(k), Income: v.income, Expense: v.expense }));
  }, [transactions]);

  const totalExpense = expenseBreakdown.reduce((s, x) => s + x.amount, 0) || 1;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="text-3xl md:text-4xl font-display font-bold">{user?.name?.split(" ")[0] || "there"} 👋</h1>
        <p className="text-muted-foreground mt-1">Here is a snapshot of your money.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Income" value={formatCurrency(stats.income)} icon={ArrowUpRight} tone="success" trend="All-time" />
        <StatCard label="Total Expense" value={formatCurrency(stats.expense)} icon={ArrowDownRight} tone="destructive" trend="All-time" />
        <StatCard label="Balance" value={formatCurrency(stats.balance)} icon={Wallet} tone="primary" trend={stats.balance >= 0 ? "On track" : "Over budget"} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-lg">Income vs Expense</h2>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                  }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Income" fill="hsl(var(--success))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-soft">
          <h2 className="font-display font-semibold text-lg mb-1">Expense Breakdown</h2>
          <p className="text-xs text-muted-foreground mb-4">By category</p>
          {expenseBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">No expenses yet.</p>
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      dataKey="amount"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {expenseBreakdown.map((d, i) => (
                        <Cell key={i} fill={d.color} stroke="hsl(var(--card))" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 12,
                      }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4 max-h-56 overflow-auto pr-1">
                {expenseBreakdown.map((b) => (
                  <div key={b.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: b.color }} />
                      <span className="truncate">{b.icon} {b.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold">{formatCurrency(b.amount)}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {Math.round((b.amount / totalExpense) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
