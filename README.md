# Robô de Produtos Milionários · Cofre do Nome

App mobile com cálculo pitagórico em código, talentos e proposta de um primeiro produto com mensagens para WhatsApp. Exemplos ilustrativos, sem promessa de venda ou renda. Não gera o PDF final.

| Tela | Endereço |
| --- | --- |
| Início pago | `/` |
| Fluxo de 5 passos | `/numero-que-vende` |
| Produto pelo identificador | `/resultado#id` |
| Meus Produtos | `/produtos` |
| Agenda de 7 dias | `/agenda` |
| Mapa e cálculo | `/mapa` |
| Quiz aberto e oferta | `/vitrine` |
| Login com código | `/entrar` |
| Compra ainda inativa | `/acesso` |
| Geração autenticada | `POST /api/produto` |

## Usando só o celular

[Passo a passo de publicação e Preview](docs/PUBLICAR.md), [login e teste de acesso](docs/LOGIN.md), [contrato Binyra](docs/BINYRA.md). Revise o Preview antes de fazer Merge. Uma chave de produção da Vercel **não** habilita Preview: ele precisa de uma chave própria.

## Desenvolvimento

```sh
npm install
# Configure um Convex de desenvolvimento, sem chaves no Git:
npx convex dev --once
npm run dev
npm test
npm run lint
npm run build
```

`convex/_generated` é versionado. `.env*` (exceto o exemplo), `.convex`, caches e dependências não são. Sem Resend configurado o login não envia código; sem compra ativa o app pago não abre. Sem Anthropic o modelo em código funciona. O limite diário local não substitui limites de uso no painel Convex.

## Visual

Azul-noite no fundo, superfícies em três níveis.
Cromo frio nos números e preços.
Lilás nas ações; verde-pinho para indicações positivas.
Geist em títulos e sistema no texto; nada de dourado.
Uma coluna no celular e menu lateral/duas colunas no desktop; movimento reduzido respeitado.

## Pastas

- `app`: páginas, layouts, proxy na raiz e rota de IA.
- `components`: moldura, disco, animação e componentes reutilizáveis.
- `lib/numerologia`: todos os cálculos e significados fixos.
- `lib`: armazenamento por conta, modelo sem IA, talentos e utilitários.
- `config/marca.ts`: personalização.
- `convex`: autenticação, compras, assinatura, webhook, geração e testes.
- `docs`: operação pelo celular e publicação.
- `scripts/configurar-chaves-auth.mjs`: alternativa para configurar chaves pelo terminal.

A geração exige login e compra ativa no servidor. Webhooks assinados são idempotentes. Reembolso prevalece. Os segredos da aplicação ficam apenas no Convex; a única exceção de infraestrutura é a deploy key no ambiente correto da Vercel.
