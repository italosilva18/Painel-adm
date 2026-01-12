# 🐳 MARGEM Admin Panel - Docker Setup

## Painel Administrativo React com Container Docker

Este documento contém todas as instruções para executar o painel administrativo MARGEM usando Docker.

---

## 📋 Pré-requisitos

- Docker Desktop instalado (Windows/Mac/Linux)
- Docker Compose v2.0+
- 4GB RAM disponível
- Porta 3000 livre (produção) ou 5173 (desenvolvimento)

---

## 🚀 Quick Start - Desenvolvimento

### 1. Clone e configure o ambiente:

```bash
# Entre na pasta do projeto
cd D:\MARGEM-2025\Painel-adm

# Copie o arquivo de ambiente
copy .env.example .env
```

### 2. Inicie o container de desenvolvimento:

```bash
# Usando Docker Compose
docker-compose up margem-admin-dev

# Ou usando npm script
npm run docker:dev
```

### 3. Acesse o painel:
- **URL:** http://localhost:5173
- **Hot Reload:** Ativo (alterações refletem instantaneamente)

---

## 🏗️ Build para Produção

### Método 1: Docker Compose (Recomendado)

```bash
# Build e executa o container de produção
docker-compose up margem-admin-prod -d

# Acesse em: http://localhost:3000
```

### Método 2: Docker Direto

```bash
# Build da imagem
docker build -t margem-admin:latest .

# Executar container
docker run -d \
  --name margem-admin \
  -p 3000:80 \
  -e VITE_API_URL=http://localhost:5001 \
  margem-admin:latest
```

### Método 3: Usando Scripts

```bash
# Dar permissão de execução (Linux/Mac)
chmod +x build.sh deploy.sh

# Build
./build.sh prod v1.0.0

# Deploy
./deploy.sh local v1.0.0
```

---

## 📦 Estrutura dos Containers

### Container de Desenvolvimento (`margem-admin-dev`)
- **Base:** node:18-alpine
- **Porta:** 5173
- **Features:** Hot reload, source maps, proxy para API
- **Volumes:** Código fonte montado para live editing

### Container de Produção (`margem-admin-prod`)
- **Base:** nginx:alpine
- **Porta:** 80 (mapeada para 3000 no host)
- **Features:** Gzip, cache headers, otimizado
- **Size:** ~25MB

---

## 🔧 Comandos Úteis

### Docker Compose

```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Ver logs
docker-compose logs -f margem-admin-dev

# Rebuild após mudanças
docker-compose up --build margem-admin-dev

# Limpar tudo
docker-compose down -v --rmi all
```

### Docker

```bash
# Listar containers rodando
docker ps

# Ver logs do container
docker logs margem-admin -f

# Entrar no container
docker exec -it margem-admin sh

# Parar container
docker stop margem-admin

# Remover container
docker rm margem-admin

# Remover imagem
docker rmi margem-admin:latest
```

### NPM Scripts

```bash
# Desenvolvimento com Docker
npm run docker:dev

# Produção com Docker
npm run docker:prod

# Build da imagem Docker
npm run docker:build

# Executar imagem Docker
npm run docker:run

# Parar containers
npm run docker:stop
```

---

## 🌐 Variáveis de Ambiente

### Principais variáveis:

| Variável | Descrição | Default |
|----------|-----------|---------|
| `VITE_API_URL` | URL da API backend | http://localhost:5001 |
| `VITE_JWT_SECRET` | Secret do JWT | #$100&&CLIENTES%%PAGANTES# |
| `NODE_ENV` | Ambiente | development |
| `PORT` | Porta do servidor | 5173 (dev) / 80 (prod) |

### Configuração por ambiente:

```bash
# Desenvolvimento
VITE_API_URL=http://localhost:5001
NODE_ENV=development

# Produção
VITE_API_URL=http://margem-api-admin:5001
NODE_ENV=production
```

---

## 🔌 Integração com Backend

O docker-compose.yml já inclui o backend API:

```yaml
services:
  margem-api-admin:
    image: gisctech/margem-api-admin:latest
    ports:
      - "5001:5001"
```

Para usar sua própria API local, ajuste o `VITE_API_URL`:

```bash
VITE_API_URL=http://host.docker.internal:5001  # Windows/Mac
VITE_API_URL=http://172.17.0.1:5001            # Linux
```

---

## 📊 Monitoramento

### Health Check

