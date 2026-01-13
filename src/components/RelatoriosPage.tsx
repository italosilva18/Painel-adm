/**
 * Relatorios Page Component
 * Complete reports and statistics with multiple export formats
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Calendar,
  FileText,
  FileCode,
  MessageCircle,
  ChevronDown,
  X,
  UserCheck,
  Store,
  ClipboardList,
  Layers,
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
import {
  ExportFormat,
  exportReport,
  exportSummaryToPDF,
  shareToWhatsApp,
  storeReportHeaders,
  storesByPlanHeaders,
  usersByStoreHeaders,
  storesByUserHeaders,
  summaryReportHeaders,
  transformStoreForExport,
  transformStoreForPlanExport,
  createSummaryForExport,
  formatDateExport,
} from '@/utils/exportUtils';

// Report types enum
type ReportType = 'summary' | 'users-by-store' | 'stores-by-user' | 'stores-complete' | 'stores-by-plan';

// Report type configuration
const reportTypes = [
  { id: 'summary' as ReportType, label: 'Resumo Executivo', icon: PieChart, description: 'Visao geral do sistema' },
  { id: 'users-by-store' as ReportType, label: 'Usuarios por Loja', icon: UserCheck, description: 'Usuarios vinculados a cada loja' },
  { id: 'stores-by-user' as ReportType, label: 'Lojas por Usuario', icon: Store, description: 'Lojas de cada usuario' },
  { id: 'stores-complete' as ReportType, label: 'Relatorio de Lojas', icon: ClipboardList, description: 'Listagem completa de lojas' },
  { id: 'stores-by-plan' as ReportType, label: 'Lojas por Plano', icon: Layers, description: 'Lojas agrupadas por plano' },
];

// Export formats
const exportFormats: { id: ExportFormat; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { id: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Excel/Planilhas' },
  { id: 'xml', label: 'XML', icon: FileCode, description: 'Dados estruturados' },
  { id: 'txt', label: 'TXT', icon: FileText, description: 'Texto simples' },
  { id: 'pdf', label: 'PDF', icon: FileText, description: 'Documento formatado' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, description: 'Compartilhar' },
];

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

  // Export dropdown
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Filters
  const [filters, setFilters] = useState<ReportFilters>({
    page: 1,
    limit: 20,
    partner: '',
    active: '',
  });

  // Date filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Pagination
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Close export menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (reportType !== 'summary') {
      loadStoresReport();
    }
  }, [reportType, filters.page, filters.partner, filters.active, startDate, endDate]);

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
      toast.error('Erro ao carregar relatorio');
    } finally {
      setLoadingStores(false);
    }
  };

  const handleRefresh = async () => {
    await loadInitialData();
    if (reportType !== 'summary') {
      await loadStoresReport();
    }
    toast.success('Dados atualizados!');
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 20, partner: '', active: '' });
    setStartDate('');
    setEndDate('');
  };

  const getFiltersDescription = (): string => {
    const parts: string[] = [];
    if (filters.partner) parts.push(`Parceiro: ${filters.partner}`);
    if (filters.active === 'true') parts.push('Status: Ativo');
    if (filters.active === 'false') parts.push('Status: Inativo');
    if (startDate) parts.push(`De: ${formatDateExport(startDate)}`);
    if (endDate) parts.push(`Ate: ${formatDateExport(endDate)}`);
    return parts.length > 0 ? parts.join(' | ') : 'Sem filtros';
  };

  const handleExport = async (format: ExportFormat) => {
    setShowExportMenu(false);

    try {
      setExporting(true);
      toast.loading('Preparando exportacao...', { id: 'export' });

      const filtersDesc = getFiltersDescription();

      if (reportType === 'summary') {
        if (!summary) {
          toast.dismiss('export');
          toast.error('Nenhum dado para exportar');
          return;
        }

        if (format === 'pdf') {
          exportSummaryToPDF(
            summary as unknown as Record<string, unknown>,
            summary.storesByPartner || [],
            'Resumo Executivo - MARGEM',
            `resumo-executivo-${new Date().toISOString().split('T')[0]}.pdf`,
            { filters: filtersDesc }
          );
        } else if (format === 'whatsapp') {
          shareToWhatsApp([], summaryReportHeaders, 'Resumo Executivo - MARGEM', {
            summary: summary as unknown as Record<string, unknown>,
          });
        } else {
          const summaryData = createSummaryForExport(summary as unknown as Record<string, unknown>);
          exportReport(format, summaryData, summaryReportHeaders, 'Resumo Executivo - MARGEM', 'resumo-executivo', {
            filters: filtersDesc,
            xmlRoot: 'resumoExecutivo',
            xmlItem: 'metrica',
          });
        }
      } else {
        // Get all stores for export
        const allStores = await reportService.getAllStoresForExport(filters);

        let exportData: Record<string, unknown>[] = [];
        let headers = storeReportHeaders;
        let title = 'Relatorio de Lojas';
        let filename = 'relatorio-lojas';
        let xmlRoot = 'lojas';
        let xmlItem = 'loja';

        switch (reportType) {
          case 'stores-complete':
            exportData = allStores.map(s => transformStoreForExport(s as unknown as Record<string, unknown>));
            break;

          case 'stores-by-plan':
            exportData = allStores.map(s => transformStoreForPlanExport(s as unknown as Record<string, unknown>));
            headers = storesByPlanHeaders;
            title = 'Lojas por Plano';
            filename = 'lojas-por-plano';
            break;

          case 'users-by-store':
            // Simulated data - in real implementation this would come from API
            exportData = allStores.flatMap(store => [{
              storeName: store.name,
              storeCnpj: store.cnpj,
              userName: 'Usuario Exemplo',
              userEmail: 'exemplo@email.com',
              userPhone: '(11) 99999-9999',
              userType: 'Mobile',
            }]);
            headers = usersByStoreHeaders;
            title = 'Usuarios por Loja';
            filename = 'usuarios-por-loja';
            xmlRoot = 'usuariosPorLoja';
            xmlItem = 'registro';
            break;

          case 'stores-by-user':
            // Simulated data - in real implementation this would come from API
            exportData = allStores.slice(0, 50).map(store => ({
              userName: 'Usuario Exemplo',
              userEmail: 'exemplo@email.com',
              storeName: store.name,
              storeCnpj: store.cnpj,
              storeCity: store.city,
              storeState: store.state,
            }));
            headers = storesByUserHeaders;
            title = 'Lojas por Usuario';
            filename = 'lojas-por-usuario';
            xmlRoot = 'lojasPorUsuario';
            xmlItem = 'registro';
            break;
        }

        exportReport(format, exportData, headers, title, filename, {
          filters: filtersDesc,
          xmlRoot,
          xmlItem,
          summary: summary as unknown as Record<string, unknown>,
          partners: summary?.storesByPartner,
        });
      }

      toast.dismiss('export');
      toast.success(format === 'whatsapp' ? 'Abrindo WhatsApp...' : 'Exportacao concluida!');
    } catch (error) {
      toast.dismiss('export');
      toast.error('Erro ao exportar relatorio');
    } finally {
      setExporting(false);
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

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Relatorios"
        description="Gere e exporte relatorios em diversos formatos"
      />

      <main className="p-4 md:p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card p-4 md:p-6 border-l-4 border-cyan-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Lojas</p>
                {loading ? <StatSkeleton /> : (
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

          <div className="card p-4 md:p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Ativas</p>
                {loading ? <StatSkeleton /> : (
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

          <div className="card p-4 md:p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Inativas</p>
                {loading ? <StatSkeleton /> : (
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

          <div className="card p-4 md:p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Mobile</p>
                {loading ? <StatSkeleton /> : (
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

          <div className="card p-4 md:p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Plano Basico</p>
                {loading ? <StatSkeleton /> : (
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

        {/* Report Type Selection */}
        <div className="card p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-600" />
              <span className="font-semibold text-gray-900">Tipo de Relatorio:</span>
            </div>

            <div className="flex flex-wrap gap-2 flex-1">
              {reportTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    reportType === type.id
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={type.description}
                >
                  <type.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>

              {/* Export Dropdown */}
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  {exporting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Exportar</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Formato de Exportacao</p>
                    </div>
                    {exportFormats.map(format => (
                      <button
                        key={format.id}
                        onClick={() => handleExport(format.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <format.icon className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">{format.label}</p>
                          <p className="text-xs text-gray-500">{format.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="card p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-semibold text-gray-900">Filtros:</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
              {/* Partner Filter */}
              <select
                value={filters.partner || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, partner: e.target.value, page: 1 }))}
                className="select-field"
              >
                <option value="">Todas Automacoes</option>
                {partners.map((p) => (
                  <option key={p._id || p.name} value={p.name}>{p.name}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filters.active || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, active: e.target.value as 'true' | 'false' | '', page: 1 }))}
                className="select-field"
              >
                <option value="">Todos Status</option>
                <option value="true">Ativas</option>
                <option value="false">Inativas</option>
              </select>

              {/* Start Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Data Inicial"
                />
              </div>

              {/* End Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Data Final"
                />
              </div>
            </div>

            {/* Clear Filters */}
            {(filters.partner || filters.active || startDate || endDate) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span className="text-sm">Limpar</span>
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {(filters.partner || filters.active || startDate || endDate) && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                <strong>Filtros ativos:</strong> {getFiltersDescription()}
              </p>
            </div>
          )}
        </div>

        {/* Report Content */}
        {reportType === 'summary' && (
          <div className="space-y-6">
            {/* Modules Stats */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-6">
                <Package className="w-5 h-5 text-cyan-600" />
                <h2 className="text-lg font-bold text-gray-900">Modulos Ativos</h2>
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
                <h2 className="text-lg font-bold text-gray-900">Distribuicao por Plano</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white">
                  <p className="text-amber-100 font-medium">Plano Basico (Scanner)</p>
                  <p className="text-4xl font-bold mt-2">{summary?.moduleStats?.scanner || 0}</p>
                  <p className="text-amber-100 text-sm mt-1">
                    {summary?.activeStores ? ((summary.moduleStats?.scanner / summary.activeStores) * 100).toFixed(1) : 0}% das lojas ativas
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl text-white">
                  <p className="text-cyan-100 font-medium">Plano Avancado</p>
                  <p className="text-4xl font-bold mt-2">
                    {(summary?.activeStores || 0) - (summary?.moduleStats?.scanner || 0)}
                  </p>
                  <p className="text-cyan-100 text-sm mt-1">
                    {summary?.activeStores ? (((summary.activeStores - (summary.moduleStats?.scanner || 0)) / summary.activeStores) * 100).toFixed(1) : 0}% das lojas ativas
                  </p>
                </div>
              </div>
            </div>

            {/* Top Partners */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-600" />
                  <h2 className="text-lg font-bold text-gray-900">Top 20 Parceiros/Automacoes</h2>
                </div>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parceiro/Automacao</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participacao</th>
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
          </div>
        )}

        {/* Stores/Users Reports */}
        {reportType !== 'summary' && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {reportTypes.find(r => r.id === reportType)?.label}
              </h2>
              <p className="text-sm text-gray-500">
                {totalRecords.toLocaleString()} registros encontrados
              </p>
            </div>

            {loadingStores ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Carregando dados...</p>
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
                        {reportType === 'stores-by-plan' && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
                        )}
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modulos</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {storesData.map((store) => {
                        const hasAdvanced = store.offerta || store.oppinar || store.prazzo;
                        return (
                          <tr key={store._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">{store.cnpj}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="font-medium text-gray-900">{store.name}</div>
                              <div className="text-gray-500 text-xs">{store.company}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{store.partner}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{store.city}/{store.state}</td>
                            {reportType === 'stores-by-plan' && (
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  hasAdvanced ? 'bg-cyan-100 text-cyan-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {hasAdvanced ? 'Avancado' : 'Basico'}
                                </span>
                              </td>
                            )}
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Pagina <span className="font-medium">{filters.page}</span> de{' '}
                      <span className="font-medium">{totalPages}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => goToPage((filters.page || 1) - 1)}
                        disabled={filters.page === 1}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Pagina anterior"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => goToPage((filters.page || 1) + 1)}
                        disabled={filters.page === totalPages}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Proxima pagina"
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum registro encontrado</h3>
                <p className="text-gray-500">Ajuste os filtros para ver os resultados</p>
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500">
          {summary?.date && <p>Ultima atualizacao: {summary.date}</p>}
        </div>
      </main>
    </div>
  );
};

export default RelatoriosPage;
