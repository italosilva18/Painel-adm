/**
 * Mobile Users Service
 * CRUD operations for mobile user management
 */

import apiClient from '@/api/config';
import { apiConfig } from '@/api/config';
import {
  MobileUser,
  CreateMobileUserRequest,
  UpdateMobileUserRequest,
} from '@/api/types';
import { parseApiError } from '@/api/errorHandler';

/**
 * Create a new mobile user
 * Note: Password is auto-generated and sent via SMS/Email
 */
export async function createMobileUser(
  user: CreateMobileUserRequest
): Promise<MobileUser> {
  try {
    const response = await apiClient.post<MobileUser>(
      apiConfig.endpoints.mobile,
      user
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get mobile user by email
 */
export async function getMobileUser(email: string): Promise<MobileUser> {
  try {
    const response = await apiClient.get<MobileUser>(
      apiConfig.endpoints.mobile,
      {
        params: { email },
      }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Update mobile user information
 */
export async function updateMobileUser(
  email: string,
  updates: Partial<CreateMobileUserRequest>
): Promise<MobileUser> {
  try {
    const payload: UpdateMobileUserRequest = {
      email,
      ...updates,
    };
    const response = await apiClient.put<MobileUser>(
      apiConfig.endpoints.mobile,
      payload
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Delete mobile user by email
 */
export async function deleteMobileUser(email: string): Promise<void> {
  try {
    await apiClient.delete(apiConfig.endpoints.mobile, {
      params: { email },
    });
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get stores associated with a mobile user
 */
export async function getUserStores(email: string): Promise<string[]> {
  try {
    const response = await apiClient.get<string[]>(
      apiConfig.endpoints.mobileStores,
      {
        params: { email },
      }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Add store to mobile user
 */
export async function addStoreToUser(
  email: string,
  cnpj: string
): Promise<MobileUser> {
  try {
    const response = await apiClient.put<MobileUser>(
      apiConfig.endpoints.mobileStores,
      {
        email,
        cnpj,
      }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Remove store from mobile user
 */
export async function removeStoreFromUser(
  email: string,
  cnpj: string
): Promise<void> {
  try {
    await apiClient.delete(apiConfig.endpoints.mobileStores, {
      params: { email, cnpj },
    });
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Toggle mobile user active status
 */
export async function toggleMobileUserStatus(
  email: string,
  active: boolean
): Promise<MobileUser> {
  try {
    const response = await apiClient.put<MobileUser>(
      apiConfig.endpoints.mobile,
      {
        email,
        active,
      }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Batch add stores to user
 */
export async function addMultipleStoresToUser(
  email: string,
  cnpjs: string[]
): Promise<MobileUser> {
  try {
    const promises = cnpjs.map(cnpj =>
      apiClient.put<MobileUser>(apiConfig.endpoints.mobileStores, {
        email,
        cnpj,
      })
    );
    const results = await Promise.all(promises);
    // Return the last result (all should be the same user)
    return results[results.length - 1].data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Batch remove stores from user
 */
export async function removeMultipleStoresFromUser(
  email: string,
  cnpjs: string[]
): Promise<void> {
  try {
    const promises = cnpjs.map(cnpj =>
      apiClient.delete(apiConfig.endpoints.mobileStores, {
        params: { email, cnpj },
      })
    );
    await Promise.all(promises);
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get all mobile users by partner (admin view)
 */
export async function getMobileUsersByPartner(
  partner: string
): Promise<MobileUser[]> {
  try {
    const response = await apiClient.get<MobileUser[]>(
      apiConfig.endpoints.mobile,
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
 * Export mobile users to file
 */
export async function exportMobileUsers(partner: string): Promise<Blob> {
  try {
    const response = await apiClient.get('/admin/file-users', {
      params: { partner },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}
