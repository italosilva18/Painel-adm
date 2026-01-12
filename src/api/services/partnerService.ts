/**
 * Partner Service
 * Handles API calls for partner/automation management
 */

import apiClient from '@/api/config';
import { apiConfig } from '@/api/config';
import { parseApiError } from '@/api/errorHandler';

// Partner interface
export interface Partner {
  _id?: string;
  name: string;
  code: string | number | null;
}

export interface PartnerRequest {
  name: string;
  code: string | number;
}

/**
 * Get all partners
 */
export async function getPartners(): Promise<Partner[]> {
  try {
    const response = await apiClient.get<Partner[]>(apiConfig.endpoints.partners);
    return response.data || [];
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get partner by code
 */
export async function getPartnerByCode(code: string): Promise<Partner | null> {
  try {
    const response = await apiClient.get<Partner>(`${apiConfig.endpoints.partners}/${code}`);
    return response.data;
  } catch (error) {
    const err = parseApiError(error);
    if (err.message.includes('not found')) {
      return null;
    }
    throw err;
  }
}

/**
 * Create a new partner
 */
export async function createPartner(partnerData: PartnerRequest): Promise<Partner> {
  try {
    const response = await apiClient.post<Partner>(apiConfig.endpoints.partners, partnerData);
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Update an existing partner
 */
export async function updatePartner(id: string, partnerData: PartnerRequest): Promise<Partner> {
  try {
    const response = await apiClient.put<Partner>(`${apiConfig.endpoints.partners}/${id}`, partnerData);
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Delete a partner
 */
export async function deletePartner(id: string): Promise<void> {
  try {
    await apiClient.delete(`${apiConfig.endpoints.partners}/${id}`);
  } catch (error) {
    throw parseApiError(error);
  }
}
