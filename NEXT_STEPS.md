# Próximos Passos - Painel Administrativo MARGEM

## Status Atual
- ✅ Typo crítico corrigido (linha 891 - App.tsx)
- ✅ CSS/Tailwind configurado e funcionando
- ✅ Estrutura React com componentização básica
- ✅ Mock data para desenvolvimento
- ❌ Integração com APIs reais
- ❌ Autenticação real com JWT
- ❌ Validação de formulários
- ❌ Testes automáticos

---

## IMEDIATO (Esta Semana)

### 1. Testar a Aplicação no Navegador
```bash
cd D:\MARGEM-2025\Painel-adm
npm install  # Se ainda não foi rodado
npm run dev
```
Acesse: http://localhost:5173

**Checklist:**
- [ ] Login page renderiza sem erros
- [ ] Depois de login, Sidebar aparece
- [ ] Clicar em "Lojas" carrega LojasPage
- [ ] Buscar por CNPJ filtra corretamente
- [ ] Clicar em "Nova loja" abre formulário
- [ ] Clicar em "Editar" pre-preenche formulário
- [ ] Abas em formulário de Mobile funcionam
- [ ] Responsividade funciona em mobile (F12 → device mode)

### 2. Validar Tailwind CSS
Certifique-se de que:
- [ ] Todas as cores estão aplicadas (azul para botões primários)
- [ ] Padding/margins estão corretos
- [ ] Hover effects funcionam
- [ ] Sem erros no console

**Debug**: Abra DevTools → Console, procure por:
- Warnings de Tailwind
- Erros de JSX
- Imports não resolvidos

### 3. Commit Inicial
```bash
git add .
git commit -m "fix: corrigir typo em onChange do SuportePage - line 891"
git push origin main
```

---

## CURTO PRAZO (2-3 Semanas)

### 4. Criar Structure de Pastas

**Objetivo:** Separar arquivo gigante `App.tsx` (1150 linhas) em componentes menores

```bash
# Criar estrutura
mkdir -p src/pages/{auth,lojas,mobile,suporte}
mkdir -p src/components/{Form,Layout,Table}
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/api
mkdir -p src/schemas

# Mover componentes para seus arquivos
# - src/pages/auth/LoginPage.tsx
# - src/pages/lojas/LojasListPage.tsx
# - src/pages/lojas/LojaFormPage.tsx
# - src/pages/mobile/MobileListPage.tsx
# - src/pages/mobile/UsuarioMobileFormPage.tsx
# - src/pages/suporte/SuportePage.tsx
# - src/pages/suporte/UsuarioSuporteFormPage.tsx
# - src/components/Layout/Sidebar.tsx
# - src/components/Layout/MainLayout.tsx
# - src/components/Form/FormInput.tsx
# - src/components/Form/FormSelect.tsx
# - src/components/Form/FormCheckbox.tsx
# - src/components/Form/FormToggle.tsx
# - src/components/Form/Tabs.tsx
# - src/components/Table/GenericListPage.tsx
```

**Referência:** Veja `MENTORING_GUIDE.md` - Sessão 2

### 5. Implementar React Router Corretamente

**Remover:** Sistema manual de roteamento com `currentPage` string

**Adicionar:** React Router v6
```bash
npm install react-router-dom
```

```typescript
// src/App.tsx (novo)
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/lojas" />} />
          <Route path="/lojas" element={<LojasListPage />} />
          <Route path="/lojas/new" element={<LojaFormPage mode="new" />} />
          <Route path="/lojas/:id" element={<LojaFormPage mode="edit" />} />
          {/* ... mobile, suporte ... */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

**Vantagens:**
- URL muda: `/lojas` ao invés de estado interno
- Back/Forward do navegador funciona
- Bookmarks funcionam
- Mais flexível para integração com API

### 6. Hooks Customizados para Dados

Criar `src/hooks/` com:
- `useLojas.ts` - Fetch/CRUD de lojas
- `useUsuariosMobile.ts` - Fetch/CRUD de usuários mobile
- `useUsuariosSuporte.ts` - Fetch/CRUD de usuários suporte

**Exemplo:** Ver `MENTORING_GUIDE.md` - Sessão 3

---

## MÉDIO PRAZO (1-2 Meses)

### 7. Integração com API Real

**Pré-requisito:** Entender o contrato da API

**API Esperada:** `margem-api-admin` (porta 5001)

```bash
# Testar endpoints manualmente
curl http://localhost:5001/admin/lojas \
  -H "Authorization: Bearer YOUR_TOKEN"

# Criar arquivo de configuração
# src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:5001',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### 8. Autenticação Real com JWT

**Remover:** `onLogin()` mock

**Adicionar:** Login real com JWT
```typescript
// src/hooks/useAuth.ts
import { useState } from 'react';
import apiClient from '@api/client';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('jwt_token', token);
      setUser(user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
  };

  return { user, login, logout, loading };
};
```

### 9. Validação de Formulários com Zod

**Adicionar:** Schemas de validação
```bash
npm install zod @hookform/resolvers
```

**Referência:** `MENTORING_GUIDE.md` - Sessão 4

