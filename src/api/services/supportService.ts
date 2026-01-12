/**
 * Support User Service
 * Handles API calls for support user management
 *
 * API Structure:
 * - GET /support?email={email} - Returns single user object (not array)
 * - POST /support - Create user
 * - PUT /support - Update user (by email)
 * - DELETE /support?email={email} - Delete user
 */

import apiClient from '@/api/config';
import { apiConfig } from '@/api/config';
import { SupportUser } from '@/api/types';
import { parseApiError } from '@/api/errorHandler';

/**
 * Interface for API response - user object with MongoDB fields
 */
interface SupportUserAPI {
  _id: string;
  name: string;
  email: string;
  partner: string;
  active?: boolean;
  inclusao?: string;
  password?: string;
}

/**
 * Convert API response to SupportUser interface
 */
function mapApiToSupportUser(apiUser: SupportUserAPI): SupportUser {
  return {
    _id: apiUser._id,
    name: apiUser.name,
    email: apiUser.email,
    partner: apiUser.partner || '',
    active: apiUser.active ?? true,
    inclusao: apiUser.inclusao,
    created_at: apiUser.inclusao,
  };
}

/**
 * Search support user by email
 * Returns single user or null if not found
 */
export async function getSupportUserByEmail(email: string): Promise<SupportUser | null> {
  try {
    const response = await apiClient.get(apiConfig.endpoints.support, {
      params: { email }
    });

    // API returns the user object directly or empty object if not found
    if (response.data && response.data._id) {
      return mapApiToSupportUser(response.data);
    }
    return null;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Create a new support user
 */
export async function createSupportUser(userData: {
  name: string;
  email: string;
  partner: string;
  active?: boolean;
  password?: string;
}): Promise<SupportUser> {
  try {
    const response = await apiClient.post(apiConfig.endpoints.support, userData);
    return mapApiToSupportUser(response.data);
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Update an existing support user (by email)
 */
export async function updateSupportUser(userData: {
  email: string;
  name?: string;
  partner?: string;
  active?: boolean;
}): Promise<SupportUser> {
  try {
    const response = await apiClient.put(apiConfig.endpoints.support, userData);
    return mapApiToSupportUser(response.data);
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Delete a support user by email
 */
export async function deleteSupportUserByEmail(email: string): Promise<void> {
  try {
    await apiClient.delete(apiConfig.endpoints.support, {
      params: { email }
    });
  } catch (error) {
    throw parseApiError(error);
  }
}

// Legacy exports for backwards compatibility
export async function getSupportUsers(email?: string): Promise<SupportUser[]> {
  if (email) {
    const user = await getSupportUserByEmail(email);
    return user ? [user] : [];
  }
  return [];
}

export async function deleteSupportUser(_id: number): Promise<void> {
  throw new Error('deleteSupportUser is deprecated. Use deleteSupportUserByEmail instead.');
}

export async function searchSupportUsersByEmail(email: string): Promise<SupportUser[]> {
  return getSupportUsers(email);
}
