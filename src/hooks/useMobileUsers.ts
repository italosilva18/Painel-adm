/**
 * useMobileUsers Hook
 * Mobile user CRUD operations and state management
 */

import { useState, useCallback } from 'react';
import * as mobileService from '@/api/services/mobileService';
import { MobileUser } from '@/api/types';
import { UserStore } from '@/api/services/mobileService';

export interface MobileUsersState {
  users: MobileUser[];
  currentUser: MobileUser | null;
  userStores: UserStore[];
  isLoading: boolean;
  error: string | null;
}

export function useMobileUsers() {
  const [state, setState] = useState<MobileUsersState>({
    users: [],
    currentUser: null,
    userStores: [],
    isLoading: false,
    error: null,
  });

  /**
   * Search mobile user by email
   */
  const searchByEmail = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await mobileService.getMobileUserWithStores(email);
      if (result) {
        setState(prev => ({
          ...prev,
          currentUser: result.user,
          userStores: result.stores,
          users: [result.user],
          isLoading: false,
        }));
        return result;
      } else {
        setState(prev => ({
          ...prev,
          currentUser: null,
          userStores: [],
          users: [],
          isLoading: false,
        }));
        return null;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar usuário';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  /**
   * Search mobile user by phone
   */
  const searchByPhone = useCallback(async (phone: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await mobileService.getMobileUserWithStoresByPhone(phone);
      if (result) {
        setState(prev => ({
          ...prev,
          currentUser: result.user,
          userStores: result.stores,
          users: [result.user],
          isLoading: false,
        }));
        return result;
      } else {
        setState(prev => ({
          ...prev,
          currentUser: null,
          userStores: [],
          users: [],
          isLoading: false,
        }));
        return null;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar usuário';
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
  const createUser = useCallback(async (userData: {
    name: string;
    email: string;
    phone: string;
    _type: string;
    partner: string;
    active: boolean;
    password?: string;
  }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const newUser = await mobileService.createMobileUser(userData);
      setState(prev => ({
        ...prev,
        users: [...prev.users, newUser],
        currentUser: newUser,
        isLoading: false,
      }));
      return newUser;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar usuário';
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
  const updateUser = useCallback(async (userData: {
    _id?: string;
    email: string;
    name?: string;
    phone?: string;
    _type?: string;
    partner?: string;
    active?: boolean;
  }) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updated = await mobileService.updateMobileUser(userData);
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
   * Delete mobile user by email
   */
  const deleteUser = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await mobileService.deleteMobileUserByEmail(email);
      setState(prev => ({
        ...prev,
        users: prev.users.filter(u => u.email !== email),
        currentUser: prev.currentUser?.email === email ? null : prev.currentUser,
        userStores: prev.currentUser?.email === email ? [] : prev.userStores,
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
   * Add store to user
   */
  const addStore = useCallback(async (email: string, cnpj: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await mobileService.addStoreToUser(email, cnpj);
      // Reload user stores
      if (state.currentUser?._id) {
        const stores = await mobileService.getUserStores(state.currentUser._id);
        setState(prev => ({
          ...prev,
          userStores: stores,
          isLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao adicionar loja';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, [state.currentUser]);

  /**
   * Remove store from user
   */
  const removeStore = useCallback(async (email: string, cnpj: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await mobileService.removeStoreFromUser(email, cnpj);
      setState(prev => ({
        ...prev,
        userStores: prev.userStores.filter(s => s.cnpj !== cnpj),
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
    searchByEmail,
    searchByPhone,
    createUser,
    updateUser,
    deleteUser,
    addStore,
    removeStore,
    clearCurrent,
    clearError,
  };
}
