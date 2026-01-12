/**
 * Support Users Service
 * CRUD operations for support user management
 */

import apiClient from '@/api/config';
import { apiConfig } from '@/api/config';
import {
  SupportUser,
  CreateSupportUserRequest,
  UpdateSupportUserRequest,
} from '@/api/types';
import { parseApiError } from '@/api/errorHandler';

/**
 * Create a new support user
 */
export async function createSupportUser(
  user: CreateSupportUserRequest
): Promise<SupportUser> {
  try {
    const response = await apiClient.post<SupportUser>(
      apiConfig.endpoints.support,
      user
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get support user by email
 */
export async function getSupportUser(email: string): Promise<SupportUser> {
  try {
    const response = await apiClient.get<SupportUser>(
      apiConfig.endpoints.support,
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
 * Get support user by ID
 */
export async function getSupportUserById(id: string): Promise<SupportUser> {
  try {
    const response = await apiClient.get<SupportUser>(
      `${apiConfig.endpoints.support}/${id}`
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Update support user information
 */
export async function updateSupportUser(
  id: string,
  updates: Partial<CreateSupportUserRequest>
): Promise<SupportUser> {
  try {
    const payload: UpdateSupportUserRequest = {
      id,
      ...updates,
    };
    const response = await apiClient.put<SupportUser>(
      apiConfig.endpoints.support,
      payload
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Update support user by email
 */
export async function updateSupportUserByEmail(
  email: string,
  updates: Partial<CreateSupportUserRequest>
): Promise<SupportUser> {
  try {
    // First get the user to get their ID
    const user = await getSupportUser(email);
    return updateSupportUser(user._id || '', updates);
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Delete support user by ID
 */
export async function deleteSupportUser(id: string): Promise<void> {
  try {
    await apiClient.delete(apiConfig.endpoints.support, {
      params: { id },
    });
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Delete support user by email
 */
export async function deleteSupportUserByEmail(email: string): Promise<void> {
  try {
    await apiClient.delete(apiConfig.endpoints.support, {
      params: { email },
    });
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get all support users by partner
 */
export async function getSupportUsersByPartner(
  partner: string
): Promise<SupportUser[]> {
  try {
    const response = await apiClient.get<SupportUser[]>(
      apiConfig.endpoints.support,
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
 * Toggle support user active status
 */
export async function toggleSupportUserStatus(
  id: string,
  active: boolean
): Promise<SupportUser> {
  try {
    const response = await apiClient.put<SupportUser>(
      apiConfig.endpoints.support,
      {
        id,
        active,
      }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Search support users
 */
export async function searchSupportUsers(query: {
  email?: string;
  partner?: string;
  name?: string;
}): Promise<SupportUser[]> {
  try {
    const response = await apiClient.get<SupportUser[]>(
      apiConfig.endpoints.support,
      {
        params: query,
      }
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get count of support users by partner
 */
export async function getSupportUserCount(partner: string): Promise<number> {
  try {
    const users = await getSupportUsersByPartner(partner);
    return users.length;
  } catch (error) {
    throw parseApiError(error);
  }
}
