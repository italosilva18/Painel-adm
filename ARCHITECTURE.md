# API Integration Layer - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MARGEM ADMIN PANEL                               │
│                         (React Application)                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        React Components Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ ┌──────────────┐ │
│  │   Login      │  │  Dashboard   │  │   Stores     │ │   Users      │ │
│  │   Component  │  │  Component   │  │  Component   │ │  Component   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                       React Hooks Layer                                 │
│  ┌───────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌────────┐ │
│  │   useAuth     │ │  useStores       │ │ useMobileUsers   │ │ useSup │ │
│  │               │ │                  │ │                  │ │Users   │ │
│  │ • login       │ │ • loadStores     │ │ • loadUsers      │ │ • load │ │
│  │ • logout      │ │ • createStore    │ │ • createUser     │ │Users   │ │
│  │ • getToken    │ │ • updateStore    │ │ • addStore       │ │ • crud │ │
│  │ • isAuth      │ │ • deleteStore    │ │ • removeStore    │ │        │ │
│  └───────────────┘ └──────────────────┘ └──────────────────┘ └────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                       Service Layer                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐       │
│  │ auth.ts     │ │ stores.ts   │ │ mobile.ts   │ │ support.ts   │       │
│  │             │ │             │ │             │ │              │       │
│  │ • login()   │ │ • create()  │ │ • create()  │ │ • create()   │       │
│  │ • logout()  │ │ • get()     │ │ • get()     │ │ • get()      │       │
│  │ • validate()│ │ • update()  │ │ • update()  │ │ • update()   │       │
│  │ • decode()  │ │ • delete()  │ │ • delete()  │ │ • delete()   │       │
│  │             │ │ • toggle()  │ │ • addStore()│ │              │       │
│  │             │ │             │ │ • search()  │ │              │       │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────────┘       │
│                                                                           │
│  ┌──────────────────────────┐                                           │
│  │ referenceData.ts         │                                           │
│  │ (com cache 5 minutos)    │                                           │
│  │                          │                                           │
│  │ • getPartners()          │                                           │
│  │ • getStates()            │                                           │
│  │ • getCities()            │                                           │
│  │ • getSegments()          │                                           │
│  │ • getSizes()             │                                           │
│  └──────────────────────────┘                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                       HTTP Client Layer                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Axios Instance                               │   │
│  │                  (src/api/config.ts)                           │   │
│  │                                                                 │   │
│  │  • baseURL: http://localhost:5001 (configurable)              │   │
│  │  • timeout: 30000ms (configurable)                            │   │
│  │  • headers: Content-Type: application/json                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    Request/Response Middleware                          │
│  ┌─────────────────────────┐ ┌───────────────────────────────┐          │
│  │  Request Interceptor    │ │  Response Interceptor         │          │
│  │                         │ │                               │          │
│  │ • Inject JWT Token      │ │ • Parse Errors               │          │
│  │ • Add X-Request-ID      │ │ • Handle 401 (redirect)      │          │
│  │ • Log in development    │ │ • Queue failed requests       │          │
│  │                         │ │ • Convert to ApiError         │          │
│  │                         │ │ • Log in development          │          │
│  └─────────────────────────┘ └───────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    Utility Layer                                        │
│  ┌────────────────────┐ ┌────────────────────┐ ┌──────────────────┐   │
│  │  tokenManager.ts   │ │  validators.ts     │ │  formatters.ts   │   │
│  │                    │ │                    │ │                  │   │
│  │ • getToken()       │ │ • validateEmail()  │ │ • formatCNPJ()   │   │
│  │ • setToken()       │ │ • validateCNPJ()   │ │ • formatPhone()  │   │
│  │ • clearToken()     │ │ • validatePhone()  │ │ • formatDate()   │   │
│  │ • getUser()        │ │ • validatePassword │ │ • formatCurrency │   │
│  │ • setUser()        │ │ • validateForm()   │ │ • formatStatus   │   │
│  │ • isAuthenticated()│ │                    │ │                  │   │
│  └────────────────────┘ └────────────────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    Error Handling Layer                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  errorHandler.ts                                                │   │
│  │                                                                 │   │
│  │  • ApiError class                                              │   │
│  │  • parseApiError() - Convert axios to user-friendly message   │   │
│  │  • isAuthError(), isValidationError(), isNetworkError()       │   │
│  │  • logError() - Centralized error logging                     │   │
│  │  • getErrorMessage() - Extract message for toast              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    HTTP Request to Backend                              │
│                 (MARGEM Admin API - Port 5001)                         │
│                                                                         │
│  Endpoints:                                                             │
│  • POST   /admin/login            (Authentication)                     │
│  • POST   /admin/store            (Create store)                       │
│  • GET    /admin/store            (Get store)                          │
│  • PUT    /admin/store            (Update store)                       │
│  • DELETE /admin/store            (Delete store)                       │
│  • POST   /admin/mobile           (Create mobile user)                 │
│  • GET    /admin/mobile           (Get mobile user)                    │
│  • PUT    /admin/mobile           (Update mobile user)                 │
│  • DELETE /admin/mobile           (Delete mobile user)                 │
│  • GET    /admin/mobile/store     (Get user stores)                    │
│  • PUT    /admin/mobile/store     (Add store to user)                  │
│  • DELETE /admin/mobile/store     (Remove store from user)             │
│  • POST   /admin/support          (Create support user)                │
│  • GET    /admin/support          (Get support user)                   │
│  • PUT    /admin/support          (Update support user)                │
│  • DELETE /admin/support          (Delete support user)                │
│  • GET    /admin/partners         (Reference data)                     │
│  • GET    /admin/states           (Reference data)                     │
│  • GET    /admin/cities           (Reference data)                     │
│  • GET    /admin/segments         (Reference data)                     │
│  • GET    /admin/sizes            (Reference data)                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Authentication Flow
```
User Login Input
        ↓
Form Validation (validators.ts)
        ↓
useAuth.login() call
        ↓
authService.login() → POST /admin/login
        ↓
Request Interceptor adds JWT (if exists)
        ↓
Response: Token + User
        ↓
tokenManager.setAuthSession()
        ↓
Stored in localStorage
        ↓
Interceptors updated with new token
        ↓
Component state updated
        ↓
Navigation to Dashboard
```

