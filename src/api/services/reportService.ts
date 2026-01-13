/**
 * Report Service
 * Handles report generation and data aggregation for analytics
 */

import apiClient from '@/api/config';
import { apiConfig } from '@/api/config';
import { parseApiError } from '@/api/errorHandler';

/**
 * Report Summary Response
 */
export interface ReportSummary {
  totalStores: number;
  activeStores: number;
  inactiveStores: number;
  totalMobileUsers: number;
  totalSupport: number;
  storesByPartner: PartnerCount[];
  moduleStats: ReportModuleStats;
  date: string;
}

export interface PartnerCount {
  partner: string;
  count: number;
}

export interface ReportModuleStats {
  offerta: number;
  oppinar: number;
  prazzo: number;
  scanner: number;
}

/**
 * Store Report Item
 */
export interface StoreReportItem {
  _id: string;
  cnpj: string;
  name: string;
  company: string;
  partner: string;
  city: string;
  state: string;
  active: boolean;
  offerta: boolean;
  oppinar: boolean;
  prazzo: boolean;
  hasScanner: boolean;
  createdAt: string;
}

/**
 * Stores Report Response
 */
export interface StoresReportResponse {
  data: StoreReportItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Report filters interface
 */
export interface ReportFilters {
  page?: number;
  limit?: number;
  partner?: string;
  active?: 'true' | 'false' | '';
  state?: string;
}

/**
 * Get report summary with statistics
 */
export async function getReportSummary(): Promise<ReportSummary> {
  try {
    const response = await apiClient.get<ReportSummary>(apiConfig.endpoints.reportsSummary);
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get paginated stores report
 */
export async function getStoresReport(filters: ReportFilters = {}): Promise<StoresReportResponse> {
  try {
    const params: Record<string, string | number> = {};

    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.partner && filters.partner !== 'all') params.partner = filters.partner;
    if (filters.active) params.active = filters.active;

    const response = await apiClient.get<StoresReportResponse>(
      apiConfig.endpoints.reportsStores,
      { params }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get all stores for export (fetches all pages)
 */
export async function getAllStoresForExport(filters: ReportFilters = {}): Promise<StoreReportItem[]> {
  try {
    const allStores: StoreReportItem[] = [];
    let page = 1;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await getStoresReport({ ...filters, page, limit });
      allStores.push(...response.data);

      hasMore = page < response.totalPages;
      page++;

      // Safety limit
      if (page > 100) break;
    }

    return allStores;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Export stores to CSV format
 */
export function exportStoresToCSV(stores: StoreReportItem[], filename = 'relatorio-lojas.csv'): void {
  // CSV headers
  const headers = [
    'CNPJ',
    'Nome Fantasia',
    'Razão Social',
    'Parceiro/Automação',
    'Cidade',
    'Estado',
    'Status',
    'Scanner',
    'Offerta',
    'Oppinar',
    'Prazzo',
    'Data Cadastro'
  ];

  // Convert data to CSV rows
  const csvRows = stores.map(store => [
    store.cnpj,
    `"${store.name || ''}"`,
    `"${store.company || ''}"`,
    `"${store.partner || ''}"`,
    `"${store.city || ''}"`,
    store.state || '',
    store.active ? 'Ativo' : 'Inativo',
    store.hasScanner ? 'Sim' : 'Não',
    store.offerta ? 'Sim' : 'Não',
    store.oppinar ? 'Sim' : 'Não',
    store.prazzo ? 'Sim' : 'Não',
    store.createdAt || 'N/A'
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...csvRows.map(row => row.join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export summary to CSV
 */
export function exportSummaryToCSV(summary: ReportSummary, filename = 'resumo-executivo.csv'): void {
  const lines = [
    'Resumo Executivo - MARGEM',
    `Data do Relatório,${summary.date}`,
    '',
    'ESTATÍSTICAS GERAIS',
    `Total de Lojas,${summary.totalStores}`,
    `Lojas Ativas,${summary.activeStores}`,
    `Lojas Inativas,${summary.inactiveStores}`,
    `Usuários Mobile,${summary.totalMobileUsers}`,
    `Usuários Suporte,${summary.totalSupport}`,
    '',
    'MÓDULOS ATIVOS',
    `Scanner (Plano Básico),${summary.moduleStats.scanner}`,
    `Offerta,${summary.moduleStats.offerta}`,
    `Oppinar,${summary.moduleStats.oppinar}`,
    `Prazzo,${summary.moduleStats.prazzo}`,
    '',
    'TOP 20 PARCEIROS/AUTOMAÇÕES',
    'Parceiro,Quantidade de Lojas',
    ...summary.storesByPartner.map(p => `"${p.partner}",${p.count}`)
  ];

  const csvContent = lines.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export partners report to CSV
 */
export function exportPartnersToCSV(partners: PartnerCount[], filename = 'lojas-por-parceiro.csv'): void {
  const headers = ['Parceiro/Automação', 'Quantidade de Lojas'];
  const csvRows = partners.map(p => [`"${p.partner}"`, p.count]);

  const csvContent = [
    headers.join(','),
    ...csvRows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
