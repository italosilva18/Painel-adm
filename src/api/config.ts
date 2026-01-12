/**
 * Axios Configuration
 * Centralized API client setup with environment support
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Environment configuration
// Use relative path for nginx proxy in production, absolute URL for local dev
const API_BASE_URL = import.meta.env.VITE_API_URL || '/admin';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT ? parseInt(import.meta.env.VITE_API_TIMEOUT) : 30000;
const API_RETRY_ATTEMPTS = import.meta.env.VITE_API_RETRY_ATTEMPTS ? parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS) : 3;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to true if cookies needed
});

/**
 * Request configuration defaults
 */
export const defaultRequestConfig: AxiosRequestConfig = {
  timeout: API_TIMEOUT,
};

/**
 * API Configuration object
 */
export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  retryAttempts: API_RETRY_ATTEMPTS,
  endpoints: {
    // Auth
    login: '/login',
    logout: '/logout',

    // Dashboard
    dashboardStats: '/dashboard/stats',
    dashboardActivity: '/dashboard/activity',

    // Stores
    stores: '/store',
    storesByPartner: '/file-stores',

    // Mobile Users
    mobile: '/mobile',
    mobileStores: '/mobile/store',

    // Support Users
    support: '/support',

    // Reference Data
    partners: '/partners',
    states: '/states',
    cities: '/cities',
    segments: '/segments',
    sizes: '/sizes',

    // Migration
    migration: '/migration',
  },
};

// Export the configured axios instance
export default apiClient;

/**
 * Update API base URL (useful for dynamic configuration)
 * @param newBaseURL - New base URL for API calls
 */
export function setApiBaseURL(newBaseURL: string): void {
  apiClient.defaults.baseURL = newBaseURL;
}

/**
 * Get current API base URL
 */
export function getApiBaseURL(): string {
  return apiClient.defaults.baseURL || API_BASE_URL;
}

/**
 * Reset API client to defaults
 */
export function resetApiClient(): void {
  apiClient.defaults.baseURL = API_BASE_URL;
  apiClient.defaults.timeout = API_TIMEOUT;
}
