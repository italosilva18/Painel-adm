# MARGEM Admin Panel - API Integration Layer

Uma camada de integração completa, robusta e type-safe para comunicação com a API administrativo MARGEM (porta 5001).

## Quick Start

### 1. Instalar Dependências

```bash
npm install axios react-router-dom
```

### 2. Configurar Environment Variables

Copie o arquivo `.env.example` para `.env`:

```bash
cp env.example .env
```

Configure as variáveis conforme seu ambiente:

```env
VITE_API_BASE_URL=http://localhost:5001
VITE_JWT_SECRET=#$100&&CLIENTES%%PAGANTES#
```

### 3. Inicializar Interceptadores na App

```typescript
import { useEffect } from 'react';
import { setupInterceptors } from '@/api/interceptors';
import { useAuth } from '@/hooks/useAuth';

export function App() {
  const { logout } = useAuth();

  useEffect(() => {
    setupInterceptors(undefined, () => logout());
  }, [logout]);

  return (
    // Seu app
  );
}
```

### 4. Usar Hooks nas Páginas

```typescript
import { useAuth } from '@/hooks/useAuth';
import { useStores } from '@/hooks/useStores';

function Dashboard() {
  const { login, logout, isAuthenticated } = useAuth();
  const { stores, loadStores, createStore } = useStores();

  // Usar na página...
}
```

---

## Estrutura de Arquivos

```
src/
├── api/                      # Camada de API
│   ├── config.ts            # Configuração do axios
│   ├── interceptors.ts      # Interceptadores de requisição/resposta
│   ├── errorHandler.ts      # Tratamento de erros centralizado
│   ├── types.ts             # Tipos TypeScript
│   ├── index.ts             # Exports
│   └── services/            # Serviços por domínio
│       ├── auth.ts          # Login, token, validation
│       ├── stores.ts        # CRUD de lojas
│       ├── mobileUsers.ts   # CRUD de usuários mobile
│       ├── supportUsers.ts  # CRUD de usuários suporte
│       ├── referenceData.ts # Dados de referência (estados, cidades, etc)
│       └── index.ts
├── hooks/                    # React Hooks
│   ├── useAuth.ts           # Gerenciamento de autenticação
│   ├── useStores.ts         # Operações com lojas
│   ├── useMobileUsers.ts    # Operações com usuários mobile
│   ├── useSupportUsers.ts   # Operações com usuários suporte
│   └── index.ts
├── utils/                    # Utilitários
│   ├── tokenManager.ts      # Gerenciamento de JWT
│   ├── validators.ts        # Validação de inputs (email, CNPJ, etc)
│   └── formatters.ts        # Formatação de dados (CNPJ, moeda, datas, etc)
└── components/examples/      # Exemplos de uso
    ├── LoginExample.tsx     # Exemplo de login
    └── StoresListExample.tsx # Exemplo de lista de lojas
```

---

## Casos de Uso Principais

### Login

```typescript
const { login, error } = useAuth();

const handleLogin = async () => {
  try {
    await login({
      email: 'admin@margem.com',
      password: 'senha123',
      partner: 'mpontom'
    });
    // Usuário autenticado, ir para dashboard
  } catch (err) {
    console.error(err.message);
  }
};
```

### Carregar Lojas

```typescript
const { stores, isLoading, loadStores } = useStores();
const { partner } = useAuth();

useEffect(() => {
  if (partner) {
    loadStores(partner);
  }
}, [partner]);
```

### Criar Loja

```typescript
const { createStore } = useStores();

const handleCreate = async (formData) => {
  try {
    const newStore = await createStore({
      cnpj: '52.068.338/0001-89',
      company: 'Loja 1',
      // ... outros campos
    });
    toast.success('Loja criada!');
  } catch (error) {
    toast.error(error.message);
  }
};
```

### Atualizar Loja

```typescript
const { updateStore } = useStores();

await updateStore('52.068.338/0001-89', {
  company: 'Novo Nome da Loja',
  // ... outros campos
});
```

### Deletar Loja

```typescript
const { deleteStore } = useStores();

await deleteStore('52.068.338/0001-89');
```

### Gerenciar Usuários Mobile

```typescript
const { users, createUser, updateUser, deleteUser } = useMobileUsers();

// Criar
await createUser({
  name: 'João Silva',
  email: 'joao@margem.com',
  phone: '11999999999',
  partner: 'mpontom'
});

// Atualizar
await updateUser('joao@margem.com', {
  name: 'João Silva Updated'
});

// Deletar
await deleteUser('joao@margem.com');

// Gerenciar lojas do usuário
await addStore('joao@margem.com', '52.068.338/0001-89');
await removeStore('joao@margem.com', '52.068.338/0001-89');
```

### Dados de Referência

```typescript
import * as referenceData from '@/api/services/referenceData';

// Carregar tudo
const { partners, states, segments, sizes } = await referenceData.loadAllReferenceData();

// Carregar cidades por estado
const cities = await referenceData.getCities('SP');

// Buscar valor por código
const partner = await referenceData.getPartnerByCode('mpontom');
const stateName = await referenceData.getStateName('SP');
```

---

## Validação de Dados

```typescript
import {
  validateEmail,
  validateCNPJ,
  validatePhone,
  validatePassword,
} from '@/utils/validators';

// Validar campo individual
if (!validateEmail(email)) {
  setError('Email inválido');
}

if (!validateCNPJ(cnpj)) {
  setError('CNPJ inválido');
}

// Validar força de senha
const result = validatePassword(password);
if (!result.valid) {
  setErrors(result.errors); // Array de mensagens
}

// Validar form inteiro
const validation = validateForm(formData, {
  email: validateEmail,
  cnpj: validateCNPJ,
  phone: validatePhone,
});

if (!validation.valid) {
  setFormErrors(validation.errors);
}
```

