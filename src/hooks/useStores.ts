/**
 * useStores Hook
 * Store CRUD operations and state management
 */

import { useState, useCallback } from 'react';
import * as storesService from '@/api/services/stores';
import { Store, CreateStoreRequest } from '@/api/types';

export interface StoresState {
  stores: Store[];
  currentStore: Store | null;
  isLoading: boolean;
  error: string | null;
}

export function useStores(_initialPartner?: string) {
  const [state, setState] = useState<StoresState>({
    stores: [],
    currentStore: null,
    isLoading: false,
    error: null,
  });

  /**
   * Load stores for a partner
   */
  const loadStores = useCallback(async (partner: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const stores = await storesService.getStoresByPartner(partner);
      setState(prev => ({
        ...prev,
        stores,
        isLoading: false,
      }));
      return stores;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar lojas';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  /**
   * Load single store by CNPJ
   */
  const loadStore = useCallback(async (cnpj: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const store = await storesService.getStore(cnpj);
      setState(prev => ({
        ...prev,
        currentStore: store,
        isLoading: false,
      }));
      return store;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar loja';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  /**
   * Create new store
   */
  const createStore = useCallback(async (store: CreateStoreRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const newStore = await storesService.createStore(store);
      setState(prev => ({
        ...prev,
        stores: [...prev.stores, newStore],
        isLoading: false,
      }));
      return newStore;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar loja';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  /**
   * Update existing store
   */
  const updateStore = useCallback(async (cnpj: string, updates: Partial<CreateStoreRequest>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updated = await storesService.updateStore(cnpj, updates);
      setState(prev => ({
        ...prev,
        stores: prev.stores.map(s => (s.cnpj === cnpj ? updated : s)),
        currentStore: prev.currentStore?.cnpj === cnpj ? updated : prev.currentStore,
        isLoading: false,
      }));
      return updated;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar loja';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  /**
   * Delete store
   */
  const deleteStore = useCallback(async (cnpj: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await storesService.deleteStore(cnpj);
      setState(prev => ({
        ...prev,
        stores: prev.stores.filter(s => s.cnpj !== cnpj),
        currentStore: prev.currentStore?.cnpj === cnpj ? null : prev.currentStore,
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar loja';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  /**
   * Toggle store service
   */
  const toggleService = useCallback(
    async (cnpj: string, service: 'offerta' | 'oppinar' | 'prazzo', enabled: boolean) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const updated = await storesService.toggleStoreService(cnpj, service, enabled);
        setState(prev => ({
          ...prev,
          stores: prev.stores.map(s => (s.cnpj === cnpj ? updated : s)),
          currentStore: prev.currentStore?.cnpj === cnpj ? updated : prev.currentStore,
          isLoading: false,
        }));
        return updated;
      } catch (error) {
        const message = error instanceof Error ? error.message : `Erro ao alterar ${service}`;
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Clear current store
   */
  const clearCurrent = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStore: null,
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
    loadStores,
    loadStore,
    createStore,
    updateStore,
    deleteStore,
    toggleService,
    clearCurrent,
    clearError,
  };
}
