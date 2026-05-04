import { useState } from "react";
import { useFinanceStore } from "@/lib/store";
import type { Transaction, TransactionType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";

const emptyForm = {
  type: "expense" as TransactionType,
  amount: "",
  categoryId: "",
  note: "",
  date: new Date().toISOString().slice(0, 10),
};

const Transactions = () => {
  const { transactions, categories, addTransaction, updateTransaction, deleteTransaction } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<"all" | TransactionType>("all");

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditing(t);
    setForm({
      type: t.type,
      amount: String(t.amount),
      categoryId: t.categoryId,
      note: t.note || "",
      date: t.date.slice(0, 10),
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount.");
    if (!form.categoryId) return toast.error("Pick a category.");
    const payload = {
      type: form.type,
      amount: amt,
      categoryId: form.categoryId,
      note: form.note.trim() || undefined,
      date: new Date(form.date).toISOString(),
    };
    try {
      if (editing) {
        await updateTransaction(editing.id, payload);
        toast.success("Transaction updated.");
      } else {
        await addTransaction(payload);
        toast.success("Transaction added.");
      }
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      toast.success("Transaction deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete.");
    }
  };

  const filtered = transactions
    .filter((t) => (filter === "all" ? true : t.type === filter))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const availableCats = categories.filter((c) => c.type === "all" || c.type === form.type);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Transactions</h1>
          <p className="text-muted-foreground">Log income and expenses to keep your balance accurate.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> New transaction</Button>
      </header>

      <div className="flex gap-2">
        {(["all", "income", "expense"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-12 text-center text-muted-foreground">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId);
              const isIncome = t.type === "income";
              return (
                <li key={t.id} className="flex items-center gap-4 p-4 hover:bg-accent/40 transition-colors">
                  <div
                    className="h-11 w-11 rounded-xl grid place-items-center text-lg shrink-0"
                    style={{ background: `${cat?.color || "#999"}22`, color: cat?.color || "#999" }}
                  >
                    {cat?.icon || "•"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{cat?.name || "Uncategorized"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t.note || (isIncome ? "Income" : "Expense")} · {formatDate(t.date)}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 font-semibold tabular-nums ${isIncome ? "text-success" : "text-destructive"}`}>
                    {isIncome ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {isIncome ? "+" : "-"}{formatCurrency(t.amount)}
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit transaction" : "New transaction"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(["income", "expense"] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setForm({ ...form, type: t, categoryId: "" })}
                  className={`py-2.5 rounded-lg border-2 text-sm font-semibold capitalize transition-all ${
                    form.type === t
                      ? t === "income"
                        ? "border-success bg-success/10 text-success"
                        : "border-destructive bg-destructive/10 text-destructive"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" step="0.01" min="0" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {availableCats.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="What was it for?" rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Save" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
