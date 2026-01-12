/**
 * Authentication Store (Zustand)
 * Global state management for authentication
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authService from '@/api/services/auth';
import * as tokenManager from '@/utils/tokenManager';
import { LoginRequest } from '@/api/types';

export interface AuthUser {
  id?: number;
  name?: string;
  email: string;
  partner?: string;
}

export interface AuthStoreState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  validateToken: () => Promise<boolean>;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);

          const user: AuthUser = {
            id: response.user?.id,
            name: response.user?.name,
            email: response.email,
            partner: response.partner,
          };

          // Store in localStorage via tokenManager
          tokenManager.setAuthSession(response.token, {
            email: user.email,
            partner: user.partner || '',
          });

          set({
            isAuthenticated: true,
            user,
            token: response.token,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao fazer login';
          set({
            isLoading: false,
            error: message,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch (error) {
          console.warn('Logout API failed, clearing locally:', error);
        } finally {
          tokenManager.clearAuthData();
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      validateToken: async () => {
        try {
          return await authService.validateToken();
        } catch (error) {
          return false;
        }
      },

      hydrate: () => {
        const token = tokenManager.getToken();
        const user = tokenManager.getUser();

        if (token && user) {
          // Check if token is expired
          if (authService.isTokenExpired(token)) {
            tokenManager.clearAuthData();
            set({
              isAuthenticated: false,
              user: null,
              token: null,
            });
            return;
          }

          set({
            isAuthenticated: true,
            token,
            user: {
              email: user.email,
              partner: user.partner,
            },
          });
        }
      },
    }),
    {
      name: 'margem-auth-store',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
