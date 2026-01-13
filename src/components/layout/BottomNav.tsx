import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Smartphone,
  FileBarChart,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { MobileMenu } from "./MobileMenu";

const mainNavItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/lojas", label: "Lojas", icon: Building2 },
  { path: "/mobile", label: "Mobile", icon: Smartphone },
  { path: "/relatorios", label: "Relatórios", icon: FileBarChart },
];

export function BottomNav() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[64px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className={cn("text-xs", isActive && "font-medium")}>
                {item.label}
              </span>
            </NavLink>
          );
        })}

        {/* More Menu */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[64px]",
                "text-muted-foreground"
              )}
            >
              <Menu className="w-5 h-5" />
              <span className="text-xs">Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-2xl">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <MobileMenu onClose={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
