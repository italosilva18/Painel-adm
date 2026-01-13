/**
 * PageHeader Component
 * Consistent header for all pages with mobile menu support
 */

import React, { useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  Building2,
  Smartphone,
  HeadphonesIcon,
  Users,
  Settings,
  Boxes,
  FileBarChart,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/lojas', label: 'Lojas', icon: Building2 },
  { path: '/mobile', label: 'Mobile', icon: Smartphone },
  { path: '/suporte', label: 'Suporte', icon: HeadphonesIcon },
  { path: '/parceiros', label: 'Parceiros', icon: Users },
  { path: '/automacoes', label: 'Automações', icon: Settings },
  { path: '/modulos', label: 'Módulos', icon: Boxes },
  { path: '/relatorios', label: 'Relatórios', icon: FileBarChart },
];

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className={`border-b bg-white sticky top-0 z-30 ${className}`}>
        <div className="px-4 md:px-6 py-4 md:py-5">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button + Title */}
            <div className="flex items-center gap-3">
              {/* Mobile hamburger menu */}
              <button
                onClick={() => setMenuOpen(true)}
                className="md:hidden h-10 w-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              {/* Title */}
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
                {description && (
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5 hidden sm:block">{description}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            {children && (
              <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                {children}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Sheet */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMenuOpen(false)}
          />

          {/* Sheet */}
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white animate-slide-in-left shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <span className="font-bold text-lg text-gray-900">MARGEM</span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 flex-1 overflow-y-auto">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => {
                          navigate(item.path);
                          setMenuOpen(false);
                        }}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                          ${isActive
                            ? 'bg-cyan-50 text-cyan-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-600' : ''}`} />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PageHeader;
