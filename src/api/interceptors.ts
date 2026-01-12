/**
 * Axios Interceptors
 * Handles request/response transformation and cross-cutting concerns
 */

import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import apiClient from './config';
import { getToken } from '@/utils/tokenManager';
import { parseApiError } from './errorHandler';

let isRefreshing = false;
let failedQueue: Array<{
  onSuccess: (token: string) => void;
  onFailure: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.onFailure(error);
    } else if (token) {
      prom.onSuccess(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

/**
 * Request Interceptor
 * - Inject JWT token from localStorage (except for login endpoint)
 * - Add request ID for tracking
 * - Log request in development
 */
export function setupRequestInterceptor(): void {
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Get token from storage
      const token = getToken();

      // Don't inject token for login endpoint
      const isLoginEndpoint = config.url?.includes('/login');

      // Inject token in Authorization header (except for login)
      // Note: API returns token with "Bearer " prefix already included
      if (token && !isLoginEndpoint) {
        const authValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        config.headers.Authorization = authValue;
      }

      // Add request ID for tracking
      config.headers['X-Request-ID'] = generateRequestId();

      // Log request in development
      if (import.meta.env.DEV) {
        console.log(
          `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
          {
            headers: config.headers,
            data: config.data,
          }
        );
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

/**
 * Response Interceptor
 * - Log responses in development
 * - Handle errors and redirect to login if unauthorized
 * - Attempt token refresh on 401
 */
export function setupResponseInterceptor(
  _onTokenRefresh?: (token: string) => void,
  onAuthError?: () => void
): void {
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response in development
      if (import.meta.env.DEV) {
        console.log(
          `[API Response] ${response.status} ${response.config.url}`,
          response.data
        );
      }

      return response;
    },
    async (error) => {
      const config = error.config as InternalAxiosRequestConfig;

      // Handle 401 Unauthorized
      if (error.response?.status === 401 && config && !config.headers['X-Retry']) {
        if (!isRefreshing) {
          isRefreshing = true;

          try {
            // Try to refresh token (implement this based on your backend)
            // For now, just clear token and redirect to login
            onAuthError?.();
            processQueue(error, null);
            return Promise.reject(parseApiError(error));
          } catch (err) {
            processQueue(err, null);
            onAuthError?.();
            return Promise.reject(parseApiError(err));
          }
        }

        // Queue failed requests
        return new Promise((resolve, reject) => {
          failedQueue.push({
            onSuccess: (token: string) => {
              config.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(config));
            },
            onFailure: (err) => {
              reject(err);
            },
          });
        });
      }

      // Parse and log error
      const apiError = parseApiError(error);

      if (import.meta.env.DEV) {
        console.error(
          `[API Error] ${apiError.code}: ${apiError.message}`,
          error
        );
      }

      return Promise.reject(apiError);
    }
  );
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Setup all interceptors
 */
export function setupInterceptors(
  onTokenRefresh?: (token: string) => void,
  onAuthError?: () => void
): void {
  setupRequestInterceptor();
  setupResponseInterceptor(onTokenRefresh, onAuthError);
}

/**
 * Add custom header to all requests
 */
export function addCustomHeader(key: string, value: string): void {
  apiClient.defaults.headers.common[key] = value;
}

/**
 * Remove custom header from all requests
 */
export function removeCustomHeader(key: string): void {
  delete apiClient.defaults.headers.common[key];
}
