# API Integration Layer - Complete Guide

## Overview

The API Integration Layer provides a robust, type-safe, and scalable way to communicate with the MARGEM Admin API (port 5001). It follows enterprise architectural patterns with separation of concerns, error handling, and security best practices.

---

## Architecture

### Layers

```
React Components
    ↓
React Hooks (useAuth, useStores, etc.)
    ↓
Service Layer (stores.ts, auth.ts, etc.)
    ↓
Axios Interceptors (Token Injection, Error Handling)
    ↓
Axios Instance (HTTP Client)
    ↓
Backend API (port 5001)
```

### Directory Structure

```
src/
├── api/
│   ├── config.ts                    # Axios instance + API configuration
│   ├── interceptors.ts              # Request/response interceptors
│   ├── errorHandler.ts              # Error parsing and handling
│   ├── types.ts                     # TypeScript interfaces for API contracts
│   ├── index.ts                     # Centralized exports
│   └── services/
│       ├── auth.ts                  # Authentication endpoints
│       ├── stores.ts                # Store CRUD operations
│       ├── mobileUsers.ts           # Mobile user management
│       ├── supportUsers.ts          # Support user management
│       ├── referenceData.ts         # Partners, states, cities, etc.
│       └── index.ts                 # Service exports
├── hooks/
│   ├── useAuth.ts                   # Authentication state + operations
│   ├── useStores.ts                 # Store operations
│   ├── useMobileUsers.ts            # Mobile user operations
│   ├── useSupportUsers.ts           # Support user operations
│   └── index.ts                     # Hooks exports
├── utils/
│   ├── tokenManager.ts              # JWT token storage/retrieval
│   ├── validators.ts                # Input validation (email, CNPJ, etc.)
│   └── formatters.ts                # Data formatting (currency, dates, etc.)
└── types/
    └── index.ts                     # Global type definitions
```

---

## Setup and Initialization

### 1. Environment Variables

Create a `.env` file in your project root:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5001
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3

# Token Management
VITE_JWT_STORAGE_KEY=margem_admin_token
VITE_SESSION_TIMEOUT=86400000
```

### 2. Initialize Interceptors in App Component

```typescript
import { useEffect } from 'react';
import { setupInterceptors } from '@/api/interceptors';
import { useAuth } from '@/hooks/useAuth';

export function App() {
  const { logout } = useAuth();

  useEffect(() => {
    // Setup API interceptors
    setupInterceptors(
      (token) => {
        // Called when token is refreshed
        console.log('Token refreshed');
      },
      () => {
        // Called when authentication fails
        logout();
      }
    );
  }, [logout]);

  return (
    // Your app content
  );
}
```

---

## Usage Examples

### Authentication

#### Login

```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await login({
        email,
        password,
        partner: 'mpontom',
      });
      console.log('Logged in as:', response.email);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div>
      {error && <p className="error">{error}</p>}
      {/* Form JSX */}
    </div>
  );
}
```

#### Check Authentication Status

```typescript
import { useAuth } from '@/hooks/useAuth';

function Dashboard() {
  const { isAuthenticated, email, partner } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <div>
      <p>Welcome, {email}!</p>
      <p>Partner: {partner}</p>
    </div>
  );
}
```

### Store Management

#### Load Stores

```typescript
import { useStores } from '@/hooks/useStores';
import { useEffect } from 'react';

function StoresPage() {
  const { stores, isLoading, error, loadStores } = useStores();
  const { partner } = useAuth();

  useEffect(() => {
    if (partner) {
      loadStores(partner);
    }
  }, [partner]);

  if (isLoading) return <Spinner />;
  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <div>
      {stores.map(store => (
        <StoreCard key={store.cnpj} store={store} />
      ))}
    </div>
  );
}
```

#### Create Store

```typescript
import { useStores } from '@/hooks/useStores';

