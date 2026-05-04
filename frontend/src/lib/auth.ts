import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "./types";
import { API_URL } from "./api-config";

type AuthResult = { ok: true } | { ok: false; error: string };

interface AuthJson {
  message?: string;
  data?: {
    user?: { id: number; email: string; name: string | null };
    token?: string;
  };
}

async function authRequest(path: "/api/auth/login" | "/api/auth/register", body: Record<string, string>) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as AuthJson;
  if (!res.ok) {
    const msg = typeof json.message === "string" ? json.message : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  const u = json.data?.user;
  const token = json.data?.token;
  if (!u || token === undefined) throw new Error("Invalid response from server");
  const user: User = {
    id: String(u.id),
    name: u.name ?? "",
    email: u.email,
  };
  return { user, token };
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (email, password) => {
        try {
          const { user, token } = await authRequest("/api/auth/login", { email, password });
          set({ user, token });
          return { ok: true };
        } catch (e) {
          return { ok: false, error: e instanceof Error ? e.message : "Sign in failed" };
        }
      },
      register: async (name, email, password) => {
        try {
          const { user, token } = await authRequest("/api/auth/register", { name, email, password });
          set({ user, token });
          return { ok: true };
        } catch (e) {
          return { ok: false, error: e instanceof Error ? e.message : "Registration failed" };
        }
      },
      logout: () => set({ user: null, token: null }),
    }),
    { name: "spendly-auth" }
  )
);

/** For future API calls (Authorization: Bearer …). */
export function getAuthToken(): string | null {
  return useAuth.getState().token;
}
