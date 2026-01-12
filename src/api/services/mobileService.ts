/**
 * Mobile User Service
 * Handles API calls for mobile user management
 *
 * API Structure:
 * - GET /mobile?email={email} - Returns single user object (not array)
 * - GET /mobile/store?id={_id} - Returns array of user stores
 * - POST /mobile - Create user
 * - PUT /mobile?id={_id} - Update user (by id)
 * - DELETE /mobile?id={_id} - Delete user
 * - PUT /mobile/store?email={email}&cnpj={cnpj} - Add store to user
 * - DELETE /mobile/store?email={email}&cnpj={cnpj} - Remove store from user
 */

import apiClient from '@/api/config';
import { apiConfig } from '@/api/config';
import { MobileUser } from '@/api/types';
import { parseApiError } from '@/api/errorHandler';

/**
 * Interface for API response - user object with MongoDB fields
 */
interface MobileUserAPI {
  _id: string;
  _type: string;
  name: string;
  email: string;
  phone: string;
  term: boolean;
  active: boolean;
  inclusao: string;
  partner: string;
  lojas?: string[]; // array of store ObjectIDs
}

/**
 * Interface for user's store from API
 */
export interface UserStore {
  _id?: string;
  serial: string;
  name: string;
  cnpj: string;
  lucrability?: boolean;
  offerta?: boolean;
  oppinar?: boolean;
  prazzo?: boolean;
  nomeFantasia?: string;
  razaoSocial?: string;
}

/**
 * Convert API response to MobileUser interface
 */
function mapApiToMobileUser(apiUser: MobileUserAPI): MobileUser {
  return {
    _id: apiUser._id,
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone || '',
    type: apiUser._type,
    _type: apiUser._type,
    partner: apiUser.partner || '',
    active: apiUser.active,
    lojas: apiUser.lojas,
    inclusao: apiUser.inclusao,
    created_at: apiUser.inclusao,
  };
}

/**
 * Search mobile user by email
 * Returns single user or null if not found
 */
export async function getMobileUserByEmail(email: string): Promise<MobileUser | null> {
  try {
    const response = await apiClient.get(apiConfig.endpoints.mobile, {
      params: { email }
    });

    // API returns the user object directly or empty object if not found
    if (response.data && response.data._id) {
      return mapApiToMobileUser(response.data);
    }
    return null;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Search mobile user by phone number
 * Returns single user or null if not found
 */
export async function getMobileUserByPhone(phone: string): Promise<MobileUser | null> {
  try {
    const response = await apiClient.get(apiConfig.endpoints.mobile, {
      params: { phone }
    });

    // API returns the user object directly or empty object if not found
    if (response.data && response.data._id) {
      return mapApiToMobileUser(response.data);
    }
    return null;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get stores associated with a mobile user
 */
export async function getUserStores(userId: string): Promise<UserStore[]> {
  try {
    const response = await apiClient.get(apiConfig.endpoints.mobileStores, {
      params: { id: userId }
    });

    // API returns array of stores
    return response.data || [];
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get mobile user with their stores (by email)
 */
export async function getMobileUserWithStores(email: string): Promise<{ user: MobileUser; stores: UserStore[] } | null> {
  try {
    const user = await getMobileUserByEmail(email);
    if (!user || !user._id) {
      return null;
    }

    const stores = await getUserStores(user._id);
    return { user, stores };
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get mobile user with their stores (by phone)
 */
export async function getMobileUserWithStoresByPhone(phone: string): Promise<{ user: MobileUser; stores: UserStore[] } | null> {
  try {
    const user = await getMobileUserByPhone(phone);
    if (!user || !user._id) {
      return null;
    }

    const stores = await getUserStores(user._id);
    return { user, stores };
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Create a new mobile user
 */
export async function createMobileUser(userData: {
  name: string;
  email: string;
  phone: string;
  _type: string;
  partner: string;
  active: boolean;
  password?: string;
}): Promise<MobileUser> {
  try {
    const response = await apiClient.post(apiConfig.endpoints.mobile, userData);
    return mapApiToMobileUser(response.data);
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Update an existing mobile user (by email)
 */
export async function updateMobileUser(userData: {
  _id?: string;
  email: string;
  name?: string;
  phone?: string;
  _type?: string;
  partner?: string;
  active?: boolean;
}): Promise<MobileUser> {
  try {
    // A API requer o ID na query string
    const { _id, ...bodyData } = userData;
    if (!_id) {
      // Se não tem _id, buscar pelo email primeiro
      const user = await getMobileUserByEmail(userData.email);
      if (!user || !user._id) {
        throw new Error('Usuário não encontrado');
      }
      const response = await apiClient.put(apiConfig.endpoints.mobile, bodyData, {
        params: { id: user._id }
      });
      return mapApiToMobileUser(response.data);
    }
    const response = await apiClient.put(apiConfig.endpoints.mobile, bodyData, {
      params: { id: _id }
    });
    return mapApiToMobileUser(response.data);
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Delete a mobile user by email
 */
export async function deleteMobileUserByEmail(email: string): Promise<void> {
  try {
    await apiClient.delete(apiConfig.endpoints.mobile, {
      params: { email }
    });
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Add a store to a mobile user
 * PUT /admin/mobile/store?email=&cnpj=
 */
export async function addStoreToUser(email: string, cnpj: string): Promise<void> {
  try {
    await apiClient.put(apiConfig.endpoints.mobileStores, null, {
      params: { email, cnpj }
    });
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Remove a store from a mobile user
 * DELETE /admin/mobile/store?email=&cnpj=
 */
export async function removeStoreFromUser(email: string, cnpj: string): Promise<void> {
  try {
    await apiClient.delete(apiConfig.endpoints.mobileStores, {
      params: { email, cnpj }
    });
  } catch (error) {
    throw parseApiError(error);
  }
}

// Legacy exports for backwards compatibility
export async function getMobileUsers(email?: string): Promise<MobileUser[]> {
  if (email) {
    const user = await getMobileUserByEmail(email);
    return user ? [user] : [];
  }
  return [];
}

export async function getMobileUserById(_id: number): Promise<MobileUser> {
  throw new Error('getMobileUserById is deprecated. Use getMobileUserByEmail instead.');
}

export async function deleteMobileUser(_id: number): Promise<void> {
  throw new Error('deleteMobileUser is deprecated. Use deleteMobileUserByEmail instead.');
}

export async function addStoreToMobileUser(_userId: number, _storeId: number): Promise<void> {
  throw new Error('addStoreToMobileUser is deprecated. Use addStoreToUser instead.');
}

export async function removeStoreFromMobileUser(_userId: number, _storeId: number): Promise<void> {
  throw new Error('removeStoreFromMobileUser is deprecated. Use removeStoreFromUser instead.');
}

export async function searchMobileUsersByEmail(email: string): Promise<MobileUser[]> {
  return getMobileUsers(email);
}
