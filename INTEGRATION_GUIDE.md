# Guia de Integração - API MARGEM

## Status da Integração

A integração com a API real foi implementada com sucesso. O projeto agora possui:

- ✅ Configuração do Axios (`src/api/config.ts`)
- ✅ Interceptadores JWT (`src/api/interceptors.ts`)
- ✅ Serviços de API (`src/api/services/`)
- ✅ Custom Hooks React (`src/hooks/`)
- ✅ Utilitários (`src/utils/`)
- ✅ TypeScript Types (`src/api/types.ts`)
- ✅ Tratamento de Erros (`src/api/errorHandler.ts`)

## Configuração Necessária

### 1. Variáveis de Ambiente (.env)

O arquivo `.env` já foi configurado com:

```env
VITE_API_BASE_URL=https://api.painelmargem.com.br/admin
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3
VITE_JWT_SECRET=#$100&&CLIENTES%%PAGANTES#
VITE_DEFAULT_EMAIL=suporte@minhamargem.com.br
VITE_DEFAULT_PASSWORD=123456
```

**IMPORTANTE:** Em produção, remova `VITE_DEFAULT_EMAIL` e `VITE_DEFAULT_PASSWORD`.

### 2. Inicializar Interceptadores

No componente raiz da aplicação (App.tsx ou AppIntegrated.tsx):

```typescript
import { useEffect } from 'react';
import { setupInterceptors } from '@/api/interceptors';
import { useAuth } from '@/hooks/useAuth';

function App() {
  const { logout } = useAuth();

  useEffect(() => {
    // Setup interceptadores na primeira renderização
    setupInterceptors(
      (token) => console.log('Token refreshed'),
      () => {
        // Chamado quando autenticação falha
        logout();
      }
    );
  }, [logout]);

  return (
    // Seu app aqui
  );
}
```

## Como Usar os Hooks

### 1. useAuth - Autenticação

```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginComponent() {
  const { login, logout, isAuthenticated, email, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        email: 'suporte@minhamargem.com.br',
        password: '123456',
        partner: 'mpontom',
      });
      console.log('Login bem-sucedido!');
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Olá, {email}</p>
          <button onClick={handleLogout} disabled={isLoading}>
            Sair
          </button>
        </>
      ) : (
        <button onClick={handleLogin} disabled={isLoading}>
          Entrar
        </button>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

### 2. useStores - Gerenciamento de Lojas

```typescript
import { useStores } from '@/hooks/useStores';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

function StoresComponent() {
  const { partner } = useAuth();
  const { stores, isLoading, error, loadStores, createStore, updateStore, deleteStore } = useStores();

  // Carregar lojas quando componente monta
  useEffect(() => {
    if (partner) {
      loadStores(partner);
    }
  }, [partner]);

  const handleCreateStore = async () => {
    try {
      const newStore = await createStore({
        cnpj: '52.068.338/0001-89',
        company: 'Minha Empresa Ltda',
        tradeName: 'Minha Loja',
        phone: '75982239640',
        email: 'contato@minhaempresa.com.br',
        segment: 'Varejo',
        size: 'Grande',
        partner: 'mpontom',
        codePartner: 'MP001',
        street: 'Rua Principal',
        neighborhood: 'Centro',
        number: '100',
        city: 'Salvador',
        state: 'BA',
        cityCode: '2927400',
        stateCode: '29',
        offerta: true,
        oppinar: false,
        prazzo: false,
        scanner: {
          active: false,
          beta: false,
          days: 30,
          expire: new Date().toISOString(),
        },
        active: true,
      });

      console.log('Loja criada:', newStore);
    } catch (err: any) {
      console.error('Erro ao criar loja:', err.message);
    }
  };

  const handleUpdateStore = async (cnpj: string, updates: any) => {
    try {
      await updateStore(cnpj, updates);
      console.log('Loja atualizada');
      loadStores(partner);
    } catch (err: any) {
      console.error('Erro ao atualizar:', err.message);
    }
  };

  const handleDeleteStore = async (cnpj: string) => {
    if (window.confirm('Deseja realmente deletar esta loja?')) {
      try {
        await deleteStore(cnpj);
        console.log('Loja deletada');
        loadStores(partner);
      } catch (err: any) {
        console.error('Erro ao deletar:', err.message);
      }
    }
  };

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <button onClick={handleCreateStore} className="btn btn-primary">
        Criar Loja
      </button>

      <table className="mt-4">
        <thead>
          <tr>
            <th>CNPJ</th>
            <th>Razão Social</th>
            <th>Nome Fantasia</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store.cnpj}>
              <td>{store.cnpj}</td>
              <td>{store.company}</td>
              <td>{store.tradeName}</td>
              <td>
                <button
                  onClick={() => handleUpdateStore(store.cnpj, { active: !store.active })}
                  className="btn btn-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteStore(store.cnpj)}
                  className="btn btn-sm btn-danger"
                >
                  Deletar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StoresComponent;
