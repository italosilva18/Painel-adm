/**
 * Store Service
 * Handles API calls for store management
 */

import apiClient from '@/api/config';
import { apiConfig } from '@/api/config';
import { Store } from '@/api/types';
import { parseApiError } from '@/api/errorHandler';

/**
 * Get store by CNPJ
 * API returns a single store object when CNPJ is provided
 * Returns empty array if no CNPJ provided (API requires CNPJ parameter)
 */
export async function getStores(cnpj?: string): Promise<Store[]> {
  try {
    if (!cnpj) {
      // API requires CNPJ parameter to search
      return [];
    }
    const response = await apiClient.get<Store>(apiConfig.endpoints.stores, {
      params: { cnpj }
    });
    // API returns single store object, wrap in array
    return response.data ? [response.data] : [];
  } catch (error) {
    // If not found, return empty array instead of throwing
    const apiError = parseApiError(error);
    if (apiError.code === 'NOT_FOUND' || apiError.code === 'NETWORK_ERROR') {
      return [];
    }
    throw apiError;
  }
}

/**
 * Transform frontend store data to API format
 * Frontend uses: name, fantasy_name, address_*
 * API expects: company, tradeName, state, city, etc.
 */
function transformStoreForAPI(storeData: Partial<Store>): Record<string, unknown> {
  // Handle scanner - can be boolean or object
  let scannerData = { active: false, beta: false, days: 0 };
  if (typeof storeData.scanner === 'object' && storeData.scanner !== null) {
    scannerData = storeData.scanner as { active: boolean; beta: boolean; days: number };
  } else if (typeof storeData.scanner === 'boolean') {
    scannerData = { active: storeData.scanner, beta: false, days: 0 };
  } else if (storeData.service_scanner) {
    scannerData = { active: true, beta: false, days: 0 };
  }

  return {
    company: storeData.name || storeData.company || '',
    tradeName: storeData.fantasy_name || storeData.tradeName || '',
    cnpj: storeData.cnpj || '',
    phone: storeData.phone || '',
    email: storeData.email || '',
    serial: storeData.serial || storeData.licenca || '',
    street: storeData.address_street || storeData.street || '',
    city: storeData.address_city || storeData.city || '',
    cityCode: Number(storeData.address_city_code || storeData.cityCode) || 0,
    state: storeData.address_state || storeData.state || '',
    stateCode: Number(storeData.address_state_code || storeData.stateCode) || 0,
    neighborhood: storeData.address_district || storeData.neighborhood || '',
    number: storeData.address_number || storeData.number || '',
    partner: storeData.partner || '',
    codePartner: Number(storeData.partner_code || storeData.codePartner) || 0,
    active: storeData.active ?? true,
    lucrability: storeData.lucrability ?? false,
    scanner: scannerData,
    offerta: storeData.offerta || storeData.service_offerta || false,
    oppinar: storeData.oppinar || storeData.service_oppinar || false,
    prazzo: storeData.prazzo || storeData.service_prazzo || false,
    size: storeData.size || '',
    segment: storeData.segment || '',
    operation: storeData.operation || []
  };
}

/**
 * Create a new store
 */
export async function createStore(storeData: Omit<Store, 'id' | 'serial' | 'created_at' | 'updated_at'>): Promise<Store> {
  try {
    const apiData = transformStoreForAPI(storeData);
    const response = await apiClient.post<Store>(apiConfig.endpoints.stores, apiData);
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Update an existing store
 * API expects: PUT /store?id={_id} with store data in body
 */
export async function updateStore(storeData: Store): Promise<Store> {
  try {
    const apiData = transformStoreForAPI(storeData);
    const response = await apiClient.put<Store>(apiConfig.endpoints.stores, apiData, {
      params: { id: storeData._id }
    });
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Delete a store by ID
 */
export async function deleteStore(id: number): Promise<void> {
  try {
    await apiClient.delete(`${apiConfig.endpoints.stores}/${id}`);
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Delete a store by CNPJ
 */
export async function deleteStoreByCnpj(cnpj: string): Promise<void> {
  try {
    await apiClient.delete(apiConfig.endpoints.stores, {
      params: { cnpj }
    });
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Search stores by CNPJ
 */
export async function searchStoresByCnpj(cnpj: string): Promise<Store[]> {
  return getStores(cnpj);
}

/**
 * Response type for store users endpoint
 */
export interface StoreUser {
  _id: string;
  type: string;
  name: string;
  email: string;
  code?: string;
  cellPhone?: string;
  term?: boolean;
  active?: boolean;
  createdAt?: string;
  partner?: string;
}

export interface StoreUsersResponse {
  store: {
    _id: string;
    tradeName: string;
    cnpj: string;
    serial: string;
  };
  users: StoreUser[];
  total_users: number;
}

/**
 * Get users by their IDs (from store.users array)
 */
export async function getUsersByIds(ids: string[]): Promise<StoreUser[]> {
  try {
    if (!ids || ids.length === 0) {
      return [];
    }
    const response = await apiClient.post<StoreUser[]>(`${apiConfig.endpoints.mobile}/by-ids`, {
      ids
    });
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}