/**
 * Report Service
 * Handles report generation and data aggregation for analytics
 */

import { Store } from '@/api/types';
import { getDashboardStats } from './dashboardService';
import { getPartners } from './partnerService';

/**
 * Report filters interface
 */
export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  partner?: string;
  reportType?: 'stores' | 'modules' | 'activity';
}

/**
 * Store report row interface
 */
export interface StoreReportRow {
  cnpj: string;
  name: string;
  fantasy_name: string;
  partner: string;
  modules: string[];
  activeModules: number;
  scannerActive: boolean;
  status: 'Ativo' | 'Inativo';
  created_at?: string;
}

/**
 * Report statistics interface
 */
export interface ReportStatistics {
  totalStores: number;
  activeStores: number;
  totalMobileUsers: number;
  storesWithScanner: number;
  totalPartners: number;
}

/**
 * Get report statistics
 * Aggregates data from dashboard and partners
 */
export async function getReportStatistics(): Promise<ReportStatistics> {
  try {
    const dashboardStats = await getDashboardStats();
    const partners = await getPartners();

    return {
      totalStores: dashboardStats.activeStores || 0,
      activeStores: dashboardStats.activeStores || 0,
      totalMobileUsers: dashboardStats.mobileUsers || 0,
      storesWithScanner: dashboardStats.totalBasics || 0,
      totalPartners: partners.length || 0,
    };
  } catch (error) {
    console.error('Error loading report statistics:', error);
    return {
      totalStores: 0,
      activeStores: 0,
      totalMobileUsers: 0,
      storesWithScanner: 0,
      totalPartners: 0,
    };
  }
}

/**
 * Convert stores to report rows
 * This is a client-side transformation since API doesn't have a report endpoint
 */
export function storeToReportRow(store: Store): StoreReportRow {
  const modules: string[] = [];

  if (store.offerta || store.service_offerta) modules.push('OFFERTA');
  if (store.oppinar || store.service_oppinar) modules.push('OPPINAR');
  if (store.prazzo || store.service_prazzo) modules.push('PRAZZO');

  const scannerActive = typeof store.scanner === 'object'
    ? store.scanner.active
    : Boolean(store.scanner || store.service_scanner);

  if (scannerActive) modules.push('SCANNER');

  return {
    cnpj: store.cnpj,
    name: store.name || store.company || '',
    fantasy_name: store.fantasy_name || store.tradeName || '',
    partner: store.partner || '',
    modules,
    activeModules: modules.length,
    scannerActive,
    status: store.active ? 'Ativo' : 'Inativo',
    created_at: store.created_at || store.createAt || store.inclusao,
  };
}

/**
 * Filter stores based on report criteria
 */
export function filterStores(
  stores: Store[],
  filters: ReportFilters
): Store[] {
  let filtered = [...stores];

  // Filter by partner
  if (filters.partner && filters.partner !== 'all') {
    filtered = filtered.filter(store => store.partner === filters.partner);
  }

  // Filter by date range (if created_at exists)
  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    filtered = filtered.filter(store => {
      const storeDate = new Date(store.created_at || store.createAt || store.inclusao || '');
      return storeDate >= startDate;
    });
  }

  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    filtered = filtered.filter(store => {
      const storeDate = new Date(store.created_at || store.createAt || store.inclusao || '');
      return storeDate <= endDate;
    });
  }

  return filtered;
}

/**
 * Export stores to CSV format
 */
export function exportToCSV(stores: StoreReportRow[], filename = 'relatorio-lojas.csv'): void {
  // CSV headers
  const headers = [
    'CNPJ',
    'Razão Social',
    'Nome Fantasia',
    'Parceiro',
    'Módulos Ativos',
    'Lista de Módulos',
    'Scanner Ativo',
    'Status',
    'Data de Criação'
  ];

  // Convert data to CSV rows
  const csvRows = stores.map(store => [
    store.cnpj,
    `"${store.name}"`,
    `"${store.fantasy_name}"`,
    `"${store.partner}"`,
    store.activeModules,
    `"${store.modules.join(', ')}"`,
    store.scannerActive ? 'Sim' : 'Não',
    store.status,
    store.created_at || 'N/A'
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
