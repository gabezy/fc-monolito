# FC Monolito

Monolito modular em TypeScript desenvolvido no curso Full Cycle. Módulos em `src/modules`:

- `checkout`
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
| API | `infrastructure/api/__tests__/checkout.e2e.spec.ts` | E2E (Express + Supertest, SQLite em memória) |

O Jest usa `@swc/jest` para transpilar TypeScript (veja `jest.config.ts`).

## API (Express)

A camada web fica em `src/infrastructure/api` (`express.ts` monta o app, `server.ts` sobe o servidor). O banco é configurado em `src/infrastructure/db/sequelize.ts`.

Subir o servidor (porta `3000` por padrão, SQLite em memória):

```bash
npm run dev
# ou: PORT=4000 DB_STORAGE=./db.sqlite npm run dev
```

| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| POST | `/products` | `{ id?, name, description, purchasePrice, salesPrice, stock }` | `201` produto criado |
| POST | `/clients` | `{ id?, name, email, document, address: { street, number, complement, city, state, zipCode } }` | `201` cliente criado |
| POST | `/checkout` | `{ clientId, products: [{ productId }] }` | `201` `{ id, invoiceId, status, total, products }` |
| GET | `/invoice/:id` | — | `200` nota fiscal (`404` se não existir) |

Erros de validação retornam `400` com `{ message }`.

Fluxo do checkout: busca o cliente, valida estoque (`product-adm`), busca preços (`store-catalog`), processa o pagamento (`payment`, aprovado quando total ≥ 100) e, se aprovado, gera a nota fiscal (`invoice`). O pedido é salvo com status `approved` ou `declined`.

Exemplo:

```bash
curl -X POST localhost:3000/clients -H 'Content-Type: application/json' \
  -d '{"id":"c1","name":"Ana","email":"ana@mail.com","document":"123","address":{"street":"Rua 1","number":"10","complement":"Apto 2","city":"Criciúma","state":"SC","zipCode":"88800-000"}}'
curl -X POST localhost:3000/products -H 'Content-Type: application/json' \
  -d '{"id":"p1","name":"Produto","description":"Desc","purchasePrice":50,"salesPrice":150,"stock":10}'
curl -X POST localhost:3000/checkout -H 'Content-Type: application/json' \
  -d '{"clientId":"c1","products":[{"productId":"p1"}]}'
curl localhost:3000/invoice/<invoiceId>
```
