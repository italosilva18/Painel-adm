# GEMINI Project Context: Painel Administrativo MARGEM

## Visão Geral do Projeto

Este é o painel administrativo para o sistema MARGEM. É uma aplicação web moderna construída com **React**, **TypeScript**, **Vite** e estilizada com **TailwindCSS**. O objetivo principal é fornecer uma interface para gerenciar os dados e operações do sistema, que, conforme o arquivo `esquema bd margem.txt`, inclui coleções como `admins`, `stores`, `mobiles`, `partners`, `reports`, entre outras.

A aplicação já possui uma camada de integração de API bem definida e robusta, utilizando `axios` com interceptadores para autenticação e tratamento de erros, além de hooks customizados (`useAuth`, `useStores`, etc.) para facilitar a comunicação com o backend.

## Objetivo Principal

O objetivo é **expandir e melhorar o painel administrativo** para cobrir todas as funcionalidades necessárias para gerenciar as coleções de dados definidas no `esquema bd margem.txt`. Isso envolve:

1.  **Desenvolver a API Backend:** Criar os endpoints necessários para as operações de CRUD (Create, Read, Update, Delete) em todas as coleções do banco de dados (`margem`, `mpontom`, `offerta`, `oppinar`).
2.  **Melhorar o Frontend:** Aprimorar a interface do usuário (UI) e a experiência do usuário (UX), criando páginas e componentes para cada uma das áreas administrativas.
3.  **Integrar Frontend e Backend:** Conectar as novas páginas e componentes do frontend com os endpoints da API.

## Estrutura do Projeto

O projeto segue uma arquitetura bem organizada, separando as responsabilidades em diferentes camadas:

-   `src/api/`: Contém toda a lógica de comunicação com a API, incluindo configuração do `axios`, serviços para cada recurso e tratamento de erros.
-   `src/components/`: Armazena os componentes React reutilizáveis.
-   `src/hooks/`: Hooks customizados que abstraem a lógica de estado e a busca de dados.
-   `src/pages/`: Componentes que representam as páginas da aplicação.
-   `src/store/`: Gerenciamento de estado global com `zustand`.
-   `src/types/`: Definições de tipos TypeScript para garantir a segurança de tipos em todo o projeto.
-   `src/utils/`: Funções utilitárias, como formatação e validação.

## Como Construir e Rodar o Projeto

### Pré-requisitos

-   Node.js (versão >= 18.0.0)
-   npm (versão >= 9.0.0)
-   Docker (opcional, para rodar em contêiner)

### Instalação

1.  Clone o repositório (se aplicável).
2.  Instale as dependências:
    ```bash
    npm install
    ```

### Rodando em Desenvolvimento

1.  Crie um arquivo `.env` a partir do `.env.example` e configure a variável `VITE_API_URL` para apontar para o backend.
2.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
    A aplicação estará disponível em `http://localhost:3000`.

### Build para Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
```

Os arquivos serão gerados no diretório `dist/`.

### Testes

Para rodar os testes unitários e de integração:

```bash
npm run test
```

## Convenções de Desenvolvimento

-   **Estilo de Código:** O projeto utiliza `ESLint` e `Prettier` para manter um estilo de código consistente. Use `npm run lint` para verificar e `npm run format` para formatar o código.
-   **Commits:** (TODO: Definir um padrão de commit, como o Conventional Commits).
-   **Componentes:** Crie componentes pequenos e reutilizáveis sempre que possível.
-   **Tipagem:** Todo o código deve ser fortemente tipado com TypeScript.
