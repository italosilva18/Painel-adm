/**
 * MainLayout Component
 * Main layout with sidebar for desktop and bottom nav for mobile
 */

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

export function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300 ease-in-out pb-20 md:pb-0",
          sidebarCollapsed ? "md:ml-[72px]" : "md:ml-64"
        )}
      >
        <div className="min-h-screen">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default MainLayout;
