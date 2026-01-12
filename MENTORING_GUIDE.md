# Guia de Mentoria - Painel Administrativo MARGEM
## Melhorias Incrementais e Aprendizados

Bem-vindo! Este é um guia prático para elevar o nível de qualidade do código do painel administrativo.

### SESSÃO 1: Corrigir o Typo e Entender TypeScript Strict

#### O Que Foi Corrigido
```javascript
// Antes (ERRADO) - Linha 891
onChange={(e) => setSearchTerm(e.g.target.value)}
// ❌ TypeError: Cannot read property 'target' of undefined

// Depois (CORRETO)
onChange={(e) => setSearchTerm(e.target.value)}
// ✓ Agora funciona!
```

#### Lição Aprendida: Por que TypeScript não pegou?

**Por que isso aconteceu?**
- TypeScript é compilado de forma transposta (não executa)
- O `any` implícito do evento React pode escapar da validação
- O linter de tipo não captura todos os erros de dot notation

**Como evitar no futuro?**
```typescript
// 1. Ser explícito com tipos
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //                 ^^^ TypeScript agora sabe exatamente o tipo
  setSearchTerm(e.target.value);
};

// 2. Ativar regras do ESLint
// No .eslintrc.json:
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-types": "warn"
  }
}

// 3. Usar type helpers
type InputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;

const handleChange: InputChangeHandler = (e) => {
  setSearchTerm(e.target.value);
};
```

### SESSÃO 2: Refatorar - De One-Liner para Componente Reutilizável

#### Problema Atual
Você tem 3 páginas de listagem quase idênticas:
```javascript
// LojasPage - ~100 linhas
// MobilePage - ~100 linhas
// SuportePage - ~100 linhas
// Total: ~300 linhas de código duplicado!
```

#### Desafio para Você
**Questão Orientadora:** "Se você precisasse fazer uma pequena mudança no layout da tabela (ex: adicionar paginação), quantos arquivos você teria que editar?"

