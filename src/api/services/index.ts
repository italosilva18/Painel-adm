/**
 * Services Index
 * Centralized export of all API services
 */

// Auth service
export * from './auth';

// Dashboard
export * from './dashboardService';

// CRUD services
export * from './storeService';
export * from './mobileService';
export * from './supportService';
export * from './modulesService';

// Partner service (CRUD)
export {
  getPartnerByCode,
  createPartner,
  updatePartner,
  deletePartner,
  type PartnerRequest,
} from './partnerService';

// Reference data (includes getPartners and Partner type)
export * from './referenceData';

// CNPJ lookup (Receita Federal via BrasilAPI)
export * from './cnpjService';

// Reports
export * from './reportService';

// Re-export config and client
export { default as apiClient } from '@/api/config';
export { apiConfig } from '@/api/config';
