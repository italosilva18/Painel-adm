/**
 * Application Router
 * Defines all routes and navigation structure
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Layout
import { MainLayout } from '@/components/layout';

// Pages
import LoginPage from '@/components/LoginPage';
import DashboardPage from '@/components/DashboardPage';
import LojasPage from '@/components/LojasPage';
import MobilePage from '@/components/MobilePage';
import SuportePage from '@/components/SuportePage';
import AutomacoesPage from '@/components/AutomacoesPage';
import ModulosPage from '@/components/ModulosPage';
import RelatoriosPage from '@/components/RelatoriosPage';
import ProtectedRoute from '@/components/ProtectedRoute';

// Protected Layout wrapper
const ProtectedLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  );
};

export const AppRouter: React.FC = () => {
  const { hydrate } = useAuthStore();

  // Hydrate auth state from localStorage on app mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes with Layout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/lojas" element={<LojasPage />} />
          <Route path="/mobile" element={<MobilePage />} />
          <Route path="/suporte" element={<SuportePage />} />
          <Route path="/automacoes" element={<AutomacoesPage />} />
          <Route path="/modulos" element={<ModulosPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
        </Route>

        {/* Catch all - redirect to dashboard if authenticated, login otherwise */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