Resposta correta: 3! Isso viola o princípio DRY (Don't Repeat Yourself).

#### Passo 1: Identificar o Padrão

```typescript
// Padrão comum em todas as 3 páginas:
1. Estado: searchTerm
2. Filtrar dados: filter(item => item.someField.includes(searchTerm))
3. Renderizar:
   - Se searchTerm vazio: mostrar placeholder
   - Se tem dados: mostrar tabela
   - Se sem resultados: mostrar "nenhum encontrado"
4. Ações: Edit, Delete, New
```

#### Passo 2: Extrair para um Componente Genérico

```typescript
// src/components/GenericListPage.tsx

interface Column<T> {
  key: keyof T;
  label: string;
  hidden?: 'sm' | 'md' | 'lg'; // responsive
  format?: (value: any) => string | React.ReactNode;
}

interface GenericListPageProps<T extends { id: string | number }> {
  title: string;
  data: T[];
  columns: Column<T>[];
  searchField: keyof T;
  searchPlaceholder: string;
  emptyMessage: string;
  newButtonLabel: string;
  onEdit: (item: T) => void;
  onNew: () => void;
}

export const GenericListPage = <T extends { id: string | number }>({
  title,
  data,
  columns,
  searchField,
  searchPlaceholder,
  emptyMessage,
  newButtonLabel,
  onEdit,
  onNew,
}: GenericListPageProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Seu filtro inteligente aqui
  const filtered = data.filter((item) => {
    const fieldValue = String(item[searchField]).toLowerCase();
    return fieldValue.includes(searchTerm.toLowerCase());
  });

  const getResponsiveClass = (hidden?: string) => {
    switch (hidden) {
      case 'sm': return 'hidden sm:table-cell';
      case 'md': return 'hidden md:table-cell';
      case 'lg': return 'hidden lg:table-cell';
      default: return '';
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header com busca e novo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative w-full max-w-lg">
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute w-5 h-5 text-gray-400 right-3 top-1/2 -translate-y-1/2" />
        </div>
        <button
          onClick={onNew}
          className="flex items-center justify-center px-4 py-2 ml-0 sm:ml-4 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md w-full sm:w-auto mt-2 sm:mt-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          {newButtonLabel}
        </button>
      </div>

      {/* Placeholder ou Tabela */}
      {searchTerm.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 bg-white border-2 border-dashed border-gray-300 rounded-lg">
          <Search className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={`px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase ${getResponsiveClass(col.hidden)}`}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={`px-6 py-4 text-sm text-gray-900 whitespace-nowrap ${getResponsiveClass(col.hidden)}`}
                    >
                      {col.format
                        ? col.format(item[col.key])
                        : String(item[col.key])}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-10 text-center text-gray-500">
                    Nenhum resultado encontrado para "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
```

#### Passo 3: Usar o Componente Genérico

```typescript
// pages/lojas/LojasListPage.tsx
const LojasListPage = ({ setPage, onSelectLoja }) => {
  const columns: Column<typeof mockLojas[0]>[] = [
    { key: 'cnpj', label: 'CNPJ', hidden: 'lg' },
    { key: 'razaoSocial', label: 'Razão Social', hidden: 'md' },
    { key: 'nomeFantasia', label: 'Nome Fantasia' },
    { key: 'licenca', label: 'Licença', hidden: 'lg' },
    {
      key: 'ativo',
      label: 'Ativo',
      format: (value) => (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
  ];

  return (
    <GenericListPage
      title="Buscar Loja"
      data={mockLojas}
      columns={columns}
      searchField="cnpj"
      searchPlaceholder="Insira o CNPJ da loja"
      emptyMessage="Insira o CNPJ de uma loja no campo acima para poder visualizar e editar seus dados."
      newButtonLabel="Nova loja"
      onNew={() => setPage('lojas_new')}
      onEdit={(loja) => {
        onSelectLoja(loja);
        setPage('lojas_edit');
      }}
    />
  );
};

// pages/mobile/MobileListPage.tsx - Agora simplificado!
const MobileListPage = ({ setPage, onSelectUsuario }) => {
  const columns: Column<typeof mockUsuariosMobile[0]>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'E-mail', hidden: 'sm' },
    { key: 'tipo', label: 'Tipo', hidden: 'md' },
    { key: 'celular', label: 'Celular', hidden: 'lg' },
    {
      key: 'ativo',
      label: 'Ativo',
      format: (value) => (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
  ];

  return (
    <GenericListPage
      title="Buscar Usuário"
      data={mockUsuariosMobile}
      columns={columns}
      searchField="email"
      searchPlaceholder="Insira o e-mail do usuário"
      emptyMessage="Insira o e-mail de um usuário no campo acima..."
      newButtonLabel="Novo usuário"
      onNew={() => setPage('mobile_new')}
      onEdit={(usuario) => {
        onSelectUsuario(usuario);
        setPage('mobile_edit');
      }}
    />
  );
};
```

#### Resultado

```
ANTES:
- Lojas List: 100 linhas
- Mobile List: 100 linhas
- Suporte List: 100 linhas
Total: 300 linhas

DEPOIS:
- GenericListPage: 150 linhas (reutilizável)
- Lojas List: 20 linhas
- Mobile List: 20 linhas
- Suporte List: 20 linhas
Total: 210 linhas (30% redução!)

Bônus: Adicionar paginação? 1 arquivo, 1 mudança!
```

### SESSÃO 3: Conectar com API Real

#### Passo 1: Criar um Hook Customizado

```typescript
// src/hooks/useLojas.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Loja {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  licenca: string;
  ativo: boolean;
}

export const useLojas = () => {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLojas = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/lojas');
      setLojas(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar lojas');
    } finally {
      setLoading(false);
    }
  };

  const criarLoja = async (data: Omit<Loja, 'id'>) => {
    try {
      const response = await axios.post('/admin/lojas', data);
      setLojas([...lojas, response.data]);
      return response.data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar loja');
    }
  };

  const atualizarLoja = async (id: string, data: Partial<Loja>) => {
    try {
      const response = await axios.put(`/admin/lojas/${id}`, data);
      setLojas(lojas.map(l => l.id === id ? response.data : l));
      return response.data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar loja');
    }
  };

  const deletarLoja = async (id: string) => {
    try {
      await axios.delete(`/admin/lojas/${id}`);
      setLojas(lojas.filter(l => l.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao deletar loja');
    }
  };

  useEffect(() => {
    fetchLojas();
  }, []);

  return {
    lojas,
    loading,
    error,
    criarLoja,
    atualizarLoja,
    deletarLoja,
    refetch: fetchLojas,
  };
};
```

#### Passo 2: Usar o Hook

```typescript
const LojasListPage = ({ setPage, onSelectLoja }) => {
  const { lojas, loading, error } = useLojas();

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <GenericListPage
      data={lojas}
      // ... resto das props
    />
  );
};
```

### SESSÃO 4: Validação com Zod + React Hook Form

#### Antes (Sem Validação)
```typescript
<FormInput label="E-mail" id="email" type="email" />
// Usuario pode enviar "nao-é-email" e backend fica irritado
```

#### Depois (Com Validação)
```typescript
// src/schemas/loja.ts
import { z } from 'zod';

export const lojaSchema = z.object({
  cnpj: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido'),
  razaoSocial: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  nomeFantasia: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  ativo: z.boolean().default(true),
});

export type LojaInput = z.infer<typeof lojaSchema>;
```

```typescript
// Em LojaFormPage
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lojaSchema } from '@schemas/loja';

const LojaFormPage = ({ mode, loja, setPage }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(lojaSchema),
    defaultValues: loja,
  });

  const onSubmit = async (data) => {
    try {
      if (mode === 'new') {
        await criarLoja(data);
      } else {
        await atualizarLoja(loja.id, data);
      }
      setPage('lojas');
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col">
        <label htmlFor="cnpj" className="mb-1 text-sm font-medium text-gray-600">
          CNPJ
          <span className="text-red-500">*</span>
        </label>
        <input
          {...register('cnpj')}
          placeholder="00.000.000/0000-00"
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.cnpj && (
          <span className="text-red-500 text-xs mt-1">{errors.cnpj.message}</span>
        )}
      </div>
      {/* Mais campos */}
    </form>
  );
};
```

### Desafios Práticos para Você

#### Desafio 1: Criar Hook para UsuariosMobile
Baseando-se em `useLojas`, crie um `useUsuariosMobile` seguindo o mesmo padrão.

**Resposta esperada:**
```typescript
// Mesmo padrão, mas para:
interface UsuarioMobile {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  celular: string;
  ativo: boolean;
  parceiro: string;
  lojas: string[];
}

export const useUsuariosMobile = () => {
  // ... implementar fetchUsuarios, criar, atualizar, deletar
}
```

#### Desafio 2: Adicionar Toast Notifications
Use o `react-hot-toast` (já está no package.json):

```typescript
import toast from 'react-hot-toast';

const handleSubmit = async (data) => {
  try {
    await criarLoja(data);
    toast.success('Loja criada com sucesso!');
    setPage('lojas');
  } catch (err) {
    toast.error('Erro ao criar loja');
  }
};
```

#### Desafio 3: Implementar Loading States
Mostre um spinner enquanto carrega:

```typescript
{loading && (
  <div className="flex items-center justify-center p-10">
    <div className="animate-spin-slow">
      <Loader className="w-8 h-8 text-blue-600" />
    </div>
  </div>
)}
```

### SESSÃO 5: Estrutura de Projeto Profissional

Quando você estiver pronto para escalar, organize assim:

```
src/
├── app/
│   ├── App.tsx
│   └── App.css
├── features/
│   ├── auth/
│   │   ├── pages/
│   │   │   └── LoginPage.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── api/
│   │   │   └── authApi.ts
│   │   └── types/
│   │       └── auth.ts
│   ├── lojas/
│   │   ├── pages/
│   │   │   ├── LojasListPage.tsx
│   │   │   └── LojaFormPage.tsx
│   │   ├── hooks/
│   │   │   └── useLojas.ts
│   │   ├── components/
│   │   │   ├── LojaTable.tsx
│   │   │   └── LojaForm.tsx
│   │   ├── api/
│   │   │   └── lojasApi.ts
│   │   ├── schemas/
│   │   │   └── lojaSchema.ts
│   │   └── types/
│   │       └── loja.ts
│   ├── mobile/
│   │   └── (mesma estrutura)
│   └── suporte/
│       └── (mesma estrutura)
├── shared/
│   ├── components/
│   │   ├── Layout/
│   │   ├── Form/
│   │   ├── Table/
│   │   └── common/
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── api-client.ts
│   └── types/
│       └── common.ts
├── store/
│   ├── authStore.ts
│   └── uiStore.ts
├── main.tsx
└── index.css
```

### Conclusão

Este guia apresenta a jornada de melhoria:

1. **Nível 1:** Corrigir typos e erros óbvios
2. **Nível 2:** Refatorar para eliminar duplicação (DRY)
3. **Nível 3:** Conectar com APIs reais
4. **Nível 4:** Adicionar validação robusta
5. **Nível 5:** Estrutura profissional e escalável

Cada sessão prepara você para a próxima. Comece pela Sessão 1 e avance gradualmente.

---

**Dúvidas?** Revise os padrões e tente implementar o desafio. Se travar, é aí que acontece o aprendizado!

**Senior Mentor - Coaching Técnico MARGEM**
