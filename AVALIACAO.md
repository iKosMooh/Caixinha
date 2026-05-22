# Avaliação do Projeto — Caixinha
> Sistema de Gestão de Estoque para a **Casa da Criança**

---

## 1. Apresentação da Problemática — `1.5 pts`

### A Problemática
A **Casa da Criança** é uma instituição de caridade que depende de doações e voluntários para manter seu estoque de alimentos, produtos de higiene e materiais de uso cotidiano. O problema central identificado:

- **Desperdício silencioso**: produtos vencendo no fundo da despensa sem que ninguém perceba
- **Falta de rastreabilidade**: ninguém sabe quantas unidades existem de cada item, onde estão guardadas ou quando foram doadas
- **Lista de compras improvisada**: pedidos de doação ou compras feitos de cabeça ou em papel, sem histórico
- **Sem acesso tecnológico especializado**: a instituição não tem equipe de TI nem budget para sistemas ERP tradicionais

**Nenhum sistema simples e gratuito resolvia todos esses pontos juntos**, especialmente com foco em mobile para voluntários que operam com celular.

---

## 2. Proposta de Resolução do Problema — `1.5 pts`

### Originalidade e Criatividade

O **Caixinha** resolve cada ponto da problemática com uma funcionalidade direta:

| Problema | Solução no Caixinha |
|---|---|
| Produtos vencendo | Semáforo visual (🔴🟡🟢) em cada lote + sugestões automáticas na lista de compras |
| Sem rastreabilidade | Lotes por localização física (prateleira, armário, geladeira) com histórico completo de movimentações |
| Lista improvisada | Lista de compras digital com autocomplete do estoque, compartilhamento via WhatsApp e impressão |
| Barreira tecnológica | PWA instalável no celular sem App Store, interface mobile-first em português |
| Acesso não autorizado | PIN de 4 dígitos protegendo o sistema, configurável pelo gestor |

**Diferencial criativo**: o sistema **aprende o padrão de consumo** de cada produto e sugere automaticamente o que está acabando ou vencendo — sem que o voluntário precise checar produto por produto. A lista de compras "pensa junto" com quem cuida do estoque.

---

## 3. Objetividade e Domínio — `1.5 pts`

### Pontos de Domínio Técnico a Demonstrar na Apresentação

1. **Arquitetura Server Components + Client Components** (Next.js 16 App Router): explicar por que Server Components reduzem bundle e melhoram performance em dispositivos modestos
2. **Supabase como backend gerenciado**: banco PostgreSQL em nuvem, sem custo inicial, sem manutenção de servidor
3. **PWA/TWA**: como o app é instalado no Android sem Google Play, usando apenas o navegador
4. **ML integrado**: SimpleLinearRegression calculando dias restantes por produto com dados reais de uso
5. **PIN no banco**: segurança sem .env, funciona em ambiente serverless (Vercel)

**Fluxo completo para demonstrar ao vivo**:
```
Abrir app → Entrar PIN → Ver dashboard com alertas →
Estoque → Produto → Ver lotes + histórico →
Lista de compras → Autocomplete → Adicionar → Compartilhar WhatsApp
```

---

## 4. Ferramentas e Técnicas — `1.5 pts`

### Stack Completo

#### Frontend
| Ferramenta | Papel |
|---|---|
| **Next.js 16** (App Router) | Framework React com Server Actions, SSR, rotas dinâmicas |
| **React 19** | UI reativa com `useTransition`, `useCallback`, `useRef` |
| **TypeScript** | Tipagem estrita em todo o projeto |
| **Tailwind CSS v4** | Estilização utility-first, responsiva, sem CSS customizado |

#### Backend / Dados
| Ferramenta | Papel |
|---|---|
| **Supabase** | PostgreSQL gerenciado em nuvem (plano gratuito) |
| **pg (node-postgres)** | Driver direto com Transaction Pooler (porta 6543) |
| **Server Actions** | Mutações sem API REST — código servidor chamado direto do cliente |

#### Machine Learning
| Ferramenta | Papel |
|---|---|
| **ml-regression-simple-linear** | Regressão linear simples para prever consumo diário |

#### Infraestrutura
| Ferramenta | Papel |
|---|---|
| **Vercel** | Deploy automático via GitHub, edge network global |
| **PWABuilder** | Empacotamento do PWA em `.apk` (Android) e `.exe` (Windows) |

#### Técnicas Utilizadas
- **Regressão Linear** sobre histórico de movimentações para predição de estoque zerado
- **Transaction Pooler** para compatibilidade IPv4 em ambiente serverless
- **Session Storage** para controle de splash screen e autenticação PIN por sessão
- **`useTransition`** para mutations não-bloqueantes com feedback visual de pending
- **Semáforo de validade** baseado em dias restantes (verde/amarelo/vermelho)
- **Undo Toast** para remoções acidentais na lista de compras

---

## 5. Repositório e Serviço em Nuvem — `1.0 pt`