function CreateStorePage() {
  const { createStore, isLoading } = useStores();

  const handleSubmit = async (formData) => {
    try {
      const newStore = await createStore(formData);
      toast.success('Loja criada com sucesso!');
      navigate(`/stores/${newStore.cnpj}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return <StoreForm onSubmit={handleSubmit} isLoading={isLoading} />;
}
```

#### Update Store

```typescript
const { updateStore } = useStores();

const handleUpdate = async (cnpj: string, updates) => {
  try {
    await updateStore(cnpj, updates);
    toast.success('Loja atualizada!');
  } catch (error) {
    toast.error(error.message);
  }
};
```

#### Delete Store

```typescript
const { deleteStore } = useStores();

const handleDelete = async (cnpj: string) => {
  if (window.confirm('Tem certeza?')) {
    try {
      await deleteStore(cnpj);
      toast.success('Loja deletada!');
    } catch (error) {
      toast.error(error.message);
    }
  }
};
```

### Mobile Users Management

#### Load Mobile Users

```typescript
import { useMobileUsers } from '@/hooks/useMobileUsers';

function MobileUsersPage() {
  const { users, loadUsers } = useMobileUsers();
  const { partner } = useAuth();

  useEffect(() => {
    if (partner) {
      loadUsers(partner);
    }
  }, [partner]);

  return (
    <List>
      {users.map(user => (
        <MobileUserCard key={user.email} user={user} />
      ))}
    </List>
  );
}
```

#### Create Mobile User

```typescript
const { createUser, isLoading } = useMobileUsers();

const handleCreate = async (userData) => {
  try {
    const newUser = await createUser(userData);
    // Password sent via SMS/Email automatically
    toast.success('Usuario criado! Credenciais enviadas por SMS.');
  } catch (error) {
    toast.error(error.message);
  }
};
```

#### Manage User Stores

```typescript
const { addStore, removeStore } = useMobileUsers();

// Add store to user
const handleAddStore = async (email: string, cnpj: string) => {
  try {
    await addStore(email, cnpj);
    toast.success('Loja adicionada ao usuario!');
  } catch (error) {
    toast.error(error.message);
  }
};

// Remove store from user
const handleRemoveStore = async (email: string, cnpj: string) => {
  try {
    await removeStore(email, cnpj);
    toast.success('Loja removida do usuario!');
  } catch (error) {
    toast.error(error.message);
  }
};
```

### Support Users Management

#### Load Support Users

```typescript
import { useSupportUsers } from '@/hooks/useSupportUsers';

function SupportUsersPage() {
  const { users, loadUsers } = useSupportUsers();
  const { partner } = useAuth();

  useEffect(() => {
    if (partner) {
      loadUsers(partner);
    }
  }, [partner]);

  return (
    <List>
      {users.map(user => (
        <SupportUserCard key={user.email} user={user} />
      ))}
    </List>
  );
}
```

### Reference Data (Partners, States, Cities)

#### Load All Reference Data

```typescript
import * as referenceService from '@/api/services/referenceData';
import { useEffect, useState } from 'react';

function SettingsPage() {
  const [referenceData, setReferenceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await referenceService.loadAllReferenceData();
        setReferenceData(data);
      } catch (error) {
        console.error('Failed to load reference data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div>
      {/* Display reference data */}
    </div>
  );
}
```

#### Load Cities by State

```typescript
import * as referenceService from '@/api/services/referenceData';

const [cities, setCities] = useState([]);

const handleStateChange = async (stateCode: string) => {
  try {
    const citiesList = await referenceService.getCities(stateCode);
    setCities(citiesList);
  } catch (error) {
    console.error('Failed to load cities:', error);
  }
};
```

---

## Error Handling

### Centralized Error Handling

```typescript
import { parseApiError, isAuthError, getErrorMessage } from '@/api/errorHandler';

try {
  await someApiCall();
} catch (error) {
  const apiError = parseApiError(error);

  if (isAuthError(apiError)) {
    // Handle authentication error
    redirectToLogin();
  } else {
    // Show error toast
    toast.error(getErrorMessage(error));
  }
}
```

### Error Types

- **401 Unauthorized**: Triggers automatic redirect to login
- **403 Forbidden**: User doesn't have permission
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Duplicate constraint (CNPJ/email already exists)
- **422 Validation Error**: Invalid input data
- **500 Internal Server Error**: Server error
- **503 Service Unavailable**: Server temporarily down

---

## Input Validation

### Available Validators

```typescript
import {
  validateEmail,
  validateCNPJ,
  validatePhone,
  validatePassword,
  validateRequired,
  validateForm,
} from '@/utils/validators';

// Single field validation
if (!validateEmail(email)) {
  setError('Email invalido');
}

if (!validateCNPJ(cnpj)) {
  setError('CNPJ invalido');
}

// Password strength
const passwordValidation = validatePassword(password);
if (!passwordValidation.valid) {
  setErrors(passwordValidation.errors);
}

// Form validation
const result = validateForm(formData, {
  email: validateEmail,
  cnpj: validateCNPJ,
  phone: validatePhone,
  password: (value) => validatePassword(value).valid,
});

if (!result.valid) {
  setFormErrors(result.errors);
}
```

---

## Data Formatting

### Format Utilities

```typescript
import {
  formatCNPJ,
  formatPhone,
  formatDate,
  formatCurrency,
  formatStatus,
  formatDateTime,
} from '@/utils/formatters';

// Formatting for display
<p>{formatCNPJ('52068338000189')}</p>
// Output: 52.068.338/0001-89

<p>{formatPhone('11999999999')}</p>
// Output: (11) 99999-9999

<p>{formatDate('2025-06-13')}</p>
// Output: 13/06/2025

<p>{formatCurrency(1500.50)}</p>
// Output: R$ 1.500,50

<p>{formatStatus(true)}</p>
// Output: Ativo

// Reverse formatting for API calls
const cleanCNPJ = unformatCNPJ(userInput);
const cleanPhone = unformatPhone(userInput);
```

---

## Token Management

### Manual Token Operations

```typescript
import * as tokenManager from '@/utils/tokenManager';

// Store token and user
tokenManager.setAuthSession(token, { email, partner });

// Get token
const token = tokenManager.getToken();

// Get user info
const user = tokenManager.getUser();
const email = tokenManager.getUserEmail();
const partner = tokenManager.getUserPartner();

// Check authentication
if (tokenManager.isAuthenticated()) {
  // User is logged in
}

// Clear everything
tokenManager.clearAuthData();
```

---

## Type Safety

All API calls are fully typed with TypeScript interfaces:

```typescript
import {
  Store,
  CreateStoreRequest,
  MobileUser,
  SupportUser,
  Partner,
} from '@/api/types';

// Type-safe store creation
const storeData: CreateStoreRequest = {
  cnpj: '52.068.338/0001-89',
  company: 'Company Name',
  // ... other fields are required by TypeScript
};

// Type-safe API calls
const store: Store = await createStore(storeData);
const email: string = store.email; // IntelliSense works!
```

---

## Caching

Reference data is automatically cached for 5 minutes to reduce API calls:

```typescript
import { clearReferenceDataCache } from '@/api/services/referenceData';

// Manually clear cache when needed
const handleRefresh = () => {
  clearReferenceDataCache();
  // Refresh data...
};
```

---

## Testing

### Mocking API Services

```typescript
import * as storesService from '@/api/services/stores';

// Mock the service
jest.mock('@/api/services/stores');

test('should load stores', async () => {
  const mockStores = [{ cnpj: '123', company: 'Test' }];
  storesService.getStoresByPartner.mockResolvedValue(mockStores);

  const { stores } = useStores();
  await act(async () => {
    await stores.loadStores('partner');
  });

  expect(stores.stores).toEqual(mockStores);
});
```

---

## Security Best Practices

1. **Token Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
2. **CORS**: Enabled globally, configure CORS_ORIGIN as needed
3. **HTTPS**: Use HTTPS in production
4. **Token Expiration**: Auto-redirect to login on 401
5. **Validation**: Always validate on both client and server
6. **Error Messages**: Don't expose sensitive server errors to users

---

## Production Checklist

- [ ] Set `VITE_API_BASE_URL` to production API endpoint
- [ ] Configure `VITE_API_TIMEOUT` for production networks
- [ ] Enable error logging to external service
- [ ] Test token refresh mechanism
- [ ] Configure CORS for production domain
- [ ] Set secure cookie flags if using cookies
- [ ] Test error scenarios (401, 409, 500, timeout)
- [ ] Review and test all validator rules
- [ ] Test with real data volumes
- [ ] Set up monitoring/alerting for API errors

---

## Common Issues and Solutions

### "Invalid Token" on Every Request

**Problem**: Token in localStorage but interceptor not injecting it

**Solution**:
```typescript
// Ensure setupInterceptors is called in App component
useEffect(() => {
  setupInterceptors();
}, []);
```

### CORS Errors

**Problem**: "Access to XMLHttpRequest blocked by CORS policy"

**Solution**:
1. Backend must have CORS enabled
2. Check `VITE_API_BASE_URL` is correct
3. Backend should return CORS headers

### "CNPJ Already Exists" Error

**Problem**: 409 Conflict when creating store

**Solution**:
```typescript
try {
  await createStore(data);
} catch (error) {
  if (error.statusCode === 409) {
    // Show user: "Este CNPJ ja existe no sistema"
  }
}
```

### Reference Data Not Loading

**Problem**: Cities dropdown empty

**Solution**:
```typescript
// Make sure to load cities AFTER state is selected
const handleStateChange = async (stateCode) => {
  const cities = await getCities(stateCode);
  // stateCode must be valid (e.g., 'SP' not 'Sao Paulo')
};
```

---

## API Endpoints Summary

| Method | Endpoint | Hook/Service | Purpose |
|--------|----------|--------------|---------|
| POST | `/admin/login` | `useAuth().login()` | Authenticate user |
| GET | `/admin/store` | `useStores().loadStore()` | Get store by CNPJ |
| POST | `/admin/store` | `useStores().createStore()` | Create new store |
| PUT | `/admin/store` | `useStores().updateStore()` | Update store |
| DELETE | `/admin/store` | `useStores().deleteStore()` | Delete store |
| GET | `/admin/file-stores` | `getStoresByPartner()` | Export stores |
| POST | `/admin/mobile` | `useMobileUsers().createUser()` | Create mobile user |
| GET | `/admin/mobile` | `useMobileUsers().loadUser()` | Get mobile user |
| PUT | `/admin/mobile` | `useMobileUsers().updateUser()` | Update mobile user |
| DELETE | `/admin/mobile` | `useMobileUsers().deleteUser()` | Delete mobile user |
| GET | `/admin/mobile/store` | `useMobileUsers().loadUserStores()` | Get user stores |
| PUT | `/admin/mobile/store` | `useMobileUsers().addStore()` | Add store to user |
| DELETE | `/admin/mobile/store` | `useMobileUsers().removeStore()` | Remove store from user |
| POST | `/admin/support` | `useSupportUsers().createUser()` | Create support user |
| GET | `/admin/support` | `useSupportUsers().loadUser()` | Get support user |
| PUT | `/admin/support` | `useSupportUsers().updateUser()` | Update support user |
| DELETE | `/admin/support` | `useSupportUsers().deleteUser()` | Delete support user |
| GET | `/admin/partners` | `getPartners()` | Get all partners |
| GET | `/admin/states` | `getStates()` | Get all states |
| GET | `/admin/cities` | `getCities()` | Get cities by state |
| GET | `/admin/segments` | `getSegments()` | Get all segments |
| GET | `/admin/sizes` | `getSizes()` | Get all sizes |

---

## Next Steps

1. Install dependencies: `npm install axios react-router-dom`
2. Copy environment variables to `.env`
3. Setup interceptors in `App.tsx`
4. Create login page using `useAuth()`
5. Create dashboard using `useStores()`, `useMobileUsers()`, etc.
6. Add error boundary for global error handling
7. Setup toast notifications
8. Configure navigation/routing

For more details, see `ADR-001-API-Integration-Layer.md`.
