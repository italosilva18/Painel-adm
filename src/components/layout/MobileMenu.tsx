/**
 * MobileMenu Component
 * Mobile navigation menu shown in bottom sheet
 */

import { NavLink, useNavigate } from "react-router-dom";
import {
  HeadphonesIcon,
  Settings,
  Boxes,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/authStore";

const menuItems = [
  { path: "/suporte", label: "Suporte", icon: HeadphonesIcon, description: "Usuários de suporte" },
  { path: "/automações", label: "Automações", icon: Settings, description: "Sistemas de automação" },
  { path: "/módulos", label: "Módulos", icon: Boxes, description: "Módulos do sistema" },
];

interface MobileMenuProps {
  onClose: () => void;
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  return (
    <div className="space-y-2 pb-4">
      {/* User Info */}
      {user && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-xl mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">
              {(user.name || user.email || "?").substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{user.name || "Admin"}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                "hover:bg-accent active:bg-accent"
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </NavLink>
          );
        })}
      </div>

      <Separator className="my-4" />

      {/* Logout */}
      <Button
        variant="ghost"
        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5 mr-3" />
        Sair da conta
      </Button>
    </div>
  );
}

export default MobileMenu;
