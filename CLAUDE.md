# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MARGEM Admin Panel - React/TypeScript admin dashboard for managing the MARGEM profit margin system. Connects to `margem-api-admin-v5` backend (Go/Fiber) via REST API.

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Zustand + Axios + Zod + react-hook-form

## Development Commands

```bash
# Start development server (Docker - recommended)
npm run docker:dev       # Hot-reload at localhost:3000

# Start development server (local)
npm run dev              # Vite dev server at localhost:5173

# Build for production
npm run build

# Run tests
npm run test
npm run test:ui          # Interactive UI
npm run test:coverage    # With coverage
# Tests use Vitest + MSW for API mocking

# Linting and formatting
npm run lint
npm run format

# Docker production
npm run docker:prod
npm run docker:stop
```

## Architecture

### API Layer (`src/api/`)
```
api/
├── config.ts           # Axios instance, API endpoints config
├── types.ts            # TypeScript interfaces (Store, MobileUser, etc.)
├── errorHandler.ts     # Centralized error parsing
├── interceptors.ts     # JWT injection, 401 handling
└── services/           # One service per domain
    ├── auth.ts         # Login/logout
    ├── storeService.ts # Store CRUD (search by CNPJ)
    ├── mobileService.ts# Mobile user CRUD (search by email/phone)
    ├── supportService.ts# Support user CRUD (search by email)
    ├── referenceData.ts# Partners, states, cities, segments, sizes
    ├── cnpjService.ts  # CNPJ lookup via BrasilAPI
    ├── dashboardService.ts # Dashboard statistics
    └── partnerService.ts # Partner management
```

### State Management
- **Zustand store** (`src/store/authStore.ts`): Global auth state with persist middleware
- **React hooks** (`src/hooks/`): Domain-specific hooks wrapping services

### Pages (`src/components/`)
- `LoginPage.tsx` - Authentication
- `DashboardPage.tsx` - Overview stats with module cards
- `LojasPage.tsx` - Store management (search by CNPJ, cascading state→city)
- `MobilePage.tsx` - Mobile user + stores management (search by email/phone)
- `SuportePage.tsx` - Support user management (search by email)
- `ParceirosPage.tsx` - Partners CRUD
- `AutomacoesPage.tsx` - Automation partners management
- `ModulosPage.tsx` - System modules overview (MARGEM, OFFERTA, OPPINAR, PRAZZO, SCANNER)

### Layout Components (`src/components/layout/`)
- `MainLayout.tsx` - Wrapper with sidebar and mobile header
- `Sidebar.tsx` - Navigation sidebar with all routes

### Routing (`src/AppRouter.tsx`)
All routes except `/login` are protected via `ProtectedRoute` component.

**Available Routes:**
- `/login` - Public
- `/dashboard` - Dashboard
- `/lojas` - Stores
- `/mobile` - Mobile users
- `/suporte` - Support users
- `/parceiros` - Partners
- `/automacoes` - Automations
- `/modulos` - Modules
- `/relatorios` - Reports (Coming Soon)

## API Integration Patterns

### Search-Based CRUD (not list-all)
The API does NOT support listing all records. All operations require a search key:
```typescript
// Stores: search by CNPJ
getStores(cnpj: string): Promise<Store[]>

// Mobile users: search by email or phone
getMobileUserByEmail(email: string): Promise<MobileUser | null>
getMobileUserByPhone(phone: string): Promise<MobileUser | null>

// Support users: search by email
getSupportUserByEmail(email: string): Promise<SupportUser | null>
```

### Critical API Field Names (MongoDB → Frontend)
The API uses English field names. **DO NOT use Portuguese field names:**
```typescript
// MobileUser fields (correct):
{ name, email, phone, partner, active, _type }

// NOT (incorrect - old format):
{ nome, celular, parceiro, ativo }

// UserStore fields (correct):
{ serial, name, cnpj }

// NOT (incorrect):
{ licenca, nomeFantasia }
```

### Mobile User API Operations
```typescript
// UPDATE requires _id in query string (not in body)
await updateMobileUser({
  _id: user._id,        // Required - passed as ?id= query param
  email, name, phone,   // Body data
  _type, partner, active
});

// DELETE uses email
await deleteMobileUserByEmail(email);  // DELETE /mobile?email=

// Store operations use email + cnpj
await addStoreToUser(email, cnpj);     // POST /mobile/store
await removeStoreFromUser(email, cnpj); // DELETE /mobile/store
```

