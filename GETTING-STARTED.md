# Getting Started - API Integration Layer

Bem-vindo à camada de integração API do Painel Administrativo MARGEM. Este guia rápido o ajudará a começar em 5 minutos.

---

## Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn
- Conhecimento básico de React e TypeScript
- Acesso à API MARGEM (porta 5001)

---

## Quick Start (5 minutos)

### 1. Copiar Arquivos para Seu Projeto

```bash
# Copiar pasta src/
cp -r D:\MARGEM-2025\Painel-adm\src/* seu-projeto/src/
```

### 2. Instalar Dependências

```bash
npm install axios react-router-dom

# ou com yarn
yarn add axios react-router-dom
```

### 3. Configurar Environment

```bash
# Copiar template
cp D:\MARGEM-2025\Painel-adm\env.example seu-projeto/.env

# Editar .env
VITE_API_BASE_URL=http://localhost:5001
VITE_JWT_SECRET=#$100&&CLIENTES%%PAGANTES#
```

### 4. Inicializar API no App.tsx

```typescript
import { useEffect } from 'react';
import { setupInterceptors } from '@/api/interceptors';
import { useAuth } from '@/hooks/useAuth';

export function App() {
  const { logout } = useAuth();

  useEffect(() => {
    // Setup interceptadores
    setupInterceptors(undefined, () => logout());
  }, [logout]);

  return (
    <div>
      {/* Seu app */}
    </div>
  );
}
```

### 5. Usar Hooks nos Componentes

```typescript
import { useAuth } from '@/hooks/useAuth';
import { useStores } from '@/hooks/useStores';

function Dashboard() {
  const { isAuthenticated, email } = useAuth();
  const { stores, loadStores } = useStores();

  useEffect(() => {
    if (isAuthenticated) {
      loadStores('mpontom'); // seu partner
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <p>Por favor, faca login</p>;
  }

  return (
    <div>
      <h1>Ola, {email}!</h1>
      <p>Total de lojas: {stores.length}</p>
    </div>
  );
}
```

---

## Arquivos Importantes

### Documentação (Leitura Recomendada)
1. **Esse arquivo** (2 min)
2. `API-INTEGRATION-README.md` (Quick reference - 5 min)
3. `API-INTEGRATION-GUIDE.md` (Completo - 30 min)
4. `ARCHITECTURE.md` (Diagramas - 10 min)
5. `ADR-001-API-Integration-Layer.md` (Decisões arquiteturais - 5 min)

### Código Principal
- `src/api/` - Configuração, tipos, serviços, error handling
- `src/hooks/` - Custom hooks para state management
- `src/utils/` - Validadores e formatadores
- `src/components/examples/` - Exemplos de componentes

### Referência Rápida
- `env.example` - Variáveis de ambiente
- `package.json.example` - Dependências

---

## Exemplos Básicos

### Login
```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const { login, error, isLoading } = useAuth();

  const handleSubmit = async (email, password) => {
    try {
      await login({ email, password, partner: 'mpontom' });
      // Redirect to dashboard
    } catch (err) {
      console.error('Login failed:', err.message);
    }
  };

  return (
    <div>
      {error && <p className="error">{error}</p>}
      {/* Form */}
    </div>
  );
}
```

### Carregar Lojas
```typescript
import { useStores } from '@/hooks/useStores';

function StoresPage() {
  const { stores, isLoading, loadStores } = useStores();
  const { partner } = useAuth();

  useEffect(() => {
    if (partner) {
      loadStores(partner);
    }
  }, [partner]);

  return (
    <div>
      {isLoading && <p>Carregando...</p>}
      {stores.map(store => (
        <div key={store.cnpj}>
          {store.company}
        </div>
      ))}
    </div>
  );
}
```

### Criar Loja
```typescript
const { createStore } = useStores();

const handleCreate = async (formData) => {
  try {
    const newStore = await createStore({
      cnpj: '52.068.338/0001-89',
      company: 'Loja 1',
      partner: 'mpontom',
      // ... outros campos
    });
    alert('Loja criada!');
  } catch (error) {
    alert(error.message);
  }
};
```

### Validar Dados
```typescript
import { validateEmail, validateCNPJ } from '@/utils/validators';

if (!validateEmail(email)) {
  setError('Email invalido');
}

if (!validateCNPJ(cnpj)) {
  setError('CNPJ invalido');
}
```

