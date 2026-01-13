/**
 * useStores Hook
 * Store CRUD operations and state management
 */

import { useState, useCallback } from 'react';
import * as storeService from '@/api/services/storeService';
import { Store } from '@/api/types';

export interface StoresState {
  stores: Store[];
  currentStore: Store | null;
  isLoading: boolean;
  error: string | null;
}

export function useStores() {
  const [state, setState] = useState<StoresState>({
    stores: [],
    currentStore: null,
    isLoading: false,
    error: null,
  });

  /**
   * Search store by CNPJ
   */
  const searchByCnpj = useCallback(async (cnpj: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const stores = await storeService.getStores(cnpj);
      setState(prev => ({
        ...prev,
        stores,
        currentStore: stores.length > 0 ? stores[0] : null,
        isLoading: false,
      }));
      return stores;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar loja';
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
  const createStore = useCallback(async (storeData: Omit<Store, 'id' | 'serial' | 'created_at' | 'updated_at'>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const newStore = await storeService.createStore(storeData);
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
  const updateStore = useCallback(async (storeData: Store) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updated = await storeService.updateStore(storeData);
      setState(prev => ({
        ...prev,
        stores: prev.stores.map(s => (s.cnpj === storeData.cnpj ? updated : s)),
        currentStore: prev.currentStore?.cnpj === storeData.cnpj ? updated : prev.currentStore,
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
   * Delete store by CNPJ
   */
  const deleteStore = useCallback(async (cnpj: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await storeService.deleteStoreByCnpj(cnpj);
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
    searchByCnpj,
    createStore,
    updateStore,
    deleteStore,
    clearCurrent,
    clearError,
  };
}
