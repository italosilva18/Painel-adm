/**
 * Stores Service
 * CRUD operations for store management
 */

import apiClient from '@/api/config';
import { apiConfig } from '@/api/config';
import {
  Store,
  CreateStoreRequest,
  UpdateStoreRequest,
  StoreQueryParams,
} from '@/api/types';
import { parseApiError } from '@/api/errorHandler';

/**
 * Create a new store
 */
export async function createStore(store: CreateStoreRequest): Promise<Store> {
  try {
    const response = await apiClient.post<Store>(
      apiConfig.endpoints.stores,
      store
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get store by CNPJ
 */
export async function getStore(cnpj: string): Promise<Store> {
  try {
    const response = await apiClient.get<Store>(apiConfig.endpoints.stores, {
      params: { cnpj },
    });
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get all stores for a partner
 */
export async function getStoresByPartner(partner: string): Promise<Store[]> {
  try {
    const response = await apiClient.get<Store[]>(
      apiConfig.endpoints.storesByPartner,
      {
        params: { partner },
      }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Update store information
 */
export async function updateStore(
  cnpj: string,
  updates: Partial<CreateStoreRequest>
): Promise<Store> {
  try {
    const payload: UpdateStoreRequest = {
      cnpj,
      ...updates,
    };
    const response = await apiClient.put<Store>(
      apiConfig.endpoints.stores,
      payload
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Delete store by CNPJ
 */
export async function deleteStore(cnpj: string): Promise<void> {
  try {
    await apiClient.delete(apiConfig.endpoints.stores, {
      params: { cnpj },
    });
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Toggle store service (Offerta, Oppinar, Prazzo, etc)
 */
export async function toggleStoreService(
  cnpj: string,
  service: 'offerta' | 'oppinar' | 'prazzo',
  enabled: boolean
): Promise<Store> {
  try {
    const response = await apiClient.put<Store>(
      apiConfig.endpoints.stores,
      {
        cnpj,
        [service]: enabled,
      }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Update scanner configuration
 */
export async function updateScannerConfig(
  cnpj: string,
  config: {
    active: boolean;
    beta?: boolean;
    days?: number;
    expire?: string;
  }
): Promise<Store> {
  try {
    const response = await apiClient.put<Store>(
      apiConfig.endpoints.stores,
      {
        cnpj,
        scanner: config,
      }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Export stores to file (CSV/Excel)
 */
export async function exportStores(partner: string): Promise<Blob> {
  try {
    const response = await apiClient.get(
      apiConfig.endpoints.storesByPartner,
      {
        params: { partner },
        responseType: 'blob',
      }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get store details by CNPJ (with full details)
 */
export async function getStoreDetails(cnpj: string): Promise<Store> {
  try {
    const response = await apiClient.get<Store>(
      `${apiConfig.endpoints.stores}/${cnpj}`
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Batch operations: Create multiple stores
 */
export async function createMultipleStores(
  stores: CreateStoreRequest[]
): Promise<Store[]> {
  try {
    const promises = stores.map(store => createStore(store));
    return Promise.all(promises);
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Search stores by query parameters
 */
export async function searchStores(
  params: StoreQueryParams
): Promise<Store[]> {
  try {
    const response = await apiClient.get<Store[]>(
      apiConfig.endpoints.stores,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}
