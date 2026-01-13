/**
 * useSupportUsers Hook
 * Support user CRUD operations and state management
 */

import { useState, useCallback } from 'react';
import * as supportService from '@/api/services/supportService';
import { SupportUser } from '@/api/types';

export interface SupportUsersState {
  users: SupportUser[];
  currentUser: SupportUser | null;
  isLoading: boolean;
  error: string | null;
}

export function useSupportUsers() {
  const [state, setState] = useState<SupportUsersState>({
    users: [],
    currentUser: null,
    isLoading: false,
    error: null,
  });

  /**
   * Search support user by email
   */
  const searchByEmail = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = await supportService.getSupportUserByEmail(email);
      if (user) {
        setState(prev => ({
          ...prev,
          currentUser: user,
          users: [user],
          isLoading: false,
        }));
        return user;
      } else {
        setState(prev => ({
          ...prev,
          currentUser: null,
          users: [],
          isLoading: false,
        }));
        return null;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar usuário de suporte';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  /**
   * Create new support user
   */
  const createUser = useCallback(async (userData: {
    name: string;
    email: string;
    partner: string;
    active?: boolean;
    password?: string;
  }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const newUser = await supportService.createSupportUser(userData);
      setState(prev => ({
        ...prev,
        users: [...prev.users, newUser],
        currentUser: newUser,
        isLoading: false,
      }));
      return newUser;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar usuário de suporte';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  /**
   * Update support user
   */
  const updateUser = useCallback(async (userData: {
    email: string;
    name?: string;
    partner?: string;
    active?: boolean;
  }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updated = await supportService.updateSupportUser(userData);
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => (u.email === userData.email ? updated : u)),
        currentUser: prev.currentUser?.email === userData.email ? updated : prev.currentUser,
        isLoading: false,
      }));
      return updated;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  /**
   * Delete support user by email
   */
  const deleteUser = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await supportService.deleteSupportUserByEmail(email);
      setState(prev => ({
        ...prev,
        users: prev.users.filter(u => u.email !== email),
        currentUser: prev.currentUser?.email === email ? null : prev.currentUser,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar usuário';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  /**
   * Clear current user
   */
  const clearCurrent = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentUser: null,
    }));
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    // State
    ...state,

    // Methods
    searchByEmail,
    createUser,
    updateUser,
    deleteUser,
    clearCurrent,
    clearError,
  };
}
