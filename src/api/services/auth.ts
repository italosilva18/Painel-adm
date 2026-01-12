/**
 * Authentication Service
 * Handles login and authentication-related API calls
 */

import apiClient from '@/api/config';
import { apiConfig } from '@/api/config';
import { LoginRequest, LoginResponse } from '@/api/types';
import { parseApiError } from '@/api/errorHandler';

/**
 * Login with email and password
 */
export async function login(credentials: LoginRequest): Promise<{
  token: string;
  email: string;
  partner?: string;
  user?: any;
}> {
  try {
    const response = await apiClient.post<LoginResponse>(
      apiConfig.endpoints.login,
      credentials
    );

    const data = response.data;

    // Extract user info from nested user object if it exists
    const email = data.user?.email || data.email || credentials.email;
    const partner = data.user?.partner || data.partner || '';

    return {
      token: data.token,
      email,
      partner,
      user: data.user,
    };
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Logout (clear token on backend if needed)
 */
export async function logout(): Promise<void> {
  try {
    // Call logout endpoint if backend requires it
    // await apiClient.post(apiConfig.endpoints.logout);
  } catch (error) {
    // Logout locally even if API call fails
    console.warn('Logout API call failed, clearing token locally');
  }
}

/**
 * Validate token by making a simple authenticated request
 */
export async function validateToken(): Promise<boolean> {
  try {
    await apiClient.get('/admin/partners');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get current user from token (decode JWT)
 * Note: This is a client-side decode, doesn't validate signature
 * Handles tokens with or without "Bearer " prefix
 */
export function decodeToken(token: string): {
  id?: string;
  email?: string;
  partner?: string;
  iat?: number;
  exp?: number;
} | null {
  try {
    // Remove Bearer prefix if present
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 * Note: API tokens may not have exp field - treat as valid if no exp
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);

  // If can't decode, token is invalid
  if (!decoded) {
    return true;
  }

  // If no exp field, token doesn't expire (API admin tokens don't have exp)
  if (!decoded.exp) {
    return false;
  }

  // Check if token expires in next 5 minutes
  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const bufferTime = 5 * 60 * 1000; // 5 minutes

  return currentTime + bufferTime > expirationTime;
}

/**
 * Get time until token expiration
 */
export function getTokenExpiresIn(token: string): number | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const timeRemaining = expirationTime - currentTime;

  return timeRemaining > 0 ? timeRemaining : null;
}
