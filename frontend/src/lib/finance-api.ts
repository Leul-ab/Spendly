import type { Budget, Category, Transaction, TransactionType } from "./types";
import { apiFetch, apiJson, parseJsonOrEmpty, ApiError } from "./api-client";

const CAT_COLORS = ["#22c55e", "#0ea5e9", "#a855f7", "#f97316", "#ef4444", "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6", "#eab308"];
const CAT_ICONS = ["💼", "🍽️", "🏠", "🚗", "🛍️", "🎬", "💊", "📁", "🏷️", "⭐"];

export interface ApiCategory {
  id: number;
  name: string;
  userId: number | null;
  createdAt?: string;
}

export interface ApiBudget {
  id: number;
  amount: number;
  month: string;
  categoryId: number;
  userId?: number;
  category?: ApiCategory | null;
}

export function mapApiBudget(b: ApiBudget): Budget {
  return {
    id: String(b.id),
    categoryId: String(b.categoryId),
    amount: b.amount,
    month: b.month,
  };
}

export interface ApiTransaction {
  id: number;
  amount: number;
  type: "INCOME" | "EXPENSE";
  description: string | null;
  date: string;
  categoryId: number;
  userId?: number;
  category?: ApiCategory | null;
}

export function mapApiTransaction(t: ApiTransaction): Transaction {
  return {
    id: String(t.id),
    type: t.type === "INCOME" ? "income" : "expense",
    amount: t.amount,
    categoryId: String(t.categoryId),
    note: t.description ?? undefined,
    date: new Date(t.date).toISOString(),
  };
}

/** API categories are untyped; mark as `all` so income and expense forms can both use them. */
export function mapApiCategory(c: ApiCategory): Category {
  const i = Math.abs(c.id) % CAT_COLORS.length;
  return {
    id: String(c.id),
    name: c.name,
    type: "all",
    color: CAT_COLORS[i],
    icon: CAT_ICONS[i % CAT_ICONS.length],
    source: c.userId == null ? "global" : "user",
  };
}

function toApiPayload(t: {
  type: TransactionType;
  amount: number;
  categoryId: string;
  note?: string;
  date: string;
}) {
  return {
    amount: t.amount,
    type: t.type === "income" ? "INCOME" : "EXPENSE",
    categoryId: Number(t.categoryId),
    description: t.note ?? null,
    date: t.date.slice(0, 10),
  };
}

export async function fetchCategoriesApi(): Promise<Category[]> {
  const res = await apiFetch("/api/categories", { method: "GET" });
  const raw = (await res.json().catch(() => [])) as ApiCategory[] | unknown;
  if (!res.ok) {
    const j = raw as { error?: string };
    throw new ApiError(j?.error || `Request failed (${res.status})`, res.status);
  }
  if (!Array.isArray(raw)) return [];
  return raw.map(mapApiCategory);
}

export async function createCategoryApi(name: string): Promise<Category> {
  const json = await apiJson<{ data: ApiCategory }>("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!json.data) throw new Error("Invalid create response");
  return mapApiCategory(json.data);
}

export async function updateCategoryApi(id: string, name: string): Promise<Category> {
  const json = await apiJson<{ data: ApiCategory }>(`/api/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!json.data) throw new Error("Invalid update response");
  return mapApiCategory(json.data);
}

export async function deleteCategoryApi(id: string): Promise<void> {
  await apiJson(`/api/categories/${id}`, { method: "DELETE" });
}

export async function fetchTransactionsApi(params?: { limit?: number; page?: number }): Promise<Transaction[]> {
  const limit = params?.limit ?? 500;
  const page = params?.page ?? 1;
  const res = await apiFetch(`/api/transactions?limit=${limit}&page=${page}`, { method: "GET" });
  const json = await parseJsonOrEmpty(res);
  if (!res.ok) {
    const msg = (typeof json.message === "string" && json.message) || `Request failed (${res.status})`;
    throw new ApiError(msg, res.status);
  }
  const data = json.data;
  if (!Array.isArray(data)) return [];
  return (data as ApiTransaction[]).map(mapApiTransaction);
}

export async function createTransactionApi(body: Omit<Transaction, "id">): Promise<Transaction> {
  const json = await apiJson<{ data: ApiTransaction }>("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiPayload(body)),
  });
  if (!json.data) throw new Error("Invalid create response");
  return mapApiTransaction(json.data);
}

export async function updateTransactionApi(
  id: string,
  body: Pick<Transaction, "type" | "amount" | "categoryId" | "note" | "date">
): Promise<Transaction> {
  const json = await apiJson<{ data: ApiTransaction }>(`/api/transactions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiPayload(body)),
  });
  if (!json.data) throw new Error("Invalid update response");
  return mapApiTransaction(json.data);
}

export async function deleteTransactionApi(id: string): Promise<void> {
  await apiJson(`/api/transactions/${id}`, { method: "DELETE" });
}

export async function fetchBudgetsApi(): Promise<Budget[]> {
  const json = await apiJson<{ data: ApiBudget[] }>("/api/budgets", { method: "GET" });
  if (!Array.isArray(json.data)) return [];
  return json.data.map(mapApiBudget);
}

export async function upsertBudgetApi(body: {
  amount: number;
  categoryId: number;
  month: string;
}): Promise<Budget> {
  const json = await apiJson<{ data: ApiBudget }>("/api/budgets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!json.data) throw new Error("Invalid budget response");
  return mapApiBudget(json.data);
}

export async function deleteBudgetApi(id: string): Promise<void> {
  await apiJson(`/api/budgets/${id}`, { method: "DELETE" });
}
