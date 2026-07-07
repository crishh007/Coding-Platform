import { type ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Trophy, Home, Calendar, Users, Shield, 
  TerminalSquare, LogOut, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/contests", label: "Contests", icon: TerminalSquare },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/rankings", label: "Rankings", icon: Trophy },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/violations", label: "Anti-Cheat", icon: Shield },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex z-10 shadow-xl shadow-black/50">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
            <TerminalSquare className="w-6 h-6" />
            <span>ARENA.</span>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  active 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center px-6 justify-between md:hidden z-10">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <TerminalSquare className="w-6 h-6" />
            <span>ARENA.</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {children}
        </div>
        
        {/* CRT Scanline effect */}
        <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay" 
             style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }}>
        </div>
      </main>
    </div>
  );
}
