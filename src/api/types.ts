/**
 * API Types and Interfaces
 * Contracts between frontend and backend
 */

// Authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id?: number;
    name?: string;
    email: string;
    partner?: string;
  };
  email?: string;
  partner?: string;
}

export interface AuthUser {
  id?: number;
  name?: string;
  email: string;
  partner?: string;
}

// Dashboard
export interface DashboardStats {
  stores: number;
  date: string;
}

// Stores
export interface Store {
  // Identifiers
  id?: number;
  _id?: string;
  cnpj: string;
  serial?: string; // licenca - auto-generated serial
  licenca?: string; // alias for serial

  // Company info
  name: string; // razaoSocial
  company?: string; // alias for razaoSocial
  fantasy_name: string; // nomeFantasia
  tradeName?: string; // alias for nomeFantasia

  // Contact
  phone: string;
  email: string;

  // Classification
  segment: string;
  size: string;
  working_hours?: string;

  // Partner
  partner: string;
  partner_code: string;
  codePartner?: string | number; // alias (API returns as number)

  // Address
  address_street?: string;
  address_number?: string;
  address_district?: string;
  address_city?: string;
  address_state?: string;
  address_city_code?: string | number;
  address_state_code?: string | number;
  // Flat aliases (API compatibility)
  street?: string;
  neighborhood?: string;
  number?: string;
  city?: string;
  state?: string;
  cityCode?: string | number;
  stateCode?: string | number;

  // Services/Modules
  offerta: boolean;
  oppinar: boolean;
  prazzo: boolean;
  scanner: ScannerConfig | boolean;
  service_offerta?: boolean;
  service_oppinar?: boolean;
  service_prazzo?: boolean;
  service_scanner?: boolean;
  lucrability?: boolean;

  // Status
  active: boolean;
  status?: string;

  // Timestamps
  inclusao?: string;
  created_at?: string;
  updated_at?: string;
  createAt?: string; // API returns this format

  // Operations/Users
  operation?: number[];
  users?: string[];
}

export interface CreateStoreRequest {
  company: string;
  tradeName: string;
  cnpj: string;
  phone: string;
  email: string;
  segment: string;
  size: string;
  partner: string;
  codePartner: string;
  street: string;
  neighborhood: string;
  number: string;
  city: string;
  state: string;
  cityCode: string;
  stateCode: string;
  offerta: boolean;
  oppinar: boolean;
  prazzo: boolean;
  scanner: ScannerConfig;
  active: boolean;
}

export interface UpdateStoreRequest {
  cnpj: string;
  [key: string]: any;
}

export interface ScannerConfig {
  active: boolean;
  beta: boolean;
  days: number;
  expire: string; // ISO date
}

export interface StoreQueryParams {
  cnpj?: string;
  partner?: string;
}

// Mobile Users
export interface MobileUser {
  id?: number;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  type: string; // Support, Admin, Operador, Gerente
  _type?: string; // alias for type
  partner: string;
  active: boolean;
  password?: string;
  lojas?: string[]; // array of CNPJs
  stores?: string[]; // alias for lojas
  inclusao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMobileUserRequest {
  name: string;
  email: string;
  phone: string;
  _type: string;
  partner: string;
  active: boolean;
}

export interface UpdateMobileUserRequest {
  email: string;
  [key: string]: any;
}

export interface MobileUserStoreAssociation {
  email: string;
  cnpj: string;
}

// Support Users
export interface SupportUser {
  id?: number;
  _id?: string;
  name: string;
  email: string;
  partner: string;
  active?: boolean;
  password?: string;
  inclusao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSupportUserRequest {
  name: string;
  email: string;
  partner: string;
}

export interface UpdateSupportUserRequest {
  id: string;
  [key: string]: any;
}

// Reference Data
export interface Partner {
  id?: string;
  _id?: string;
  name: string;
  code?: string | number | null;
}

export interface State {
  code: string;
  name: string;
}

export interface City {
  code: string;
  name: string;
  state: string;
}

export interface Segment {
  _id?: string;
  name: string;
  code: string;
}

export interface Size {
  _id?: string;
  name: string;
  code: string;
}

// API Error Response
export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: any;
  timestamp?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  partner?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Generic Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
