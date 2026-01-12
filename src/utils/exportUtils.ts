/**
 * Export Utilities
 * Functions to export data to CSV and Excel formats
 */

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
 * Export data to CSV file
 */
export function exportToCSV<T extends object>(
  data: T[],
  columns: { key: keyof T; label: string }[],
  filename: string
): void {
  const csv = arrayToCSV(data, columns);
  downloadCSV(csv, filename);
}

/**
 * Store columns for export
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
 * Mobile user columns for export
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
 * Support user columns for export
 */
export const supportUserExportColumns = [
  { key: 'name' as const, label: 'Nome' },
  { key: 'email' as const, label: 'E-mail' },
  { key: 'partner' as const, label: 'Parceiro' },
  { key: 'active' as const, label: 'Ativo' },
];