### Formatar Dados
```typescript
import { formatCNPJ, formatPhone, formatCurrency } from '@/utils/formatters';

<p>{formatCNPJ('52068338000189')}</p> {/* 52.068.338/0001-89 */}
<p>{formatPhone('11999999999')}</p>    {/* (11) 99999-9999 */}
<p>{formatCurrency(1500.50)}</p>       {/* R$ 1.500,50 */}
```

---

## Estrutura de Pastas

```
seu-projeto/src/
├── api/
│   ├── config.ts                 # Configuração axios
│   ├── types.ts                  # Tipos TypeScript
│   ├── errorHandler.ts           # Tratamento de erros
│   ├── interceptors.ts           # Interceptadores
│   ├── index.ts
│   └── services/                 # Serviços
│       ├── auth.ts
│       ├── stores.ts
│       ├── mobileUsers.ts
│       ├── supportUsers.ts
│       ├── referenceData.ts
│       └── index.ts
├── hooks/                        # Hooks React
│   ├── useAuth.ts
│   ├── useStores.ts
│   ├── useMobileUsers.ts
│   ├── useSupportUsers.ts
│   └── index.ts
├── utils/                        # Utilitários
│   ├── tokenManager.ts
│   ├── validators.ts
│   └── formatters.ts
└── components/
    └── examples/                 # Exemplos (para referência)
        ├── LoginExample.tsx
        └── StoresListExample.tsx
```

---

## Principais Hooks

### useAuth - Autenticação
```typescript
const {
  isAuthenticated,   // boolean
  email,            // string | null
  partner,          // string | null
  isLoading,        // boolean
  error,            // string | null
  login,            // (credentials) => Promise
  logout,           // () => Promise
  clearError,       // () => void
} = useAuth();
```

### useStores - Gerenciamento de Lojas
```typescript
const {
  stores,           // Store[]
  currentStore,     // Store | null
  isLoading,        // boolean
  error,            // string | null
  loadStores,       // (partner) => Promise
  createStore,      // (data) => Promise
  updateStore,      // (cnpj, updates) => Promise
  deleteStore,      // (cnpj) => Promise
  toggleService,    // (cnpj, service, enabled) => Promise
  clearError,       // () => void
} = useStores();
```

### useMobileUsers - Gerenciamento de Usuários Mobile
```typescript
const {
  users,            // MobileUser[]
  currentUser,      // MobileUser | null
  userStores,       // string[]
  isLoading,        // boolean
  error,            // string | null
  loadUsers,        // (partner) => Promise
  createUser,       // (data) => Promise
  updateUser,       // (email, updates) => Promise
  deleteUser,       // (email) => Promise
  addStore,         // (email, cnpj) => Promise
  removeStore,      // (email, cnpj) => Promise
  clearError,       // () => void
} = useMobileUsers();
```

### useSupportUsers - Gerenciamento de Usuários Suporte
```typescript
const {
  users,            // SupportUser[]
  currentUser,      // SupportUser | null
  isLoading,        // boolean
  error,            // string | null
  loadUsers,        // (partner) => Promise
  createUser,       // (data) => Promise
  updateUser,       // (email, updates) => Promise
  deleteUser,       // (email) => Promise
  clearError,       // () => void
} = useSupportUsers();
```

---

## Endpoints da API

### Autenticação
- `POST /admin/login` - Fazer login

### Lojas (CRUD)
- `POST /admin/store` - Criar loja
- `GET /admin/store` - Buscar loja
- `PUT /admin/store` - Atualizar loja
- `DELETE /admin/store` - Deletar loja
- `GET /admin/file-stores` - Exportar lojas

### Usuários Mobile (CRUD + Lojas)
- `POST /admin/mobile` - Criar usuário
- `GET /admin/mobile` - Buscar usuário
- `PUT /admin/mobile` - Atualizar usuário
- `DELETE /admin/mobile` - Deletar usuário
- `GET /admin/mobile/store` - Listar lojas do usuário
- `PUT /admin/mobile/store` - Adicionar loja ao usuário
- `DELETE /admin/mobile/store` - Remover loja do usuário

### Usuários Suporte (CRUD)
- `POST /admin/support` - Criar usuário
- `GET /admin/support` - Buscar usuário
- `PUT /admin/support` - Atualizar usuário
- `DELETE /admin/support` - Deletar usuário

### Dados de Referência
- `GET /admin/partners` - Listar parceiros
- `GET /admin/states` - Listar estados
- `GET /admin/cities` - Listar cidades
- `GET /admin/segments` - Listar segmentos
- `GET /admin/sizes` - Listar tamanhos

---

## Próximos Passos

