/**
 * Type Definitions for MARGEM Admin Panel
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: number;
    name: string;
    email: string;
    partner?: string;
  };
  email?: string;
  partner?: string;
}

export interface Store {
  id: number;
  name: string;
  fantasy_name: string;
  cnpj: string;
  phone?: string;
  email?: string;
  segment?: string;
  working_hours?: string;
  size?: string;
  partner?: string;
  partner_code?: string;
  serial: string;
  address_state?: string;
  address_city?: string;
  address_street?: string;
  address_number?: string;
  address_district?: string;
  address_city_code?: string;
  address_state_code?: string;
  active: boolean;
  service_offerta: boolean;
  service_oppinar: boolean;
  service_prazzo: boolean;
  service_scanner: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MobileUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  type: string;
  partner?: string;
  active: boolean;
  updated_at: string;
  created_at: string;
  stores: Store[];
}

export interface SupportUser {
  id: number;
  name: string;
  email: string;
  partner: string;
}

export interface DashboardStats {
  stores: number;
  date: string;
}

export interface Partner {
  id: string;
  name: string;
}