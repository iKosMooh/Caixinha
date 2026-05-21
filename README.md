# 📦 Caixinha – Controle de Despensa Familiar

Uma aplicação web moderna e responsiva para controle de estoque, despensa e lista de compras com suporte offline, previsões inteligentes e interface otimizada para mobile.

> **Controle sua despensa. Nunca jogue dinheiro fora novamente.**

---

## 🌟 Características Principais

- **📱 Progressive Web App (PWA)** – Funciona offline com sincronização automática
- **📊 Dashboard Inteligente** – Visualização em tempo real de produtos vencidos, baixo estoque e previsões
- **📷 Scanner de Código de Barras** – Captura de barcodes via câmera (ZXing/ZBar)
- **🧠 Previsões de Consumo** – Algoritmo ML que previne desperdício
- **📋 Gerenciamento Completo**:
  - ➕ Entrada de produtos com lotes
  - ➖ Saída (uso ou desperdício) com rastreamento
  - 🔧 Ajustes de estoque
  - 🛒 Lista de compras integrada
- **🏠 Categorização Flexível** – Organização por local (Armário, Geladeira, Congelador, Despensa, Outro)
- **🔍 Busca Inteligente** – Integração com Open Food Facts para dados automáticos
- **💾 Armazenamento Híbrido** – PostgreSQL + IndexedDB para resiliência
- **🌐 Responsivo** – Mobile-first, funciona em qualquer dispositivo

---

## 🛠 Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 19.2, Next.js 16 (App Router), TypeScript 5 |
| **Styling** | Tailwind CSS v4, PostCSS |
| **Backend** | Next.js Server Actions |
| **Banco de Dados** | Supabase (PostgreSQL), node-postgres (pg 8.20) |
| **Auth DB client** | @supabase/supabase-js, @supabase/ssr |
| **Offline** | IndexedDB (idb 8.0), Service Worker |
| **ML** | ml-regression-simple-linear (regressão linear OLS) |
| **Scanner** | @zxing/library 0.22 (barcode detection) |
| **Deploy** | Vercel (serverless) |
| **DevTools** | ESLint 9, TypeScript 5, Tailwind Config |

---

## 📋 Pré-requisitos