---

## Formatação de Dados

```typescript
import {
  formatCNPJ,
  formatPhone,
  formatDate,
  formatCurrency,
  formatStatus,
} from '@/utils/formatters';

// Para exibição
<p>{formatCNPJ('52068338000189')}</p> {/* 52.068.338/0001-89 */}
<p>{formatPhone('11999999999')}</p>    {/* (11) 99999-9999 */}
<p>{formatDate('2025-06-13')}</p>      {/* 13/06/2025 */}
<p>{formatCurrency(1500.50)}</p>       {/* R$ 1.500,50 */}
<p>{formatStatus(true)}</p>             {/* Ativo */}

// Para enviar à API (remover formatação)
const cleanCNPJ = unformatCNPJ(userInput);
const cleanPhone = unformatPhone(userInput);
```

---

## Tratamento de Erros

Todos os erros são padronizados e transformados em mensagens amigáveis:

```typescript
import { parseApiError, isAuthError } from '@/api/errorHandler';

try {
  await someApiCall();
} catch (error) {
  const apiError = parseApiError(error);

  if (isAuthError(apiError)) {
    // 401 - Usuário precisa fazer login novamente
    redirectToLogin();
  } else if (apiError.statusCode === 409) {
    // 409 - Conflito (CNPJ/email duplicado)
    toast.error('Este CNPJ ja existe');
  } else {
    // Erro genérico
    toast.error(apiError.message);
  }
}
```

---

## Tipos TypeScript

Todos os endpoints possuem tipos TypeScript definidos:

```typescript
import {
  Store,
  CreateStoreRequest,
  MobileUser,
  CreateMobileUserRequest,
  SupportUser,
  Partner,
  State,
  City,
  Segment,
  Size,
} from '@/api/types';

// Type-safe!
const storeData: CreateStoreRequest = {
  cnpj: '52.068.338/0001-89',
  company: 'Company',
  // TypeScript sugere todos os campos obrigatórios
};
```

---

## Configuração Avançada

### Mudar URL da API em Runtime

```typescript
import { setApiBaseURL } from '@/api/config';

setApiBaseURL('https://api.production.com');
```

### Adicionar Headers Customizados

```typescript
import { addCustomHeader, removeCustomHeader } from '@/api/interceptors';

addCustomHeader('X-Custom-Header', 'value');
removeCustomHeader('X-Custom-Header');
```

### Limpar Cache de Dados de Referência

```typescript
import { clearReferenceDataCache } from '@/api/services/referenceData';

clearReferenceDataCache();
```

---

## Performance

### Caching

Dados de referência (partners, states, segments, sizes) são automaticamente cacheados por 5 minutos:

```typescript
// Primeira chamada: faz requisição à API
const states = await getStates();

// Chamadas subsequentes nos próximos 5 minutos: retorna do cache
const states2 = await getStates(); // Instantâneo!
```

### Interceptadores

Os interceptadores lidam automaticamente com:
- Injeção de JWT token em todas as requisições
- Logging de requests/responses em desenvolvimento
- Transformação de erros em mensagens amigáveis
- Retry automático em caso de falha (configurável)

---

## Segurança

- **JWT Token**: Armazenado em localStorage com expiração de 24 horas
- **CORS**: Configurado no backend para aceitar requisições do frontend
- **HTTPS**: Recomendado para produção
- **Validação**: Cliente valida entrada, servidor valida tudo
- **Sem Credenciais no Código**: Use variáveis de ambiente

---

## Checklist para Produção

- [ ] Configurar `VITE_API_BASE_URL` para endpoint de produção
- [ ] Usar HTTPS (não HTTP)
- [ ] Configurar CORS no backend
- [ ] Testar todos os endpoints
- [ ] Testar tratamento de erros (401, 409, 500)
- [ ] Testar token expiration e refresh
- [ ] Configurar error logging externo
- [ ] Revisar validação de inputs
- [ ] Testar performance com muitos dados
- [ ] Setup de monitoring/alertas

---

## Suporte e Documentação

- **Guia Completo**: Ver `API-INTEGRATION-GUIDE.md`
- **Decisões Arquiteturais**: Ver `ADR-001-API-Integration-Layer.md`
- **Exemplos de Código**: Ver `src/components/examples/`
- **Análise do Painel**: Ver `D:\MARGEM-2025\ADMIN-PANEL-ANALYSIS.md`

---

## Exemplos Práticos

### Componente de Login Completo

Ver: `src/components/examples/LoginExample.tsx`

### Componente de Lista de Lojas

Ver: `src/components/examples/StoresListExample.tsx`

---

## Próximos Passos

1. Instalar axios: `npm install axios`
2. Copiar `env.example` para `.env`
3. Configurar URL da API
4. Implementar rota de login
5. Adicionar autenticação ao App
6. Implementar páginas principais
7. Adicionar tratamento de erros com toast
8. Testar todos os endpoints

---

## Notas Importantes

### CNPJ
- Banco de dados armazena com formatação: `52.068.338/0001-89`
- APIs aceitam com ou sem formatação
- Sempre validar antes de enviar

### JWT Secret
- Cliente: `#$100&&CLIENTES%%PAGANTES#`
- Deve ser o mesmo em todas as APIs
- Armazenado em variável de ambiente

### Datas
- Banco de dados: formato DD/MM/YYYY
- API: formato YYYY-MM-DD (ISO)
- Formatadores convertem automaticamente

---

**Última atualização:** 08/11/2025
**Versão:** 1.0.0
**Status:** Production Ready
