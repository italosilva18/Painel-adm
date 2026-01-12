# Passos Rápidos para Integração

## 1. Verificar Estrutura (Já Concluído!)

A estrutura de API já foi criada em `src/`:

```
src/
├── api/                    - Configuração e serviços de API
│   ├── config.ts          - Axios instance
│   ├── interceptors.ts    - JWT authentication
│   ├── errorHandler.ts    - Error handling
│   ├── types.ts           - TypeScript types
│   └── services/          - API services
│
├── hooks/                  - Custom React hooks
│   ├── useAuth.ts         - Authentication
│   ├── useStores.ts       - Store CRUD
│   ├── useMobileUsers.ts  - Mobile user CRUD
│   └── useSupportUsers.ts - Support user CRUD
│
├── utils/                  - Utility functions
│   ├── tokenManager.ts    - Token management
│   ├── validators.ts      - Input validation
│   └── formatters.ts      - Data formatting
│
└── .env                    - Environment variables
```

## 2. Instalar Dependências

```bash
cd D:\MARGEM-2025\Painel-adm
npm install
```

## 3. Verificar Configuração do .env

O arquivo `.env` foi atualizado com:

```env
VITE_API_BASE_URL=https://api.painelmargem.com.br/admin
VITE_JWT_SECRET=#$100&&CLIENTES%%PAGANTES#
VITE_DEFAULT_EMAIL=suporte@minhamargem.com.br
VITE_DEFAULT_PASSWORD=123456
```

## 4. Testar a Integração

### Iniciar desenvolvimento:
```bash
npm run dev
```

### Abrir no navegador:
http://localhost:5173

### Fazer login com:
- Email: `suporte@minhamargem.com.br`
- Senha: `123456`

### Verificar no console:
- F12 -> Console
- Procure por `[API Request]` e `[API Response]`

## 5. Como Usar os Hooks

### Autenticação
```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { login, logout, isAuthenticated, email } = useAuth();

  const handleLogin = async () => {
    await login({
      email: 'user@example.com',
      password: 'password',
      partner: 'mpontom'
    });
  };

  return (
    <div>
      {isAuthenticated ? <p>Olá, {email}</p> : <p>Não autenticado</p>}
      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
}
```

### Carregamento de Lojas
```typescript
import { useStores } from '@/hooks/useStores';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

function MyComponent() {
  const { partner } = useAuth();
  const { stores, isLoading, loadStores } = useStores();

  useEffect(() => {
    if (partner) {
      loadStores(partner);
    }
  }, [partner]);

  return (
    <div>
      {isLoading ? <p>Carregando...</p> : (
        <ul>
          {stores.map(store => (
            <li key={store.cnpj}>{store.company}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## 6. Integrar com App.tsx Existente

No seu `LoginPage` componente, substitua a lógica mockada:

```typescript
import { useAuth } from '@/hooks/useAuth';

const LoginPage = ({ onLogin }) => {
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await login({ email, password, partner: 'mpontom' });
      onLogin(); // Chama callback do App.tsx
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    // seu formulário aqui
  );
};
```

## 7. Substituir Dados Mockados

Procure por:
- `mockLojas`
- `mockParceiros`
- `mockUsuariosMobile`
- `mockUsuariosSuporte`

E substitua pela lógica dos hooks.

## 8. Adicionar Notificações (Toast)

O projeto já tem `react-hot-toast`:

```typescript
import toast from 'react-hot-toast';

// Sucesso
toast.success('Operação realizada!');

// Erro
toast.error('Algo deu errado!');

// Loading
toast.loading('Carregando...');
```

## 9. Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint

# Format
npm run format

# Testes
npm run test
```

## 10. Endpoints Disponíveis

### Login
- POST `/admin/login` - Email e senha

### Lojas
- GET `/admin/file-stores?partner=xxx` - Listar lojas
- POST `/admin/store` - Criar loja
- PUT `/admin/store` - Atualizar loja
- DELETE `/admin/store?cnpj=xxx` - Deletar loja

### Usuários Mobile
- GET `/admin/mobile?email=xxx` - Buscar usuário
- POST `/admin/mobile` - Criar usuário
- PUT `/admin/mobile` - Atualizar usuário
- DELETE `/admin/mobile?email=xxx` - Deletar usuário

### Usuários Suporte
- GET `/admin/support?email=xxx` - Buscar usuário
- POST `/admin/support` - Criar usuário
- PUT `/admin/support` - Atualizar usuário
- DELETE `/admin/support?email=xxx` - Deletar usuário

## Próximas Etapas

1. Integrar hooks em todos os componentes
2. Remover dados mockados
3. Adicionar tratamento de erros
4. Adicionar loading states
5. Implementar paginação
6. Adicionar testes
7. Deploy em produção

## Troubleshooting

### "Token inválido"
Verifique se `setupInterceptors()` foi chamado no App.tsx.

### "CORS error"
Verifique se VITE_API_BASE_URL está correto.

### "Login não funciona"
Verifique as credenciais e se o backend está rodando.

Para mais detalhes, veja INTEGRATION_GUIDE.md
