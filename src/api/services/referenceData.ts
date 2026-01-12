/**
 * Reference Data Service
 * Handles API calls for partners, states, segments, sizes
 */

import apiClient from '@/api/config';
import { parseApiError } from '@/api/errorHandler';

export interface Partner {
  _id?: string;
  name: string;
  code: number | null;
}

export interface State {
  name: string;
  code: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface Segment {
  description: string;
}

export interface Size {
  description: string;
  value: string;
}

export interface City {
  name: string;
  code: string;
  state?: string;
  stateCode?: string;
}

/**
 * Get all partners
 */
export async function getPartners(): Promise<Partner[]> {
  try {
    const response = await apiClient.get<Partner[]>('/partners');
    // Filter out empty partners
    return (response.data || []).filter(p => p.name && p.name.trim() !== '');
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get all states
 */
export async function getStates(): Promise<State[]> {
  try {
    const response = await apiClient.get<State[]>('/states');
    return response.data || [];
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get all segments
 */
export async function getSegments(): Promise<Segment[]> {
  try {
    const response = await apiClient.get<Segment[]>('/segments');
    return response.data || [];
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get all sizes
 */
export async function getSizes(): Promise<Size[]> {
  try {
    const response = await apiClient.get<Size[]>('/sizes');
    return response.data || [];
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get cities by state code
 * @param stateCode - The state code (e.g., "29" for Bahia)
 */
export async function getCitiesByState(stateCode: string): Promise<City[]> {
  try {
    const response = await apiClient.get<City[]>('/cities', {
      params: { estado: stateCode }
    });
    return response.data || [];
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get all cities (without filter)
 */
export async function getAllCities(): Promise<City[]> {
  try {
    const response = await apiClient.get<City[]>('/cities');
    return response.data || [];
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Load all reference data at once
 */
export async function loadAllReferenceData(): Promise<{
  partners: Partner[];
  states: State[];
  segments: Segment[];
  sizes: Size[];
}> {
  try {
    const [partners, states, segments, sizes] = await Promise.all([
      getPartners(),
      getStates(),
      getSegments(),
      getSizes(),
    ]);
    return { partners, states, segments, sizes };
  } catch (error) {
    throw parseApiError(error);
  }
}
