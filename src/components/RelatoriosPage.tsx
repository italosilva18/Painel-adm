/**
 * Relatorios Page Component
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
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/common';
import * as reportService from '@/api/services/reportService';
import * as partnerService from '@/api/services/partnerService';
import { Partner } from '@/api/services/partnerService';
import { ReportStatistics, StoreReportRow, ReportFilters } from '@/api/services/reportService';

export const RelatoriosPage: React.FC = () => {
  // State
  const [stats, setStats] = useState<ReportStatistics | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [reportData, setReportData] = useState<StoreReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  // Filters
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: '',
    endDate: '',
    partner: 'all',
    reportType: 'stores',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [statsData, partnersData] = await Promise.all([
        reportService.getReportStatistics(),
        partnerService.getPartners(),
      ]);

      setStats(statsData);
      setPartners(partnersData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Erro ao carregar dados iniciais');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoadingReport(true);
      toast.loading('Gerando relatório...', { id: 'generate-report' });

      // For now, we show a message that this requires a CNPJ search
      // In a real implementation, you'd have an API endpoint that returns all stores
      toast.dismiss('generate-report');
      toast.success('Para gerar relatórios completos, use a busca de lojas por CNPJ', {
        duration: 5000,
      });

      // Mock data for demonstration
      setReportData([]);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.dismiss('generate-report');
      toast.error('Erro ao gerar relatório');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleExportCSV = () => {
    if (reportData.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    try {
      const filename = `relatorio-margem-${new Date().toISOString().split('T')[0]}.csv`;
      reportService.exportToCSV(reportData, filename);
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Pagination
  const totalPages = Math.ceil(reportData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = reportData.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
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
        title="Relatórios"
        description="Estatísticas e análises do sistema"
      />

      <main className="p-4 md:p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total de Lojas Ativas */}
          <div className="card p-4 md:p-6 border-l-4 border-cyan-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total de Lojas</p>
                {loading ? (
                  <StatSkeleton />
                ) : (
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.totalStores || 0}
                  </p>
                )}
              </div>
              <div className="h-12 w-12 bg-cyan-100 rounded-full flex items-center justify-center">
                <Building className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>

          {/* Usuários Mobile */}
          <div className="card p-4 md:p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Usuários Mobile</p>
                {loading ? (
                  <StatSkeleton />
                ) : (
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.totalMobileUsers || 0}
                  </p>
                )}
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Lojas com Scanner Ativo */}
          <div className="card p-4 md:p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Scanner Ativo</p>
                {loading ? (
                  <StatSkeleton />
                ) : (
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.storesWithScanner || 0}
                  </p>
                )}
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <ScanLine className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total de Parceiros */}
          <div className="card p-4 md:p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Parceiros</p>
                {loading ? (
                  <StatSkeleton />
                ) : (
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.totalPartners || 0}
                  </p>
                )}
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-cyan-600" />
            <h2 className="text-lg font-bold text-gray-900">Filtros de Relatório</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="form-group">
              <label className="form-label"><Calendar className="w-4 h-4 inline mr-1" />Data Início</label>
              <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="input-field" />
            </div>

            <div className="form-group">
              <label className="form-label"><Calendar className="w-4 h-4 inline mr-1" />Data Fim</label>
              <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="input-field" />
            </div>

            <div className="form-group">
              <label className="form-label">Parceiro</label>
              <select value={filters.partner} onChange={(e) => setFilters({ ...filters, partner: e.target.value })} className="select-field">
                <option value="all">Todos</option>
                {partners.map((partner) => (
                  <option key={partner._id || partner.name} value={partner.name}>{partner.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Relatório</label>
              <select value={filters.reportType} onChange={(e) => setFilters({ ...filters, reportType: e.target.value as any })} className="select-field">
                <option value="stores">Lojas</option>
                <option value="modules">Módulos</option>
                <option value="activity">Atividade</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={handleGenerateReport} disabled={loadingReport} className="btn-primary flex items-center gap-2">
              {loadingReport ? <RefreshCw className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5" />}
              {loadingReport ? 'Gerando...' : 'Gerar Relatório'}
            </button>
            <button onClick={handleExportCSV} disabled={reportData.length === 0} className="btn-secondary flex items-center gap-2">
              <Download className="w-5 h-5" />Exportar CSV
            </button>
          </div>
        </div>

        {/* Report Table */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Relatório de Lojas</h2>
            <p className="text-sm text-gray-500 mt-1">
              {reportData.length > 0
                ? `Exibindo ${startIndex + 1}-${Math.min(endIndex, reportData.length)} de ${reportData.length} registros`
                : 'Nenhum dado disponível. Use os filtros acima e clique em "Gerar Relatório"'}
            </p>
          </div>

          {reportData.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CNPJ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parceiro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Módulos Ativos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {row.cnpj}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-medium">{row.fantasy_name}</div>
                          <div className="text-gray-500 text-xs">{row.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row.partner}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-wrap gap-1">
                            {row.modules.map((module) => (
                              <span
                                key={module}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-teal-700"
                              >
                                {module}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              row.status === 'Ativo'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Página <span className="font-medium">{currentPage}</span> de{' '}
                    <span className="font-medium">{totalPages}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-orange-500 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-2 py-2">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum relatório gerado
              </h3>
              <p className="text-gray-500">
                Configure os filtros acima e clique em "Gerar Relatório" para visualizar os
                dados
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RelatoriosPage;
