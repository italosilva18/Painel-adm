/**
 * Export Utilities
 * Functions to export data in multiple formats: CSV, XML, TXT, PDF, WhatsApp
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type for autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF;
  }
}

/**
 * Download helper function
 */
function downloadFile(content: string | Blob, filename: string, mimeType: string): void {
  const blob = content instanceof Blob ? content : new Blob(['\ufeff' + content], { type: mimeType });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for display
 */
export function formatDateExport(date: string | Date): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format datetime for display
 */
export function formatDateTime(date: string | Date): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================
// CSV EXPORT (Legacy compatibility)
// ============================================

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends object>(
  data: T[],
  columns: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) return '';

  // Header row
  const header = columns.map(col => `"${col.label}"`).join(';');

  // Data rows
  const rows = data.map(item =>
    columns.map(col => {
      const value = item[col.key] as unknown;
      if (value === null || value === undefined) return '""';
      if (typeof value === 'boolean') return value ? '"Sim"' : '"Nao"';
      if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(';')
  );

  return [header, ...rows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Add BOM for Excel to recognize UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV file (legacy)
 */
export function exportToCSVLegacy<T extends object>(
  data: T[],
  columns: { key: keyof T; label: string }[],
  filename: string
): void {
  const csv = arrayToCSV(data, columns);
  downloadCSV(csv, filename);
}

// ============================================
// NEW CSV EXPORT
// ============================================

export function exportToCSV(
  data: Record<string, unknown>[],
  headers: { key: string; label: string }[],
  filename: string
): void {
  const headerRow = headers.map(h => h.label).join(';');
  const rows = data.map(item =>
    headers.map(h => {
      const value = item[h.key];
      if (value === null || value === undefined) return '';
      if (typeof value === 'boolean') return value ? 'Sim' : 'Nao';
      if (typeof value === 'string' && (value.includes(';') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    }).join(';')
  );

  const csvContent = [headerRow, ...rows].join('\n');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

// ============================================
// XML EXPORT
// ============================================

export function exportToXML(
  data: Record<string, unknown>[],
  rootElement: string,
  itemElement: string,
  filename: string,
  options?: {
    title?: string;
    filters?: string;
  }
): void {
  const { title, filters } = options || {};

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `<${rootElement}>\n`;
  xml += `  <metadados>\n`;
  if (title) xml += `    <titulo>${escapeXml(title)}</titulo>\n`;
  xml += `    <geradoEm>${new Date().toISOString()}</geradoEm>\n`;
  xml += `    <totalRegistros>${data.length}</totalRegistros>\n`;
  if (filters) xml += `    <filtros>${escapeXml(filters)}</filtros>\n`;
  xml += `  </metadados>\n`;
  xml += `  <registros>\n`;

  data.forEach(item => {
    xml += `    <${itemElement}>\n`;
    Object.entries(item).forEach(([key, value]) => {
      const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
      const safeValue = formatXmlValue(value);
      xml += `      <${safeKey}>${safeValue}</${safeKey}>\n`;
    });
    xml += `    </${itemElement}>\n`;
  });

  xml += `  </registros>\n`;
  xml += `</${rootElement}>`;

  downloadFile(xml, filename, 'application/xml;charset=utf-8;');
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatXmlValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') return escapeXml(JSON.stringify(value));
  return escapeXml(String(value));
}

// ============================================
// TXT EXPORT
// ============================================

export function exportToTXT(
  data: Record<string, unknown>[],
  headers: { key: string; label: string }[],
  title: string,
  filename: string,
  options?: {
    subtitle?: string;
    filters?: string;
  }
): void {
  const { subtitle, filters } = options || {};
  const separator = '='.repeat(80);
  const lines: string[] = [];

  // Header
  lines.push(separator);
  lines.push(` ${title.toUpperCase()}`);
  if (subtitle) lines.push(` ${subtitle}`);
  lines.push(separator);
  lines.push(`  Gerado em: ${formatDateTime(new Date())}`);
  lines.push(`  Total de registros: ${data.length}`);
  if (filters) lines.push(`  Filtros aplicados: ${filters}`);
  lines.push(separator);
  lines.push('');

  // Table header
  const colWidths = headers.map(h => Math.max(h.label.length, 15));
  const headerLine = headers.map((h, i) => h.label.padEnd(colWidths[i])).join(' | ');
  lines.push(headerLine);
  lines.push('-'.repeat(headerLine.length));

  // Data rows
  data.forEach(item => {
    const row = headers.map((h, i) => {
      const value = item[h.key];
      let displayValue = '';
      if (value === null || value === undefined) displayValue = '-';
      else if (typeof value === 'boolean') displayValue = value ? 'Sim' : 'Nao';
      else displayValue = String(value);
      return displayValue.substring(0, colWidths[i]).padEnd(colWidths[i]);
    }).join(' | ');
    lines.push(row);
  });

  // Footer
  lines.push('');
  lines.push(separator);
  lines.push(' FIM DO RELATORIO - MARGEM Sistema Administrativo');
  lines.push(separator);

  downloadFile(lines.join('\n'), filename, 'text/plain;charset=utf-8;');
}

// ============================================
// PDF EXPORT
// ============================================

export function exportToPDF(
  data: Record<string, unknown>[],
  headers: { key: string; label: string }[],
  title: string,
  filename: string,
  options?: {
    orientation?: 'portrait' | 'landscape';
    subtitle?: string;
    filters?: string;
  }
): void {
  const { orientation = 'landscape', subtitle, filters } = options || {};
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });

  // Colors
  const primaryColor: [number, number, number] = [6, 182, 212]; // Cyan-500
  const darkColor: [number, number, number] = [31, 41, 55]; // Gray-800

  // Header background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 35, 'F');

  // Logo/Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('MARGEM', 14, 18);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 28);

  // Metadata
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(9);
  doc.text(`Gerado em: ${formatDateTime(new Date())}`, pageWidth - 14, 18, { align: 'right' });
  doc.text(`Total: ${data.length} registros`, pageWidth - 14, 24, { align: 'right' });

  // Subtitle and filters
  let startY = 45;
  doc.setTextColor(...darkColor);

  if (subtitle) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(subtitle, 14, startY);
    startY += 8;
  }

  if (filters) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128); // Gray-500
    doc.text(`Filtros: ${filters}`, 14, startY);
    startY += 10;
  }

  // Table
  const tableHeaders = headers.map(h => h.label);
  const tableData = data.map(item =>
    headers.map(h => {
      const value = item[h.key];
      if (value === null || value === undefined) return '';
      if (typeof value === 'boolean') return value ? 'Sim' : 'Nao';
      return String(value);
    })
  );

  doc.autoTable({
    startY: startY,
    head: [tableHeaders],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkColor,
    },
    alternateRowStyles: {
      fillColor: [243, 244, 246], // Gray-100
    },
    margin: { left: 14, right: 14 },
    styles: {
      cellPadding: 3,
      overflow: 'linebreak',
    },
    didDrawPage: (pageData: { pageNumber: number }) => {
      // Footer on each page
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175); // Gray-400
      doc.text(
        `Pagina ${pageData.pageNumber}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text('MARGEM - Sistema Administrativo', 14, pageHeight - 10);
    },
  });

  doc.save(filename);
}

// ============================================
// PDF SUMMARY EXPORT (Special format)
// ============================================

export function exportSummaryToPDF(
  summary: Record<string, unknown>,
  partners: { partner: string; count: number }[],
  title: string,
  filename: string,
  options?: {
    filters?: string;
  }
): void {
  const { filters } = options || {};
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Colors
  const primaryColor: [number, number, number] = [6, 182, 212];
  const darkColor: [number, number, number] = [31, 41, 55];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('MARGEM', 14, 22);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 34);

  doc.setFontSize(9);
  doc.text(`Gerado em: ${formatDateTime(new Date())}`, pageWidth - 14, 22, { align: 'right' });

  let y = 55;

  if (filters) {
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(9);
    doc.text(`Filtros: ${filters}`, 14, y);
    y += 10;
  }

  // Statistics Section
  doc.setTextColor(...darkColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Estatisticas Gerais', 14, y);
  y += 10;

  const moduleStats = summary.moduleStats as Record<string, number> || {};
  const stats = [
    ['Total de Lojas', String(summary.totalStores || 0)],
    ['Lojas Ativas', String(summary.activeStores || 0)],
    ['Lojas Inativas', String(summary.inactiveStores || 0)],
    ['Usuarios Mobile', String(summary.totalMobileUsers || 0)],
    ['Usuarios Suporte', String(summary.totalSupport || 0)],
  ];

  doc.autoTable({
    startY: y,
    body: stats,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { halign: 'right', cellWidth: 40 },
    },
    margin: { left: 14, right: pageWidth / 2 + 10 },
  });

  // Modules Section (same row)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Modulos Ativos', pageWidth / 2, y - 10);

  const modules = [
    ['Scanner (Basico)', String(moduleStats.scanner || 0)],
    ['Offerta', String(moduleStats.offerta || 0)],
    ['Oppinar', String(moduleStats.oppinar || 0)],
    ['Prazzo', String(moduleStats.prazzo || 0)],
  ];

  doc.autoTable({
    startY: y,
    body: modules,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { halign: 'right', cellWidth: 30 },
    },
    margin: { left: pageWidth / 2, right: 14 },
  });

  y = Math.max((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || y + 40, y + 40) + 15;

  // Partners Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top 20 Parceiros/Automacoes', 14, y);
  y += 8;

  const total = Number(summary.totalStores) || 1;
  const partnerData = partners.slice(0, 20).map((p, i) => [
    String(i + 1),
    p.partner,
    String(p.count),
    ((p.count / total) * 100).toFixed(1) + '%',
  ]);

  doc.autoTable({
    startY: y,
    head: [['#', 'Parceiro/Automacao', 'Qtd', '%']],
    body: partnerData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 100 },
      2: { cellWidth: 20, halign: 'right' },
      3: { cellWidth: 20, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('MARGEM - Sistema Administrativo', 14, pageHeight - 10);
  doc.text('Pagina 1', pageWidth / 2, pageHeight - 10, { align: 'center' });

  doc.save(filename);
}

// ============================================
// WHATSAPP SHARE
// ============================================

export function shareToWhatsApp(
  data: Record<string, unknown>[],
  headers: { key: string; label: string }[],
  title: string,
  options?: {
    maxRecords?: number;
    phone?: string;
    summary?: Record<string, unknown>;
  }
): void {
  const { maxRecords = 10, phone, summary } = options || {};
  const displayData = data.slice(0, maxRecords);

  let message = `*${title}*\n`;
  message += `_Gerado em: ${formatDateTime(new Date())}_\n`;

  // Add summary if provided
  if (summary) {
    message += `\n*Resumo:*\n`;
    message += `- Total de Lojas: ${summary.totalStores || 0}\n`;
    message += `- Lojas Ativas: ${summary.activeStores || 0}\n`;
    message += `- Lojas Inativas: ${summary.inactiveStores || 0}\n`;
    message += `- Usuarios Mobile: ${summary.totalMobileUsers || 0}\n`;
  } else {
    message += `_Total: ${data.length} registros_\n`;
  }

  if (displayData.length > 0) {
    message += `\n*Dados:*\n`;
    displayData.forEach((item, index) => {
      message += `\n*${index + 1}.* `;
      const mainFields = headers.slice(0, 3).map(h => {
        const value = item[h.key];
        return value !== null && value !== undefined ? String(value) : '';
      }).filter(Boolean).join(' - ');
      message += mainFields;
    });
  }

  if (data.length > maxRecords) {
    message += `\n\n_...e mais ${data.length - maxRecords} registros_`;
  }

  message += '\n\n_Enviado via MARGEM Admin_';

  const encodedMessage = encodeURIComponent(message);
  const url = phone
    ? `https://wa.me/${phone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;

  window.open(url, '_blank');
}

// ============================================
// REPORT HEADERS DEFINITIONS
// ============================================

// Store Report Headers
export const storeReportHeaders = [
  { key: 'cnpj', label: 'CNPJ' },
  { key: 'name', label: 'Nome Fantasia' },
  { key: 'company', label: 'Razao Social' },
  { key: 'partner', label: 'Parceiro/Automacao' },
  { key: 'city', label: 'Cidade' },
  { key: 'state', label: 'UF' },
  { key: 'activeText', label: 'Status' },
  { key: 'hasScanner', label: 'Scanner' },
  { key: 'offerta', label: 'Offerta' },
  { key: 'oppinar', label: 'Oppinar' },
  { key: 'prazzo', label: 'Prazzo' },
  { key: 'createdAt', label: 'Data Cadastro' },
];

// User Report Headers
export const userReportHeaders = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Telefone' },
  { key: 'partner', label: 'Parceiro' },
  { key: 'type', label: 'Tipo' },
  { key: 'activeText', label: 'Status' },
  { key: 'storeCount', label: 'Qtd Lojas' },
  { key: 'createdAt', label: 'Data Cadastro' },
];

// Users by Store Headers
export const usersByStoreHeaders = [
  { key: 'storeName', label: 'Loja' },
  { key: 'storeCnpj', label: 'CNPJ' },
  { key: 'userName', label: 'Usuario' },
  { key: 'userEmail', label: 'Email' },
  { key: 'userPhone', label: 'Telefone' },
  { key: 'userType', label: 'Tipo' },
];

// Stores by User Headers
export const storesByUserHeaders = [
  { key: 'userName', label: 'Usuario' },
  { key: 'userEmail', label: 'Email' },
  { key: 'storeName', label: 'Loja' },
  { key: 'storeCnpj', label: 'CNPJ' },
  { key: 'storeCity', label: 'Cidade' },
  { key: 'storeState', label: 'UF' },
];

// Partner Report Headers
export const partnerReportHeaders = [
  { key: 'position', label: '#' },
  { key: 'partner', label: 'Parceiro/Automacao' },
  { key: 'count', label: 'Quantidade' },
  { key: 'percentage', label: 'Participacao (%)' },
];

// Stores by Plan Headers
export const storesByPlanHeaders = [
  { key: 'cnpj', label: 'CNPJ' },
  { key: 'name', label: 'Nome Fantasia' },
  { key: 'partner', label: 'Parceiro' },
  { key: 'city', label: 'Cidade' },
  { key: 'state', label: 'UF' },
  { key: 'plan', label: 'Plano' },
  { key: 'modules', label: 'Modulos' },
];

// Summary Report Headers
export const summaryReportHeaders = [
  { key: 'metric', label: 'Metrica' },
  { key: 'value', label: 'Valor' },
];

// ============================================
// DATA TRANSFORMERS
// ============================================

// Transform store data for export
export function transformStoreForExport(store: Record<string, unknown>): Record<string, unknown> {
  return {
    ...store,
    activeText: store.active ? 'Ativo' : 'Inativo',
    hasScanner: store.hasScanner ? 'Sim' : 'Nao',
    offerta: store.offerta ? 'Sim' : 'Nao',
    oppinar: store.oppinar ? 'Sim' : 'Nao',
    prazzo: store.prazzo ? 'Sim' : 'Nao',
    createdAt: store.createdAt ? formatDateExport(store.createdAt as string) : 'N/A',
  };
}

// Transform user data for export
export function transformUserForExport(user: Record<string, unknown>): Record<string, unknown> {
  return {
    ...user,
    activeText: user.active ? 'Ativo' : 'Inativo',
    storeCount: Array.isArray(user.stores) ? user.stores.length : 0,
    createdAt: user.createdAt ? formatDateExport(user.createdAt as string) : 'N/A',
  };
}

// Transform partner data for export
export function transformPartnerForExport(
  partner: { partner: string; count: number },
  index: number,
  total: number
): Record<string, unknown> {
  return {
    position: index + 1,
    partner: partner.partner,
    count: partner.count,
    percentage: ((partner.count / total) * 100).toFixed(2) + '%',
  };
}

// Transform store for plan report
export function transformStoreForPlanExport(store: Record<string, unknown>): Record<string, unknown> {
  const modules: string[] = [];
  if (store.hasScanner) modules.push('Scanner');
  if (store.offerta) modules.push('Offerta');
  if (store.oppinar) modules.push('Oppinar');
  if (store.prazzo) modules.push('Prazzo');

  const hasAdvanced = store.offerta || store.oppinar || store.prazzo;

  return {
    cnpj: store.cnpj,
    name: store.name,
    partner: store.partner,
    city: store.city,
    state: store.state,
    plan: hasAdvanced ? 'Avancado' : 'Basico',
    modules: modules.join(', ') || 'Nenhum',
  };
}

// Create summary data for export
export function createSummaryForExport(summary: Record<string, unknown>): Record<string, unknown>[] {
  const moduleStats = summary.moduleStats as Record<string, number> || {};

  return [
    { metric: 'Total de Lojas', value: summary.totalStores || 0 },
    { metric: 'Lojas Ativas', value: summary.activeStores || 0 },
    { metric: 'Lojas Inativas', value: summary.inactiveStores || 0 },
    { metric: 'Usuarios Mobile', value: summary.totalMobileUsers || 0 },
    { metric: 'Usuarios Suporte', value: summary.totalSupport || 0 },
    { metric: '', value: '' },
    { metric: 'MODULOS ATIVOS', value: '' },
    { metric: 'Scanner (Plano Basico)', value: moduleStats.scanner || 0 },
    { metric: 'Offerta', value: moduleStats.offerta || 0 },
    { metric: 'Oppinar', value: moduleStats.oppinar || 0 },
    { metric: 'Prazzo', value: moduleStats.prazzo || 0 },
  ];
}

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================

/**
 * Store columns for export (legacy)
 */
export const storeExportColumns = [
  { key: 'cnpj' as const, label: 'CNPJ' },
  { key: 'tradeName' as const, label: 'Nome Fantasia' },
  { key: 'company' as const, label: 'Razao Social' },
  { key: 'email' as const, label: 'E-mail' },
  { key: 'phone' as const, label: 'Telefone' },
  { key: 'segment' as const, label: 'Segmento' },
  { key: 'size' as const, label: 'Porte' },
  { key: 'partner' as const, label: 'Parceiro' },
  { key: 'state' as const, label: 'Estado' },
  { key: 'city' as const, label: 'Cidade' },
  { key: 'street' as const, label: 'Endereco' },
  { key: 'number' as const, label: 'Numero' },
  { key: 'neighborhood' as const, label: 'Bairro' },
  { key: 'serial' as const, label: 'Licenca' },
  { key: 'active' as const, label: 'Ativo' },
];

/**
 * Mobile user columns for export (legacy)
 */
export const mobileUserExportColumns = [
  { key: 'name' as const, label: 'Nome' },
  { key: 'email' as const, label: 'E-mail' },
  { key: 'phone' as const, label: 'Telefone' },
  { key: '_type' as const, label: 'Tipo' },
  { key: 'partner' as const, label: 'Parceiro' },
  { key: 'active' as const, label: 'Ativo' },
];

/**
 * Support user columns for export (legacy)
 */
export const supportUserExportColumns = [
  { key: 'name' as const, label: 'Nome' },
  { key: 'email' as const, label: 'E-mail' },
  { key: 'partner' as const, label: 'Parceiro' },
  { key: 'active' as const, label: 'Ativo' },
];

// Export type for format selection
export type ExportFormat = 'csv' | 'xml' | 'txt' | 'pdf' | 'whatsapp';

// Export all formats for a given report
export function exportReport(
  format: ExportFormat,
  data: Record<string, unknown>[],
  headers: { key: string; label: string }[],
  title: string,
  baseFilename: string,
  options?: {
    subtitle?: string;
    filters?: string;
    xmlRoot?: string;
    xmlItem?: string;
    summary?: Record<string, unknown>;
    partners?: { partner: string; count: number }[];
  }
): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${baseFilename}-${timestamp}`;

  switch (format) {
    case 'csv':
      exportToCSV(data, headers, `${filename}.csv`);
      break;
    case 'xml':
      exportToXML(data, options?.xmlRoot || 'relatorio', options?.xmlItem || 'item', `${filename}.xml`, {
        title,
        filters: options?.filters,
      });
      break;
    case 'txt':
      exportToTXT(data, headers, title, `${filename}.txt`, {
        subtitle: options?.subtitle,
        filters: options?.filters,
      });
      break;
    case 'pdf':
      if (options?.summary && options?.partners) {
        exportSummaryToPDF(options.summary, options.partners, title, `${filename}.pdf`, {
          filters: options?.filters,
        });
      } else {
        exportToPDF(data, headers, title, `${filename}.pdf`, {
          subtitle: options?.subtitle,
          filters: options?.filters,
        });
      }
      break;
    case 'whatsapp':
      shareToWhatsApp(data, headers, title, {
        summary: options?.summary,
      });
      break;
  }
}