### API Response Mapping
MongoDB uses `_id` (string ObjectID) - services map to frontend interfaces:
```typescript
// API returns:  { _id: "507f1f77...", _type: "Suporte", name: "..." }
// Mapped to:    { _id: "507f1f77...", type: "Suporte", name: "..." }
```

### Endpoints Configuration (`src/api/config.ts`)
```typescript
apiConfig.endpoints = {
  stores: '/store',
  mobile: '/mobile',
  mobileStores: '/mobile/store',  // User's associated stores
  support: '/support',
  partners: '/partners',
  states: '/states',
  cities: '/cities',              // GET /cities?state={stateCode}
  segments: '/segments',
  sizes: '/sizes',
}
```

## Environment Variables

```bash
# API v5 (current - port 5000)
VITE_API_URL=http://localhost:5000/admin

# Production API
VITE_API_URL=https://api.painelmargem.com.br/admin

VITE_API_TIMEOUT=30000
```

## Docker Configuration

**Development:** Container `margem-web-admin-v5-dev` at port 3000
- Mounts `src/`, `public/`, and `index.html` for hot-reload
- Connects to API at `http://localhost:5000/admin`

**Production:** Container `margem-web-admin-v5-prod` at port 3000 (nginx)

**Backend API v5:** Container `margem-api-admin-v5` at port 5000

```bash
# Start frontend + backend
docker-compose up -d margem-web-admin-v5-dev

# Check logs
docker logs margem-web-admin-v5-dev
docker logs margem-api-admin-v5
```

## Key Implementation Details

### Store Operation Days
Values 0-6 = Sunday-Saturday, 7 = Mon-Sat shortcut, 8/33 = All days
```typescript
filterValidDays([0,1,2,3,4,5,6,7,8,33]) // Returns [0,1,2,3,4,5,6]
getOperationArray([0,1,2,3,4,5,6])      // Returns [0,1,2,3,4,5,6,7,8,33]
```

### Mobile User Store Management
```typescript
const user = await getMobileUserByEmail(email);
const stores = await getUserStores(user._id);
await addStoreToUser(email, cnpj);      // Uses email, not user._id
await removeStoreFromUser(email, cnpj); // Uses email + cnpj
```

### Cascading Dropdowns (State → City)
```typescript
// When state changes:
// 1. Load cities via getCitiesByState(stateCode)
// 2. Auto-fill address_state_code
// 3. Reset city and city_code
```

### CNPJ Lookup (Receita Federal)
```typescript
import * as cnpjService from '@/api/services/cnpjService';

const data = await cnpjService.consultarCNPJ('52068338000189');
// Returns: razao_social, nome_fantasia, logradouro, numero, bairro, etc.

cnpjService.UF_TO_NAME['SP']  // → 'São Paulo'
cnpjService.UF_TO_CODE['SP']  // → '35'
```

### Path Aliases (vite.config.ts)
```typescript
'@' → './src'
'@api' → './src/api'
'@components' → './src/components'
'@pages' → './src/pages'
'@hooks' → './src/hooks'
'@store' → './src/store'
'@types' → './src/types'
'@utils' → './src/utils'
'@assets' → './src/assets'
```

## UI Patterns

### "Not Found" Modals
When searching for CNPJ/email that doesn't exist, show modal asking if user wants to create new record with that value pre-filled.

### Form Auto-Fill
- Partner → Partner Code (from partners list)
- State → State Code + load cities
- City → City Code

### Table Actions
Edit and Delete buttons on each row. Delete requires confirmation dialog.

### Page Header Color Scheme
Each page uses a distinct icon color for visual consistency:
- **Lojas**: Blue (`bg-blue-100`, `text-blue-600`)
- **Mobile**: Purple (`bg-purple-100`, `text-purple-600`)
- **Suporte**: Green (`bg-green-100`, `text-green-600`)
- **Parceiros**: Amber (`bg-amber-100`, `text-amber-600`)
- **Automacoes**: Cyan (`bg-cyan-100`, `text-cyan-600`)
- **Modulos**: Indigo (`bg-indigo-100`, `text-indigo-600`)

## File Editing Notes

When Docker dev container is running (`margem-web-admin-v5-dev`), files are watched for hot-reload. This can cause "File has been unexpectedly modified" errors when using Edit tool. Solutions:
1. Stop container: `docker stop margem-web-admin-v5-dev`
2. Use Node.js script via Bash tool instead of Edit tool
3. Make edits, then restart: `docker start margem-web-admin-v5-dev`
