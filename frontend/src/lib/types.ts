export type TransactionType = "income" | "expense";

/** `all` = category from API (no income/expense distinction on server). */
export type CategoryType = TransactionType | "all";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  /** API: built-in (userId null) vs user-created */
  source?: "global" | "user";
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  note?: string;
  date: string; // ISO
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  /** Calendar month key, matches API: `"YYYY-MM"` */
  month: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