### 10. Testes Unitários

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

Exemplo:
```typescript
// src/components/Form/FormInput.test.tsx
import { render, screen } from '@testing-library/react';
import { FormInput } from './FormInput';

describe('FormInput', () => {
  it('deve renderizar label e input', () => {
    render(<FormInput label="Email" id="email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
```

Rodar testes:
```bash
npm run test
```

---

## LONGO PRAZO (3+ Meses)

### 11. State Management com Zustand

Migrar de useState para store global:
```bash
npm install zustand
```

```typescript
// src/store/useAppStore.ts
import create from 'zustand';

interface AppState {
  user: User | null;
  lojas: Loja[];
  loading: boolean;
  setUser: (user: User | null) => void;
  setLojas: (lojas: Loja[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  lojas: [],
  loading: false,
  setUser: (user) => set({ user }),
  setLojas: (lojas) => set({ lojas }),
}));

// Na aplicação
const { user, lojas } = useAppStore();
```

### 12. Performance & Otimizações

- [ ] Lazy load de rotas com `React.lazy()`
- [ ] Code splitting automático com Vite
- [ ] Memoization com `useMemo()` e `useCallback()`
- [ ] Virtualization para listas grandes
- [ ] Caching com React Query

```bash
npm install @tanstack/react-query
```

### 13. Documentação & Storybook

```bash
npm install --save-dev storybook @storybook/react
npx storybook init
```

Criar stories para componentes reutilizáveis:
```typescript
// src/components/Form/FormInput.stories.tsx
import { FormInput } from './FormInput';

export default {
  component: FormInput,
  title: 'Form/Input',
};

export const Default = {
  args: {
    label: 'Email',
    id: 'email',
    type: 'email',
  },
};

export const Required = {
  args: {
    label: 'Email',
    id: 'email',
    type: 'email',
    required: true,
  },
};
```

Rodar Storybook:
```bash
npm run storybook
```

### 14. CI/CD Pipeline

Adicionar verificações automáticas:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

---

## Priority Matrix

```
HIGH IMPACT + LOW EFFORT:
- [ ] Sessão 2: Refatorar listas duplicadas (MENTORING_GUIDE)
- [ ] Sessão 3: Criar hooks para dados (MENTORING_GUIDE)
- [ ] Sessão 4: Validação com Zod (MENTORING_GUIDE)
- [ ] React Router setup

MEDIUM IMPACT + LOW EFFORT:
- [ ] Toast notifications
- [ ] Loading states
- [ ] Error boundaries

HIGH IMPACT + HIGH EFFORT:
- [ ] Integração API real
- [ ] Testes automáticos
- [ ] State management (Zustand)

LOW IMPACT + HIGH EFFORT:
- [ ] Storybook
- [ ] Performance optimizations
- [ ] Documentation
```

---

## Métricas de Sucesso

### Semana 1
- [ ] App rodando sem erros no navegador
- [ ] Todas as páginas carregam
- [ ] Responsividade funciona

### Semana 2-3
- [ ] App.tsx dividido em múltiplos arquivos
- [ ] React Router implementado
- [ ] Hooks customizados criados
- [ ] Sem warnings no console

### Semana 4-6
- [ ] Login real com JWT
- [ ] Validação de formulários
- [ ] CRUD funcionando com API
- [ ] 80% de cobertura de testes

### Mês 2+
- [ ] State management centralizado
- [ ] Performance OK (Lighthouse score > 90)
- [ ] Documentação completa
- [ ] Pronto para produção

---

## Recursos Úteis

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com/en/main)
- [Zod Validation](https://zod.dev)
- [React Hook Form](https://react-hook-form.com)
- [Zustand](https://github.com/pmndrs/zustand)

---

## Dúvidas Frequentes

**P: Por onde começo?**
R: Pela Sessão 2 do `MENTORING_GUIDE.md` - refatorar as listas duplicadas. É baixo risco e alto aprendizado.

**P: Preciso remover os dados mockados?**
R: Não ainda. Use-os para desenvolvimento local. Quando conectar com API, os mocks saem naturalmente.

**P: Quanto tempo leva para escalar isso?**
R: ~2-3 meses para um app profissional completo com testes e CI/CD.

**P: O que fazer se ficar preso?**
R: Revise o `MENTORING_GUIDE.md`, tente reproduzir o exemplo, e se não funcionar, peça ajuda. A iteração é parte do aprendizado!

---

## Roadmap Sugerido

```
Semana 1:   Refatoração estrutural (split de App.tsx)
Semana 2-3: React Router + Hooks customizados
Semana 4:   Validação com Zod + React Hook Form
Semana 5:   Integração API real (lojas)
Semana 6:   Login e JWT
Semana 7-8: Testes e polimento
Semana 9+:  Otimizações e deployment
```

---

**Próximo Passo:** Abra o `MENTORING_GUIDE.md` e comece pela **Sessão 2: Refatorar - De One-Liner para Componente Reutilizável**.

**Boa sorte! 🚀**

---

**Senior Mentor - Coaching Técnico MARGEM**
