/**
 * Dashboard Page Component
 * Main page shown after successful login with real API data
 * Matching omnia-admin design
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  Building2,
  Smartphone,
  ScanLine,
  Settings,
  RefreshCw,
  Clock,
  LogOut,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as dashboardService from '@/api/services/dashboardService';
import { DashboardStats } from '@/api/services/dashboardService';
import { StatCard, MenuCard } from '@/components/common';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const statsData = await dashboardService.getDashboardStats();
      setStats(statsData);

      if (isRefresh) {
        toast.success('Dados atualizados!');
      }
    } catch (error) {
      toast.error('Erro ao carregar dados do dashboard');
      setStats({
        activeStores: 0,
        mobileUsers: 0,
        totalBasics: 0,
        totalPartners: 0,
        date: new Date().toLocaleString('pt-BR'),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const quickAccess = [
    { label: 'Lojas', description: 'Gerenciar estabelecimentos', path: '/lojas', color: 'blue' as const },
    { label: 'Mobile', description: 'Usuários do aplicativo', path: '/mobile', color: 'purple' as const },
    { label: 'Suporte', description: 'Equipe de suporte', path: '/suporte', color: 'green' as const },
    { label: 'Relatórios', description: 'Estatísticas e exportação', path: '/relatorios', color: 'orange' as const },
    { label: 'Automações', description: 'Sistemas comerciais', path: '/automacoes', color: 'cyan' as const },
    { label: 'Módulos', description: 'Visualizar módulos', path: '/modulos', color: 'purple' as const },
  ];

  const recentActivity = [
    { action: 'Nova loja cadastrada', detail: 'Mercado Bom Preco - CNPJ: 12.345.678/0001-90', time: 'há 5 min', type: 'store' },
    { action: 'Usuário editado', detail: 'Joao Silva - mobile@email.com', time: 'há 15 min', type: 'user' },
    { action: 'Parceiro criado', detail: 'Tech Solutions Ltda', time: 'há 1 hora', type: 'partner' },
    { action: 'Automacao atualizada', detail: 'Sistema PDV Integrado', time: 'há 2 horas', type: 'automation' },
    { action: 'Modulo ativado', detail: 'OFFERTA - Loja Central', time: 'há 3 horas', type: 'module' },
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'store': return 'bg-cyan-500';
      case 'user': return 'bg-violet-500';
      case 'partner': return 'bg-amber-500';
      case 'automation': return 'bg-teal-500';
      case 'module': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header */}
      <header className="glass border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">MARGEM</h1>
                <p className="text-xs text-gray-500">Sistema Administrativo</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={() => loadDashboardData(true)}
                disabled={refreshing}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">Atualizar</span>
              </button>

              {/* User Info */}
              {user && (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-gray-500">Administrador</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-100 to-teal-200 flex items-center justify-center">
                    <span className="text-cyan-600 font-semibold text-sm">
                      {(user.name || user.email || '?').substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Visão geral do sistema MARGEM</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Lojas"
            value={stats?.activeStores || 0}
            icon={Building2}
            color="blue"
            loading={loading}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Usuários Mobile"
            value={stats?.mobileUsers || 0}
            icon={Smartphone}
            color="purple"
            loading={loading}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Total de Basics"
            value={stats?.totalBasics || 0}
            icon={ScanLine}
            color="green"
            loading={loading}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Total de Automações"
            value={stats?.totalPartners || 0}
            icon={Settings}
            color="orange"
            loading={loading}
            trend={{ value: 2, isPositive: true }}
          />
        </div>

        {/* Quick Access */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acesso Rápido</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickAccess.map((item) => (
              <MenuCard
                key={item.path}
                title={item.label}
                description={item.description}
                color={item.color}
                onClick={() => navigate(item.path)}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
            </div>
            <span className="text-xs text-gray-500">Ultimas 24 horas</span>
          </div>
          <div className="divide-y">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.detail}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-4 font-medium">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-gray-50 border-t">
            <button className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
              Ver toda atividade
            </button>
          </div>
        </div>

        {/* Mobile refresh indicator */}
        {stats && (
          <div className="text-center sm:hidden">
            <button
              onClick={() => loadDashboardData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-500 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Atualizado em: {stats.date}</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