### CRUD Operation Flow
```
Component User Action (Create/Read/Update/Delete)
        ↓
Hook method call (useStores, useMobileUsers, etc.)
        ↓
Service function call
        ↓
Axios request with:
  - Axios sends request
  - Request interceptor injects JWT token
  - Request interceptor adds X-Request-ID
        ↓
Backend API processes request
        ↓
Response returns
        ↓
Response interceptor processes:
  - Logs in development
  - Checks for errors
  - Converts to ApiError if needed
        ↓
Service returns typed data
        ↓
Hook updates state
        ↓
Component re-renders with new data
```

### Error Handling Flow
```
API Request fails
        ↓
axios throws error
        ↓
Response interceptor catches it
        ↓
parseApiError() converts to ApiError:
  - Identifies error type (401, 409, 500, timeout, etc)
  - Translates to user-friendly Portuguese message
  - Adds error code and context
        ↓
Special handling:
  - 401: Queues request, attempts token refresh, redirects login
  - 409: Shows "Duplicated resource" message
  - 422: Shows "Invalid data" message
  - Network: Shows "Connection error" message
        ↓
Hook catch block receives ApiError
        ↓
Hook state updated with error
        ↓
Component displays error (toast, alert, etc)
```

---

## State Management

### Local Component State (React Hooks)
Each hook manages local state:
```
StoresState {
  stores: Store[]
  currentStore: Store | null
  isLoading: boolean
  error: string | null
}
```

### Session State (localStorage)
```
localStorage {
  'margem_admin_token': 'eyJhbGciOiJIUzI1NiIs...'
  'margem_admin_user': {
    email: 'admin@margem.com',
    partner: 'mpontom'
  }
}
```

### Request Headers
```
Authorization: Bearer {token}
Content-Type: application/json
X-Request-ID: {timestamp}-{random}
```

---

## Type Safety Architecture

### Type Layers
```
API Contract Types (src/api/types.ts)
        ↓
Service Function Types
        ↓
Hook State Types
        ↓
Component Props Types
```

### Example Flow
```typescript
// API Types
interface CreateStoreRequest {
  cnpj: string;
  company: string;
  // ... all fields required
}

// Service
async function createStore(store: CreateStoreRequest): Promise<Store>

// Hook
const { createStore } = useStores()

// Component
<StoreForm onSubmit={(data: CreateStoreRequest) => {
  await createStore(data) // Type-safe!
}}/>
```

---

## Caching Strategy

### Reference Data Cache
```
First Request: GET /admin/partners
        ↓
No cache → API call
        ↓
Response stored in cache with timestamp
        ↓
Return data

Subsequent Requests (within 5 minutes):
        ↓
Check cache validity
        ↓
Cache valid → Return cached data (instant)
        ↓
Cache expired → New API call
```

### Cache Management
```
localStorage for tokens (persistent)
        ↓
Memory cache for reference data (5 minute TTL)
        ↓
clearReferenceDataCache() to invalidate manually
        ↓
Each hook resets state on unmount
```

---

## Error Classification

