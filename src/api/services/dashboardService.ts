/**
 * Dashboard Service
 * Handles dashboard-related API calls
 */

import apiClient from '@/api/config';
import { apiConfig } from '@/api/config';
import { parseApiError } from '@/api/errorHandler';

/**
 * Dashboard statistics interface
 */
export interface DashboardStats {
  activeStores: number;
  mobileUsers: number;
  totalBasics: number;
  totalPartners: number;
  date: string;
}

/**
 * Recent activity interface
 */
export interface RecentActivity {
  type: 'store' | 'mobile' | 'support';
  message: string;
  timestamp: string;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await apiClient.get<DashboardStats>(
      apiConfig.endpoints.dashboardStats
    );
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * Get recent activity
 */
export async function getRecentActivity(): Promise<RecentActivity[]> {
  try {
    const response = await apiClient.get<RecentActivity[]>(
      apiConfig.endpoints.dashboardActivity
    );
    return response.data || [];
  } catch (error) {
    throw parseApiError(error);
  }
}
