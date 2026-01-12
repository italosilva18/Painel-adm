/**
 * API Module Index
 * Centralized export of API configuration, services, and utilities
 */

// Configuration
export { default as apiClient } from './config';
export { apiConfig, setApiBaseURL, getApiBaseURL, resetApiClient } from './config';

// Interceptors
export { setupInterceptors, addCustomHeader, removeCustomHeader } from './interceptors';

// Error handling
export { ApiError, parseApiError, isAuthError, isValidationError, isNetworkError, getErrorMessage, logError } from './errorHandler';

// Types
export type {
  LoginRequest,
  LoginResponse,
  AuthUser,
  Store,
  CreateStoreRequest,
  UpdateStoreRequest,
  ScannerConfig,
  StoreQueryParams,
  MobileUser,
  CreateMobileUserRequest,
  UpdateMobileUserRequest,
  MobileUserStoreAssociation,
  SupportUser,
  CreateSupportUserRequest,
  UpdateSupportUserRequest,
  Partner,
  State,
  City,
  Segment,
  Size,
  ApiErrorResponse,
  PaginationParams,
  PaginatedResponse,
  ApiResponse,
} from './types';

// Services
export * from './services';
