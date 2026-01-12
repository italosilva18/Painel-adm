/**
 * BottomNavigation Component
 * Mobile bottom navigation matching omnia-admin design
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Smartphone,
  FileBarChart,
  MoreHorizontal,
  Users,
  Settings,
  Boxes,
  X,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: Building2, label: 'Lojas', path: '/lojas' },
  { icon: Smartphone, label: 'Mobile', path: '/mobile' },
  { icon: FileBarChart, label: 'Relatorios', path: '/relatorios' },
];

const moreItems: NavItem[] = [
  { icon: Users, label: 'Suporte', path: '/suporte' },
  { icon: Users, label: 'Parceiros', path: '/parceiros' },
  { icon: Settings, label: 'Automacoes', path: '/automacoes' },
  { icon: Boxes, label: 'Modulos', path: '/modulos' },
];

interface BottomNavigationProps {
  onMoreClick?: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isMoreActive = moreItems.some(item => location.pathname === item.path);

  return (
    <>
      {/* Spacer */}
      <div className="h-20 md:hidden" />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Glass background */}
        <div className="absolute inset-0 glass border-t" />

        {/* Safe area for iPhone */}
        <div className="relative flex items-center justify-around h-16 px-2 pb-safe">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  flex flex-col items-center justify-center gap-0.5 py-2 px-4
                  rounded-xl transition-all duration-200 min-w-[60px]
                  ${active ? 'bg-cyan-50' : ''}
                `}
              >
                <div className={`w-6 h-6 flex items-center justify-center ${active ? 'text-cyan-600' : 'text-gray-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-medium ${active ? 'text-cyan-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
                {active && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-cyan-600" />
                )}
              </button>
            );
          })}

          {/* More Menu Button */}
          <button
            onClick={() => setMenuOpen(true)}
            className={`
              flex flex-col items-center justify-center gap-0.5 py-2 px-4
              rounded-xl transition-all duration-200 min-w-[60px]
              ${isMoreActive ? 'bg-cyan-50' : ''}
            `}
          >
            <div className={`w-6 h-6 flex items-center justify-center ${isMoreActive ? 'text-cyan-600' : 'text-gray-400'}`}>
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-medium ${isMoreActive ? 'text-cyan-600' : 'text-gray-400'}`}>
              Mais
            </span>
          </button>
        </div>
      </nav>

      {/* More Menu Sheet */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMenuOpen(false)}
          />

          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-slide-in-up pb-safe">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="px-4 pb-4 pt-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="px-4 pb-4 grid grid-cols-2 gap-3">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMenuOpen(false);
                    }}
                    className={`
                      flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 active:scale-[0.98]
                      ${active ? 'bg-cyan-50 text-cyan-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}
                    `}
                  >
                    <div className={`p-2 rounded-xl ${active ? 'bg-white' : 'bg-white'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Export MoreMenu for compatibility
export const MoreMenu: React.FC<{ isOpen: boolean; onClose: () => void }> = () => null;

export default BottomNavigation;