```

### 3. useMobileUsers - Gerenciamento de Usuários Mobile

```typescript
import { useMobileUsers } from '@/hooks/useMobileUsers';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

function MobileUsersComponent() {
  const { partner } = useAuth();
  const {
    users,
    isLoading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    addStore,
    removeStore,
  } = useMobileUsers();

  useEffect(() => {
    if (partner) {
      loadUsers(partner);
    }
  }, [partner]);

  const handleCreateUser = async () => {
    try {
      const newUser = await createUser({
        name: 'João Silva',
        email: 'joao.silva@minhamargem.com.br',
        phone: '75982239640',
        _type: 'Operador',
        partner: 'mpontom',
        active: true,
      });

      console.log('Usuário criado:', newUser);
      loadUsers(partner);
    } catch (err: any) {
      console.error('Erro ao criar usuário:', err.message);
    }
  };

  const handleAddStore = async (email: string, cnpj: string) => {
    try {
      await addStore(email, cnpj);
      console.log('Loja adicionada ao usuário');
      loadUsers(partner);
    } catch (err: any) {
      console.error('Erro ao adicionar loja:', err.message);
    }
  };

  const handleRemoveStore = async (email: string, cnpj: string) => {
    try {
      await removeStore(email, cnpj);
      console.log('Loja removida do usuário');
      loadUsers(partner);
    } catch (err: any) {
      console.error('Erro ao remover loja:', err.message);
    }
  };

  if (isLoading) return <p>Carregando usuários...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <button onClick={handleCreateUser} className="btn btn-primary">
        Criar Usuário Mobile
      </button>

      <ul className="mt-4">
        {users.map((user) => (
          <li
            key={user.email}
            className="p-4 border rounded-lg mb-2 flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-600">
                {user.lojas?.length || 0} lojas atribuídas
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAddStore(user.email, 'CNPJ_AQUI')}
                className="btn btn-sm"
              >
                Adicionar Loja
              </button>
              <button
                onClick={() => handleRemoveStore(user.email, 'CNPJ_AQUI')}
                className="btn btn-sm btn-danger"
              >
                Remover Loja
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MobileUsersComponent;
```

### 4. useSupportUsers - Gerenciamento de Usuários de Suporte

```typescript
import { useSupportUsers } from '@/hooks/useSupportUsers';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

function SupportUsersComponent() {
  const { partner } = useAuth();
  const { users, isLoading, error, loadUsers, createUser, updateUser, deleteUser } =
    useSupportUsers();

  useEffect(() => {
    if (partner) {
      loadUsers(partner);
    }
  }, [partner]);

  const handleCreateUser = async () => {
    try {
      const newUser = await createUser({
        name: 'Maria Santos',
        email: 'maria.santos@suporte.com.br',
        partner: 'mpontom',
      });

      console.log('Usuário de suporte criado:', newUser);
      loadUsers(partner);
    } catch (err: any) {
      console.error('Erro ao criar usuário:', err.message);
    }
  };

  if (isLoading) return <p>Carregando usuários...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <button onClick={handleCreateUser} className="btn btn-primary">
        Criar Usuário Suporte
      </button>

      <ul className="mt-4">
        {users.map((user) => (
          <li
            key={user.email}
            className="p-4 border rounded-lg mb-2 flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm">Editar</button>
              <button className="btn btn-sm btn-danger">Deletar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SupportUsersComponent;
```

## Validação de Dados

Use os validadores para garantir que os dados sejam válidos antes de enviar para a API:

```typescript
import {
  validateEmail,
  validateCNPJ,
  validatePhone,
  validatePassword,
} from '@/utils/validators';

// Validar email
if (!validateEmail('user@example.com')) {
  console.log('Email inválido');
}

// Validar CNPJ
if (!validateCNPJ('52.068.338/0001-89')) {
  console.log('CNPJ inválido');
}

// Validar telefone
if (!validatePhone('75982239640')) {
  console.log('Telefone inválido');
}

// Validar força de senha
const passwordCheck = validatePassword('MinhaSenha123!');
if (!passwordCheck.valid) {
  console.log('Erros de senha:', passwordCheck.errors);
}
```

## Formatação de Dados

Use os formatadores para exibir dados de forma correta:

```typescript
import {
  formatCNPJ,
  formatPhone,
  formatDate,
  formatCurrency,
  formatStatus,
} from '@/utils/formatters';

// Formatar CNPJ para exibição
<p>{formatCNPJ('52068338000189')}</p> // Output: 52.068.338/0001-89

// Formatar telefone
<p>{formatPhone('75982239640')}</p> // Output: (75) 98223-9640

// Formatar data
<p>{formatDate('2025-06-13')}</p> // Output: 13/06/2025

// Formatar moeda
<p>{formatCurrency(1500.50)}</p> // Output: R$ 1.500,50

// Formatar status
<p>{formatStatus(true)}</p> // Output: Ativo
```

## Tratamento de Erros

Todos os erros da API são centralizados no `errorHandler`:

```typescript
import { parseApiError, isAuthError, getErrorMessage } from '@/api/errorHandler';

try {
  await someApiCall();
} catch (error) {
  const apiError = parseApiError(error);

  if (isAuthError(apiError)) {
    // Token inválido - redireciona para login
    redirectToLogin();
  } else if (apiError.code === 409) {
    // Conflito - provavelmente dado duplicado
    showError('Este registro já existe');
  } else if (apiError.code === 422) {
    // Erro de validação
    showError('Dados inválidos: ' + apiError.message);
  } else {
    // Erro genérico
    showError(getErrorMessage(error));
  }
}
```

## Próximas Etapas

1. **Criar Componentes de UI**
   - Formulários para criar/editar lojas
   - Tabelas para listar dados
   - Modals para confirmações
   - Toast notifications para feedback

2. **Implementar Roteamento**
   - Setup react-router-dom
   - Criar páginas para cada seção
   - Proteger rotas que requerem autenticação

3. **Adicionar Testes**
   - Testes unitários para hooks
   - Testes de integração para componentes
   - Mock de serviços de API

4. **Otimizações**
   - Cache de dados
   - Debounce de requisições
   - Paginação de listas
   - Lazy loading

5. **Deploy**
   - Configurar VITE_API_BASE_URL para produção
   - Habilitar HTTPS
   - Configurar CORS no backend
   - Setup de monitoring

## Endpoints Disponíveis

### Autenticação
- `POST /admin/login` - Login com email/senha
- `POST /admin/logout` - Logout (opcional)

### Lojas (CRUD)
- `POST /admin/store` - Criar loja
- `GET /admin/store?cnpj=...` - Buscar loja por CNPJ
- `PUT /admin/store` - Atualizar loja
- `DELETE /admin/store?cnpj=...` - Deletar loja
- `GET /admin/file-stores?partner=...` - Listar lojas por parceiro

### Usuários Mobile
- `POST /admin/mobile` - Criar usuário
- `GET /admin/mobile?email=...` - Buscar usuário
- `PUT /admin/mobile` - Atualizar usuário
- `DELETE /admin/mobile?email=...` - Deletar usuário
- `GET /admin/mobile/store?email=...` - Listar lojas do usuário
- `PUT /admin/mobile/store` - Adicionar loja ao usuário
- `DELETE /admin/mobile/store?email=...&cnpj=...` - Remover loja do usuário

### Usuários Suporte
- `POST /admin/support` - Criar usuário
- `GET /admin/support?email=...` - Buscar usuário
- `PUT /admin/support` - Atualizar usuário
- `DELETE /admin/support?email=...` - Deletar usuário

### Dados de Referência
- `GET /admin/partners` - Listar parceiros
- `GET /admin/states` - Listar estados
- `GET /admin/cities?state=...` - Listar cidades por estado
- `GET /admin/segments` - Listar segmentos
- `GET /admin/sizes` - Listar tamanhos

## Troubleshooting

### "Token inválido em cada requisição"
**Solução:** Verifique se `setupInterceptors()` foi chamado no App component.

### "CORS error"
**Solução:** Verifique se:
1. `VITE_API_BASE_URL` está correto
2. Backend tem CORS habilitado
3. Browser permite requisições cross-origin

### "401 Unauthorized"
**Solução:** O token pode estar:
1. Expirado (fazer login novamente)
2. Inválido (verificar se foi corrompido)
3. Não injetado corretamente (verificar interceptador)

### "CNPJ/Email já existe"
**Solução:** Isso é um erro esperado (409 Conflict). Implemente tratamento para este caso.

## Suporte

Para mais informações, consulte:
- `API-INTEGRATION-GUIDE.md` - Guia completo
- `src/api/` - Código da integração
- `src/hooks/` - Documentação dos hooks