- **Node.js** 18+ e npm
- Conta **Supabase** (gratuita) — [supabase.com](https://supabase.com)
- Um navegador moderno com suporte a:
  - Service Workers
  - IndexedDB
  - Camera API (opcional, para scanner)

---

## 🚀 Instalação & Setup Rápido

### 1️⃣ Clonar Repositório

```bash
git clone https://github.com/seu-usuario/caixinha.git
cd caixinha
```

### 2️⃣ Instalar Dependências

```bash
npm install
```

### 3️⃣ Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. **SQL Editor** → cole o conteúdo de `db/schema.sql` → **Run**
3. **Settings → Database → Connection pooling** → copie a connection string (Session mode, porta 5432)

### 4️⃣ Configurar Variáveis de Ambiente

Crie `.env.local` na raiz:

```env
# Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_XXXX

# Supabase → Settings → Database → Connection pooling (Session, porta 5432)
POSTGRES_URL=postgresql://postgres.SEU_PROJECT_REF:SUA_SENHA@aws-0-REGION.pooler.supabase.com:5432/postgres
```

### 5️⃣ Executar em Desenvolvimento

```bash
npm run dev
```

Abra **http://localhost:3000** no navegador. 🎉

---

## 📂 Estrutura do Projeto

```
caixinha/
├── public/
│   └── sw.js                          # Service Worker (PWA)
│
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── actions/                   # Server Actions (data layer)
│   │   │   ├── dashboard.ts          # Dados do dashboard
│   │   │   ├── lots.ts               # Gerenciamento de lotes
│   │   │   ├── products.ts           # Catálogo de produtos
│   │   │   └── shopping.ts           # Lista de compras
│   │   │
│   │   ├── entrada/                   # 📥 Entrada de Produtos
│   │   │   ├── page.tsx              # Layout da rota
│   │   │   ├── error.tsx             # Error boundary
│   │   │   └── EntradaForm.tsx       # Formulário interativo
│   │   │
│   │   ├── estoque/                   # 📦 Controle de Estoque
│   │   │   ├── page.tsx
│   │   │   ├── EstoqueClient.tsx
│   │   │   ├── error.tsx
│   │   │   └── [productId]/          # Detalhes de produto
│   │   │       ├── page.tsx
│   │   │       ├── error.tsx
│   │   │       └── LotActions.tsx    # Ações de lote
│   │   │
│   │   ├── lista/                     # 🛒 Lista de Compras
│   │   │   ├── page.tsx
│   │   │   ├── ListaClient.tsx
│   │   │   └── error.tsx
│   │   │
│   │   ├── saida/                     # 📤 Saída de Produtos
│   │   │   ├── page.tsx
│   │   │   ├── error.tsx
│   │   │   └── SaidaForm.tsx         # Formulário de saída
│   │   │
│   │   ├── layout.tsx                # Root layout com BottomNav
│   │   ├── page.tsx                  # Dashboard inicial
│   │   ├── error.tsx                 # Error boundary global
│   │   ├── globals.css               # Estilos globais
│   │   └── manifest.ts               # PWA Manifest
│   │
│   ├── components/                    # 🎨 Componentes Reutilizáveis
│   │   ├── AlertCard.tsx             # Card de alertas (vencido, baixo estoque)
│   │   ├── BarcodeScanner.tsx        # Câmera + scanner
│   │   ├── BottomNav.tsx             # Navegação inferior
│   │   ├── Button.tsx                # Botão customizado
│   │   ├── ErrorBoundary.tsx         # Error boundary genérico
│   │   ├── LocationPicker.tsx        # Seletor de local
│   │   ├── NumericInput.tsx          # Input para números
│   │   ├── ProductSearch.tsx         # Busca de produtos
│   │   ├── SemaphoreBadge.tsx        # Badge com status (🔴🟡🟢)
│   │   ├── ServiceWorkerRegister.tsx # Registra SW
│   │   ├── SplashScreen.tsx          # Tela inicial de carregamento
│   │   └── UndoToast.tsx             # Toast para desfazer ações
│   │
│   └── lib/                           # 🛠 Utilitários & Tipos
│       ├── db.ts                     # Pool de conexão PostgreSQL
│       ├── idb.ts                    # IndexedDB (offline queue)
│       ├── ml.ts                     # Previsões de consumo
│       ├── products-api.ts           # Open Food Facts API
│       └── types.ts                  # TypeScript Interfaces
│
├── db/
│   ├── schema.sql                     # Schema PostgreSQL completo
│   └── testdata.sql                   # Dados para testes
│
├── .env.local                         # Variáveis de ambiente (não commit)
├── .gitignore
├── next.config.ts                     # Configuração Next.js
├── tsconfig.json                      # TypeScript config
├── postcss.config.mjs                 # PostCSS config (Tailwind)
├── eslint.config.mjs                  # ESLint rules
├── package.json                       # Dependências & scripts
└── README.md                          # Este arquivo

```

---

## 🎯 Funcionalidades Detalhadas

### 📊 Dashboard (página inicial)

- **Resumo Visual**:
  - Total de produtos em estoque
  - Total de unidades disponíveis
- **Alertas Inteligentes**:
  - 🔴 Vencidos (vermelho) – expirar hoje ou antes
  - 🟡 Vencendo em breve (amarelo) – expirar nos próximos 7 dias
  - 🔵 Baixo estoque (azul) – menos de 2 unidades
- **Previsões de Consumo**:
  - Data estimada de fim baseada em histórico
  - Ícone de urgência (⚠️ crítico)
- **Botões de Acesso Rápido**:
  - ➕ Entrada
  - 📦 Estoque
  - 🛒 Lista
  - 📤 Saída

### ➕ Entrada de Produtos

1. **Busca**:
   - Por código de barras (scanner ou digitado)
   - Por nome de produto
   - Autocomplete de produtos existentes
2. **Busca Automática**:
   - Se não encontrado localmente, busca em Open Food Facts
   - Importa foto, marca, categoria automaticamente
3. **Dados do Lote**:
   - Quantidade
   - Data de validade (datepicker)
   - Local de armazenamento (dropdown)
   - Observações opcionais
4. **Confirmação**:
   - Revisa dados antes de confirmar
   - Salva e volta ao dashboard
   - Toast de sucesso

### 📦 Controle de Estoque

- **Listagem**:
  - Filtro por local (Armário, Geladeira, etc.)
  - Filtro por status (Fechado, Aberto, Acabou)
  - Ordenação por validade/quantidade
- **Detalhe de Produto**:
  - Foto (se disponível)
  - Nome, marca, código de barras
  - Todos os lotes com status
  - Data de entrada e validade
- **Ações por Lote**:
  - 📤 Usar (saída com uso)
  - 🗑️ Desperdiçar (saída com desperdício)
  - 🔧 Ajustar quantidade
  - ⚠️ Marcar como expirado
- **Histórico de Movimentações**:
  - Todas as entradas/saídas por lote
  - Tipo e quantidade de cada movimento
  - Timestamp exato

### 🛒 Lista de Compras

- **Adicionar Itens**:
  - Pelo catálogo de produtos
  - Texto livre (item genérico)
- **Gerenciar Lista**:
  - Marcar como comprado
  - Remover item
  - Limpar lista completa
- **Integração com Estoque**:
  - Quando item é comprado e entrada realizada, remove da lista automaticamente

### 📤 Saída de Produtos

- **Tipo de Saída**:
  - 🍽️ Uso (produto consumido/utilizado)
  - 🗑️ Desperdício (descartado/vencido)
  - 🔧 Ajuste (correção de estoque)
- **Rastreamento**:
  - Qual lote
  - Quantidade
  - Motivo/observação
  - Timestamp automático
- **Impacto na Previsão**:
  - Cada saída atualiza algoritmo ML
  - Nova previsão gerada em tempo real

---

## 🔧 Desenvolvimento

### Executar em Modo Dev

```bash
npm run dev
```

- Hot reload automático
- Debug no DevTools normalmente
- PostgreSQL conecta automaticamente

### Build para Produção

```bash
npm run build
npm start
```

### Lint & Type Check

```bash
npm run lint
```

Valida:
- TypeScript (tipos)
- ESLint (estilo de código)
- Sem warnings

---

## 📐 Decisões de Projeto

### ✅ Autenticação

**Status:** Não implementada

**Justificativa:** Uso doméstico de uma única casa/família. PIN do dispositivo ou biometria é suficiente.

**Extensão futura:**
```typescript
// Para multi-usuário, adicione middleware de sessão:
// import { getSession } from 'next-session'
// ou use NextAuth/Supabase Auth
```

### ✅ Banco de Dados

**PostgreSQL raw SQL** (sem ORM)

**Justificativa:**
- Controle total sobre queries
- Performance previsível
- Pool singleton em [src/lib/db.ts](src/lib/db.ts)
- Sem overhead de abstração

**Schema Highlights:**
```sql
-- Enums para tipo seguro
CREATE TYPE location_kind AS ENUM ('armario', 'geladeira', 'congelador', 'despensa', 'outro');
CREATE TYPE lot_status AS ENUM ('fechado', 'aberto', 'acabou');
CREATE TYPE movement_type AS ENUM ('in', 'out_used', 'out_wasted', 'adjust');

-- Relationships:
-- products → lots (1:N)
-- locations (seeds automático)
-- stock_movements (audit log)
```

### ✅ Machine Learning

> 📄 Documentação completa: **[machine-learning.md](machine-learning.md)**

**Regressão Linear Simples** (ml-regression-simple-linear)

**Como funciona:**
1. Coleta saídas (`out_*`) dos últimos 60 dias
2. Extrai timestamps → intervalo entre consumos
3. Treina modelo: y = ax + b (consumo médio por dia)
4. Predição = data_atual + (quantidade_atual / consumo_diário)

**Requisitos:**
- Mínimo 3 eventos de saída para treinar
- Atualiza automaticamente após cada saída
- Cache em `consumption_predictions` (não precisa recomputar)

**Limitações:**
- Não detecta sazonalidade
- Alterações bruscas de padrão levam ~7 dias para ajustar
- Ideal para produtos de consumo regular

### ✅ PWA & Offline

**Arquitetura:**

```
┌─────────────────────────────────────┐
│        Service Worker (SW)          │ ← Caching estático
│     (public/sw.js)                  │ ← Cache assets
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│    IndexedDB (src/lib/idb.ts)       │ ← Fila de operações
│    • Escritas offline pendentes     │ ← Sincroniza on-connect
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│    Server Actions (Next.js)         │ ← Requer rede
│    • PostgreSQL operations          │ ← Sempre sincroniza
└─────────────────────────────────────┘
```

**Status Atual:**
- ✅ SW caching (leitura offline funciona)
- ✅ IndexedDB fila de escritas (pronto, não conectado)
- ⏳ Background Sync (arquitetura pronta, não implementado)

**Para Ativar Background Sync:**

```typescript
// Em src/components/ServiceWorkerRegister.tsx:
if ('serviceWorker' in navigator && 'SyncManager' in window) {
  // Registra fila IndexedDB como background sync
}
```

---

## 🧪 Tipos TypeScript

Todos em [src/lib/types.ts](src/lib/types.ts):

```typescript
export interface Product {
  id: bigint
  barcode: string | null
  name: string
  brand: string | null
  image_url: string | null
  default_category: string | null
  created_at: Date
}

export interface Lot {
  id: bigint
  product_id: bigint
  location_id: bigint
  qty: number
  status: 'fechado' | 'aberto' | 'acabou'
  expiry_date: Date | null
  entered_at: Date
  opened_at: Date | null
  finished_at: Date | null
}

export interface StockMovement {
  id: bigint
  lot_id: bigint
  type: 'in' | 'out_used' | 'out_wasted' | 'adjust'
  qty: number
  occurred_at: Date
  note: string | null
}

export interface ConsumptionPrediction {
  lot_id: bigint
  estimated_end_date: Date
  daily_consumption: number
  priority: 'urgente' | 'normal' | 'baixa'
}
```

---

## 🚨 Tratamento de Erros

Cada rota possui `error.tsx`:

```
src/app/
├── error.tsx              ← Fallback global
├── entrada/error.tsx      ← Específico de entrada
├── estoque/error.tsx      ← Específico de estoque
├── saida/error.tsx        ← Específico de saída
└── lista/error.tsx        ← Específico de lista
```

**ErrorBoundary genérico** ([src/components/ErrorBoundary.tsx](src/components/ErrorBoundary.tsx)):

```typescript
export default function ErrorBoundary({ error, reset }: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <h2 className="text-red-900 font-bold">Algo deu errado</h2>
      <p className="text-red-700 text-sm mt-1">{error.message}</p>
      <button onClick={reset} className="mt-3 bg-red-600 text-white px-3 py-1 rounded">
        Tentar Novamente
      </button>
    </div>
  )
}
```

---

## 📱 PWA Manifest & Installation

**Manifest:** [src/app/manifest.ts](src/app/manifest.ts)

```typescript
export default {
  name: 'Caixinha',
  short_name: 'Caixinha',
  description: 'Controle de despensa para toda a família',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#2563eb',
  icons: [
    {
      src: '/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
}
```

**Como instalar:**
- iOS: Safari → Compartilhar → Adicionar à Tela Inicial
- Android: Menu → Instalar app
- Desktop: Menu → Instalar

---

## 📦 Gerar .apk (Android) e .exe (Windows)

O app é uma **PWA completa** — manifest, Service Worker e ícones já estão prontos. Para empacotar como APK/EXE nativo usa-se **TWA via PWABuilder**, sem nenhuma mudança no código.

### Pré-requisito: Deploy em HTTPS

PWABuilder precisa de URL pública com HTTPS. Opção mais rápida: **Vercel**.

```bash
npm i -g vercel
vercel
```

> ⚠️ Configure as variáveis `POSTGRES_URL`, `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` no painel do Vercel (Settings → Environment Variables).  
> Use a **Session Pooler** URL do Supabase (porta 5432) — a conexão direta é IPv6 only e não funciona no Vercel.

### Gerar .apk — Android TWA

1. Acesse **[pwabuilder.com](https://www.pwabuilder.com/)**
2. Cole a URL do deploy (ex: `https://caixinha.vercel.app`)
3. Clique **Start** → aguarda análise do manifest
4. Aba **Package** → **Android** → **Generate Package**
5. Baixa `.apk` pronto para instalar ou submeter na Play Store

### Gerar .exe — Windows MSIX

Mesmo fluxo no PWABuilder:

- Aba **Package** → **Windows** → **Generate Package**
- Baixa `.msix` — instalável no Windows 10/11

**Alternativa sem instalador:** Edge/Chrome mostram "Instalar aplicativo" automaticamente ao acessar a URL — sem `.exe`, sem PWABuilder.

### Checklist antes de gerar

| Item | Status |
|---|---|
| `icon-192.png` em `/public/` | ✅ |
| `icon-512.png` em `/public/` | ✅ |
| `manifest.ts` completo | ✅ |
| `sw.js` registrado | ✅ |
| Deploy HTTPS | ⬜ fazer |
| `POSTGRES_URL` (Session Pooler) no Vercel | ⬜ configurar |

**Caminho mais rápido:** `vercel` → `pwabuilder.com` → baixar. ~10 minutos.

---

## 🔐 Segurança

✅ **Implementado:**
- Variáveis de ambiente para todas as credenciais
- Server Actions isolados (sem exposição de DB)
- Query parameterization (proteção SQL injection)
- CSRF protection nativa do Next.js
- Headers de cache corretos (`no-store` para dados)

⚠️ **Recomendações para Produção:**
- [ ] Adicione autenticação (Supabase, Auth0, etc.)
- [ ] Rate limiting (middleware)
- [ ] HTTPS obrigatório (Vercel, Railway, etc.)
- [ ] Backup automático PostgreSQL
- [ ] Monitoramento de erros (Sentry)
- [ ] WAF (Web Application Firewall)

---

## 🐛 Troubleshooting

### ❌ Erro: "Conneção ECONNREFUSED 127.0.0.1:5432"

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
psql -U postgres -c "SELECT 1"

# Se não, iniciar:
# macOS
brew services start postgresql
# Linux
sudo service postgresql start
# Windows
net start PostgreSQL14 # (versão pode variar)

# Validar variáveis de ambiente
echo $DATABASE_URL
```

### ❌ Erro: "relation 'products' does not exist"

**Solução:**
```bash
# Schema não foi executado
psql caixinha_db < db/schema.sql
```

### ❌ Service Worker não registra

1. Abrir DevTools → Application → Service Workers
2. Verificar se `public/sw.js` existe
3. Validar headers do SW:
   ```
   Content-Type: application/javascript
   Cache-Control: no-cache
   ```
4. Em produção, usar HTTPS

### ❌ Scanner de barcode não funciona

- Permitir acesso à câmera no navegador
- Em produção (HTTPS), usar `https://` explícito
- ZXing suporta: EAN-13, UPC-A, QR Code, Aztec, PDF417

### ❌ Previsão retorna `null`

- Necessário mínimo 3 eventos de saída para treinar
- Esperar 7+ dias de histórico para precisão melhor
- Validar tabela `stock_movements`

---

## 📈 Roadmap & Melhorias Futuras

- [ ] **Autenticação Multi-usuário** (Supabase Auth)
- [ ] **Sincronização em Tempo Real** (WebSocket/Realtime)
- [ ] **Notificações Push** (browser notification API)
- [ ] **Exportação de Relatórios** (PDF, CSV)
- [ ] **Integração com APIs de Compras** (Amazon, Carrefour)
- [ ] **Análise de Desperdício** (gráficos por categoria)
- [ ] **Receitas Sugeridas** (baseada em estoque)
- [ ] **Compartilhamento de Lista** (com família)
- [ ] **NFC Integration** (etiquetas NFC em produtos)
- [ ] **Dark Mode** (tema escuro)
- [ ] **Internacionalização** (multi-idioma)

---

## 🤝 Contribuindo

1. **Fork** o repositório
2. **Crie uma branch** (`git checkout -b feature/minha-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona minha funcionalidade'`)
4. **Push** para a branch (`git push origin feature/minha-funcionalidade`)
5. **Abra um Pull Request**

**Antes de submeter:**
```bash
npm run lint          # Sem erros
npm run build         # Build sucesso
```

---

## 📄 Licença

MIT © 2026. Veja [LICENSE](LICENSE) para detalhes.

---

## 📧 Contato & Suporte

- 🐛 **Issues:** [GitHub Issues](https://github.com/seu-usuario/caixinha/issues)
- 💬 **Discussões:** [GitHub Discussions](https://github.com/seu-usuario/caixinha/discussions)

---

## 🙏 Agradecimentos

- [Open Food Facts](https://world.openfoodfacts.org/) – API de dados de produtos
- [ZXing](https://github.com/zxing/zxing) – Detecção de código de barras
- [Tailwind CSS](https://tailwindcss.com/) – Styling utilities
- [Next.js](https://nextjs.org/) – Framework web
- [PostgreSQL](https://www.postgresql.org/) – Banco de dados robusto

---

<div align="center">

**Desenvolvido com ❤️ para reduzir desperdício e organizar a despensa da família**

*Última atualização: maio 2026*

</div>

```sql
-- O schema.sql já insere os 5 locais padrão:
-- Armário, Geladeira, Congelador, Despensa, Outro

-- Para verificar:
SELECT * FROM locations;
```

### Ícones PWA

Coloque arquivos `icon-192.png` e `icon-512.png` na pasta `public/` para que o PWA funcione corretamente. Use ferramentas como [realfavicongenerator.net](https://realfavicongenerator.net/).

## Estrutura de arquivos

```
src/
  app/
    actions/           # Server Actions (mutations)
      dashboard.ts     # Queries para alertas do dashboard
      lots.ts          # CRUD de lotes + FEFO
      products.ts      # Busca/criação de produtos + Open Food Facts
      shopping.ts      # Lista de compras
    entrada/           # Rota /entrada — registrar entrada
    estoque/           # Rota /estoque — lista e detalhe
    lista/             # Rota /lista — lista de compras + WhatsApp
    saida/             # Rota /saida — registrar saída (FEFO)
    page.tsx           # Dashboard (/)
    layout.tsx         # Root layout com BottomNav + SW
    manifest.ts        # Web App Manifest
  components/
    AlertCard.tsx      # Card de alerta com contagem
    BarcodeScanner.tsx # Scanner via câmera (@zxing/browser)
    BottomNav.tsx      # Navegação bottom tab
    Button.tsx         # Botão grande (min 52px, WCAG AA)
    LocationPicker.tsx # Botões de local (Armário, Geladeira...)
    NumericInput.tsx   # Input numérico com inputmode="numeric"
    ProductSearch.tsx  # Busca de produto com autocomplete
    SemaphoreBadge.tsx # Semáforo de validade (verde/amarelo/vermelho)
    ServiceWorkerRegister.tsx
    UndoToast.tsx      # Toast com desfazer (10s)
  lib/
    db.ts              # Pool PostgreSQL
    idb.ts             # Fila offline IndexedDB (idb)
    ml.ts              # Regressão linear (ml-regression-simple-linear)
    products-api.ts    # Open Food Facts API
    types.ts           # Tipos TypeScript
db/
  schema.sql           # DDL completo com trigger e views
public/
  sw.js                # Service worker
```

## Funcionalidades implementadas

- Dashboard com alertas (vencendo, vencidos, acabando)
- Entrada via código de barras (câmera) ou manual
- Auto-preenchimento via Open Food Facts
- Lotes com FEFO automático na saída
- Status por lote: Fechado / Aberto / Acabou
- Motivo de saída: "Usei tudo" / "Joguei fora"
- 5 locais predefinidos com ícones
- Semáforo de validade (colorblind-safe: cor + ícone)
- Lista de compras + compartilhamento WhatsApp
- Previsão ML de consumo (regressão linear)
- PWA com service worker e manifest
- Undo toast após ações destrutivas (10s)
- Zerar/corrigir quantidade por lote
- Inputs numéricos com inputmode="numeric"
- Tap targets mínimos 44px, fontes maiores que 18px
- Audio beep no scan de código de barras
- Fila offline IndexedDB (estrutura pronta)

## Funcionalidades diferidas

- **PIN de acesso**: Não implementado. Arquitetura suporta um middleware simples. Prioridade baixa para uso doméstico único.
- **Replay automático de offline writes**: A fila IndexedDB está implementada em `src/lib/idb.ts`, mas o replay automático via background sync não foi conectado — Server Actions requerem rede. Extensão possível com um route handler dedicado chamado periodicamente.
- **Botão "Zerar Local"**: Implementado no action `clearLocation` em `src/app/actions/lots.ts`, mas sem botão na UI — pode ser adicionado ao `/estoque` com filtro por local.

## Build

```bash
npm run build  # Produção
npm run dev    # Desenvolvimento (Turbopack)
```
