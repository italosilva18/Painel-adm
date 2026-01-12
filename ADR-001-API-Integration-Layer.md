# ADR-001: API Integration Layer Architecture for Admin Panel

## Status
ACCEPTED

## Context

The MARGEM Admin Panel (Painel-adm) requires a robust, scalable integration layer to communicate with the backend Admin API (port 5001). The frontend is a React-based single-page application that needs to:

1. Authenticate users and manage JWT tokens
2. Perform CRUD operations on stores, mobile users, and support users
3. Fetch reference data (partners, states, cities, segments, sizes)
4. Handle errors gracefully with user-friendly messages
5. Support multi-tenant operations (partner-based isolation)

### Non-Functional Requirements
- Low latency for API calls (< 100ms)
- Robust error handling with retry mechanisms
- Token expiration and refresh handling
- Type safety (TypeScript)
- Centralized API configuration
- Interceptor pattern for cross-cutting concerns (auth, logging)

## Decision

We will implement an **API Integration Layer** using:

1. **Axios** as HTTP client - industry standard, interceptor support, simple request/response handling
2. **Service pattern** - Separation of concerns with individual service files for each domain (auth, stores, users, etc.)
3. **Centralized configuration** - Single point for API base URL, timeouts, and defaults
4. **Error wrapper** - Custom error handling with user-friendly messages
5. **Token manager** - Secure JWT storage and automatic token injection
6. **Type-safe interfaces** - TypeScript interfaces matching backend API contracts

### Architecture Layers

```
Frontend Components
         ↓
React Hooks (useAuth, useStores, etc.)
         ↓
Service Layer (services/auth.ts, services/stores.ts, etc.)
         ↓
Axios Instance + Interceptors
         ↓
Backend API (port 5001)
```

## Rationale

### Why Axios?
- Interceptor support for automatic token injection
- Built-in request/response transformation
- Better error handling than Fetch API
- Community maturity and extensive documentation

### Why Service Pattern?
- Clean separation of business logic from components
- Reusable across multiple components
- Easy to test (mockable services)
- Single Responsibility Principle (SOLID)

### Why Centralized Configuration?
- Single source of truth for API settings
- Easy environment switching (dev/staging/prod)
- Reduces duplication
- Simpler maintenance

### Why Type-Safe Interfaces?
- Compile-time safety (catches errors early)
- Self-documenting code
- IDE autocomplete support
- Matches backend API contracts

## Implementation Structure

```
src/
├── api/
│   ├── config.ts                    # Axios instance + base configuration
│   ├── interceptors.ts              # Request/response interceptors
│   ├── errorHandler.ts              # Error parsing and user messaging
│   ├── types.ts                     # Shared API types/interfaces
│   └── services/
│       ├── auth.ts                  # Authentication endpoints
│       ├── stores.ts                # Store CRUD operations
│       ├── mobileUsers.ts           # Mobile user CRUD
│       ├── supportUsers.ts          # Support user CRUD
│       ├── referenceData.ts         # Partners, states, cities, etc.
│       └── index.ts                 # Service exports
├── hooks/
│   ├── useAuth.ts                   # Authentication state management
│   ├── useStores.ts                 # Store operations
│   ├── useMobileUsers.ts            # Mobile user operations
│   └── useSupportUsers.ts           # Support user operations
├── utils/
│   ├── tokenManager.ts              # JWT token storage/retrieval
│   ├── validators.ts                # Input validation rules
│   └── formatters.ts                # Data formatting utilities
└── types/
    └── index.ts                     # Global type definitions
```

## Consequences

### Positive
- Clean, maintainable code structure
- Easy to add new services without touching existing code
- Excellent testability
- Type-safe API calls
- Centralized error handling
- Consistent token management
- Reusable across components

### Negative
- Additional abstraction layer (minor complexity)
- Need to maintain type definitions in sync with backend
- Requires developer discipline for service layer usage

## Acceptance Criteria

1. All API endpoints wrapped in service functions
2. JWT token automatically injected in request headers
3. 401 responses trigger auto-redirect to login
4. Error messages user-friendly (not raw API errors)
5. TypeScript strict mode enabled
6. All services have corresponding types
7. Interceptors handle logging and error transformation
8. Configuration supports multiple environments

## Related Decisions

- Use React Query/SWR for data fetching and caching (future ADR)
- Implement error boundary component for global error handling (future ADR)
- Setup E2E tests with API mocking (future ADR)

## References

- Axios Documentation: https://axios-http.com/
- Backend API Specification: ADMIN-PANEL-ANALYSIS.md
- SOLID Principles: https://en.wikipedia.org/wiki/SOLID
- Service Locator Pattern: https://refactoring.guru/design-patterns/service-locator
