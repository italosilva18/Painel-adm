# MARGEM Admin Panel

Painel administrativo completo para gerenciamento do sistema MARGEM de controle de margem de lucro.

---

## Acesso ao Sistema

| Ambiente | URL |
|----------|-----|
| **Produção** | http://207.180.255.150:3000 |
| **API Backend** | http://207.180.255.150:5000 |

### Credenciais de Acesso

```
Email: suporte3@mpontom.com.br
Senha: 123456
```

---

## Status das Funcionalidades

### Páginas Implementadas

| Página | Rota | Status | Integração API |
|--------|------|--------|----------------|
| Login | `/login` | ✅ Completa | ✅ Real |
| Dashboard | `/dashboard` | ✅ Completa | ✅ Real |
| Lojas | `/lojas` | ✅ Completa | ✅ Real |
| Mobile | `/mobile` | ✅ Completa | ✅ Real |
| Suporte | `/suporte` | ✅ Completa | ✅ Real |
| Parceiros | `/parceiros` | ✅ Completa | ✅ Real |
| Automações | `/automacoes` | ✅ Completa | ✅ Real |
| Módulos | `/modulos` | ✅ Completa | ✅ Real |
| Relatórios | `/relatorios` | ✅ Completa | ✅ Real |

### Funcionalidades por Página

#### Dashboard
- ✅ Cards de estatísticas (lojas ativas, usuários mobile, suporte, parceiros)
- ✅ Gráficos de módulos ativos
- ✅ Atividade recente em tempo real
- ✅ Navegação rápida para outras páginas

#### Lojas
- ✅ Busca por CNPJ
- ✅ Consulta na Receita Federal (BrasilAPI)
- ✅ Auto-preenchimento de Estado e Cidade
- ✅ Cadastro e edição completa
- ✅ Toggle de serviços (Offerta, Oppinar, Prazzo, Scanner)
- ✅ Configuração de dias de operação

#### Mobile
- ✅ Busca por email ou telefone
- ✅ Cadastro e edição de usuários
- ✅ Vinculação de lojas ao usuário
- ✅ Toggle de status ativo/inativo

#### Suporte
- ✅ Busca por email
- ✅ Cadastro e edição de usuários
- ✅ Toggle de status

#### Parceiros
- ✅ Lista de parceiros
- ✅ Cadastro de novos parceiros
- ✅ Edição de parceiros existentes
- ✅ Validação de código duplicado

#### Automações
- ✅ Lista de automações por parceiro
- ✅ Cadastro e edição

#### Módulos
- ✅ Visualização dinâmica dos módulos
- ✅ Contagem de lojas por módulo
- ✅ Status de ativação

#### Relatórios
- ✅ Resumo de estatísticas
- ✅ Filtros por período e parceiro
- ✅ Tabela paginada de lojas
- ✅ Exportação para CSV

---

## Tecnologias

### Frontend
- **React** 18.2
- **TypeScript** 5.0
- **Vite** 5.0
- **Tailwind CSS** 3.4
- **Zustand** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **React Router** 6 - Navegação
- **Recharts** - Gráficos
- **Lucide React** - Ícones

### Backend
- **Go** 1.21
- **Fiber** v2 - Framework web
- **MongoDB** - Banco de dados
- **JWT** - Autenticação

---

## Comandos de Desenvolvimento

### Frontend (Docker - Recomendado)

```bash
# Iniciar ambiente de desenvolvimento
cd /root/margem-v5/margem-web-admin-v5
docker compose up -d margem-web-admin-v5-dev

# Ver logs
docker logs margem-web-admin-v5-dev -f

# Parar
docker compose down
```

### Frontend (Local)

```bash
cd /root/margem-v5/margem-web-admin-v5
npm install
npm run dev
```

### Backend (Docker)

```bash
cd /root/margem-v5/margem-api-admin-v5
docker compose up -d

# Ver logs
docker logs margem-api-admin-v5 -f
```

### Backend (Local)

```bash
cd /root/margem-v5/margem-api-admin-v5
go mod tidy
go run cmd/api/main.go
```

---

## Estrutura do Projeto

