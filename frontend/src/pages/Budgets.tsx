import { useMemo, useState } from "react";
import { useFinanceStore } from "@/lib/store";
import type { Budget } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, monthKey, monthLabel } from "@/lib/format";
import { toast } from "sonner";

const empty = { categoryId: "", amount: "" };

const Budgets = () => {
  const { budgets, categories, transactions, addBudget, updateBudget, deleteBudget } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const currentMonth = monthKey(new Date().toISOString());

  const budgetsThisMonth = useMemo(
    () => budgets.filter((b) => b.month === currentMonth),
    [budgets, currentMonth]
  );

  const spendThisMonth = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === "expense" && monthKey(t.date) === currentMonth)
      .forEach((t) => map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount));
    return map;
  }, [transactions, currentMonth]);

  const expenseCats = categories.filter((c) => c.type === "expense" || c.type === "all");

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (b: Budget) => {
    setEditing(b);
    setForm({ categoryId: b.categoryId, amount: String(b.amount) });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount.");
    if (!form.categoryId) return toast.error("Pick a category.");
    if (
      !editing &&
      budgetsThisMonth.some((b) => b.categoryId === form.categoryId)
    ) {
      return toast.error("A budget for that category already exists this month.");
    }
    if (
      editing &&
      budgetsThisMonth.some((b) => b.categoryId === form.categoryId && b.id !== editing.id)
    ) {
      return toast.error("Another budget already uses that category this month.");
    }
    setSaving(true);
    try {
      if (editing) {
        await updateBudget(editing.id, {
          categoryId: form.categoryId,
          amount: amt,
          month: currentMonth,
        });
        toast.success("Budget updated.");
      } else {
        await addBudget({
          categoryId: form.categoryId,
          amount: amt,
          month: currentMonth,
        });
        toast.success("Budget created.");
      }
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteBudget(id);
      toast.success("Budget deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Budgets</h1>
          <p className="text-muted-foreground">
            Set limits for {monthLabel(currentMonth)} and watch your spending pace.
          </p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> New budget</Button>
      </header>

      {budgetsThisMonth.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-soft">
          <p className="text-muted-foreground">
            No budgets for this month yet. Create one to start tracking limits.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetsThisMonth.map((b) => {
            const cat = categories.find((c) => c.id === b.categoryId);
            const spent = spendThisMonth.get(b.categoryId) || 0;
            const pct = Math.min((spent / b.amount) * 100, 100);
            const over = spent > b.amount;
            return (
              <div key={b.id} className="bg-card border border-border rounded-2xl p-5 shadow-soft hover:shadow-elevated transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="h-11 w-11 rounded-xl grid place-items-center text-xl shrink-0"
                    style={{ background: `${cat?.color || "#999"}22`, color: cat?.color || "#999" }}
                  >
                    {cat?.icon || "•"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{cat?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{monthLabel(b.month)}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-display font-bold tabular-nums">{formatCurrency(spent)}</span>
                  <span className="text-sm text-muted-foreground">of {formatCurrency(b.amount)}</span>
                </div>
                <Progress value={pct} className={over ? "[&>div]:bg-destructive" : ""} />
                <p className={`text-xs mt-2 ${over ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                  {over
                    ? `Over by ${formatCurrency(spent - b.amount)}`
                    : `${formatCurrency(b.amount - spent)} remaining`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit budget" : "New budget"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Select expense category" /></SelectTrigger>
                <SelectContent>
                  {expenseCats.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Monthly limit ({monthLabel(currentMonth)})</Label>
              <Input type="number" step="0.01" min="0" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editing ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Budgets;