### GitHub
- Repositório versionado com commits descritivos
- Branch `master` com histórico de desenvolvimento

### Nuvem
| Serviço | Função | Custo |
|---|---|---|
| **Vercel** | Hospedagem do app Next.js | Gratuito (Hobby) |
| **Supabase** | Banco PostgreSQL + Connection Pooler | Gratuito (Free tier) |

**URL de produção**: `https://caixinha-gamma.vercel.app`

Deploy automático: cada push para `master` → Vercel faz build e publica em ~60 segundos.

---

## 6. Telas do Aplicativo — `1.5 pts`

### Telas Implementadas

#### Splash Screen
- Logo animada com fade-out suave (8.7s)
- Exibida uma vez por sessão

#### Dashboard (`/`)
- Contadores: total de produtos, lotes, alertas de validade, estoque baixo
- Cards de alerta com semáforo visual imediato

#### Lista de Compras (`/lista`)
- Sugestões automáticas agrupadas por motivo (vencido 🔴 / vencendo 🟡 / acabando 🔵)
- Input com **autocomplete** dos produtos cadastrados (imagem + marca)
- Navegação por teclado (↑↓ Enter Escape)
- Botão de marcar como comprado com animação ✓
- Compartilhar via WhatsApp e imprimir

#### Estoque (`/estoque`)
- Cards de produtos com semáforo de validade
- Busca por nome/marca
- Acesso rápido ao histórico de cada produto

#### Detalhe do Produto (`/estoque/[id]`)
- Todos os lotes com localização, quantidade, validade, datas
- Ações por lote: registrar uso, desperdício, ajuste
- Histórico completo de movimentações inline

#### Histórico Completo (`/historico/[id]`)
- Timeline agrupada por dia
- Totalizadores: entradas, usos, desperdícios, ajustes
- Detalhes do lote por evento

#### Configurações (`/configuracoes`)
- Alterar PIN de 4 dígitos
- Validação do PIN atual antes de trocar

#### PinGate (overlay global)
- Numpad visual + suporte a teclado físico
- Protege todas as rotas do app

### Critérios de Interface
- ✅ Mobile-first (mínimo 44px em todos os alvos de toque)
- ✅ Português brasileiro em toda a interface
- ✅ Feedback visual em toda ação (pending, erro, sucesso)
- ✅ Acessibilidade: `aria-label`, `aria-expanded`, `role="listbox"` no autocomplete
- ✅ Instalável como PWA (ícone na home screen, sem barra de endereço)

---

## 7. Aprendizagem de Máquina — Integração Nativa

### Como o ML está integrado (não separado)

O modelo não é um módulo isolado — **cada ação do usuário alimenta o aprendizado**:

```
Usuário registra saída de produto
        ↓
Movimento salvo em stock_movements (com timestamp)
        ↓
consumption_predictions recalculado (TTL 1h)
   → slope = unidades consumidas por dia (regressão linear)
   → daysToEmpty = estoque_atual / slope
        ↓
Dashboard mostra "Acaba em ~X dias"
Lista de compras sugere automaticamente o produto
```

### Algoritmo
- **Modelo**: `SimpleLinearRegression` (biblioteca `ml-regression-simple-linear`)
- **X**: dias desde o primeiro movimento do produto
- **Y**: quantidade acumulada consumida até aquele dia
- **Saída**: `slope` = taxa de consumo diário em unidades
- **Mínimo**: 3 eventos para calcular (evita predições com dados insuficientes)
- **Cache**: tabela `consumption_predictions` com coluna `computed_at` — recomputa após 1h

### Integração com UX
O usuário **nunca vê o modelo diretamente**. O que ele vê:
- Badge "Acabando" na lista de sugestões → gerado pelo ML
- "Acaba em ~X dias" no dashboard → calculado pelo ML
- Sugestão automática ao abrir a lista de compras → acionada pelo ML

Isso cumpre o critério de **integração imperceptível**: a IA é o motor por trás de uma UX simples.

---

## Resumo da Pontuação Esperada

| Critério | Nota Máx. | Avaliação |
|---|---|---|
| Apresentação da Problemática | 1.5 | Casa da Criança sem sistema de gestão → desperdício + desordem |
| Proposta de Resolução | 1.5 | PWA instalável, gratuito, sugestões automáticas, histórico completo |
| Objetividade e Domínio | 1.5 | Stack moderno com justificativa técnica para cada escolha |
| Ferramentas e Técnicas | 1.5 | Next.js 16, Supabase, Vercel, ML, PWA/TWA, TypeScript |
| Repositório e Nuvem | 1.0 | GitHub + Vercel (deploy automático) + Supabase (DB gerenciado) |
| Telas do Aplicativo | 1.5 | 7 telas funcionais, mobile-first, acessíveis, em português |
| Aprendizagem de Máquina | — | Regressão linear integrada ao fluxo de sugestões, invisível ao usuário |
| **Total** | **9.5** | |