```
/root/margem-v5/
├── margem-web-admin-v5/           # Frontend React
│   ├── src/
│   │   ├── api/                   # Camada de API
│   │   │   ├── config.ts          # Configuração Axios
│   │   │   ├── types.ts           # Interfaces TypeScript
│   │   │   ├── errorHandler.ts    # Tratamento de erros
│   │   │   ├── interceptors.ts    # Middleware HTTP
│   │   │   └── services/          # Serviços por domínio
│   │   │       ├── auth.ts
│   │   │       ├── storeService.ts
│   │   │       ├── mobileService.ts
│   │   │       ├── supportService.ts
│   │   │       ├── partnerService.ts
│   │   │       ├── dashboardService.ts
│   │   │       ├── reportService.ts
│   │   │       ├── modulesService.ts
│   │   │       ├── referenceData.ts
│   │   │       └── cnpjService.ts
│   │   ├── components/            # Componentes React
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── LojasPage.tsx
│   │   │   ├── MobilePage.tsx
│   │   │   ├── SuportePage.tsx
│   │   │   ├── ParceirosPage.tsx
│   │   │   ├── AutomacoesPage.tsx
│   │   │   ├── ModulosPage.tsx
│   │   │   └── RelatoriosPage.tsx
│   │   ├── store/                 # Estado global (Zustand)
│   │   │   └── authStore.ts
│   │   ├── hooks/                 # React hooks
│   │   ├── utils/                 # Utilitários
│   │   └── AppRouter.tsx          # Rotas
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── vite.config.ts
│   └── package.json
│
└── margem-api-admin-v5/           # Backend Go
    ├── cmd/api/main.go            # Entry point
    ├── internal/
    │   ├── handlers/              # Controllers
    │   │   ├── auth.go
    │   │   ├── store.go
    │   │   ├── mobile.go
    │   │   ├── support.go
    │   │   ├── partners.go
    │   │   ├── dashboard.go
    │   │   ├── reports.go
    │   │   └── master_data.go
    │   ├── models/                # Modelos de dados
    │   ├── middleware/            # JWT, CORS, etc
    │   └── database/              # Conexão MongoDB
    ├── docker-compose.yml
    └── .env
```

---

## Endpoints da API

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/admin/login` | Login de administrador |

### Dashboard
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/dashboard/stats` | Estatísticas gerais |
| GET | `/admin/dashboard/activity` | Atividade recente |

### Lojas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/store?cnpj=` | Buscar loja por CNPJ |
| POST | `/admin/store` | Criar loja |
| PUT | `/admin/store?id=` | Atualizar loja |
| DELETE | `/admin/store?id=` | Deletar loja |

### Usuários Mobile
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/mobile?email=` | Buscar por email |
| GET | `/admin/mobile?phone=` | Buscar por telefone |
| POST | `/admin/mobile` | Criar usuário |
| PUT | `/admin/mobile?id=` | Atualizar usuário |
| DELETE | `/admin/mobile?email=` | Deletar usuário |
| POST | `/admin/mobile/store` | Vincular loja |
| DELETE | `/admin/mobile/store` | Desvincular loja |

### Usuários Suporte
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/support?email=` | Buscar por email |
| POST | `/admin/support` | Criar usuário |
| PUT | `/admin/support?id=` | Atualizar usuário |
| DELETE | `/admin/support?email=` | Deletar usuário |

### Parceiros
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/partners` | Listar parceiros |
| POST | `/admin/partners` | Criar parceiro |
| PUT | `/admin/partners/:id` | Atualizar parceiro |
| DELETE | `/admin/partners/:id` | Deletar parceiro |

### Relatórios
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/reports/summary` | Resumo de estatísticas |
| GET | `/admin/reports/stores` | Lista de lojas com filtros |

### Dados de Referência
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/admin/states` | Lista de estados |
| GET | `/admin/cities?estado=` | Cidades por estado |
| GET | `/admin/segments` | Segmentos de negócio |
| GET | `/admin/sizes` | Tamanhos de loja |

---

## Variáveis de Ambiente

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/admin
VITE_API_TIMEOUT=30000
```

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://user:pass@host:27017/db
MONGODB_DATABASE=margem
ADMIN_SECRET=your-jwt-secret
```

---

## Dados do Sistema

| Métrica | Valor |
|---------|-------|
| Total de Lojas | 7.077 |
| Lojas Ativas | 4.450 |
| Usuários Mobile | 5.051 |
| Usuários Suporte | 55 |
| Parceiros | 68 |

### Top Parceiros
1. BRASIL SOFTWARE - 946 lojas
2. G10 - 703 lojas
3. CRE-ARIUS - 658 lojas
4. HIPCOM - 410 lojas
5. SYSPDV - 377 lojas

---

## Troubleshooting

### Login retorna 500
- Verificar se MongoDB está conectado
- Verificar credenciais no banco de dados

### Cidades não carregam
- Verificar se o estado foi selecionado
- Verificar logs da API: `docker logs margem-api-admin-v5 -f`

### Hot reload não funciona
```bash
docker compose down
docker compose up -d --build
```

### Proxy não funciona (CORS)
- Verificar configuração em `vite.config.ts`
- Certificar que target aponta para API correta

---

## Licença

MIT

---

**Versão:** 2.0.0
**Última Atualização:** 17/12/2025
**Status:** ✅ Production Ready
