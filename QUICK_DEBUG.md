# Quick Debug Guide - Painel Administrativo MARGEM

Guia rápido para resolver problemas comuns.

---

## 🔴 Problema: "White Screen" ou Blank Page

### Checklist
1. Abra DevTools: `F12`
2. Vá para aba **Console**
3. Procure por erros vermelhos

### Causas Comuns e Soluções

#### 1. Erro de Sintaxe JavaScript
```
TypeError: e.g is undefined
ou
Cannot read property 'target' of undefined
```

**Solução:** Procure por `e.g.` em event handlers. Deve ser `e.target`.

```bash
# Buscar no código
grep -r "e\.g\." src/
# Deveria estar vazio agora (foi corrigido)
```

#### 2. Módulo Não Encontrado
```
Failed to resolve 'lucide-react'
ou
Cannot find module '@components/...'
```

**Solução:**
```bash
npm install  # Reinstalar dependências
# Se ainda não funcionar:
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### 3. Erro de CSS
```
Unable to find Tailwind preset
ou
[postcss] plugin error: ...
```

**Solução:**
```bash
# Verificar configuração
npm run build  # Testa build
# Se falhar, reinstale tailwind
npm install -D tailwindcss postcss autoprefixer
```

---

## 🟠 Problema: Estilos Tailwind Não Aparecem

### Checklist
1. Abra DevTools: `F12` → **Elements/Inspector**
2. Clique em um elemento com classe Tailwind
3. Verifique se a classe está sendo aplicada

### Causas e Soluções

#### Tailwind Content Glob Incorreto
```javascript
// ❌ ERRADO
content: ['./index.html', './src/**/*.js']

// ✅ CORRETO
content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}']
```

**Verificar:** `tailwind.config.js`
```bash
grep "content:" tailwind.config.js
# Deve incluir .tsx e .jsx
```

#### Classe Tailwind Dinâmica
```javascript
// ❌ Tailwind não consegue encontrar strings dinâmicas
const color = isSaved ? 'green' : 'red';
className={`bg-${color}-500`}  // NÃO FUNCIONA!

// ✅ Usar diretamente
className={isSaved ? 'bg-green-500' : 'bg-red-500'}
```

#### Cache de Build Antigo
```bash
# Limpar cache Vite
rm -rf dist .vite
npm run dev
```

---

## 🟡 Problema: Componentes Não Renderizam

### Checklist
1. DevTools → **Components** tab (se React DevTools instalado)
2. Procure pelo componente na árvore
3. Verifique o estado (state) e props

### Causas Comuns

#### 1. Condicional Errada
```javascript
// ❌ searchTerm.length === 0 ?
// Quando vazio, mostra placeholder. Correto!
// Quando tem busca, mostra tabela. Correto!

// ❌ Mas se a busca não filtra nada:
if (filteredLojas.length === 0 && searchTerm !== '') {
  // Mostrar "nenhum encontrado"
}
```

#### 2. Map Sem Key
```javascript
// ❌ ERRADO
{lojas.map((loja, index) => <tr key={index}>)}
// Problema: Se reordenar, keys mudam!

// ✅ CORRETO
{lojas.map((loja) => <tr key={loja.id}>)}
```

#### 3. Estado Não Atualiza
```javascript
// ❌ Tentar mutar diretamente
const handleToggle = () => {
  loja.ativo = !loja.ativo;  // NÃO VAI RENDERIZAR!
};

// ✅ Criar novo objeto
const handleToggle = () => {
  setLoja({ ...loja, ativo: !loja.ativo });
};
```

---

## 🟢 Problema: Comportamento Inesperado

### 1. Busca Não Filtra
```javascript
// Verificar o filtro
const filtered = mockLojas.filter(loja =>
  loja.cnpj.includes(searchTerm.replace(/[\.\-\/]/g, ''))
);

// Debug:
console.log('Search term:', searchTerm);
console.log('Filtered:', filtered);
```

### 2. Formulário Não Salva
```javascript
// Atualmente faz apenas console.log
const handleSubmit = (e) => {
  e.preventDefault();
  console.log('Salvando dados da loja...');
  setPage('lojas');  // Volta para lista
};

// No futuro, isso chamará API:
// await api.post('/lojas', formData);
```

### 3. Sidebar Não Fecha em Mobile
```javascript
// Verificar se isSidebarOpen atualiza
const [isSidebarOpen, setIsSidebarOpen] = useState(false);

