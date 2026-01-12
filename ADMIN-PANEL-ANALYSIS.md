# MARGEM Admin Panel - Comprehensive Analysis

## Executive Summary

The MARGEM-2025 project is a **multi-product microservices platform** with three major systems. This analysis focuses on the **Admin Panel (Painel-adm)** requirements based on the backend APIs and existing project structure.

The admin panel needs to manage:
- **Stores/Establishments** (Lojas)
- **Mobile Users** (Usuários Mobile)
- **Support Users** (Usuários Suporte)
- **Partners** (Parceiros)
- **Reference Data** (States, Cities, Segments, Sizes)

There is already a React-based frontend started in the Painel-adm directory with mock data and component scaffolding.

---

## 1. Platform Architecture Overview

### Service Architecture
```
MARGEM-2025 (Three Separate Systems):
├── MARGEM - Profit margin management (~300k scripts every 10 mins)
├── OFFERTA - Product and offer management (5 microservices)
└── OPPINAR - NPS feedback system

Core Infrastructure:
- RabbitMQ: Message queuing (1000+ msgs/sec)
- MongoDB: Data persistence
- Go APIs: REST endpoints with JWT authentication
```

### Active Services (Docker Compose)
```
Port 5001 (internal 5000) -> margem-api-admin (Admin REST API)
Port 5002 (internal 5000) -> margem-api-mobile (Mobile REST API)
Port 5003 (internal 5000) -> margem-api-support (Support REST API)
Port 5010 (internal 5000) -> margem-api-gateway (Producer/Gateway)
Port 5020 (internal 5000) -> margem-gateway (Consumer)
Port 5672 -> rabbitmq (Message Broker)
Port 15672 -> rabbitmq (Management UI)
```

---

## 2. Admin API (margem-api-admin) - Complete Specification

### Base Configuration
- **Port:** 5001 (local) / 5000 (container)
- **Base Path:** `/admin`
- **Framework:** Echo (Go HTTP framework)
- **Authentication:** JWT with SHA1 password hashing
- **CORS:** Enabled globally
- **Body Limit:** 200MB
- **Compression:** GZIP Level 5

### Authentication

#### Login Endpoint
```
POST /admin/login
```

**Request:**
```json
{
  "email": "user@minhamargem.com.br",
  "password": "password123",
  "partner": "mpontom"
}
```

**Response (200):**
```json
{
  "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "partner": "mpontom",
  "email": "user@minhamargem.com.br"
}
```

**JWT Secret:** `#$100&&CLIENTES%%PAGANTES#`
**Token Expiry:** 24 hours
**Password Hashing:** SHA1

---

## 3. Stores (Estabelecimentos) Management

### Create Store
```
POST /admin/store
Headers: Authorization: Bearer {token}
```

**Request Fields:**
- company (razaoSocial)
- tradeName (nomeFantasia)
- cnpj
- phone
- email
- segment
- size
- partner
- codePartner
- street, neighborhood, number, city, state
- cityCode, stateCode
- offerta, oppinar, prazzo (service flags)
- scanner: {active, beta, days, expire}
- active

**Response:** Created store with auto-generated serial number

### Get Store
```
GET /admin/store?cnpj={cnpj}
```

### Get Stores by Partner
```
GET /admin/file-stores?partner={partner}
```

### Update Store
```
PUT /admin/store
```

### Delete Store
```
DELETE /admin/store?cnpj={cnpj}
```

---

## 4. Mobile Users (Usuários Mobile) Management

### Create Mobile User
```
POST /admin/mobile
```

**Fields:**
- name
- email
- phone (celular)
- _type (Support, Admin, etc.)
- partner
- active

**Side Effects:**
- Auto-generates SHA1 password
- Sends SMS via Twilio
- Sends email with credentials

### Get Mobile Users
```
GET /admin/mobile?email={email}
```

### Get User Stores
```
GET /admin/mobile/store?email={email}
```

### Add Store to User
```
PUT /admin/mobile/store?email={email}
```

### Remove Store from User
```
DELETE /admin/mobile/store?email={email}
```

### Update Mobile User
```
PUT /admin/mobile?email={email}
```

### Delete Mobile User
```
DELETE /admin/mobile?email={email}
```

---

## 5. Support Users (Usuários Suporte) Management

### Create Support User
```
POST /admin/support
```

**Fields:**
- name
- email
- partner

### Get Support Users
```
GET /admin/support?email={email}
```

