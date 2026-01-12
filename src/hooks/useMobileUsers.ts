/**
 * useMobileUsers Hook
 * Mobile user CRUD operations and state management
 */

import { useState, useCallback } from 'react';
import * as mobileService from '@/api/services/mobileUsers';
import { MobileUser, CreateMobileUserRequest } from '@/api/types';

export interface MobileUsersState {
  users: MobileUser[];
  currentUser: MobileUser | null;
  userStores: string[];
  isLoading: boolean;
  error: string | null;
}

export function useMobileUsers(_initialPartner?: string) {
  const [state, setState] = useState<MobileUsersState>({
    users: [],
    currentUser: null,
    userStores: [],
    isLoading: false,
    error: null,
  });

  /**
   * Load mobile users by partner
   */
  const loadUsers = useCallback(async (partner: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const users = await mobileService.getMobileUsersByPartner(partner);
      setState(prev => ({
        ...prev,
        users,
        isLoading: false,
      }));
      return users;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar usuarios';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  /**
   * Load single user by email
   */
  const loadUser = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = await mobileService.getMobileUser(email);
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
   * Load user stores
   */
  const loadUserStores = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const stores = await mobileService.getUserStores(email);
      setState(prev => ({
        ...prev,
        userStores: stores,
        isLoading: false,
      }));
      return stores;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar lojas do usuario';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  /**
   * Create new mobile user
   */
  const createUser = useCallback(async (user: CreateMobileUserRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const newUser = await mobileService.createMobileUser(user);
      setState(prev => ({
        ...prev,
        users: [...prev.users, newUser],
        isLoading: false,
      }));
      return newUser;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar usuario';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  /**
   * Update mobile user
   */
  const updateUser = useCallback(async (email: string, updates: Partial<CreateMobileUserRequest>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updated = await mobileService.updateMobileUser(email, updates);
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
   * Delete mobile user
   */
  const deleteUser = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await mobileService.deleteMobileUser(email);
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
   * Add store to user
   */
  const addStore = useCallback(async (email: string, cnpj: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updated = await mobileService.addStoreToUser(email, cnpj);
      setState(prev => ({
        ...prev,
        currentUser: prev.currentUser?.email === email ? updated : prev.currentUser,
        userStores: [...prev.userStores, cnpj],
        isLoading: false,
      }));
      return updated;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao adicionar loja';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  /**
   * Remove store from user
   */
  const removeStore = useCallback(async (email: string, cnpj: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await mobileService.removeStoreFromUser(email, cnpj);
      setState(prev => ({
        ...prev,
        userStores: prev.userStores.filter(s => s !== cnpj),
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao remover loja';
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
  const toggleStatus = useCallback(async (email: string, active: boolean) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updated = await mobileService.toggleMobileUserStatus(email, active);
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => (u.email === email ? updated : u)),
        currentUser: prev.currentUser?.email === email ? updated : prev.currentUser,
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
   * Clear current user
   */
  const clearCurrent = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentUser: null,
      userStores: [],
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
    loadUserStores,
    createUser,
    updateUser,
    deleteUser,
    addStore,
    removeStore,
    toggleStatus,
    clearCurrent,
    clearError,
  };
}
