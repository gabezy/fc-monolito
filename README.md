# FC Monolito

Monolito modular em TypeScript desenvolvido no curso Full Cycle. Módulos em `src/modules`:

- `client-adm`
- `invoice`
- `payment`
- `product-adm`
- `store-catalog`

## Pré-requisitos

- Node.js 16+ (testado com Node 20)
- npm

Os testes de integração usam SQLite em memória (`sqlite3`), então nenhum banco de dados externo é necessário.

## Instalação

```bash
npm install
```

## Rodando os testes

Rodar todos os testes (faz a checagem de tipos com `tsc --noEmit` e depois roda o Jest):

```bash
npm test
```

Rodar só o Jest, sem checagem de tipos (mais rápido):

```bash
npx jest
```

Rodar os testes de um módulo:

```bash
npx jest src/modules/invoice
```

Rodar um arquivo de teste específico:

```bash
npx jest src/modules/invoice/facade/invoice.facade.spec.ts
```

Rodar um teste pelo nome:

```bash
npx jest -t "should find an invoice"
```

Modo watch (roda novamente ao salvar arquivos):

```bash
npx jest --watch
```

Relatório de cobertura:

```bash
npx jest --coverage
```

## Estrutura dos testes

Os testes ficam ao lado do código, com sufixo `.spec.ts`:

| Camada | Exemplo | Tipo |
|---|---|---|
| Domínio | `invoice/domain/invoce.spec.ts` | Unitário |
| Use case | `invoice/usecase/find-invoice/find-invoice.usecase.spec.ts` | Unitário (repositório mockado com `jest.fn()`) |
| Repositório | `invoice/repository/invoice.repository.spec.ts` | Integração (SQLite em memória) |
| Facade | `invoice/facade/invoice.facade.spec.ts` | Integração (SQLite em memória) |

O Jest usa `@swc/jest` para transpilar TypeScript (veja `jest.config.ts`).
