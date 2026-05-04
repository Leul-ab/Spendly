import { Sparkles } from "lucide-react";
import { ReactNode } from "react";

const AuthShell = ({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full gradient-primary opacity-20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary-glow opacity-10 blur-3xl" />

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-11 w-11 overflow-hidden rounded-full shadow-glow">
            <img src="/wallet-logo.png" alt="Spendly logo" className="h-full w-full object-cover" />
          </div>
          <span className="font-display font-bold text-2xl">Spendly</span>
        </div>
        <div className="bg-card border border-border rounded-2xl shadow-elevated p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
