/**
 * useAuth Hook
 * Authentication state management and operations
 */

import { useState, useCallback, useEffect } from 'react';
import * as authService from '@/api/services/auth';
import * as tokenManager from '@/utils/tokenManager';
import { LoginRequest } from '@/api/types';

export interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  partner: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: tokenManager.isAuthenticated(),
    email: tokenManager.getUserEmail(),
    partner: tokenManager.getUserPartner(),
    isLoading: false,
    error: null,
  });

  // Check token validity on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenManager.getToken();
      if (!token) {
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          email: null,
          partner: null,
        }));
        return;
      }

      // Check if token is expired
      if (authService.isTokenExpired(token)) {
        tokenManager.clearAuthData();
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          email: null,
          partner: null,
          error: 'Token expirado',
        }));
      }
    };

    checkAuth();
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (credentials: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authService.login(credentials);

      // Store token and user info
      tokenManager.setAuthSession(response.token, {
        email: response.email,
        partner: response.partner || '',
      });

      setState({
        isAuthenticated: true,
        email: response.email,
        partner: response.partner || null,
        isLoading: false,
        error: null,
      });

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));

      throw error;
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout API failed, clearing locally:', error);
    } finally {
      tokenManager.clearAuthData();
      setState({
        isAuthenticated: false,
        email: null,
        partner: null,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Validate current token
   */
  const validateToken = useCallback(async (): Promise<boolean> => {
    try {
      return await authService.validateToken();
    } catch (error) {
      return false;
    }
  }, []);

  /**
   * Get token expiration time
   */
  const getTokenExpiresIn = useCallback((): number | null => {
    const token = tokenManager.getToken();
    if (!token) return null;
    return authService.getTokenExpiresIn(token);
  }, []);

  /**
   * Check if token will expire soon (within 5 minutes)
   */
  const isTokenExpiringSoon = useCallback((): boolean => {
    const token = tokenManager.getToken();
    if (!token) return false;
    return authService.isTokenExpired(token);
  }, []);

  return {
    // State
    ...state,

    // Methods
    login,
    logout,
    clearError,
    validateToken,
    getTokenExpiresIn,
    isTokenExpiringSoon,
  };
}
