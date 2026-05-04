import { useState } from "react";
import { useFinanceStore } from "@/lib/store";
import type { Category, TransactionType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ICONS = ["💼", "🧑‍💻", "📈", "🎁", "🍽️", "🏠", "🚗", "🛍️", "🎬", "💊", "✈️", "📚", "💡", "🐶", "🎮", "💰"];
const COLORS = ["#22c55e", "#0ea5e9", "#a855f7", "#f97316", "#ef4444", "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6", "#eab308"];

const empty = { name: "", type: "expense" as TransactionType, color: COLORS[0], icon: ICONS[0] };

const isReadOnly = (c: Category) => c.source === "global";

const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (c: Category) => {
    if (isReadOnly(c)) return;
    setEditing(c);
    const t: TransactionType = c.type === "income" || c.type === "expense" ? c.type : "expense";
    setForm({ name: c.name, type: t, color: c.color, icon: c.icon });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Enter a name.");
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, form);
        toast.success("Category updated.");
      } else {
        await addCategory(form);
        toast.success("Category created.");
      }
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (c: Category) => {
    if (isReadOnly(c)) return;
    if (!confirm(`Delete "${c.name}"? Related transactions and budgets will be removed from this app.`)) return;
    try {
      await deleteCategory(c.id);
      toast.success("Category deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete category.");
    }
  };

  const grouped = {
    income: categories.filter((c) => c.type === "income"),
    expense: categories.filter((c) => c.type === "expense" || c.type === "all"),
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Categories</h1>
          <p className="text-muted-foreground">Organize where your money comes from and goes.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> New category</Button>
      </header>

      {(["income", "expense"] as const).map((type) => (
        <section key={type}>
          <h2 className="font-display font-semibold text-lg mb-3 capitalize">{type}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {grouped[type].length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full">No {type} categories.</p>
            )}
            {grouped[type].map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-xl p-4 shadow-soft flex items-center gap-3 hover:shadow-elevated transition-all">
                <div
                  className="h-11 w-11 rounded-xl grid place-items-center text-xl shrink-0"
                  style={{ background: `${c.color}22`, color: c.color }}
                >
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                  {c.type === "all" ? "Any" : c.type}
                  {isReadOnly(c) ? " · built-in" : ""}
                </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={isReadOnly(c)}
                  title={isReadOnly(c) ? "Built-in categories cannot be edited" : undefined}
                  onClick={() => openEdit(c)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={isReadOnly(c)}
                  title={isReadOnly(c) ? "Built-in categories cannot be deleted" : undefined}
                  onClick={() => onDelete(c)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(["income", "expense"] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setForm({ ...form, type: t })}
                  className={`py-2.5 rounded-lg border-2 text-sm font-semibold capitalize transition-all ${
                    form.type === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Groceries" />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-1.5">
                {ICONS.map((i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setForm({ ...form, icon: i })}
                    className={`h-9 w-9 rounded-lg text-lg grid place-items-center transition-all ${
                      form.icon === i ? "ring-2 ring-primary bg-primary/10" : "bg-secondary hover:bg-accent"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    className={`h-8 w-8 rounded-full transition-transform ${form.color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
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

export default Categories;
