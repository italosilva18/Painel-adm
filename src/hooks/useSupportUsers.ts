/**
 * useSupportUsers Hook
 * Support user CRUD operations and state management
 */

import { useState, useCallback } from 'react';
import * as supportService from '@/api/services/supportUsers';
import { SupportUser, CreateSupportUserRequest } from '@/api/types';

export interface SupportUsersState {
  users: SupportUser[];
  currentUser: SupportUser | null;
  isLoading: boolean;
  error: string | null;
}

export function useSupportUsers(_initialPartner?: string) {
  const [state, setState] = useState<SupportUsersState>({
    users: [],
    currentUser: null,
    isLoading: false,
    error: null,
  });

  /**
   * Load support users by partner
   */
  const loadUsers = useCallback(async (partner: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const users = await supportService.getSupportUsersByPartner(partner);
      setState(prev => ({
        ...prev,
        users,
        isLoading: false,
      }));
      return users;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar usuarios de suporte';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  /**
   * Load single support user by email
   */
  const loadUser = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = await supportService.getSupportUser(email);
      setState(prev => ({
        ...prev,
        currentUser: user,
        isLoading: false,
      }));
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar usuario';
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
  const createUser = useCallback(async (user: CreateSupportUserRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const newUser = await supportService.createSupportUser(user);
      setState(prev => ({
        ...prev,
        users: [...prev.users, newUser],
        isLoading: false,
      }));
      return newUser;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar usuario de suporte';
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
  const updateUser = useCallback(async (email: string, updates: Partial<CreateSupportUserRequest>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updated = await supportService.updateSupportUserByEmail(email, updates);
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => (u.email === email ? updated : u)),
        currentUser: prev.currentUser?.email === email ? updated : prev.currentUser,
        isLoading: false,
      }));
      return updated;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar usuario';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  /**
   * Delete support user
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
      const message = error instanceof Error ? error.message : 'Erro ao deletar usuario';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  /**
   * Toggle user active status
   */
  const toggleStatus = useCallback(async (id: string, active: boolean) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updated = await supportService.toggleSupportUserStatus(id, active);
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => (u._id === id ? updated : u)),
        currentUser: prev.currentUser?._id === id ? updated : prev.currentUser,
        isLoading: false,
      }));
      return updated;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar status';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  /**
   * Search support users
   */
  const searchUsers = useCallback(async (query: {
    email?: string;
    partner?: string;
    name?: string;
  }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const users = await supportService.searchSupportUsers(query);
      setState(prev => ({
        ...prev,
        users,
        isLoading: false,
      }));
      return users;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao pesquisar usuarios';
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
    loadUsers,
    loadUser,
    createUser,
    updateUser,
    deleteUser,
    toggleStatus,
    searchUsers,
    clearCurrent,
    clearError,
  };
}