// Clicar em link deve chamar:
onClick={() => {
  setPage('lojas');
  setIsSidebarOpen(false);  // Fechar sidebar
}}
```

---

## 🔧 Ferramentas de Debug

### 1. React DevTools
```bash
# Instalar extensão do Chrome/Firefox
# https://react-devtools-tutorial.vercel.app/

# Depois:
# - Inspect componentes
# - Veja props e state em tempo real
# - Mude state e veja re-render
```

### 2. ESLint + Prettier
```bash
# Corrigir erros de código automaticamente
npm run lint
npm run format
```

### 3. Network Tab
```
DevTools → Network tab
- Vê requisições HTTP (quando conectado a API)
- Verifica status codes (200, 400, 500, etc)
- Vê tamanho e tempo de resposta
```

### 4. Console Avançado
```javascript
// Útil para debug
console.table([loja1, loja2]);  // Mostra em tabela
console.time('label');
// ... código ...
console.timeEnd('label');  // Mostra tempo decorrido

// Conditional debugging
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) console.log('Só em desenvolvimento');
```

---

## 📝 Checklist de Antes de Commitar

```bash
# 1. Rodou npm install?
npm list | head -20  # Vê dependências

# 2. Sem erros no console?
npm run dev
# F12 → Console → procura por 🔴 vermelho

# 3. Lint passa?
npm run lint

# 4. Build funciona?
npm run build

# 5. Sem warnings?
npm run build 2>&1 | grep -i warning
```

---

## 🚨 Emergências

### App não inicia
```bash
# 1. Cheque Node version
node --version  # Deve ser >= 18

# 2. Limpe tudo
rm -rf node_modules dist package-lock.json

# 3. Reinstale
npm install

# 4. Tente de novo
npm run dev
```

### Erro ao fazer build
```bash
# 1. Veja erro específico
npm run build

# 2. Geralmente é erro de TypeScript
npm run build -- --reporter=verbose

# 3. Ou erro de Tailwind
npm run build 2>&1 | grep -A5 "tailwindcss"
```

### Port 5173 em uso
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <número> /F

# Linux/Mac
lsof -i :5173
kill -9 <PID>

# Ou use porta diferente
npm run dev -- --port 3000
```

---

## 🔍 Debugging de Mudanças Recentes

Se fez uma mudança e quebrou:

### 1. Git Blame
```bash
git blame src/App.tsx | grep "e.g."
# Mostra quem fez a mudança ruim
```

### 2. Git Diff
```bash
git diff HEAD
# Mostra o que foi alterado
```

### 3. Reverter Mudança
```bash
git checkout src/App.tsx
# Volta arquivo para estado anterior
```

### 4. Git Log
```bash
git log --oneline | head -10
# Vê histórico de commits

git show <commit-hash>
# Vê o que mudou naquele commit
```

---

## 💡 Dicas Profissionais

### 1. Breakpoints no DevTools
```javascript
// Adicione debugger na linha que quer investigar
const handleClick = () => {
  debugger;  // Pausa aqui quando F12 está aberto
  setPage('lojas');
};
```

### 2. Console Inteligente
```javascript
// Ao invés de vários console.log:
const log = (label, value) => {
  console.log(`[${label}]`, value);
};

log('searchTerm', searchTerm);
log('filteredLojas', filteredLojas);

// Saída fica legível:
// [searchTerm] "51.137"
// [filteredLojas] [{...}, {...}]
```

### 3. Error Boundaries
```typescript
// Capturar erros em componentes filhos
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Algo deu errado</h1>;
    }
    return this.props.children;
  }
}

// Usar:
<ErrorBoundary>
  <LojasPage />
</ErrorBoundary>
```

---

## 📞 Checklist Final

Antes de dizer "está pronto":

- [ ] Roda sem erros em `npm run dev`
- [ ] Sem warnings no console (F12)
- [ ] Responsividade funciona (testar em mobile)
- [ ] `npm run lint` passa
- [ ] `npm run build` não tem erros
- [ ] Todos os cliques funcionam
- [ ] Busca filtra corretamente
- [ ] Formulários abrem/fecham
- [ ] Nenhum console.log ou debugger deixado

---

**Pronto para debugar? Boa sorte!**

Senior Mentor - Coaching Técnico MARGEM
