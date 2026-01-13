/**
 * Relatórios Page Component
 * Reports and statistics for the admin panel
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  RefreshCw,
  Building,
  Smartphone,
  ScanLine,
  Users,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  PieChart,
  TrendingUp,
  Package,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/common';
import * as reportService from '@/api/services/reportService';
import { getPartners } from '@/api/services/referenceData';
import {
  ReportSummary,
  StoreReportItem,
  ReportFilters,
} from '@/api/services/reportService';

type ReportType = 'summary' | 'stores' | 'partners' | 'modules';

export const RelatoriosPage: React.FC = () => {
  // State
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [storesData, setStoresData] = useState<StoreReportItem[]>([]);
  const [partners, setPartners] = useState<{ name: string; _id?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStores, setLoadingStores] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Report type selection
  const [reportType, setReportType] = useState<ReportType>('summary');

  // Filters for stores report
  const [filters, setFilters] = useState<ReportFilters>({
    page: 1,
    limit: 20,
    partner: '',
    active: '',
  });

  // Pagination
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (reportType === 'stores') {
      loadStoresReport();
    }
  }, [reportType, filters.page, filters.partner, filters.active]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [summaryData, partnersData] = await Promise.all([
        reportService.getReportSummary(),
        getPartners(),
      ]);

      setSummary(summaryData);
      setPartners(partnersData);
    } catch (error) {
      toast.error('Erro ao carregar dados iniciais');
    } finally {
      setLoading(false);
    }
  };

  const loadStoresReport = async () => {
    try {
      setLoadingStores(true);
      const response = await reportService.getStoresReport(filters);
      setStoresData(response.data || []);
      setTotalPages(response.totalPages);
      setTotalRecords(response.total);
    } catch (error) {
      toast.error('Erro ao carregar relatório de lojas');
    } finally {
      setLoadingStores(false);
    }
  };

  const handleRefresh = async () => {
    await loadInitialData();
    if (reportType === 'stores') {
      await loadStoresReport();
    }
    toast.success('Dados atualizados!');
  };

  const handleExportSummary = () => {
    if (!summary) return;
    try {
      reportService.exportSummaryToCSV(summary, `resumo-executivo-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Resumo exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar resumo');
    }
  };

  const handleExportStores = async () => {
    try {
      setExporting(true);
      toast.loading('Exportando lojas...', { id: 'export' });
      const allStores = await reportService.getAllStoresForExport(filters);
      reportService.exportStoresToCSV(allStores, `relatorio-lojas-${new Date().toISOString().split('T')[0]}.csv`);
      toast.dismiss('export');
      toast.success(`${allStores.length} lojas exportadas com sucesso!`);
    } catch (error) {
      toast.dismiss('export');
      toast.error('Erro ao exportar lojas');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPartners = () => {
    if (!summary?.storesByPartner) return;
    try {
      reportService.exportPartnersToCSV(summary.storesByPartner, `lojas-por-parceiro-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Relatório de parceiros exportado!');
    } catch (error) {
      toast.error('Erro ao exportar');
    }
  };

  const goToPage = (page: number) => {
    setFilters(prev => ({ ...prev, page: Math.max(1, Math.min(page, totalPages)) }));
  };

  // Skeleton for loading
  const StatSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
      <div className="h-8 w-16 bg-gray-200 rounded"></div>
    </div>
  );

  // Report type tabs
  const reportTypes = [
    { id: 'summary' as ReportType, label: 'Resumo Executivo', icon: PieChart },
    { id: 'stores' as ReportType, label: 'Lojas', icon: Building },
    { id: 'partners' as ReportType, label: 'Por Parceiro', icon: Users },
    { id: 'modules' as ReportType, label: 'Módulos', icon: Package },
  ];

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Relatórios"
        description="Estatísticas e análises do sistema"
      />

      <main className="p-4 md:p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total de Lojas */}
          <div className="card p-4 md:p-6 border-l-4 border-cyan-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Lojas</p>
                {loading ? (
                  <StatSkeleton />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {summary?.totalStores?.toLocaleString() || 0}
                  </p>
                )}
              </div>
              <div className="h-10 w-10 bg-cyan-100 rounded-full flex items-center justify-center">
                <Building className="w-5 h-5 text-cyan-600" />
              </div>
            </div>
          </div>

          {/* Lojas Ativas */}
          <div className="card p-4 md:p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Ativas</p>
                {loading ? (
                  <StatSkeleton />
                ) : (
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {summary?.activeStores?.toLocaleString() || 0}
                  </p>
                )}
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Lojas Inativas */}
          <div className="card p-4 md:p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Inativas</p>
                {loading ? (
                  <StatSkeleton />
                ) : (
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {summary?.inactiveStores?.toLocaleString() || 0}
                  </p>
                )}
              </div>
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>

          {/* Usuários Mobile */}
          <div className="card p-4 md:p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Mobile</p>
                {loading ? (
                  <StatSkeleton />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {summary?.totalMobileUsers?.toLocaleString() || 0}
                  </p>
                )}
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Scanner/Básico */}
          <div className="card p-4 md:p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Plano Básico</p>
                {loading ? (
                  <StatSkeleton />
                ) : (
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {summary?.moduleStats?.scanner || 0}
                  </p>
                )}
              </div>
              <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                <ScanLine className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="card p-4">
          <div className="flex flex-wrap gap-2">
            {reportTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  reportType === type.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <type.icon className="w-4 h-4" />
                {type.label}
              </button>
            ))}
            <div className="ml-auto">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {reportType === 'summary' && (
          <div className="space-y-6">
            {/* Modules Stats */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-cyan-600" />
                  <h2 className="text-lg font-bold text-gray-900">Módulos Ativos</h2>
                </div>
                <button onClick={handleExportSummary} className="btn-secondary flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-amber-50 rounded-xl">
                  <p className="text-sm text-amber-700 font-medium">Scanner</p>
                  <p className="text-3xl font-bold text-amber-600 mt-1">
                    {summary?.moduleStats?.scanner || 0}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-700 font-medium">Offerta</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {summary?.moduleStats?.offerta || 0}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-700 font-medium">Oppinar</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {summary?.moduleStats?.oppinar || 0}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <p className="text-sm text-purple-700 font-medium">Prazzo</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {summary?.moduleStats?.prazzo || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Plan Distribution */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-cyan-600" />
                <h2 className="text-lg font-bold text-gray-900">Distribuição por Plano</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white">
                  <p className="text-amber-100 font-medium">Plano Básico (Scanner)</p>
                  <p className="text-4xl font-bold mt-2">{summary?.moduleStats?.scanner || 0}</p>
                  <p className="text-amber-100 text-sm mt-1">
                    {summary?.activeStores ? ((summary.moduleStats?.scanner / summary.activeStores) * 100).toFixed(1) : 0}% das lojas ativas
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl text-white">
                  <p className="text-cyan-100 font-medium">Plano Avançado</p>
                  <p className="text-4xl font-bold mt-2">
                    {(summary?.activeStores || 0) - (summary?.moduleStats?.scanner || 0)}
                  </p>
                  <p className="text-cyan-100 text-sm mt-1">
                    {summary?.activeStores ? (((summary.activeStores - (summary.moduleStats?.scanner || 0)) / summary.activeStores) * 100).toFixed(1) : 0}% das lojas ativas
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'stores' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="card p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filtros:</span>
                </div>

                <select
                  value={filters.partner || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, partner: e.target.value, page: 1 }))}
                  className="select-field w-auto min-w-[200px]"
                >
                  <option value="">Todos os Parceiros</option>
                  {partners.map((p) => (
                    <option key={p._id || p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>

                <select
                  value={filters.active || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, active: e.target.value as 'true' | 'false' | '', page: 1 }))}
                  className="select-field w-auto"
                >
                  <option value="">Todos os Status</option>
                  <option value="true">Ativas</option>
                  <option value="false">Inativas</option>
                </select>

                <div className="ml-auto">
                  <button
                    onClick={handleExportStores}
                    disabled={exporting}
                    className="btn-primary flex items-center gap-2"
                  >
                    {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                    {exporting ? 'Exportando...' : 'Exportar CSV'}
                  </button>
                </div>
              </div>
            </div>

            {/* Stores Table */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Relatório de Lojas</h2>
                <p className="text-sm text-gray-500">
                  {totalRecords.toLocaleString()} lojas encontradas
                </p>
              </div>

              {loadingStores ? (
                <div className="p-12 text-center">
                  <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Carregando lojas...</p>
                </div>
              ) : storesData.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNPJ</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parceiro</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cidade/UF</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Módulos</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {storesData.map((store) => (
                          <tr key={store._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">{store.cnpj}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="font-medium text-gray-900">{store.name}</div>
                              <div className="text-gray-500 text-xs">{store.company}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{store.partner}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{store.city}/{store.state}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {store.hasScanner && <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">Scanner</span>}
                                {store.offerta && <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">Offerta</span>}
                                {store.oppinar && <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">Oppinar</span>}
                                {store.prazzo && <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">Prazzo</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                store.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {store.active ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Página <span className="font-medium">{filters.page}</span> de{' '}
                        <span className="font-medium">{totalPages}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => goToPage((filters.page || 1) - 1)}
                          disabled={filters.page === 1}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Página anterior"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => goToPage((filters.page || 1) + 1)}
                          disabled={filters.page === totalPages}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Próxima página"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center">
                  <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma loja encontrada</h3>
                  <p className="text-gray-500">Ajuste os filtros para ver os resultados</p>
                </div>
              )}
            </div>
          </div>
        )}

        {reportType === 'partners' && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Top 20 Parceiros/Automações</h2>
                <p className="text-sm text-gray-500">Lojas por parceiro integrador</p>
              </div>
              <button onClick={handleExportPartners} className="btn-secondary flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin mx-auto" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parceiro/Automação</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participação</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {summary?.storesByPartner?.map((partner, index) => (
                      <tr key={partner.partner} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{partner.partner}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{partner.count.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-cyan-600 h-2 rounded-full"
                                style={{ width: `${((partner.count / (summary?.totalStores || 1)) * 100)}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {((partner.count / (summary?.totalStores || 1)) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {reportType === 'modules' && (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Package className="w-5 h-5 text-cyan-600" />
                <h2 className="text-lg font-bold text-gray-900">Detalhamento de Módulos</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Scanner */}
                <div className="border rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <ScanLine className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Scanner</h3>
                      <p className="text-sm text-gray-500">Plano Básico</p>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-amber-600">{summary?.moduleStats?.scanner || 0}</p>
                  <p className="text-sm text-gray-500 mt-2">lojas com módulo ativo</p>
                </div>

                {/* Offerta */}
                <div className="border rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Offerta</h3>
                      <p className="text-sm text-gray-500">Gestão de Ofertas</p>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-blue-600">{summary?.moduleStats?.offerta || 0}</p>
                  <p className="text-sm text-gray-500 mt-2">lojas com módulo ativo</p>
                </div>

                {/* Oppinar */}
                <div className="border rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Oppinar</h3>
                      <p className="text-sm text-gray-500">NPS e Feedback</p>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-green-600">{summary?.moduleStats?.oppinar || 0}</p>
                  <p className="text-sm text-gray-500 mt-2">lojas com módulo ativo</p>
                </div>

                {/* Prazzo */}
                <div className="border rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Prazzo</h3>
                      <p className="text-sm text-gray-500">Gestão de Prazos</p>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-purple-600">{summary?.moduleStats?.prazzo || 0}</p>
                  <p className="text-sm text-gray-500 mt-2">lojas com módulo ativo</p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="card p-6 bg-gradient-to-r from-cyan-50 to-teal-50 border-cyan-200">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-cyan-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Sobre os Módulos</h3>
                  <p className="text-gray-600 text-sm">
                    <strong>Scanner (Plano Básico):</strong> Leitura de código de barras e consulta de preços.<br />
                    <strong>Offerta:</strong> Gestão de ofertas e promoções.<br />
                    <strong>Oppinar:</strong> Sistema de NPS e feedback dos clientes.<br />
                    <strong>Prazzo:</strong> Controle de validade e gestão de prazos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500">
          {summary?.date && <p>Última atualização: {summary.date}</p>}
        </div>
      </main>
    </div>
  );
};

export default RelatoriosPage;
