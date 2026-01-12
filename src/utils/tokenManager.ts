/**
 * Token Manager
 * Secure JWT token storage and management
 */

const TOKEN_KEY = import.meta.env.VITE_JWT_STORAGE_KEY || 'margem_admin_token';
const USER_KEY = 'margem_admin_user';

/**
 * Store token in localStorage
 */
export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to store token:', error);
  }
}

/**
 * Retrieve token from localStorage
 */
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve token:', error);
    return null;
  }
}

/**
 * Check if token exists
 */
export function hasToken(): boolean {
  return getToken() !== null;
}

/**
 * Remove token from localStorage
 */
export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to clear token:', error);
  }
}

/**
 * Store user information
 */
export function setUser(user: { email: string; partner: string }): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to store user:', error);
  }
}

/**
 * Retrieve user information
 */
export function getUser(): { email: string; partner: string } | null {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Failed to retrieve user:', error);
    return null;
  }
}

/**
 * Get user email
 */
export function getUserEmail(): string | null {
  const user = getUser();
  return user?.email || null;
}

/**
 * Get user partner
 */
export function getUserPartner(): string | null {
  const user = getUser();
  return user?.partner || null;
}

/**
 * Remove user information
 */
export function clearUser(): void {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Failed to clear user:', error);
  }
}

/**
 * Clear all auth data
 */
export function clearAuthData(): void {
  clearToken();
  clearUser();
}

/**
 * Check if authenticated
 */
export function isAuthenticated(): boolean {
  return hasToken();
}

/**
 * Get auth headers for API calls
 * Note: API returns token with "Bearer " prefix already included
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return {};

  // Check if token already has Bearer prefix (API returns it this way)
  const authValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  return {
    Authorization: authValue,
  };
}

/**
 * Store auth session data
 */
export function setAuthSession(token: string, user: { email: string; partner: string }): void {
  setToken(token);
  setUser(user);
}

/**
 * Get complete auth session
 */
export function getAuthSession(): {
  token: string | null;
  user: { email: string; partner: string } | null;
} {
  return {
    token: getToken(),
    user: getUser(),
  };
}
