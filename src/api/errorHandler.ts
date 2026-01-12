/**
 * Error Handler
 * Centralized error parsing and user-friendly message generation
 */

import { AxiosError } from 'axios';
import { ApiErrorResponse } from './types';

export class ApiError extends Error {
  public readonly statusCode?: number;
  public readonly code?: string;
  public readonly originalError?: any;

  constructor(
    message: string,
    statusCode?: number,
    code?: string,
    originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.originalError = originalError;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Parse axios error and return user-friendly message
 */
export function parseApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data as ApiErrorResponse | undefined;

    // Handle specific status codes
    if (status === 401) {
      return new ApiError(
        'Sessao expirada. Por favor, faca login novamente.',
        401,
        'UNAUTHORIZED',
        error
      );
    }

    if (status === 403) {
      return new ApiError(
        'Voce nao tem permissao para acessar este recurso.',
        403,
        'FORBIDDEN',
        error
      );
    }

    if (status === 404) {
      return new ApiError(
        'Recurso nao encontrado.',
        404,
        'NOT_FOUND',
        error
      );
    }

    if (status === 409) {
      return new ApiError(
        data?.message || 'Este recurso ja existe (duplicado).',
        409,
        'CONFLICT',
        error
      );
    }

    if (status === 422) {
      return new ApiError(
        data?.message || 'Dados invalidos. Verifique os campos preenchidos.',
        422,
        'VALIDATION_ERROR',
        error
      );
    }

    if (status === 500) {
      return new ApiError(
        'Erro interno do servidor. Tente novamente mais tarde.',
        500,
        'INTERNAL_SERVER_ERROR',
        error
      );
    }

    if (status === 503) {
      return new ApiError(
        'Servidor indisponivel. Tente novamente mais tarde.',
        503,
        'SERVICE_UNAVAILABLE',
        error
      );
    }

    // Network errors
    if (error.code === 'ECONNABORTED') {
      return new ApiError(
        'Timeout na conexao. Verifique sua internet.',
        0,
        'TIMEOUT',
        error
      );
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new ApiError(
        'Nao foi possivel conectar ao servidor.',
        0,
        'CONNECTION_ERROR',
        error
      );
    }

    // Generic error response from server
    if (data?.message) {
      return new ApiError(
        data.message,
        status,
        data.code,
        error
      );
    }

    // Fallback to axios error message
    return new ApiError(
      error.message || 'Erro desconhecido na requisicao.',
      status,
      'UNKNOWN_ERROR',
      error
    );
  }

  if (error instanceof Error) {
    return new ApiError(error.message, undefined, 'ERROR', error);
  }

  return new ApiError('Erro desconhecido ocorreu.', undefined, 'UNKNOWN', error);
}

/**
 * Check if error is authentication-related
 */
export function isAuthError(error: ApiError): boolean {
  return error.statusCode === 401 || error.code === 'UNAUTHORIZED';
}

/**
 * Check if error is validation-related
 */
export function isValidationError(error: ApiError): boolean {
  return error.statusCode === 422 || error.code === 'VALIDATION_ERROR';
}

/**
 * Check if error is network-related
 */
export function isNetworkError(error: ApiError): boolean {
  return (
    error.code === 'TIMEOUT' ||
    error.code === 'CONNECTION_ERROR' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'ECONNREFUSED'
  );
}

/**
 * Get user-friendly error message for toast notifications
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}

/**
 * Log error for debugging
 */
export function logError(error: unknown, context?: string): void {
  const apiError = error instanceof ApiError ? error : parseApiError(error);

  console.error(
    `[${context || 'API Error'}] ${apiError.code}: ${apiError.message}`,
    apiError.originalError
  );

  // In production, you might want to send this to a logging service
  if (import.meta.env.PROD) {
    // sendToLoggingService(apiError, context);
  }
}
