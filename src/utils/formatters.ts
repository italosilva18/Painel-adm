/**
 * Formatters
 * Data formatting utilities for display
 */

/**
 * Format CNPJ (14 digits to XX.XXX.XXX/XXXX-XX)
 */
export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return cnpj;
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Remove CNPJ formatting
 */
export function unformatCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');

  // Handle 10 digits (landline)
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  // Handle 11 digits (mobile)
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  return phone;
}

/**
 * Remove phone formatting
 */
export function unformatPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Format date (YYYY-MM-DD to DD/MM/YYYY)
 */
export function formatDate(date: string | Date): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format date to ISO (DD/MM/YYYY to YYYY-MM-DD)
 */
export function formatDateToISO(date: string): string {
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
}

/**
 * Format currency (BRL)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format number with decimal places
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${formatNumber(value, decimals)}%`;
}

/**
 * Format store name with code highlight
 */
export function formatStoreName(company: string, tradeName?: string): string {
  if (tradeName && tradeName !== company) {
    return `${tradeName} (${company})`;
  }
  return company;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Format boolean to Portuguese
 */
export function formatBoolean(value: boolean): string {
  return value ? 'Sim' : 'Nao';
}

/**
 * Format status/active flag
 */
export function formatStatus(active: boolean, activeText = 'Ativo', inactiveText = 'Inativo'): string {
  return active ? activeText : inactiveText;
}

/**
 * Format timestamp to readable date/time
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(dateObj);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'agora mesmo';
  } else if (diffMins < 60) {
    return `${diffMins} minuto${diffMins > 1 ? 's' : ''} atras`;
  } else if (diffHours < 24) {
    return `${diffHours} hora${diffHours > 1 ? 's' : ''} atras`;
  } else if (diffDays < 7) {
    return `${diffDays} dia${diffDays > 1 ? 's' : ''} atras`;
  } else {
    return formatDate(dateObj);
  }
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format email (hide part of email for privacy)
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  const visibleChars = Math.ceil(localPart.length / 3);
  const masked = localPart.substring(0, visibleChars) + '*'.repeat(localPart.length - visibleChars);
  return `${masked}@${domain}`;
}

/**
 * Format phone (hide last 4 digits for privacy)
 */
export function maskPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 4) return phone;
  const masked = '*'.repeat(clean.length - 4) + clean.slice(-4);
  return formatPhone(masked);
}

/**
 * Apply CNPJ mask dynamically as user types
 * Returns formatted value (00.000.000/0000-00)
 */
export function applyCNPJMask(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 14);

  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`;
  if (clean.length <= 8) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
  if (clean.length <= 12) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`;
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`;
}

/**
 * Apply phone mask dynamically as user types
 * Returns formatted value ((00) 00000-0000 or (00) 0000-0000)
 */
export function applyPhoneMask(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 11);

  if (clean.length <= 2) return clean.length ? `(${clean}` : '';
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 10) {
    // Landline: (XX) XXXX-XXXX
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  // Mobile: (XX) XXXXX-XXXX
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
}

/**
 * Apply CEP mask dynamically as user types
 * Returns formatted value (00000-000)
 */
export function applyCEPMask(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 8);

  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 5)}-${clean.slice(5)}`;
}