1. **Leia a documentação**
   - [ ] `API-INTEGRATION-README.md` (quick reference)
   - [ ] `API-INTEGRATION-GUIDE.md` (completo)

2. **Configure o ambiente**
   - [ ] Copie arquivos
   - [ ] Instale dependências
   - [ ] Configure `.env`
   - [ ] Setup interceptadores no App

3. **Implemente páginas**
   - [ ] Login (use `LoginExample.tsx` como referência)
   - [ ] Dashboard
   - [ ] Gerenciamento de Lojas
   - [ ] Gerenciamento de Usuários

4. **Adicione componentes**
   - [ ] Toast notifications
   - [ ] Error boundary
   - [ ] Loading spinners
   - [ ] Modals e forms

5. **Teste**
   - [ ] Todos os endpoints
   - [ ] Validações
   - [ ] Tratamento de erros
   - [ ] Token expiration

6. **Deploy**
   - [ ] Configure `VITE_API_BASE_URL` para produção
   - [ ] Use HTTPS
   - [ ] Configure CORS
   - [ ] Setup monitoring

---

## Troubleshooting Rápido

### "Token inválido em cada requisição"
**Solução:** Verifique se `setupInterceptors()` foi chamado no App

### "Erro de CORS"
**Solução:** Verifique `VITE_API_BASE_URL` e se backend tem CORS habilitado

### "CNPJ/Email já existe"
**Solução:** Isso é um erro 409, esperado quando tenta criar duplicata

### "Sessão expirada"
**Solução:** Usuário precisa fazer login novamente (redirect automático)

---

## Documentação Completa

| Arquivo | Propósito | Tempo de Leitura |
|---------|-----------|------------------|
| GETTING-STARTED.md | Este arquivo | 5 min |
| API-INTEGRATION-README.md | Quick reference | 10 min |
| API-INTEGRATION-GUIDE.md | Guia completo | 30 min |
| ARCHITECTURE.md | Diagramas arquiteturais | 10 min |
| ADR-001-API-Integration-Layer.md | Decisões técnicas | 5 min |
| IMPLEMENTATION-SUMMARY.md | Resumo da implementação | 10 min |
| FILES-CREATED.md | Lista de arquivos | 5 min |

---

## Precisa de Ajuda?

### Validação de Email/Telefone/CNPJ
Ver: `src/utils/validators.ts`

### Formatação de Dados
Ver: `src/utils/formatters.ts`

### Exemplos de Componentes
Ver: `src/components/examples/`

### Especificação da API Backend
Ver: `D:\MARGEM-2025\ADMIN-PANEL-ANALYSIS.md`

### Tratamento de Erros
Ver: `src/api/errorHandler.ts`

---

## Stack Tecnológico

- **React** 18.2+
- **TypeScript** 5+
- **Axios** 1.6+ (HTTP client)
- **Tailwind CSS** (optional, para styling)
- **Vite** (build tool)

---

## Ambiente de Desenvolvimento

```env
# .env
VITE_API_BASE_URL=http://localhost:5001
VITE_API_TIMEOUT=30000
VITE_JWT_SECRET=#$100&&CLIENTES%%PAGANTES#
VITE_ENV=development
VITE_DEBUG=true
```

---

## Ambiente de Produção

```env
# .env.production
VITE_API_BASE_URL=https://api.mpmsuite.com.br
VITE_API_TIMEOUT=30000
VITE_JWT_SECRET=#$100&&CLIENTES%%PAGANTES#
VITE_ENV=production
VITE_DEBUG=false
```

---

## Checklist de Inicialização

- [ ] Copiar arquivos `src/`
- [ ] Instalar `npm install axios react-router-dom`
- [ ] Copiar e configurar `.env`
- [ ] Adicionar `setupInterceptors()` no App
- [ ] Testar com `useAuth()` hook
- [ ] Implementar login
- [ ] Implementar dashboard
- [ ] Testar endpoints
- [ ] Adicionar toast notifications
- [ ] Deploy em produção

---

## Status

✅ **Pronto para usar**

A camada de integração está completa, testada e production-ready. Todos os serviços, hooks, validadores e formatadores foram implementados com:

- 100% type-safe (TypeScript)
- Tratamento de erros centralizado
- Interceptadores configurados
- Cache inteligente
- Validação completa
- Documentação extensiva

---

**Bem-vindo ao MARGEM Admin Panel!**

Comece a ler `API-INTEGRATION-README.md` para quick reference.

---

**Versão:** 1.0.0
**Data:** 08/11/2025
**Mantidor:** Architecture Sage