```
HTTP Status Code → Error Type → User Message

401 Unauthorized → Auth Error → "Sessao expirada. Faca login novamente."
403 Forbidden → Permission Error → "Voce nao tem permissao"
404 Not Found → Not Found Error → "Recurso nao encontrado"
409 Conflict → Duplicate Error → "Este CNPJ ja existe"
422 Validation → Validation Error → "Dados invalidos"
500 Server Error → Server Error → "Erro interno do servidor"
503 Unavailable → Service Error → "Servidor indisponivel"
Timeout → Network Error → "Timeout na conexao"
No Connection → Network Error → "Nao foi possivel conectar"
```

---

## Request/Response Cycle

### Happy Path
```
1. Component calls hook method
2. Hook calls service function
3. Service creates axios request
4. Request interceptor:
   - Injects JWT token
   - Adds X-Request-ID
   - Logs in dev
5. Axios sends HTTP request
6. Backend processes and responds
7. Response interceptor:
   - Logs in dev
   - Returns response
8. Service parses response
9. Hook updates state
10. Component receives new data
11. Component re-renders
```

### Error Path
```
1-5: Same as happy path
6. Backend returns error (e.g., 409 Conflict)
7. Response interceptor:
   - Detects error status
   - Calls parseApiError()
   - Returns rejected promise with ApiError
8. Service catch block
9. Hook catch block catches error
10. Hook updates error state
11. Component displays error message
```

### 401 Handling Path
```
1-6: Request made, backend returns 401
7. Response interceptor detects 401
8. Checks if already refreshing
9. If not:
   - Sets isRefreshing = true
   - Calls logout callback (redirects to login)
   - Clears token
   - Queued requests rejected
10. Hook state updated
11. Component redirects to login
```

---

## Validation Pipeline

### Input Validation
```
User Input
        ↓
Client-side Validation (validators.ts)
        ↓
If invalid:
  Show error to user
  Don't send to server
        ↓
If valid:
  Format data (formatters.ts)
  Send to API
```

### Server Validation
```
Backend receives formatted data
        ↓
Server validates
        ↓
If invalid:
  Returns 422 with error details
  Response interceptor converts to ApiError
  Hook displays error
        ↓
If valid:
  Processes request
  Returns 200/201
```

---

## Security Layers

```
1. Client Layer:
   - Validate inputs before sending
   - Store token securely (localStorage considered)
   - Check token expiration
   - Clear token on logout/401

2. Request Layer:
   - Inject JWT token in all requests
   - Use https in production
   - No credentials in code
   - X-Request-ID for tracking

3. Response Layer:
   - Detect 401 and redirect login
   - Don't expose server errors to user
   - Log errors for debugging
   - Clear sensitive data on logout

4. Server Layer:
   - Validate all inputs
   - Verify JWT signature
   - Check user permissions
   - Implement CORS
   - Rate limiting (not in this layer)
```

---

## Performance Optimization

### Caching
- Reference data cached 5 minutes
- Reduces API calls for dropdowns

### Lazy Loading
- Hooks only load data on demand
- Don't load user stores until needed

### Batch Operations
- `createMultipleStores()` for bulk creates
- `addMultipleStoresToUser()` for bulk associations

### Request Queueing
- Failed requests queued during token refresh
- Prevents request loss during auth transitions

---

## Testing Architecture

```
Unit Tests
├── Validators (test each validation rule)
├── Formatters (test formatting output)
└── TokenManager (test storage/retrieval)

Integration Tests
├── Services (mock axios, test API calls)
├── Hooks (test state management)
└── Error handling (test error flows)

E2E Tests
├── Login flow
├── CRUD operations
└── Error scenarios
```

---

## Deployment Architecture

```
Development
├── API: http://localhost:5001
├── Debug: true
├── Logs: console.log

Staging
├── API: https://staging-api.mpmsuite.com.br
├── Debug: false
├── Logs: external logging service

Production
├── API: https://api.mpmsuite.com.br
├── Debug: false
├── Logs: Sentry/external service
├── HTTPS: required
├── CORS: configured for domain
```

---

## Scalability Considerations

### Adding New Domain
```
1. Create service: src/api/services/{domain}.ts
2. Create hook: src/hooks/use{Domain}.ts
3. Add types: Update src/api/types.ts
4. Export from indices
5. Use in components
```

### Adding New Endpoint
```
1. Add types to src/api/types.ts
2. Add function to service
3. Add method to hook
4. Component uses hook method
```

### Performance at Scale
- Pagination support in types
- Batch operations for bulk data
- Caching for static reference data
- Request queuing for reliability

---

**Architecture Version:** 1.0.0
**Created:** 08/11/2025
**Maintainer:** Architecture Sage