```bash
# Verificar saúde do container
curl http://localhost:3000/health

# Verificar via Docker
docker inspect margem-admin --format='{{.State.Health.Status}}'
```

### Métricas

```bash
# Ver uso de recursos
docker stats margem-admin

# Ver tamanho da imagem
docker images | grep margem-admin
```

---

## 🐛 Troubleshooting

### Problema: "Cannot connect to API"

**Solução:**
```bash
# Verifique se a API está rodando
docker ps | grep margem-api-admin

# Verifique a network
docker network ls
docker network inspect margem-network
```

### Problema: "Port already in use"

**Solução:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Problema: "Permission denied"

**Solução:**
```bash
# Linux/Mac
sudo chown -R $(whoami) .
chmod -R 755 .
```

### Problema: Hot reload não funciona

**Solução:**
```yaml
# No vite.config.ts, certifique-se de ter:
server: {
  watch: {
    usePolling: true  # Necessário para Docker no Windows
  }
}
```

---

## 🚢 Deploy em Produção

### 1. Build para produção:

```bash
# Build com tag de versão
docker build -t margem-admin:v1.0.0 .

# Tag como latest
docker tag margem-admin:v1.0.0 margem-admin:latest
```

### 2. Push para registry:

```bash
# DockerHub
docker tag margem-admin:latest gisctech/margem-admin:latest
docker push gisctech/margem-admin:latest

# Registry privado
docker tag margem-admin:latest registry.mpontom.com.br/margem-admin:latest
docker push registry.mpontom.com.br/margem-admin:latest
```

### 3. Deploy no Kubernetes:

```bash
# Aplicar manifesto
kubectl apply -f k8s-deployment.yaml

# Verificar deploy
kubectl rollout status deployment/margem-admin -n margem
```

---

## 📁 Estrutura de Arquivos

```
Painel-adm/
├── Dockerfile              # Imagem de produção (multi-stage)
├── Dockerfile.dev          # Imagem de desenvolvimento
├── docker-compose.yml      # Orquestração dos containers
├── nginx.conf              # Configuração do Nginx
├── .dockerignore           # Arquivos ignorados no build
├── .env.example            # Variáveis de ambiente exemplo
├── package.json            # Dependências e scripts
├── vite.config.ts          # Configuração do Vite
├── build.sh                # Script de build
├── deploy.sh               # Script de deploy
└── README-DOCKER.md        # Este arquivo
```

---

## 🔒 Segurança

### Boas práticas implementadas:

✅ Multi-stage build (imagem menor e mais segura)
✅ Usuário non-root no container
✅ Secrets via variáveis de ambiente
✅ Health checks configurados
✅ Security headers no Nginx
✅ Imagem Alpine (menor superfície de ataque)

### Recomendações adicionais:

```bash
# Scan de vulnerabilidades
docker scan margem-admin:latest

# Limitar recursos
docker run -d \
  --memory="512m" \
  --cpus="0.5" \
  margem-admin:latest
```

---

## 📈 Performance

### Otimizações aplicadas:

- **Gzip:** Compressão de assets
- **Cache:** Headers otimizados
- **Bundle splitting:** Chunks separados
- **Tree shaking:** Código não usado removido
- **Minificação:** JS/CSS minificados

### Métricas esperadas:

- **Tamanho da imagem:** ~25MB
- **Tempo de build:** ~2 minutos
- **Tempo de startup:** <5 segundos
- **Bundle size:** <100KB gzipped
- **Lighthouse score:** >90

---

## 🆘 Suporte

**Problemas ou dúvidas:**
- Email: suporte3@mpontom.com.br
- GitHub Issues: https://github.com/Margem-m2m/painel-admin/issues

**Logs úteis:**
```bash
# Ver todos os logs
docker-compose logs

# Logs específicos
docker logs margem-admin --tail 50 -f

# Salvar logs
docker logs margem-admin > logs.txt 2>&1
```

---

## ✅ Checklist de Produção

Antes de ir para produção, verifique:

- [ ] Variáveis de ambiente configuradas
- [ ] HTTPS/SSL configurado
- [ ] Backup do banco configurado
- [ ] Monitoramento ativo
- [ ] Health checks funcionando
- [ ] Logs centralizados
- [ ] Rate limiting configurado
- [ ] CORS configurado corretamente
- [ ] Secrets seguros (não hardcoded)
- [ ] Imagem scaneada por vulnerabilidades

---

**Versão:** 1.0.0
**Última atualização:** 08/11/2025
**Autor:** MARGEM Team