### Update Support User
```
PUT /admin/support?id={id}
```

### Delete Support User
```
DELETE /admin/support?id={id}
```

---

## 6. Reference Data Endpoints

### Get Partners
```
GET /admin/partners
```

### Get States
```
GET /admin/states
```

### Get Cities
```
GET /admin/cities?estado={state_code}
```

### Get Segments
```
GET /admin/segments
```

### Get Sizes
```
GET /admin/sizes
```

---

## 7. MongoDB Data Models

### Collections

#### `stores`
- razaoSocial, nomeFantasia, cnpj
- licenca (serial)
- telefone, email
- endereço: rua, numero, bairro, cidade, estado
- automacao (partner), codigo
- ativo, lucrability
- offerta, oppinar, prazzo
- scanner: {active, beta, expire_at}
- usuarios (array of user IDs)
- inclusao (creation date)

#### `mobiles`
- nome, email, celular
- password (SHA1)
- ativo, _type, parceiro
- lojas (array of store IDs)
- termo, inclusao

#### `supports`
- nome, email, password (SHA1)
- parceiro, ativo, inclusao

#### `admins`
- email, password (SHA1)
- nome, parceiro, ativo, inclusao

---

## 8. Error Handling

| Status | Meaning |
|--------|---------|
| 200 | OK - Successful GET/PUT/POST |
| 201 | Created - Successfully created resource |
| 204 | No Content - Successful DELETE |
| 401 | Unauthorized - Invalid credentials |
| 409 | Conflict - Duplicate constraint (CNPJ/email) |
| 500 | Internal Error - Server/database error |

---

## 9. Admin Panel UI Requirements

### Key Sections

#### 1. Login
- Email input
- Password input
- Partner selector (if multi-tenant)
- Submit button

#### 2. Dashboard
- Stats (store count, last update)
- Quick navigation

#### 3. Stores
- List with search by CNPJ
- Create/Edit modal with all fields
- Delete confirmation
- Service toggles (Offerta, Oppinar, Prazzo, Scanner)
- Scanner settings UI (Active/Beta with expiry)

#### 4. Mobile Users
- List with search by email
- Create/Edit modal
- Store association manager
- Delete confirmation

#### 5. Support Users
- List with search
- Create/Edit modal
- Delete confirmation

#### 6. Settings
- Reference data management
- Bulk operations

---

## 10. Existing Frontend Code

### Location
`D:\MARGEM-2025\Painel-adm\index.html`

### Current State
- React + Tailwind CSS
- Mock data defined (stores, partners, mobile users, support users)
- Reusable components: FormInput, FormSelect, FormCheckbox, FormToggle, Tabs
- Component structure scaffolded

### To Complete
1. Replace mock data with API calls
2. Add authentication flow
3. Implement form submissions
4. Add error handling
5. JWT token management
6. Toast notifications
7. React Router setup

---

## 11. Technology Stack

### Backend
- Language: Go
- Framework: Echo
- Database: MongoDB
- Auth: JWT (HS256)
- Password: SHA1
- Queue: RabbitMQ
- Email: SMTP
- SMS: Twilio
- Deployment: Docker + K3s

### Frontend
- Framework: React
- Styling: Tailwind CSS
- Icons: Lucide React
- HTTP: Fetch API
- State: React hooks
- Routing: React Router v6
- Form: React Hook Form (recommended)

---

## 12. Environment Variables

```
REACT_APP_API_BASE_URL=http://localhost:5001
REACT_APP_JWT_STORAGE_KEY=margem_admin_token
REACT_APP_SESSION_TIMEOUT=86400000
```

---

## 13. Key Implementation Notes

1. **CNPJ Format:** Database stores with formatting (e.g., "52.068.338/0001-89")
2. **Password Hashing:** Must use SHA1 for backward compatibility
3. **JWT Secret:** Must match exactly: `#$100&&CLIENTES%%PAGANTES#`
4. **Token Expiry:** 24 hours
5. **Field Mapping:** JSON differs from BSON (e.g., "company" vs "razaoSocial")
6. **Unique Constraints:** CNPJ for stores, email for users

---

## Conclusion

The MARGEM admin panel is a critical management interface. The backend API is well-structured with clear endpoints. The existing React scaffolding needs integration with real API calls and proper authentication/token management. Development should focus on:

1. API integration layer
2. Authentication and token management
3. Form validation and error handling
4. Data synchronization
5. User experience enhancements

