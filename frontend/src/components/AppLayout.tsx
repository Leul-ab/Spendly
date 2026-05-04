import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, Tags, Wallet, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useFinanceStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/budgets", label: "Budgets", icon: Wallet },
];

const AppLayout = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const syncFinanceFromApi = useFinanceStore((s) => s.syncFinanceFromApi);
  const clearForLogout = useFinanceStore((s) => s.clearForLogout);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        await syncFinanceFromApi();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not load finance data.");
      }
    })();
  }, [token, syncFinanceFromApi]);

  const handleLogout = () => {
    clearForLogout();
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar/60 backdrop-blur-sm">
        <div className="px-6 py-6 flex items-center gap-2">
          <div className="h-10 w-10 overflow-hidden rounded-full shadow-glow">
            <img src="/wallet-logo.svg" alt="Spendly logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="font-display font-bold text-lg leading-none">Spendly</p>
            <p className="text-xs text-muted-foreground mt-1">Finance tracker</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full gradient-primary grid place-items-center text-primary-foreground font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            <LogOut className="h-3.5 w-3.5 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-background/80 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-full">
              <img src="/wallet-logo.png" alt="Spendly logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-display font-bold">Spendly</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex overflow-x-auto px-2 pb-2 gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="flex-1 min-w-0 pt-28 md:pt-0">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
