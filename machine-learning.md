# Machine Learning no Caixinha

## Visão Geral

O Caixinha usa **regressão linear simples** para prever quando cada produto vai acabar, com base no histórico real de consumo registrado pelo usuário.

O objetivo é responder: **"Dado o ritmo atual de uso, em quantos dias este produto vai acabar?"**

---

## Biblioteca utilizada

**[`ml-regression-simple-linear`](https://github.com/mljs/regression-simple-linear)**

```json
"ml-regression": "^6.3.0"
```

Parte do ecossistema `ml.js` — bibliotecas de machine learning em JavaScript puro, sem dependências nativas, compatíveis com Node.js e browser.

A classe usada é `SimpleLinearRegression`, que implementa o método dos **mínimos quadrados ordinários (OLS)** para ajustar uma reta `y = a·x + b` a um conjunto de pontos.

---

## Como funciona na prática

### 1. Coleta de dados

Toda vez que o usuário registra uma **saída** de produto (uso ou desperdício), o sistema grava um `stock_movement` com `type = 'out_used'` ou `'out_wasted'` e o timestamp exato.

```sql
SELECT sm.occurred_at
FROM stock_movements sm
JOIN lots l ON l.id = sm.lot_id
WHERE l.product_id = $1
  AND sm.type IN ('out_used', 'out_wasted')
ORDER BY sm.occurred_at ASC
```

### 2. Construção dos eixos

O modelo precisa de pares `(x, y)`:

- **x** = tempo decorrido em dias desde o primeiro consumo registrado
- **y** = número acumulado de unidades consumidas até aquele ponto

```typescript
const t0 = new Date(movements[0].occurred_at).getTime()

const x = movements.map((m) =>
  (new Date(m.occurred_at).getTime() - t0) / 86_400_000  // ms → dias
)

const y = movements.map((_, i) => i + 1)  // 1, 2, 3, ... N (contagem acumulada)
```

**Exemplo visual com 5 saídas:**

```
Unidades
consumidas
   5 |              •
   4 |           •
   3 |        •
   2 |     •
   1 |  •
     +------------------→ dias
        0   2   5   9  14
```

### 3. Treinamento da regressão

```typescript
const regression = new SimpleLinearRegression(x, y)
const slope = regression.slope   // unidades consumidas por dia
```

O `slope` (inclinação da reta) representa a **taxa de consumo diário**.

> Exemplo: `slope = 0.35` → o produto é consumido em média 0,35 unidades/dia, ou seja, uma unidade a cada ~3 dias.

### 4. Cálculo da previsão

```typescript
const totalStock = parseInt(stockRow?.total ?? '0', 10)
const daysToEmpty = totalStock / slope

const runoutDate = new Date()
runoutDate.setDate(runoutDate.getDate() + Math.round(daysToEmpty))
```

**Fórmula:**

```
dias_para_acabar = estoque_atual / taxa_de_consumo_diário
```

### 5. Cache no banco de dados

O resultado é salvo na tabela `consumption_predictions`:

```sql
INSERT INTO consumption_predictions(product_id, predicted_days_to_empty, predicted_runout_at, computed_at)
VALUES ($1, $2, $3, NOW())
ON CONFLICT (product_id) DO UPDATE
  SET predicted_days_to_empty = $2,
      predicted_runout_at = $3,
      computed_at = NOW()
```

---

## Quando o modelo é atualizado

### Atualização reativa

Após cada saída registrada, o sistema recalcula a previsão do produto afetado:

```typescript
// em src/app/actions/lots.ts
computeAndCachePrediction(productId).catch(() => {})
```

Executado de forma **assíncrona** — não bloqueia a resposta ao usuário.

### Atualização proativa (stale refresh)

A cada acesso ao dashboard, o sistema verifica produtos com previsões **desatualizadas há mais de 1 hora**:

```typescript
export async function refreshStalePredictions(): Promise<void> {
  const rows = await query<{ product_id: number }>(
    `SELECT DISTINCT l.product_id
     FROM stock_movements sm
     JOIN lots l ON l.id = sm.lot_id
     WHERE sm.type IN ('out_used', 'out_wasted')
     GROUP BY l.product_id
     HAVING COUNT(*) >= 3
     AND l.product_id NOT IN (
       SELECT product_id FROM consumption_predictions
       WHERE computed_at > NOW() - INTERVAL '1 hour'
     )`
  )
  await Promise.all(rows.map((r) => computeAndCachePrediction(r.product_id)))
}
```

---

## Requisitos mínimos para predição

| Condição | Valor |
|---|---|
| Mínimo de saídas registradas | **3 eventos** |
| Slope válido | `> 0` (consumo crescente) |
| Cache válido | **1 hora** antes de recomputar |

Se o produto tem menos de 3 saídas, a previsão é salva como `NULL` e não aparece no dashboard.

---

## Diagrama do fluxo completo

```
Usuário registra saída
         │
         ▼
  stock_movements INSERT
         │
         ▼
  computeAndCachePrediction(productId)
         │
    ┌────┴────┐
    │ < 3     │ ≥ 3 saídas
  NULL    Coleta saídas do DB
             │
             ▼
    Constrói vetores x[], y[]
    x = dias desde 1ª saída
    y = contagem acumulada
             │
             ▼
    SimpleLinearRegression(x, y)
    slope = unidades/dia
             │
             ▼
    daysToEmpty = estoque / slope
             │
             ▼
    Salva em consumption_predictions
             │
             ▼
    Dashboard exibe previsão 🤖
```

---

## Limitações conhecidas

| Limitação | Impacto |
|---|---|
| Não detecta sazonalidade | Produtos de uso irregular têm previsão imprecisa |
| Não considera múltiplos lotes | Usa soma total do estoque |
| Mudança brusca de padrão | Leva alguns dias para o modelo ajustar |
| Mínimo de 3 eventos | Produtos novos ficam sem previsão |
| Regressão linear pura | Assume consumo constante no tempo |

---

## Localização no código

| Arquivo | Função |
|---|---|
| `src/lib/ml.ts` | `computeAndCachePrediction()` — treina e salva |
| `src/lib/ml.ts` | `refreshStalePredictions()` — atualiza cache |
| `src/app/actions/lots.ts` | Chama `computeAndCachePrediction` após cada saída |
| `src/app/page.tsx` | Chama `refreshStalePredictions` no render do dashboard |
| `src/app/actions/dashboard.ts` | `getPredictions()` — lê da tabela de cache |
| `db/schema.sql` | Tabela `consumption_predictions` |
