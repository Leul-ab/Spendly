import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Budget, Category, Transaction, TransactionType } from "./types";
import { getAuthToken } from "./auth";
import {
  createCategoryApi,
  createTransactionApi,
  deleteBudgetApi,
  deleteCategoryApi,
  deleteTransactionApi,
  fetchBudgetsApi,
  fetchCategoriesApi,
  fetchTransactionsApi,
  updateCategoryApi,
  updateTransactionApi,
  upsertBudgetApi,
} from "./finance-api";

interface FinanceState {
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];

  syncFinanceFromApi: () => Promise<void>;
  clearForLogout: () => void;

  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  addCategory: (c: Omit<Category, "id">) => Promise<void>;
  updateCategory: (id: string, c: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addBudget: (b: Omit<Budget, "id">) => Promise<void>;
  updateBudget: (id: string, b: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      categories: [],
      transactions: [],
      budgets: [],

      clearForLogout: () => set({ transactions: [], categories: [], budgets: [] }),

      syncFinanceFromApi: async () => {
        if (!getAuthToken()) return;
        const prev = get().categories;
        const [freshList, transactions, budgets] = await Promise.all([
          fetchCategoriesApi(),
          fetchTransactionsApi(),
          fetchBudgetsApi(),
        ]);
        const merged = freshList.map((c) => {
          const old = prev.find((x) => x.id === c.id);
          if (!old) return c;
          return {
            ...c,
            color: old.color,
            icon: old.icon,
            type: old.type !== "all" ? old.type : c.type,
          };
        });
        set({ categories: merged, transactions, budgets });
      },

      addTransaction: async (t) => {
        if (!getAuthToken()) throw new Error("Not signed in");
        const created = await createTransactionApi(t);
        set((s) => ({ transactions: [created, ...s.transactions] }));
      },

      updateTransaction: async (id, t) => {
        if (!getAuthToken()) throw new Error("Not signed in");
        const prev = get().transactions.find((x) => x.id === id);
        if (!prev) throw new Error("Transaction not found");
        const merged = { ...prev, ...t };
        const updated = await updateTransactionApi(id, {
          type: merged.type,
          amount: merged.amount,
          categoryId: merged.categoryId,
          note: merged.note,
          date: merged.date,
        });
        set((s) => ({
          transactions: s.transactions.map((x) => (x.id === id ? updated : x)),
        }));
      },

      deleteTransaction: async (id) => {
        if (!getAuthToken()) throw new Error("Not signed in");
        await deleteTransactionApi(id);
        set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) }));
      },

      addCategory: async (c) => {
        if (!getAuthToken()) throw new Error("Not signed in");
        const fromApi = await createCategoryApi(c.name.trim());
        const merged: Category = {
          ...fromApi,
          type: c.type,
          color: c.color,
          icon: c.icon,
          source: "user",
        };
        set((s) => ({
          categories: [...s.categories.filter((x) => x.id !== merged.id), merged].sort((a, b) =>
            a.name.localeCompare(b.name)
          ),
        }));
      },

      updateCategory: async (id, c) => {
        if (!getAuthToken()) throw new Error("Not signed in");
        const prev = get().categories.find((x) => x.id === id);
        if (!prev) throw new Error("Category not found");
        if (prev.source === "global") throw new Error("Cannot edit a built-in category");
        const name = (c.name ?? prev.name).trim();
        const fromApi = await updateCategoryApi(id, name);
        set((s) => ({
          categories: s.categories.map((x) =>
            x.id === id
              ? {
                  ...fromApi,
                  type: c.type ?? prev.type,
                  color: c.color ?? prev.color,
                  icon: c.icon ?? prev.icon,
                  source: "user" as const,
                }
              : x
          ),
        }));
      },

      deleteCategory: async (id) => {
        if (!getAuthToken()) throw new Error("Not signed in");
        const prev = get().categories.find((x) => x.id === id);
        if (!prev) throw new Error("Category not found");
        if (prev.source === "global") throw new Error("Cannot delete a built-in category");
        await deleteCategoryApi(id);
        set((s) => ({
          categories: s.categories.filter((x) => x.id !== id),
          transactions: s.transactions.filter((t) => t.categoryId !== id),
          budgets: s.budgets.filter((b) => b.categoryId !== id),
        }));
      },

      addBudget: async (b) => {
        if (!getAuthToken()) throw new Error("Not signed in");
        const created = await upsertBudgetApi({
          amount: b.amount,
          categoryId: Number(b.categoryId),
          month: b.month,
        });
        set((s) => {
          const withoutDup = s.budgets.filter(
            (x) => !(x.categoryId === created.categoryId && x.month === created.month)
          );
          return { budgets: [...withoutDup, created] };
        });
      },

      updateBudget: async (id, partial) => {
        if (!getAuthToken()) throw new Error("Not signed in");
        const prev = get().budgets.find((x) => x.id === id);
        if (!prev) throw new Error("Budget not found");
        const month = partial.month ?? prev.month;
        const categoryId = partial.categoryId ?? prev.categoryId;
        const amount = partial.amount ?? prev.amount;

        if (categoryId !== prev.categoryId || month !== prev.month) {
          await deleteBudgetApi(prev.id);
          const created = await upsertBudgetApi({
            amount,
            categoryId: Number(categoryId),
            month,
          });
          set((s) => {
            const withoutOld = s.budgets.filter((x) => x.id !== prev.id);
            const withoutDup = withoutOld.filter(
              (x) => !(x.categoryId === created.categoryId && x.month === created.month)
            );
            return { budgets: [...withoutDup, created] };
          });
        } else {
          const updated = await upsertBudgetApi({
            amount,
            categoryId: Number(categoryId),
            month,
          });
          set((s) => ({
            budgets: s.budgets.map((x) => (x.id === updated.id ? updated : x)),
          }));
        }
      },

      deleteBudget: async (id) => {
        if (!getAuthToken()) throw new Error("Not signed in");
        await deleteBudgetApi(id);
        set((s) => ({ budgets: s.budgets.filter((x) => x.id !== id) }));
      },
    }),
    { name: "spendly-finance-v2" }
  )
);

export const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];
