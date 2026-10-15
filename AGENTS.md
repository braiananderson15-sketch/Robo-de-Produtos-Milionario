# Missão: construir o "Robô de Produtos Milionários" (vitrine "Cofre do Nome")

Você é o desenvolvedor. Eu sou o DONO do produto: sou leigo, não programo. Então:
- fale comigo em português do Brasil, frases curtas, sem jargão;
- nunca me peça para editar código: você edita, eu testo e aprovo;
- antes de rodar um comando que instala pacote ou mexe fora da pasta, diga em 1 linha o que ele faz;
- siga as FASES da seção 14 NA ORDEM. No fim de cada fase diga o que ficou pronto, como eu testo (endereço e o que digitar) e PARE até eu dizer "pode seguir".

**Este arquivo é o manual completo do produto.** O CLAUDE.md e o AGENTS.md desta pasta têm o mesmo conteúdo: o Claude Code lê um, o Codex lê o outro. Resumo do que o app tem:
- Visual azul-noite + cromo frio + uma cor de ação lilás + verde-pinho para "coisas boas" (seção 4). Nada de dourado.
- O app pago fica na raiz `/` (grupo de rotas `app/(pago)`) e a vitrine do anúncio fica em `/vitrine`.
- Login por código no e-mail (Convex Auth + Resend), banco Convex e conferência de compra ativa vinda da Binyra. O app pago só abre para quem tem compra ativa.
- A IA é Anthropic (Claude Sonnet 5.5 por padrão) e a chamada acontece numa action do Convex. A chave fica SÓ nas variáveis do Convex.
- Cada aparelho guarda até 20 produtos.

**Escopo deste manual: construir tudo no computador (local).** Conectar o banco de dados na nuvem e publicar na Vercel NÃO fazem parte destas fases: isso vem depois, na PARTE 2 do comando inicial.

Você vai reconstruir um app que JÁ EXISTE e está aprovado. Fidelidade vale mais que criatividade: use exatamente os nomes de arquivos, nomes de classes CSS, textos e números deste documento. Quando eu colocar um bloco "copie literalmente", copie caractere por caractere. Se algo aqui parecer faltar, escolha o caminho mais simples e me diga em 1 frase.

---

## 1. O produto em 6 linhas

App web para o celular (funciona também no computador). A pessoa digita nome completo e data de nascimento; o app calcula, EM CÓDIGO, o Número de Ofício, o Número da Moeda e o Ano de Colheita, mostrando a conta letra por letra com um disco de cofre girando. Depois ela marca até 3 talentos que já tem e responde 3 perguntas opcionais; a IA (ou um modelo pronto em código, se não houver chave) monta "Seu Primeiro Produto": nome, promessa, 5 a 7 tópicos de mini-guia, preço de EXEMPLO e 3 mensagens prontas (Status, Grupo, Privado) com botão que abre o WhatsApp da própria pessoa. Há ainda Meus Produtos, Agenda da Colheita (próximos 7 dias) e Meu Mapa. A vitrine `/vitrine` é aberta: faz o quiz grátis até revelar o número e mostra a oferta com o link de pagamento externo. Quem compra na Binyra recebe e-mail com o link de entrada; entra com o MESMO e-mail por um código de 8 números.

O app NÃO promete venda nem renda. Frase-guia: "A moeda sempre esteve com você. Só nunca teve preço."

## 2. Regras que não se negociam

- Nenhuma chave ou segredo no código, no Git, no `localStorage`, no navegador ou em variável `NEXT_PUBLIC_*`. Segredos ficam SÓ nas variáveis de ambiente do Convex. As únicas variáveis públicas são os endereços do Convex (`NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`), que não são chaves.
- Números da numerologia SÓ em código (`lib/numerologia`). A IA nunca calcula número.
- Nenhuma promessa de ganho. Nunca escreva "você vai ganhar", "renda garantida", "dinheiro no automático", "fique rico". Todo valor em dinheiro aparece como "Preço de exemplo" / "valor sugerido, não é garantia de venda".
- O app nunca pede CPF, senha, Pix ou dado de banco.
- PROIBIDO: pagamento dentro do app, API do WhatsApp/envio automático, câmera/áudio/voz, upload, raspagem, push, painel administrativo.
- Toda função do Convex que entrega conteúdo pago confere no SERVIDOR o usuário logado (Convex Auth) e a compra ativa. Esconder botão não substitui isso. A identidade nunca vem de um id mandado pelo navegador.
- Webhook da Binyra: confere a assinatura antes de gravar; eventos repetidos não duplicam compra nem e-mail.
- Tudo que é da marca (nome, preço, link, WhatsApp, faixa de preço, limite diário) vem de `config/marca.ts`.
- Você NÃO roda `npx convex dev`, `npx convex deploy`, `npx convex env ...`, `vercel` nem qualquer comando que conecte ou publique. Isso vem depois das fases locais, na PARTE 2 do comando inicial.

## 3. Pilha, versões e estrutura

`package.json` (use exatamente estas versões; nome do pacote `robo-de-produtos-milionarios`, `"private": true`, versão `0.1.0`):

```json
"scripts": { "dev": "next dev", "build": "next build", "start": "next start", "lint": "eslint", "test": "vitest run" },
"dependencies": {
  "@anthropic-ai/sdk": "^0.131.0",
  "@auth/core": "0.41.1",
  "@convex-dev/auth": "0.0.96",
  "@convex-dev/resend": "0.2.8",
  "@oslojs/crypto": "1.0.1",
  "convex": "1.46.0",
  "jose": "6.2.12",
  "next": "16.4.0",
  "react": "19.3.0",
  "react-dom": "19.3.0",
  "resend": "6.32.1",
  "zod": "^4.6.5"
},
"devDependencies": {
  "@edge-runtime/vm": "5.0.0",
  "@tailwindcss/turbopack": "^4",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "convex-test": "0.0.60",
  "eslint": "^9",
  "eslint-config-next": "16.4.0",
  "tailwindcss": "^4",
  "typescript": "^5",
  "vitest": "^4.1.11"
}
```

Configurações:
- `next.config.ts`: `turbopack.rules["*.css"] = { loaders: ["@tailwindcss/turbopack"], as: "*.css" }`. Não há `postcss.config`. Comentário: "O app roda todo no aparelho (dados no localStorage), então não usamos o cache de componentes."
- `tsconfig.json`: padrão do Next (target ES2017, strict, moduleResolution bundler, jsx react-jsx, plugin next, paths `"@/*": ["./*"]`), include inclui `**/*.mts`, exclude `["node_modules", "convex/**/*.test.ts", "vitest.config.mts"]`.
- `vitest.config.mts`: `defineConfig({ test: { environment: "edge-runtime", include: ["lib/numerologia/**/*.test.ts", "convex/**/*.test.ts"], server: { deps: { inline: ["convex-test"] } } } })`.
- `eslint.config.mjs`: `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`, ignorando `.next/**`, `out/**`, `build/**`, `next-env.d.ts`.
- `convex/tsconfig.json`: o padrão gerado pelo Convex (target ESNext, lib ES2023+dom, strict, moduleResolution Bundler), com `"exclude": ["./_generated", "./**/*.test.ts"]`.
- `.gitignore`: node_modules, .next, out, build, dist, coverage, `*.tsbuildinfo`, `.env*` com exceção `!.env.example`, .DS_Store, logs, `.vercel`, `/.agents/`, `/.claude/`.
- `.vercelignore`: `.env*`, `.agents/`, `.claude/`, `.vercel/`, `node_modules/`, `.next/`, `*.tsbuildinfo` (comentário: "Segredos ficam nas variáveis da Vercel, nunca nos arquivos enviados.").
- `.env.example` (copie literalmente):
```
# Apenas endereços públicos do Convex: não são chaves.
NEXT_PUBLIC_CONVEX_URL=https://SEU-DEPLOYMENT.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://SEU-DEPLOYMENT.convex.site
# AUTH_RESEND_KEY, AUTH_EMAIL_FROM, JWT_PRIVATE_KEY, JWKS, SITE_URL
# e as variáveis de IA são cadastradas SOMENTE no Convex.
# BINYRA_WEBHOOK_SECRET e BINYRA_PRODUTO_ID também ficam somente no Convex.
# Veja docs/LOGIN.md e docs/BINYRA.md.
```

Estrutura final (crie o projeto DENTRO desta pasta, sem subpasta extra):

```
AGENTS.md  CLAUDE.md  BUSINESS.md  README.md
proxy.ts                       # Next 16: o antigo middleware.ts
app/
  layout.tsx  globals.css  icon.svg
  (pago)/layout.tsx            # exige login + compra ativa
  (pago)/page.tsx              # /            Início
  (pago)/numero-que-vende/page.tsx   # fluxo de 5 passos
  (pago)/resultado/page.tsx    # /resultado#<id>
  (pago)/produtos/page.tsx
  (pago)/agenda/page.tsx
  (pago)/mapa/page.tsx
  entrar/page.tsx              # login por código
  acesso/page.tsx              # logado, mas sem compra ativa
  vitrine/layout.tsx  vitrine/page.tsx   # aberta, sem login
  api/produto/route.ts         # ÚNICA rota de IA (repassa ao Convex)
components/
  AcessoPago.tsx AgendaSemana.tsx Aviso.tsx BotaoSair.tsx CofreAbrindo.tsx
  ConvexClientProvider.tsx Disco.tsx Icones.tsx Moldura.tsx Preco.tsx
  ProdutoView.tsx RodapeHonestidade.tsx Vazio.tsx
config/marca.ts
lib/
  armazenamento.ts produtoModelo.ts talentos.ts textos.ts tipos.ts ui.ts useHash.ts
  numerologia/calculo.ts numerologia/significados.ts numerologia/calculo.test.ts
convex/
  schema.ts auth.ts auth.config.ts ResendOTP.ts acesso.ts compras.ts binyra.ts
  http.ts produtos.ts convex.config.ts tsconfig.json
  acesso.test.ts binyra.test.ts
docs/ LOGIN.md BINYRA.md PUBLICAR.md COMO-REVENDER.md ideias-futuras.md
scripts/configurar-chaves-auth.mjs
public/.gitkeep
.env.example .gitignore .vercelignore
```

## 4. Identidade visual

Conceito (vai como comentário no topo do CSS): "Azul-noite com cromo frio (o luxo vem do material, como num painel Mercedes ou num iPhone) e uma única cor de ação: lilás-ametista, amigável e confiável (vende sem gritar). Números em cromo, ações em lilás, "bom para anunciar" em verde-pinho. Nada de dourado."

Resumo para você entender o CSS que vem logo abaixo:
- Fundo: gradiente vertical `#090e18` → `#0c1320`, fixo, com dois brilhos radiais por cima (lilás no topo central, branco frio no canto superior direito).
- Superfícies em três degraus: `--s1 #0f1826`, `--s2 #152136`, `--s3 #1d2c45`. Linhas finas em branco frio com 9% e 17% de opacidade.
- Texto `#f2f3f0`, secundário `#a5b0bd`, apagado `#7f8c9c`.
- Ação (botões, item marcado, passo atual, ponteiro do disco, números das letras): lilás `#a497f5`, gradiente do botão `#b8aefc → #9182ef`, tinta escura do botão `#0d0a22`.
- Cromo (todos os números grandes e preços): texto com gradiente `#ffffff → #dbe5eb (42%) → #8fa3b6`, aplicado com `background-clip: text` na classe `.cromo`. Borda cromada dos cartões de destaque `.card-destaque`: gradiente 160° branco 55% → branco frio 12% → lilás 35% → branco frio 30%, feita com o truque `padding-box / border-box`, e sombra lilás embaixo.
- Verde-pinho `#82b89d` só para coisas boas: selo "Bom para anunciar", "Seu produto está pronto", ícones de confiança.
- Aviso/erro: `#f0c38e` (âmbar suave, nunca vermelho).
- Metal do disco: `#8a95a3`, `#eef2f5`, `#a7b2be`, tinta `#18202b`, em `conic-gradient` (metal escovado).
- Fontes: Geist (via `next/font/google`, `subsets: ["latin"]`, `variable: "--font-geist"`, aplicada no `<html>`) para títulos e números (números finos, peso 200–300, letter-spacing negativo); texto corrido na fonte do sistema (SF no iPhone). `--display` = Geist primeiro; `--sans` = sistema primeiro.
- Raios: cartão 22px, cartão de destaque 28px, botão 16px (pequeno 14px), campo 16px, chip 12px, opção 14px, mini-cartão 20px, balão de mensagem `20px 20px 20px 6px`.
- Botões com no mínimo 56px de altura (pequenos 46px), letra mínima 16px nos campos.
- Celular (até 959px): coluna única de no máximo 480px, topo com o emblema e o nome do app, e BARRA DE ABAS fixa embaixo (76px, vidro fosco: fundo `rgba(9,14,24,.8)` + `backdrop-filter: blur(20px) saturate(150%)`) com 4 abas: Início, Número, Produtos, Agenda.
- Computador (960px ou mais): some a barra de abas; aparece MENU LATERAL fixo de 252px (emblema + nome, 5 itens: Início, Número que Vende, Meus Produtos, Agenda da Colheita, Meu Mapa; rodapé com "Acesso por código no e-mail" e "Tudo salvo neste aparelho"). Conteúdo até 1120px e telas em DUAS colunas (Início 1.55fr/1fr, Resultado 1.1fr/1fr com a coluna da direita grudada no topo, Vitrine 1.1fr/0.9fr, Oferta 1fr/420px, Fluxo 560px + painel lateral com disco de 240px e a lista dos passos).
- Até 370px: título 29px, número grande 124px, letra do nome 15px.
- `prefers-reduced-motion`: desliga todas as animações e transições (e o CofreAbrindo pula direto para o fim).
- Animação de entrada `.entrar`: 0.45s, sobe 8px e aparece.

`app/globals.css` — **copie literalmente, inteiro** (as classes daqui são as que os componentes usam; não troque nomes):

```css
@import "tailwindcss";

/* Cofre do Nome
   Azul-noite com cromo frio (o luxo vem do material, como num painel Mercedes ou num iPhone)
   e uma única cor de ação: lilás-ametista, amigável e confiável (vende sem gritar).
   Números em cromo, ações em lilás, "bom para anunciar" em verde-pinho. Nada de dourado. */
:root {
  --bg: #090e18;
  --bg-2: #0c1320;
  --s1: #0f1826;
  --s2: #152136;
  --s3: #1d2c45;
  --line: rgba(214, 226, 232, 0.09);
  --line-2: rgba(214, 226, 232, 0.17);
  --text: #f2f3f0;
  --muted: #a5b0bd;
  --dim: #7f8c9c;

  --acao: #a497f5;
  --acao-2: #8576e8;
  --acao-ink: #0d0a22;
  --acao-soft: rgba(164, 151, 245, 0.11);
  --acao-line: rgba(164, 151, 245, 0.42);
  --acao-glow: rgba(133, 118, 232, 0.34);
  --acao-grad: linear-gradient(180deg, #b8aefc 0%, #9182ef 100%);

  --cromo: linear-gradient(180deg, #ffffff 0%, #dbe5eb 42%, #8fa3b6 100%);
  --cromo-borda: linear-gradient(160deg, rgba(255, 255, 255, 0.55), rgba(214, 226, 232, 0.12) 35%, rgba(164, 151, 245, 0.35) 75%, rgba(214, 226, 232, 0.3));
  --verde: #82b89d;
  --verde-soft: rgba(130, 184, 157, 0.13);
  --verde-line: rgba(130, 184, 157, 0.45);
  --warn: #f0c38e;

  --metal-a: #8a95a3;
  --metal-b: #eef2f5;
  --metal-c: #a7b2be;
  --metal-ink: #18202b;
  --shadow: rgba(2, 5, 10, 0.75);
  --scrim: rgba(6, 10, 18, 0.82);

  --display: var(--font-geist), -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
  --sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", var(--font-geist), "Helvetica Neue", Arial, sans-serif;

  --tabbar: 76px;
  color-scheme: dark;
}

html { background: var(--bg); }
body {
  margin: 0;
  min-height: 100dvh;
  background: linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%) fixed;
  color: var(--text);
  font-family: var(--sans);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
}
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 60% 34% at 50% -4%, rgba(164, 151, 245, 0.13), transparent 70%),
    radial-gradient(ellipse 40% 30% at 90% 10%, rgba(214, 226, 232, 0.05), transparent 70%);
}
:focus-visible { outline: 2px solid var(--acao); outline-offset: 3px; border-radius: 8px; }
::selection { background: var(--acao); color: var(--acao-ink); }

/* ---------- esqueleto ---------- */
.app { position: relative; min-height: 100dvh; }
.lateral { display: none; }
.shell {
  position: relative;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100dvh;
  padding: calc(env(safe-area-inset-top, 0px) + 8px) 20px calc(var(--tabbar) + env(safe-area-inset-bottom, 0px) + 28px);
}
.shell.sem-abas { padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 28px); }

.topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; height: 56px; }
.marca { display: inline-flex; align-items: center; gap: 10px; color: var(--text); text-decoration: none; }
.marca span { font-family: var(--display); font-size: 17px; font-weight: 600; letter-spacing: -0.02em; }
.voltar {
  display: inline-grid; place-items: center; width: 40px; height: 40px; margin-left: -8px;
  border-radius: 50%; color: var(--text); background: none; border: 0; cursor: pointer;
}
.voltar:hover { background: var(--s2); }

.tabbar {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 20;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: rgba(9, 14, 24, 0.8);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  border-top: 1px solid var(--line);
}
.tabbar nav { max-width: 480px; margin: 0 auto; height: var(--tabbar); display: grid; grid-template-columns: repeat(4, 1fr); }
.tab { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; color: var(--dim); text-decoration: none; font-size: 11.5px; font-weight: 500; }
.tab[aria-current="page"] { color: var(--acao); }

/* ---------- tipografia ---------- */
.display { font-family: var(--display); font-weight: 600; font-size: 33px; line-height: 1.08; letter-spacing: -0.035em; margin: 0; text-wrap: balance; }
.display.lg { font-size: 38px; }
.display.sm { font-size: 24px; letter-spacing: -0.03em; }
.lead { color: var(--muted); font-size: 16.5px; margin: 10px 0 0; }
.kicker { font-size: 13.5px; color: var(--acao); margin: 0 0 8px; font-weight: 600; }
.muted { color: var(--muted); }
.cromo { background: var(--cromo); -webkit-background-clip: text; background-clip: text; color: transparent; padding-bottom: 0.06em; }
.num-serif { font-family: var(--display); font-weight: 300; letter-spacing: -0.04em; font-variant-numeric: lining-nums tabular-nums; }
.virgula { font: inherit; }
.ornamento { display: flex; align-items: center; gap: 12px; margin: 30px 0 14px; font-size: 13px; font-weight: 500; color: var(--muted); }
.ornamento::before, .ornamento::after { content: ""; flex: 1; height: 1px; background: var(--line-2); }
.ornamento svg { color: var(--acao); }
.sec-titulo { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin: 32px 0 12px; }
.sec-titulo h2 { font-family: var(--display); font-size: 17px; font-weight: 600; letter-spacing: -0.02em; margin: 0; }
.sec-titulo a, .sec-titulo button { font-size: 14px; font-weight: 500; color: var(--acao); text-decoration: none; background: none; border: 0; padding: 4px 0; cursor: pointer; white-space: nowrap; }

/* ---------- superfícies ---------- */
.card { background: var(--s1); border: 1px solid var(--line); border-radius: 22px; }
.card-destaque {
  position: relative;
  border: 1px solid transparent;
  border-radius: 28px;
  background: linear-gradient(180deg, var(--s2), var(--s1) 70%) padding-box, var(--cromo-borda) border-box;
  box-shadow: 0 40px 80px -40px var(--acao-glow), 0 1px 0 rgba(255, 255, 255, 0.06) inset;
}

.confianca { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-top: 14px; font-size: 13px; color: var(--muted); }
.confianca span { display: inline-flex; align-items: center; gap: 6px; }
.confianca svg { color: var(--verde); }

/* ---------- botões ---------- */
.btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; min-height: 56px; padding: 0 22px; border-radius: 16px; border: 0;
  font: inherit; font-size: 17px; font-weight: 600; letter-spacing: -0.01em; text-decoration: none; cursor: pointer;
  transition: transform 0.15s, opacity 0.2s, box-shadow 0.2s, background 0.2s;
}
.btn:active { transform: scale(0.985); }
.btn:disabled { opacity: 0.35; cursor: default; transform: none; }
.btn-acao { background: var(--acao-grad); color: var(--acao-ink); box-shadow: 0 1px 0 rgba(255, 255, 255, 0.45) inset, 0 14px 32px -10px var(--acao-glow); }
.btn-acao:hover:not(:disabled) { box-shadow: 0 1px 0 rgba(255, 255, 255, 0.45) inset, 0 18px 40px -10px var(--acao-glow); }
.btn-acao svg { flex: none; }
.btn-contorno { background: rgba(214, 226, 232, 0.04); color: var(--text); border: 1px solid var(--line-2); }
.btn-contorno:hover { background: rgba(214, 226, 232, 0.08); }
.btn-calmo { background: none; color: var(--muted); min-height: 46px; font-weight: 500; font-size: 15px; }
.btn-sm { min-height: 46px; font-size: 15px; padding: 0 18px; border-radius: 14px; }

/* ---------- formulários ---------- */
.campo { display: block; background: var(--s1); border: 1px solid var(--line-2); border-radius: 16px; padding: 11px 16px 12px; transition: border-color 0.2s, box-shadow 0.2s; }
.campo:focus-within { border-color: var(--acao-line); box-shadow: 0 0 0 4px var(--acao-soft); }
.campo span { display: block; font-size: 12.5px; color: var(--dim); }
.campo input { width: 100%; background: none; border: 0; outline: 0; color: var(--text); font: inherit; font-size: 18px; padding: 3px 0 0; font-variant-numeric: tabular-nums; }
.campo input::placeholder { color: var(--dim); }
.campo.grande input { font-family: var(--display); font-size: 23px; font-weight: 500; letter-spacing: -0.02em; }
.data { display: grid; grid-template-columns: 1fr 1fr 1.4fr; gap: 10px; }
.erro { color: var(--warn); font-size: 14px; margin: 8px 2px 0; min-height: 21px; }
.aviso { display: flex; gap: 9px; align-items: flex-start; color: var(--dim); font-size: 13px; margin: 14px 2px 0; }
.aviso svg { flex: none; margin-top: 2px; color: var(--verde); }

.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  display: inline-flex; align-items: center; gap: 7px; min-height: 42px; padding: 0 15px; border-radius: 12px;
  border: 1px solid var(--line-2); background: var(--s1); color: var(--text); font: inherit; font-size: 14.5px; cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.chip svg { color: var(--acao); }
/* Recomendado: só a estrela é lilás. Marcado: fundo lilás sólido e um ✓. */
.chip.estrela { border-color: var(--line-2); background: var(--s1); }
.chip[aria-pressed="true"] { background: var(--acao-grad); border-color: transparent; color: var(--acao-ink); font-weight: 600; }
.chip[aria-pressed="true"] svg { color: var(--acao-ink); }
.chip:disabled { opacity: 0.35; cursor: default; }

.opcoes { display: grid; gap: 8px; }
.opcao {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; text-align: left;
  min-height: 52px; padding: 12px 16px; border-radius: 14px; border: 1px solid var(--line-2); background: var(--s1);
  color: var(--text); font: inherit; font-size: 15.5px; cursor: pointer; transition: border-color 0.2s, background 0.2s;
}
.opcao i { flex: none; width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid var(--line-2); display: grid; place-items: center; }
.opcao[aria-pressed="true"] { border-color: var(--acao-line); background: var(--acao-soft); }
.opcao[aria-pressed="true"] i { border-color: var(--acao); }
.opcao[aria-pressed="true"] i::after { content: ""; width: 10px; height: 10px; border-radius: 50%; background: var(--acao); }
.pergunta { font-size: 15.5px; font-weight: 600; margin: 26px 0 10px; }

.progresso { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 4px 0 26px; }
.progresso span { height: 4px; border-radius: 2px; background: var(--s3); }
.progresso span.on { background: var(--acao); }
.passo-label { font-size: 13px; color: var(--muted); }
.passo-label b { color: var(--text); font-weight: 600; }

.doca { position: sticky; bottom: 0; margin: 28px -20px 0; padding: 22px 20px calc(env(safe-area-inset-bottom, 0px) + 18px); background: linear-gradient(transparent, var(--bg-2) 30%); }
.contagem { text-align: center; font-size: 13px; color: var(--dim); margin-bottom: 10px; font-variant-numeric: tabular-nums; }
.contagem b { color: var(--acao); font-weight: 600; }

/* ---------- disco do cofre ---------- */
.disco {
  position: relative; flex: none; width: var(--d, 216px); height: var(--d, 216px); border-radius: 50%;
  background: conic-gradient(from 20deg, var(--metal-a), var(--metal-b) 11%, var(--metal-c) 24%, var(--metal-b) 37%, var(--metal-a) 50%, var(--metal-b) 61%, var(--metal-c) 74%, var(--metal-b) 87%, var(--metal-a));
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35) inset, 0 0 0 calc(var(--d, 216px) * 0.032) var(--s1), 0 0 0 calc(var(--d, 216px) * 0.032 + 1px) var(--line-2), 0 26px 60px var(--shadow);
  transition: box-shadow 0.6s;
}
.disco svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.disco .giro { transform-origin: 100px 100px; transition: transform 0.95s cubic-bezier(0.65, 0, 0.3, 1); }
.disco line { stroke: var(--metal-ink); }
.disco text { font-family: var(--display); font-weight: 500; font-size: 14px; fill: var(--metal-ink); text-anchor: middle; dominant-baseline: central; }
.disco .ponteiro { fill: var(--acao); }
.disco .miolo { position: absolute; inset: 35%; border-radius: 50%; background: radial-gradient(circle at 34% 28%, #ffffff, #c9d3dc 45%, #6f7d8c 100%); box-shadow: 0 6px 14px var(--shadow), 0 0 0 1px rgba(255, 255, 255, 0.4); }
.disco.aberto { box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35) inset, 0 0 0 calc(var(--d, 216px) * 0.032) var(--s1), 0 0 0 calc(var(--d, 216px) * 0.032 + 2px) var(--acao), 0 0 90px var(--acao-glow), 0 26px 60px var(--shadow); }
.disco.girando .giro { animation: girar 1.4s cubic-bezier(0.5, 0, 0.5, 1) infinite; transition: none; }
@keyframes girar { from { transform: rotate(0); } to { transform: rotate(360deg); } }

/* ---------- abertura ---------- */
.abertura { display: grid; justify-items: center; text-align: center; cursor: default; max-width: 560px; margin: 0 auto; }
.abertura .disco { margin: 10px 0 26px; }
.letras { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px 14px; margin: 0 0 14px; }
.palavra { display: flex; gap: 1px; }
.letra { width: 17px; text-align: center; opacity: 0.1; transform: translateY(4px); transition: opacity 0.25s, transform 0.25s; }
.letra.on { opacity: 1; transform: none; }
.letra b { display: block; font-size: 14px; font-weight: 600; line-height: 1.3; }
.letra i { display: block; font-style: normal; font-size: 13px; color: var(--acao); line-height: 1.3; font-variant-numeric: tabular-nums; }
.soma { color: var(--dim); font-size: 14px; font-variant-numeric: tabular-nums; min-height: 22px; opacity: 0; transition: opacity 0.4s; margin: 0; }
.soma.on { opacity: 1; }
.soma b { color: var(--text); font-weight: 500; }
.soma em { font-style: normal; color: var(--acao); font-weight: 700; }
.pular { color: var(--dim); font-size: 12.5px; margin-top: 8px; }
.revelacao { width: 100%; opacity: 0; transform: translateY(10px); transition: opacity 0.7s, transform 0.7s; margin-top: 20px; }
.revelacao.on { opacity: 1; transform: none; }
.numero-grande { display: block; font-family: var(--display); font-weight: 200; font-size: 148px; line-height: 0.9; letter-spacing: -0.06em; margin: 0 0 6px; }
.titulo-oficio { font-family: var(--display); font-weight: 600; font-size: 26px; line-height: 1.15; letter-spacing: -0.03em; margin: 0 0 10px; text-wrap: balance; }
.texto-oficio { color: var(--muted); margin: 0 auto 24px; max-width: 32ch; font-size: 15.5px; }
.par { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: left; margin-bottom: 24px; }
.mini { background: var(--s1); border: 1px solid var(--line-2); border-radius: 20px; padding: 14px 15px 15px; }
.mini span { font-size: 12.5px; color: var(--muted); }
.mini strong { display: block; font-family: var(--display); font-weight: 300; font-size: 46px; line-height: 1.05; letter-spacing: -0.04em; }
.mini p { margin: 2px 0 0; font-size: 13px; color: var(--dim); line-height: 1.4; }

.sobreposicao { position: fixed; inset: 0; z-index: 40; display: grid; place-content: center; justify-items: center; gap: 18px; background: var(--scrim); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); animation: surgir 0.3s; }
.sobreposicao p { font-family: var(--display); font-weight: 500; font-size: 21px; letter-spacing: -0.02em; margin: 0; }
@keyframes surgir { from { opacity: 0; } }

/* ---------- painel inicial ---------- */
.saudacao { margin: 14px 0 22px; }
.heroi { padding: 24px 22px 22px; overflow: hidden; }
.heroi-topo { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
.heroi h2 { font-family: var(--display); font-weight: 600; font-size: 27px; line-height: 1.08; letter-spacing: -0.035em; margin: 0 0 8px; text-wrap: balance; }
.heroi p { color: var(--muted); font-size: 15px; margin: 0 0 18px; }
.heroi .disco { --d: 104px; margin: 4px 2px 0 0; }
.heroi-num { display: flex; align-items: flex-end; gap: 16px; margin: 0 0 18px; }
.heroi-num .numero-grande { font-size: 108px; margin: 0; }
.heroi-num p { margin: 0 0 12px; font-family: var(--display); font-weight: 600; font-size: 20px; line-height: 1.2; letter-spacing: -0.02em; color: var(--text); }
.heroi-num p span { display: block; font-family: var(--sans); font-weight: 400; letter-spacing: 0; font-size: 12.5px; color: var(--muted); margin-bottom: 2px; }
.acoes-heroi { display: grid; gap: 8px; }
.etapas { display: flex; gap: 8px 14px; flex-wrap: wrap; font-size: 13px; color: var(--muted); margin: 0 0 18px; }
.etapas span { display: inline-flex; align-items: center; gap: 7px; }
.etapas b { width: 20px; height: 20px; border-radius: 50%; display: inline-grid; place-items: center; font-size: 11.5px; font-weight: 700; color: var(--acao); background: var(--acao-soft); border: 1px solid var(--acao-line); }

.hoje { display: flex; align-items: center; gap: 14px; padding: 14px 16px; margin-top: 12px; }
.hoje .num-serif { font-size: 40px; line-height: 1; width: 36px; text-align: center; }
.hoje p { margin: 0; font-size: 14.5px; }
.hoje small { display: block; color: var(--dim); font-size: 12.5px; }
.selo { display: inline-flex; align-items: center; gap: 5px; margin-left: auto; flex: none; font-size: 11.5px; font-weight: 600; color: var(--verde); background: var(--verde-soft); border: 1px solid var(--verde-line); padding: 3px 9px; border-radius: 10px; }

.grade { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ferramenta { position: relative; display: flex; flex-direction: column; gap: 10px; min-height: 140px; padding: 16px; color: var(--text); text-decoration: none; transition: border-color 0.2s, transform 0.15s, background 0.2s; }
.ferramenta:hover { border-color: var(--line-2); background: var(--s2); }
.ferramenta:active { transform: scale(0.985); }
.ferramenta .icone { width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; color: var(--acao); background: var(--acao-soft); }
.ferramenta h3 { font-size: 15px; font-weight: 600; margin: auto 0 0; }
.ferramenta p { font-size: 13px; color: var(--dim); margin: -6px 0 0; line-height: 1.35; }
.ferramenta .contador { position: absolute; top: 12px; right: 16px; font-family: var(--display); font-weight: 300; font-size: 30px; line-height: 1; }
.ferramenta.trancada .icone { color: var(--dim); background: var(--s2); }
.ferramenta.trancada h3 { color: var(--muted); }

.ultimo { display: flex; gap: 14px; align-items: center; padding: 16px; text-decoration: none; color: var(--text); }
.ultimo .preco-tag { font-family: var(--display); font-weight: 400; font-size: 21px; letter-spacing: -0.02em; white-space: nowrap; }
.ultimo h3 { font-family: var(--display); font-weight: 600; font-size: 17px; letter-spacing: -0.02em; line-height: 1.25; margin: 0; }
.ultimo small { color: var(--dim); font-size: 12.5px; }

/* ---------- produto ---------- */
.pronto { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 600; color: var(--verde); background: var(--verde-soft); border: 1px solid var(--verde-line); padding: 5px 12px 5px 8px; border-radius: 20px; margin: 6px 0 14px; }
.produto { padding: 26px 22px 22px; }
.produto h1 { font-family: var(--display); font-weight: 600; font-size: 29px; line-height: 1.1; letter-spacing: -0.035em; margin: 0 0 10px; text-wrap: balance; }
.produto .promessa { color: var(--muted); margin: 0; font-size: 16px; }
.topicos { list-style: none; margin: 0; padding: 0; counter-reset: t; }
.topicos li { counter-increment: t; display: grid; grid-template-columns: 30px 1fr; padding: 11px 0; border-top: 1px solid var(--line); font-size: 15px; }
.topicos li::before { content: counter(t); font-weight: 600; color: var(--acao); font-size: 14px; line-height: 1.6; font-variant-numeric: tabular-nums; }
.preco { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--line-2); }
.preco span { font-size: 13px; color: var(--muted); }
.preco strong { font-family: var(--display); font-weight: 300; font-size: 44px; line-height: 1.1; letter-spacing: -0.04em; white-space: nowrap; }
.preco-nota { font-size: 12.5px; color: var(--dim); margin: 4px 0 0; text-align: right; }
.abas { display: grid; grid-template-columns: repeat(3, 1fr); padding: 3px; border-radius: 13px; background: var(--s1); border: 1px solid var(--line-2); margin-bottom: 12px; }
.abas button { border: 0; background: none; height: 36px; border-radius: 10px; font: inherit; font-size: 14px; font-weight: 500; color: var(--muted); cursor: pointer; }
.abas button[aria-pressed="true"] { background: var(--s3); color: var(--text); font-weight: 600; box-shadow: 0 1px 0 rgba(255, 255, 255, 0.08) inset; }
.balao { background: var(--s2); border: 1px solid var(--line); border-radius: 20px 20px 20px 6px; padding: 14px 16px; font-size: 15px; line-height: 1.55; white-space: pre-wrap; margin: 0 0 12px; }
.acoes-msg { display: grid; grid-template-columns: 1fr auto; gap: 10px; }
.acoes-msg .btn { min-height: 50px; font-size: 15.5px; }

.agenda { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
.dia { text-align: center; padding: 9px 0 10px; border-radius: 14px; font-variant-numeric: tabular-nums; border: 1px solid transparent; }
.dia.hoje-dia { background: var(--s1); border-color: var(--line-2); }
.dia .sem { display: block; font-size: 11.5px; color: var(--dim); }
.dia .dt { display: block; font-size: 12px; color: var(--muted); }
.dia .pn { display: block; font-family: var(--display); font-weight: 300; font-size: 25px; line-height: 1.25; color: var(--text); }
.dia .ponto { display: block; width: 5px; height: 5px; margin: 2px auto 0; border-radius: 50%; }
.dia.bom .pn { color: var(--verde); font-weight: 400; }
.dia.bom .ponto { background: var(--verde); }
.legenda { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--muted); margin: 10px 2px 4px; }
.legenda i { width: 6px; height: 6px; border-radius: 50%; background: var(--verde); }
.pequeno { font-size: 13.5px; color: var(--dim); margin: 4px 2px 0; }

.lista-dias { display: grid; gap: 8px; }
.linha-dia { display: grid; grid-template-columns: 52px 1fr auto; gap: 14px; align-items: center; padding: 14px 16px; }
.linha-dia .num-serif { font-size: 36px; line-height: 1; text-align: center; }
.linha-dia p { margin: 0; font-size: 14.5px; }
.linha-dia small { display: block; color: var(--dim); font-size: 12.5px; }
.linha-dia.bom-dia { border-color: var(--verde-line); }
.linha-dia.bom-dia .num-serif { color: var(--verde); }

.confirmar { border: 1px solid var(--line-2); border-radius: 20px; padding: 16px; display: grid; gap: 12px; text-align: center; }
.confirmar p { margin: 0; font-size: 15px; }
.confirmar div { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.suporte { display: block; width: 100%; text-align: center; color: var(--muted); font-size: 14.5px; margin-top: 6px; padding: 10px; text-decoration: none; }
.suporte u { text-decoration-color: var(--acao-line); text-underline-offset: 4px; }
.honesto { margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--line); font-size: 12px; line-height: 1.55; color: var(--dim); max-width: 760px; }
.vazio { text-align: center; padding: 36px 22px 26px; }
.vazio .disco { --d: 96px; margin: 0 auto 22px; }
.vazio h2 { font-family: var(--display); font-weight: 600; font-size: 23px; letter-spacing: -0.03em; margin: 0 0 6px; }
.vazio p { color: var(--muted); margin: 0 auto 20px; max-width: 34ch; }
.vazio .btn { max-width: 360px; margin: 0 auto; }
.dev-aviso { font-size: 12px; color: var(--warn); border: 1px dashed var(--warn); border-radius: 12px; padding: 8px 12px; margin: 12px 0 0; }

.mapa-num { display: grid; grid-template-columns: 76px 1fr; gap: 16px; align-items: center; padding: 18px; }
.mapa-num .num-serif { font-size: 66px; line-height: 0.95; text-align: center; }
.mapa-num h3 { font-size: 13px; color: var(--acao); font-weight: 600; margin: 0 0 2px; }
.mapa-num p { margin: 0; }
.mapa-num p.t { font-family: var(--display); font-weight: 600; font-size: 18px; letter-spacing: -0.02em; line-height: 1.25; margin-bottom: 4px; }
.mapa-num p.d { color: var(--muted); font-size: 14px; }

/* ---------- vitrine ---------- */
.vitrine-heroi { padding: 18px 0 26px; }
.recap { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.recap .numero-grande { font-size: 88px; margin: 0; }
.recap p { margin: 0; font-family: var(--display); font-weight: 600; font-size: 20px; letter-spacing: -0.02em; line-height: 1.2; }
.recap span { display: block; font-family: var(--sans); font-weight: 400; letter-spacing: 0; font-size: 12.5px; color: var(--muted); margin-bottom: 2px; }
.borrado { filter: blur(4px); opacity: 0.45; pointer-events: none; }
.inclui { list-style: none; padding: 0; margin: 26px 0 0; display: grid; gap: 11px; }
.inclui li { display: grid; grid-template-columns: 22px 1fr; gap: 10px; font-size: 15px; }
.inclui svg { margin-top: 3px; color: var(--verde); }
.oferta { margin-top: 26px; padding: 26px 22px 20px; text-align: center; }
.oferta .rot { font-size: 13.5px; font-weight: 600; color: var(--acao); }
.oferta .valor { font-family: var(--display); font-weight: 300; font-size: 60px; line-height: 1.05; letter-spacing: -0.05em; margin: 4px 0 2px; }
.oferta .parc { font-size: 14px; color: var(--dim); margin: 0 0 20px; }
.oferta .aviso { justify-content: center; text-align: left; }
.versus { font-family: var(--display); font-weight: 500; font-size: 20px; line-height: 1.3; letter-spacing: -0.02em; text-align: center; margin: 30px auto 0; max-width: 30ch; color: var(--muted); text-wrap: balance; }
.como { display: grid; gap: 12px; margin-top: 26px; }
.como div { display: grid; grid-template-columns: 32px 1fr; gap: 12px; align-items: start; }
.como b { width: 30px; height: 30px; border-radius: 10px; display: grid; place-items: center; font-size: 14px; color: var(--acao); background: var(--acao-soft); border: 1px solid var(--acao-line); }
.como p { margin: 4px 0 0; font-size: 15px; color: var(--muted); }
.como p strong { color: var(--text); font-weight: 600; }

/* ---------- fluxo: painel lateral só no desktop ---------- */
.fluxo-grade { display: block; }
.fluxo-lado { display: none; }

.toast { position: fixed; left: 50%; bottom: calc(var(--tabbar) + env(safe-area-inset-bottom, 0px) + 18px); z-index: 60; transform: translate(-50%, 16px); opacity: 0; pointer-events: none; background: var(--text); color: var(--bg); font-size: 14px; font-weight: 600; padding: 10px 18px; border-radius: 14px; white-space: nowrap; max-width: calc(100% - 40px); overflow: hidden; text-overflow: ellipsis; box-shadow: 0 10px 30px var(--shadow); transition: opacity 0.25s, transform 0.25s; }
.toast.on { opacity: 1; transform: translate(-50%, 0); }

.entrar { animation: entrar 0.45s cubic-bezier(0.2, 0.7, 0.2, 1) both; }
@keyframes entrar { from { opacity: 0; transform: translateY(8px); } }

/* ---------- grades das páginas (no celular, uma coluna) ---------- */
.painel-grade, .resultado-grade, .vitrine-grade, .oferta-grade { display: grid; }
.coluna { min-width: 0; }
.lista-produtos { display: grid; gap: 10px; }
.mapa-cards { display: grid; gap: 10px; }

/* ================= DESKTOP ================= */
@media (min-width: 960px) {
  :root { --lateral: 252px; }
  .tabbar { display: none; }
  .toast { bottom: 32px; }

  .app.com-lateral { display: grid; grid-template-columns: var(--lateral) minmax(0, 1fr); }
  .lateral {
    display: flex; flex-direction: column; gap: 4px; position: sticky; top: 0; height: 100dvh;
    padding: 26px 18px 24px; border-right: 1px solid var(--line); background: rgba(12, 19, 32, 0.6);
  }
  .lateral .marca { padding: 0 10px 26px; align-items: flex-start; }
  .lateral .marca span { font-size: 15.5px; line-height: 1.2; padding-top: 3px; }
  .lateral a.item {
    display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 12px; border-radius: 12px;
    color: var(--muted); text-decoration: none; font-size: 15px; font-weight: 500; transition: background 0.2s, color 0.2s;
  }
  .lateral a.item:hover { background: var(--s1); color: var(--text); }
  .lateral a.item[aria-current="page"] { background: var(--acao-soft); color: var(--text); }
  .lateral a.item[aria-current="page"] svg { color: var(--acao); }
  .lateral .rodape-lateral { margin-top: auto; padding: 16px 12px 0; border-top: 1px solid var(--line); font-size: 12.5px; color: var(--dim); display: grid; gap: 8px; }
  .lateral .rodape-lateral span { display: flex; align-items: center; gap: 8px; }
  .lateral .rodape-lateral svg { color: var(--verde); }

  .app.com-lateral .shell { max-width: 1120px; padding: 34px 48px 56px; }
  .app.com-lateral .topbar .marca { display: none; }
  .app.com-lateral .topbar { height: auto; min-height: 8px; }
  .shell.sem-abas { max-width: 1120px; padding: 28px 40px 48px; }

  .display { font-size: 42px; }
  .display.lg { font-size: 56px; letter-spacing: -0.045em; }
  .saudacao { margin: 6px 0 28px; }
  .saudacao .lead { font-size: 18px; max-width: 56ch; }

  .painel-grade { grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr); gap: 28px; align-items: start; }
  .heroi { padding: 34px 34px 30px; }
  .heroi h2 { font-size: 36px; }
  .heroi p { font-size: 16.5px; max-width: 40ch; }
  .heroi .disco { --d: 150px; }
  .heroi-num .numero-grande { font-size: 150px; }
  .acoes-heroi { grid-template-columns: 1fr 1fr; }
  .painel-grade .hoje { margin-top: 0; }
  .coluna-lado > .sec-titulo:first-child { margin-top: 0; }

  .resultado-grade { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 32px; align-items: start; }
  .resultado-grade .coluna-lado { position: sticky; top: 28px; }
  .produto { padding: 34px 32px 28px; }
  .produto h1 { font-size: 36px; }

  .lista-produtos { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mapa-cards { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .mapa-num { grid-template-columns: 1fr; text-align: left; align-items: start; padding: 24px; }
  .mapa-num .num-serif { text-align: left; font-size: 88px; }
  .lista-dias { grid-template-columns: repeat(2, minmax(0, 1fr)); }

  .fluxo-grade { display: grid; grid-template-columns: minmax(0, 560px) minmax(0, 1fr); gap: 72px; align-items: start; }
  .fluxo-lado { display: grid; justify-items: center; gap: 22px; position: sticky; top: 40px; padding: 24px 32px; }
  .fluxo-lado .disco { --d: 240px; }
  .fluxo-lado ol { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 4px; width: 100%; max-width: 320px; }
  .fluxo-lado li { display: grid; grid-template-columns: 28px 1fr; gap: 12px; align-items: center; padding: 8px 10px; border-radius: 12px; color: var(--dim); font-size: 15px; }
  .fluxo-lado li b { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; border: 1px solid var(--line-2); }
  .fluxo-lado li.feito { color: var(--muted); }
  .fluxo-lado li.feito b { background: var(--verde-soft); border-color: var(--verde-line); color: var(--verde); }
  .fluxo-lado li.atual { background: var(--s1); color: var(--text); }
  .fluxo-lado li.atual b { background: var(--acao); border-color: var(--acao); color: var(--acao-ink); }
  .fluxo-lado p { margin: 0; font-size: 13.5px; color: var(--dim); text-align: center; max-width: 30ch; }
  .doca { position: static; margin: 28px 0 0; padding: 0; background: none; }
  .fluxo-grade .abertura { margin: 0; }

  .vitrine-grade { grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); gap: 56px; align-items: center; min-height: calc(100dvh - 160px); }
  .vitrine-heroi { padding: 0; }
  .vitrine-heroi .lead { font-size: 19px; max-width: 46ch; }
  .oferta-grade { grid-template-columns: minmax(0, 1fr) minmax(0, 420px); gap: 48px; align-items: start; }
  .oferta-grade .oferta { margin-top: 0; position: sticky; top: 28px; }
  .numero-grande { font-size: 168px; }
}

@media (max-width: 370px) {
  .display { font-size: 29px; }
  .numero-grande { font-size: 124px; }
  .letra { width: 15px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation: none !important; }
}

@media (min-width: 960px) {
  .fluxo-grade.sem-lado { grid-template-columns: minmax(0, 1fr); }
  .fluxo-grade.sem-lado .fluxo-lado { display: none; }
  .fluxo-grade.sem-lado .abertura { margin: 0 auto; }
}

/* Acesso por código */
.topbar-direita{display:flex;align-items:center;gap:12px}.sair .btn{white-space:nowrap}.sair small{display:block;max-width:160px}.auth-card{max-width:480px;margin:40px auto 20px}.auth-card h1{margin:20px 0}.auth-card .lead{margin-bottom:25px}.auth-emblema{display:inline-grid;place-items:center;width:64px;height:64px;border:1px solid var(--line);border-radius:20px;color:var(--acao)}.auth-form{display:flex;flex-direction:column;gap:16px;margin-top:28px}.auth-form .campo{display:flex;flex-direction:column;gap:10px}.auth-form input{font-size:16px}.auth-form .erro:empty{display:none}.auth-note{font-size:12px;color:var(--dim);margin-top:24px;line-height:1.7}@media(max-width:480px){.topbar .marca{min-width:0}.topbar .marca span{font-size:14px;line-height:1.25}.topbar .marca svg{flex-shrink:0}.sair .btn{padding:8px 12px}}
```

`app/icon.svg` (ícone da aba; copie literalmente):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#d6e2e8"/><stop offset="1" stop-color="#7f93a6"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="#090e18"/><circle cx="32" cy="32" r="22" fill="none" stroke="url(#g)" stroke-width="2.4"/><circle cx="32" cy="32" r="8" fill="url(#g)"/><path d="M32 6l3 5h-6z" fill="#a497f5"/></svg>
```

### 4.1 Componentes visuais

**`components/Icones.tsx`** — ícones de traço fino (1.6) desenhados à mão, mais o `Emblema` (disco de cofre cromado com ponteiro lilás) usado ao lado do nome do app. Copie literalmente:

```tsx
import { useId } from "react";

type P = { size?: number };
const base = (size = 22) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });

export const IconeInicio = ({ size }: P) => (<svg {...base(size)}><path d="M3.5 10.5 12 4l8.5 6.5V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z" /></svg>);
export const IconeCofre = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2" /></svg>);
export const IconeProdutos = ({ size }: P) => (<svg {...base(size)}><path d="M6 3.5h9l3.5 3.5v13.5H6z" /><path d="M14.5 3.5V7.5H18.5M9 12h6M9 15.5h6" /></svg>);
export const IconeAgenda = ({ size }: P) => (<svg {...base(size)}><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /><circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none" /></svg>);
export const IconeMapa = ({ size }: P) => (<svg {...base(size)}><path d="M12 3.5 14.5 9l5.9.6-4.4 4 1.3 5.9L12 16.5l-5.3 3 1.3-5.9-4.4-4L9.5 9z" /></svg>);
export const IconeMensagem = ({ size }: P) => (<svg {...base(size)}><path d="M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1-4.4A8.5 8.5 0 1 1 20.5 12z" /></svg>);
export const IconeVoltar = ({ size }: P) => (<svg {...base(size)}><path d="M15 5l-7 7 7 7" /></svg>);
export const IconeSeta = ({ size = 18 }: P) => (<svg {...base(size)}><path d="M9 5l7 7-7 7" /></svg>);

export const IconeCadeado = ({ size = 14 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.3" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
);
export const IconeCheck = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const IconeEstrela = ({ size = 12 }: P) => (
  <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true"><path fill="currentColor" d="M6 .7l1.55 3.3 3.6.42-2.68 2.46.72 3.56L6 8.66 2.81 10.44l.72-3.56L.85 4.42l3.6-.42z" /></svg>
);

/** Emblema da marca: um disco de cofre em cromo, com ponteiro lilás. */
export function Emblema({ size = 28 }: P) {
  const id = useId().replace(/:/g, "");
  const marcas = Array.from({ length: 24 }, (_, i) => {
    const a = (i * 15 * Math.PI) / 180;
    const r2 = i % 6 === 0 ? 11.2 : 12.4;
    return <line key={i} x1={16 + 14 * Math.sin(a)} y1={16 - 14 * Math.cos(a)} x2={16 + r2 * Math.sin(a)} y2={16 - r2 * Math.cos(a)} />;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" /><stop offset=".5" stopColor="#d6e2e8" /><stop offset="1" stopColor="#7f93a6" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="none" stroke={`url(#${id})`} strokeWidth="1.2" />
      <g stroke={`url(#${id})`} strokeWidth="1">{marcas}</g>
      <circle cx="16" cy="16" r="5.2" fill={`url(#${id})`} />
      <path d="M16 1.6l1.6 2.6h-3.2z" fill="#a497f5" />
    </svg>
  );
}
```

**`components/Disco.tsx`** — o disco de cofre em metal escovado: SVG 200×200 com 90 marcas (a cada 4°, uma maior a cada 10), os números 1 a 9 em círculo (a cada 40°, raio 65), um ponteiro lilás fixo no topo e um miolo metálico. O grupo `.giro` é o que roda: para deixar o número `k` sob o ponteiro, rotação `-(k-1)*40` graus. Props: `tamanho` (padrão 216, vira a variável CSS `--d`), `aberto` (anel lilás + brilho), `girando` (gira sem parar: usado no "Abrindo o seu cofre…"), `refGiro`. Copie literalmente:

```tsx
import type { Ref } from "react";

const MARCAS = Array.from({ length: 90 }, (_, i) => {
  const maior = i % 10 === 0;
  const a = (i * 4 * Math.PI) / 180;
  const r1 = 90;
  const r2 = maior ? 79 : 85;
  return { x1: 100 + r1 * Math.sin(a), y1: 100 - r1 * Math.cos(a), x2: 100 + r2 * Math.sin(a), y2: 100 - r2 * Math.cos(a), maior };
});
const NUMEROS = Array.from({ length: 9 }, (_, i) => {
  const a = (i * 40 * Math.PI) / 180;
  return { k: i + 1, x: 100 + 65 * Math.sin(a), y: 100 - 65 * Math.cos(a) };
});

/** Disco de cofre em metal escovado com os números de 1 a 9. O número sob o ponteiro lilás é a combinação. */
export function Disco({ tamanho = 216, aberto = false, girando = false, refGiro }: { tamanho?: number; aberto?: boolean; girando?: boolean; refGiro?: Ref<SVGGElement> }) {
  return (
    <div className={`disco ${aberto ? "aberto" : ""} ${girando ? "girando" : ""}`} style={{ ["--d" as string]: `${tamanho}px` }}>
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <g className="giro" ref={refGiro}>
          {MARCAS.map((m, i) => (
            <line key={i} x1={m.x1.toFixed(2)} y1={m.y1.toFixed(2)} x2={m.x2.toFixed(2)} y2={m.y2.toFixed(2)} strokeWidth={m.maior ? 1.6 : 0.7} />
          ))}
          {NUMEROS.map((n) => (
            <text key={n.k} x={n.x.toFixed(2)} y={n.y.toFixed(2)}>{n.k}</text>
          ))}
        </g>
        <path className="ponteiro" d="M100 14 L94.5 2 L105.5 2 Z" />
      </svg>
      <div className="miolo" />
    </div>
  );
}
```

**`components/CofreAbrindo.tsx`** (client) — o momento principal do app. Exporta três coisas:
- `Soma({ passos, on = true })`: `<p className={"soma " + (on ? "on" : "")}>` com o texto `Soma <b>{passos[0]}</b>` e, para cada passo seguinte, ` → ` + os dígitos do passo anterior separados por ` + ` + ` = ` + o novo valor. O último valor vai em `<em>` (lilás, negrito), os intermediários em `<b>`. Exemplo visível: "Soma 47 → 4 + 7 = 11 → 1 + 1 = 2". Para um passo só (ex.: 7) mostra só "Soma 7".
- `LetrasDoNome({ nome, visiveis = Infinity })`: `<div className="letras" aria-label="Letras do nome e seus números">`, uma `<span className="palavra">` por palavra, e em cada uma uma `<span className={"letra " + (on ? "on" : "")}>` com `<b>` = letra ORIGINAL em maiúscula (com acento) e `<i>` = valor. Uma letra está `on` se o índice global dela < `visiveis`. Usa `letrasDoNome()` de `lib/numerologia/calculo`.
- `CofreAbrindo({ nome, numeros, children })`: `<div className="abertura" onClick={() => !aberto && terminar()}>` contendo, nesta ordem: `<Disco aberto={aberto} refGiro={giro} />`, `<LetrasDoNome nome visiveis />`, `<Soma passos={numeros.passosOficio} on={somaOn} />`, `{!aberto && <p className="pular">Toque para pular</p>}`, e `<section className={"revelacao " + (aberto ? "on" : "")} aria-live="polite" aria-hidden={!aberto}>` com:
  - `<p className="kicker">Seu Número de Ofício é</p>`
  - `<p className="numero-grande cromo">{oficio}</p>`
  - `<h2 className="titulo-oficio">o Número de {tituloNaFrase(oficio)}</h2>`
  - `<p className="texto-oficio">{SIGNIFICADOS[oficio].oficio}</p>`
  - `<div className="par">` com dois `<div className="mini">`: (1) `<span>Número da Moeda</span><strong className="cromo">{moeda}</strong><p>{SIGNIFICADOS[moeda].moeda}</p>`; (2) `<span>Ano de Colheita</span><strong className="cromo">{anoColheita}</strong><p>Hora de {fase}. {frase}</p>` (fase/frase de `colheita()`).
  - `{aberto && children}` (o botão de seguir).
  - Linha do tempo (com `setTimeout`, todos guardados num ref para limpar): letra i aparece em `300 + i*80` ms; soma aparece em `fimLetras = 300 + total*80 + 150`; o disco gira até a Moeda em `fimLetras+250` (sentido horário, +1 volta inteira), até o Ano de Colheita em `fimLetras+1300` (anti-horário, +1 volta), até o Ofício em `fimLetras+2350` (horário, 0 voltas extra); `terminar()` em `fimLetras+3350`. Girar: alvo `-(k-1)*40`; diferença = `((alvo - rotAtual) % 360 + 360) % 360`; se sentido -1, diferença = (diferença === 0 ? 0 : diferença - 360); `rot += diferença + sentido*360*voltas`; aplica `transform: rotate(rot deg)` no `<g>` (a transição CSS de 0.95s faz o giro). `terminar()`: limpa timers, tira a transição, põe o disco direto em `-(oficio-1)*40`, mostra todas as letras, a soma e `aberto=true`. Com `prefers-reduced-motion` (função `semMovimento()` de `lib/ui`), chama `terminar` já no início. Um toque em qualquer lugar da abertura pula para o fim.

**`components/Moldura.tsx`** (client) — esqueleto de toda tela. Props: `children`, `voltar?: string | true`, `semAbas = false`, `direita?: ReactNode`, `nomeMarca = marca.nomeApp`.
- Estrutura: `<div className={"app " + (semAbas ? "" : "com-lateral")}>`; se não `semAbas`, `<aside className="lateral" aria-label="Menu">` com `<Link href="/" className="marca"><Emblema /><span>{marca.nomeApp}</span></Link>`, os 5 itens do MENU como `<Link className="item" aria-current={caminho === href ? "page" : undefined}><Icone size={20} />{rotulo}</Link>` e `<div className="rodape-lateral"><span><IconeCheck size={14} />Acesso por código no e-mail</span><span><IconeCadeado size={13} />Tudo salvo neste aparelho</span></div>`.
- Depois `<div className={"shell " + (semAbas ? "sem-abas" : "")}>` com `<header className="topbar">`: à esquerda, se `voltar === true` um `<button className="voltar" aria-label="Voltar">` com `router.back()`, se `voltar` é texto um `<Link className="voltar" aria-label="Voltar">`, senão `<Link href="/" className="marca"><Emblema /><span>{nomeMarca}</span></Link>`; à direita `<div className="topbar-direita">{direita}<BotaoSair /></div>`. Em seguida `children`.
- Fora do `.app`, se não `semAbas`: `<div className="tabbar"><nav aria-label="Navegação principal">` com as 4 ABAS (`className="tab"`, `aria-current` igual, `<Icone />` + rótulo).
- MENU: `/` "Início" (IconeInicio), `/numero-que-vende` "Número que Vende" (IconeCofre), `/produtos` "Meus Produtos" (IconeProdutos), `/agenda` "Agenda da Colheita" (IconeAgenda), `/mapa` "Meu Mapa" (IconeMapa).
- ABAS: `/` "Início", `/numero-que-vende` "Número", `/produtos` "Produtos", `/agenda` "Agenda" (mesmos ícones).

**`components/BotaoSair.tsx`** (client) — só aparece se `useConvexAuth().isAuthenticated`. `<div className="sair"><button className="btn btn-contorno btn-sm">` com texto "Sair" (ou "Saindo…" enquanto espera). Ao clicar: `signOut()` (de `useAuthActions`), `definirDonoDosDados(null)`, `router.replace("/entrar")`, `router.refresh()`. Erro: `<small role="alert">Não foi possível sair. Tente novamente.</small>`.

**`components/Aviso.tsx`** (client) — o "toast": `<div className={"toast " + (on ? "on" : "")} role="status" aria-live="polite">{texto}</div>`. Ouve o evento de janela `cofre:aviso` (CustomEvent com o texto em `detail`), mostra e esconde depois de 1900 ms. Fica montado uma vez no layout raiz.

**`components/Preco.tsx`** — `export function Preco({ texto }) { return <>{texto}</>; }` (fica num componente só para ajustar o desenho do valor num lugar).

**`components/Vazio.tsx`** — estado vazio padrão: `<section className="card-destaque vazio entrar"><Disco tamanho={96} /><h2>{titulo}</h2><p>{texto}</p><Link href={href} className="btn btn-acao">{acao}</Link></section>`, com padrões `acao = "Descobrir o meu número"` e `href = "/numero-que-vende"`.

**`components/RodapeHonestidade.tsx`** — `<p className="honesto">{RODAPE_HONESTIDADE}</p>`.

**`components/AgendaSemana.tsx`** — recebe `ano` (Ano de Colheita) e usa `proximosDias(ano)`. `<div className="agenda">` com 7 `<div className={"dia " + (i===0 ? "hoje-dia" : "") + " " + (bom ? "bom" : "")}>` contendo `<span className="sem">` ("hoje" no primeiro, senão dom/seg/ter/qua/qui/sex/sáb), `<span className="dt">{dia do mês}</span>`, `<span className="pn">{n}</span>`, `<span className="ponto" />`. `aria-label` de cada dia: `"hoje, " (só no primeiro) + "{sem} {dia}, dia {n}" + (bom ? ", bom para anunciar" : "")`. Depois `<p className="legenda"><i />bom para anunciar</p>` e `<p className="pequeno">Qualquer dia serve. A agenda só te ajuda a escolher por onde começar.</p>`.

**`components/ProdutoView.tsx`** (client) — props `produto: ProdutoSalvo`, `anoColheita: number | null`, `children`. Estado `aba` = "status" | "grupo" | "privado" (começa em "status").
- `<div className="resultado-grade">`
  - Coluna 1 `<div className="coluna">`: `<article className="card-destaque produto entrar">` com `<h1>{nomeProduto}</h1>`, `<p className="promessa">{promessa}</p>`, `<div className="sec-titulo"><h2>O que vai no seu mini-guia</h2><button>Copiar tópicos</button></div>` (copia `"1. tópico\n2. tópico..."`), `<ol className="topicos">` com os tópicos, `<div className="preco"><span>Preço de exemplo</span><strong className="cromo"><Preco texto={formatarPreco(precoExemplo)} /></strong></div>` e `<p className="preco-nota">valor sugerido, não é garantia de venda</p>`.
  - Coluna 2 `<div className="coluna coluna-lado">`: `<section>` com `<div className="sec-titulo"><h2>Mensagens prontas</h2></div>`, `<div className="abas" role="group" aria-label="Tipo de mensagem">` com 3 botões "Status", "Grupo", "Privado" (`aria-pressed`), `<p className="balao">{mensagem da aba}</p>`, `<div className="acoes-msg"><a className="btn btn-acao" href={linkWhatsApp(mensagem)} target="_blank" rel="noopener noreferrer">Mandar no WhatsApp</a><button className="btn btn-contorno" style={{width:"auto"}}>Copiar</button></div>`, `<p className="pequeno">O botão só abre o WhatsApp. Você escolhe a pessoa ou o grupo e envia.</p>`. Se `anoColheita !== null`: `<section><div className="sec-titulo"><h2>Agenda da Colheita</h2></div><AgendaSemana ano={anoColheita} /></section>`. Por fim `{children}`.

**`components/ConvexClientProvider.tsx`** (client) — cria uma vez `new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)` (em `useState`) e envolve com `<ConvexAuthNextjsProvider client={client}>` de `@convex-dev/auth/nextjs`.

**`components/AcessoPago.tsx`** (client) — guarda das telas pagas no navegador. `useQuery(api.acesso.atual)`. Enquanto `undefined`, ou se não ativo, ou se o dono dos dados ainda não foi definido: `<main className="shell"><p role="status">Conferindo seu acesso…</p></main>`. Efeito: se `null` → `definirDonoDosDados(null)` e `router.replace("/entrar")`; se `!ativo` → `definirDonoDosDados(null)` e `router.replace("/acesso")`; se ativo → `definirDonoDosDados(acesso.usuarioId)` e guarda o id num estado; no desmontar, `definirDonoDosDados(null)`. Só renderiza `children` quando ativo e o dono = `acesso.usuarioId`.

### 4.2 Layouts

**`app/layout.tsx`** (servidor): fonte Geist como acima. `metadata`: `title: marca.nomeApp`, `description: "Descubra o seu Número que Vende e monte o seu primeiro produto, pronto para mandar no WhatsApp."`, `appleWebApp: { capable: true, title: marca.nomeApp, statusBarStyle: "black-translucent" }`. `viewport`: `themeColor: "#090e18"`, `viewportFit: "cover"`, `width: "device-width"`, `initialScale: 1`. HTML: `<html lang="pt-BR" className={geist.variable}><body><ConvexAuthNextjsServerProvider storage="inMemory" shouldHandleCode={false}><ConvexClientProvider>{children}<Aviso /></ConvexClientProvider></ConvexAuthNextjsServerProvider></body></html>`.

**`app/vitrine/layout.tsx`**: só troca o título da aba: `metadata = { title: marca.nomeVitrine, appleWebApp: { capable: true, title: marca.nomeVitrine, statusBarStyle: "black-translucent" } }` e devolve `children`.

**`app/(pago)/layout.tsx`** (servidor, async): `const token = await convexAuthNextjsToken()`; sem token → `redirect("/entrar")`; `const acesso = await fetchQuery(api.acesso.atual, {}, { token })`; `null` → `redirect("/entrar")`; `!acesso.ativo` → `redirect("/acesso")`; senão `<AcessoPago>{children}</AcessoPago>`.

**`proxy.ts`** (Next 16 chama o middleware de proxy):
```ts
import {convexAuthNextjsMiddleware,createRouteMatcher} from "@convex-dev/auth/nextjs/server";
import {NextResponse} from "next/server";
const protegido=createRouteMatcher(["/","/agenda(.*)","/mapa(.*)","/numero-que-vende(.*)","/produtos(.*)","/resultado(.*)","/api/produto(.*)","/acesso(.*)"]);
export default convexAuthNextjsMiddleware(async(request,{convexAuth})=>{
 if(protegido(request)&&!await convexAuth.isAuthenticated()){
  if(request.nextUrl.pathname.startsWith("/api/"))return NextResponse.json({erro:"Entre com seu e-mail para continuar."},{status:401});
  const url=request.nextUrl.clone();url.pathname="/entrar";url.search="";url.searchParams.set("voltar",request.nextUrl.pathname);return NextResponse.redirect(url);
 }
},{cookieConfig:{maxAge:60*60*24*30},shouldHandleCode:()=>false});
export const config={matcher:["/((?!_next|.*\\..*).*)","/","/(api|trpc)(.*)"]};
```

## 5. As telas, uma por uma (textos literais)

Todas as telas pagas são client components (`"use client"`) que leem os dados com `useDados()` e enquanto `pronto` é falso não mostram estado vazio (evita piscar). Números sempre recalculados com `calcularNumeros(perfil.nome, perfil.dia, perfil.mes)`.

### 5.1 Início — `app/(pago)/page.tsx` (`<Moldura>`, com abas)

1. `<section className="saudacao entrar">`: `<h1 className="display">` = com perfil `"{Bom dia|Boa tarde|Boa noite}, {primeiro nome}"` (antes das 12h Bom dia, antes das 18h Boa tarde, senão Boa noite); sem perfil "Boas-vindas ao seu cofre". `<p className="lead">` = com perfil "O seu número já está calculado. Escolha por onde quer seguir hoje."; sem perfil "Tudo o que você precisa para transformar o que já sabe fazer num primeiro produto."
2. `<div className="painel-grade">` com duas colunas.
   **Coluna 1** (`.coluna`):
   - COM número: `<section className="card-destaque heroi entrar">`: `<p className="kicker">Seu Número que Vende</p>`, `<div className="heroi-num"><span className="numero-grande cromo">{oficio}</span><p><span>Número de Ofício</span>o Número de {tituloNaFrase(oficio)}</p></div>`, `<div className="acoes-heroi">` com `Link /numero-que-vende#talentos` `btn btn-acao` "Montar um novo produto" e `Link /mapa` `btn btn-contorno` "Ver o meu mapa".
   - SEM número: `<section className="card-destaque heroi entrar">`: `<div className="heroi-topo"><div><p className="kicker">Número que Vende</p><h2>Descubra o que você já sabe fazer que pode virar dinheiro</h2><p>O seu nome mostra o seu Número de Ofício. Em 2 minutos você sai com um produto pronto para oferecer no WhatsApp.</p></div><Disco tamanho={104} /></div>`; `<div className="etapas"><span><b>1</b>Nome e data</span><span><b>2</b>O que você sabe fazer</span><span><b>3</b>Produto pronto</span></div>`; `Link /numero-que-vende` `btn btn-acao` "Descobrir o meu número" + `<IconeSeta />`; `<div className="confianca"><span><IconeCheck size={14} />Leva 2 minutos</span><span><IconeCheck size={14} />Sem senha</span><span><IconeCadeado size={13} />Fica salvo no seu celular</span></div>`.
   - `<p className="ornamento">Ferramentas do cofre</p>` e `<div className="grade">` com 4 cartões `Ferramenta` (`<Link className={"card ferramenta " + (trancada ? "trancada" : "")}>` → `<span className="icone">` (cadeado 16 se trancada, senão o ícone 20), contador opcional `<span className="contador cromo">`, `<h3>`, `<p>` = "Abre depois do seu número" se trancada, senão o texto):
     - "Meus Produtos" → `/produtos`; texto "Os produtos que você já montou" ou "Nenhum ainda"; contador = quantidade (se > 0); nunca trancado.
     - "Agenda da Colheita" → `/agenda` (ou `/numero-que-vende` se sem número); "Os melhores dias para anunciar"; trancado sem número.
     - "Meu Mapa" → `/mapa` (ou `/numero-que-vende`); "Seus 3 números e como chegamos neles"; trancado sem número.
     - "Mensagens Prontas" → `/resultado#{id do último}` (ou `/numero-que-vende`); "Status, grupo e privado"; trancado sem produto.
   **Coluna 2** (`.coluna.coluna-lado`):
   - COM número: `<div className="sec-titulo"><h2>Hoje</h2></div>` + `<div className="card hoje"><span className="num-serif cromo">{n de hoje}</span><p>{DIA[n]}<small>{dia da semana por extenso} {dia do mês}</small></p>{n em [1,3,5,8] && <span className="selo">Bom para anunciar</span>}</div>`. Dias por extenso: domingo, segunda-feira, terça-feira, quarta-feira, quinta-feira, sexta-feira, sábado. `n de hoje = diaPessoal(anoColheita, new Date())`.
   - SEM número: `<div className="sec-titulo"><h2>Como funciona</h2></div>` + `<div className="card como" style={{padding:18, marginTop:0}}>` com 3 itens `<div><b>1</b><p><strong>Digite o seu nome e a data.</strong> O app calcula o seu número letra por letra.</p></div>`, `<b>2</b> <strong>Marque o que te pedem sempre.</strong> Bolo, unha, reforço escolar, conselho...`, `<b>3</b> <strong>Receba o produto pronto.</strong> Nome, preço de exemplo e mensagens para o WhatsApp.`
   - Se há último produto: `<div className="sec-titulo"><h2>Seu último produto</h2><Link href="/produtos">Ver todos</Link></div>` + `<Link href="/resultado#{id}" className="card ultimo"><div style={{flex:1,minWidth:0}}><h3>{nomeProduto}</h3><small>Preço de exemplo <Preco texto={formatarPreco(preco)} /></small></div><IconeSeta /></Link>`.
   - Se há número: `<div className="sec-titulo"><h2>Sua semana</h2><Link href="/agenda">Abrir agenda</Link></div>` + `<AgendaSemana ano={anoColheita} />`.

### 5.2 Número que Vende — `app/(pago)/numero-que-vende/page.tsx` (fluxo de 5 passos, SEM abas)

Enquanto `!pronto`: `<div className="shell sem-abas" />`. Depois monta o fluxo com os dados iniciais. Não usa `Moldura`: usa `<div className="shell sem-abas">` próprio com `<header className="topbar"><button className="voltar" aria-label="Voltar"><IconeVoltar /></button><span className="passo-label">Passo <b>{etapa+1}</b> de 5</span></header>` e `<div className="progresso" aria-hidden="true">` com 5 `<span>` (classe `on` se índice ≤ etapa).

ETAPAS = "Seu nome", "Sua data", "Seu número", "Seus talentos", "Seu jeito".

Estado inicial: se já há perfil E o endereço termina em `#talentos`, começa na etapa 3 (talentos); senão na 0. Campos preenchidos com o perfil salvo (dia e mês com 2 dígitos), talentos, "outro" e respostas salvas; `formato` começa em "Deixa o app escolher".

Voltar: na etapa 0 vai para `/`; na etapa 3 volta para a 1 (pula a animação); nas outras, etapa-1. Sempre limpa o erro.

`<div className={"fluxo-grade " + (etapa === 2 ? "sem-lado" : "")}>` → `<div className="coluna">` com a etapa atual, e `<aside className="fluxo-lado" aria-hidden="true"><Disco tamanho={240} /><ol>` com os 5 passos (`<li className="feito|atual|">` + `<b>{✓ se feito, senão número}</b>` + nome) `</ol><p>{AVISO_GOLPE}</p></aside>` (o aside só aparece no computador).

- **Etapa 0** (`<form className="entrar">`): kicker "Número que Vende"; `<h1 className="display">Qual é o seu nome completo?</h1>`; lead "Escreva como está na certidão. Cada letra vira um número."; `<label className="campo grande" style={{marginTop:26}}><span>Nome completo</span><input autoFocus autoComplete="name" placeholder="Maria Aparecida da Silva" /></label>`; `<p className="erro" aria-live="polite">`; `<p className="aviso"><IconeCadeado /><span>{AVISO_GOLPE}</span></p>`; `<div className="doca"><button className="btn btn-acao" type="submit">Continuar</button></div>`. Erro se nome inválido: "Coloque o nome completo, com sobrenome."
- **Etapa 1** (`form`): kicker "Número que Vende"; título "Quando você nasceu?"; lead "A data mostra o seu momento: começar, semear ou colher."; `<div className="data" style={{marginTop:26}}>` com 3 campos `campo` "Dia" (placeholder 14, máx. 2), "Mês" (03, máx. 2), "Ano" (1972, máx. 4), `inputMode="numeric"`, só dígitos; erro; aviso anti-golpe; botão "Revelar meu Número que Vende". Erro: "Confira a data: dia, mês e ano em que você nasceu." Se válida, GRAVA o perfil `{ nome: nome.trim(), dia, mes, ano }` e vai à etapa 2.
- **Etapa 2**: `<CofreAbrindo nome numeros key={nome+dia+mes}>` com o botão `btn btn-acao` "Ver o que combina com o meu número" (vai à 3).
- **Etapa 3** (`div.entrar`): kicker "O Espelho do Talento"; título "O que você já sabe fazer?"; lead "Toque no que te pedem sempre. Pode marcar até 3."; bloco Talentos: `<p className="ornamento"><IconeEstrela /> Combina com o seu número {oficio}</p>` (se Ofício ≠ Moeda: "Combina com o seu número {oficio} e {moeda}"), `<div className="chips">` com os talentos que combinam (chip com classe `estrela`, mostra `<IconeEstrela />`), `<p className="ornamento">Outros talentos</p>` e `<div className="chips">` com o resto (sem estrela). Cada chip é `<button className="chip [estrela]" aria-pressed={marcado} disabled={!marcado && já há 3}>` mostrando `<IconeCheck size={14} />` quando marcado (no lugar da estrela) + nome. Depois `<label className="campo" style={{marginTop:24}}><span>Faz outra coisa que te pedem sempre? Escreva aqui</span><input maxLength={60} placeholder="Opcional" /></label>`; `<div className="doca"><p className="contagem"><b>{n}</b> de 3 marcados</p><button className="btn btn-acao" disabled={nenhum marcado}>Continuar</button></div>`.
- **Etapa 4** (`div.entrar`): kicker "Quase lá"; título "Conte um pouco do seu jeito"; lead "Isso ajuda a montar um produto que cabe na sua rotina. Pode pular o que quiser."; três perguntas (`<p className="pergunta">` + `<div className="opcoes" role="group" aria-label={título}>` com `<button className="opcao" aria-pressed>{opção}<i /></button>`; tocar de novo desmarca): "Para quem você mais faz isso hoje?" (PUBLICOS), "Quanto tempo você tem para isso?" (TEMPOS), "Como prefere entregar?" (FORMATOS); erro; `<div className="doca"><button className="btn btn-acao" disabled={gerando}>Montar meu produto</button></div>`.
- **Montar**: se `geracoesHoje(lerDados()) >= marca.limiteGeracoesPorDia` → erro LIMITE_ATINGIDO e para. Senão grava talentos/outro/respostas, monta o `PedidoProduto` (primeiroNome cortado em 60, números, `tituloOficio` e `significadoOficio` de SIGNIFICADOS, talentos, `outro.trim() || undefined`, publico/tempo/formato ou undefined, `precoMin/precoMax` de `marca`), mostra a sobreposição `<div className="sobreposicao" role="status"><Disco tamanho={132} girando /><p>Abrindo o seu cofre…</p></div>`, faz `POST /api/produto` com o JSON e espera no MÍNIMO 1800 ms (para a animação). Se a resposta não for ok ou der erro de rede → monta ali mesmo com `ajustarLimites(montarProdutoModelo(pedido), min, max)` e `origem: "modelo"`. Salva `{ ...produto, id: crypto.randomUUID().slice(0, 8), criadoEm: ISO, talentos, origem }` NO INÍCIO da lista, corta em 20, soma 1 no contador do dia e vai para `/resultado#{id}`.

### 5.3 Resultado — `app/(pago)/resultado/page.tsx` (`<Moldura voltar="/">`)

Lê o id do `#` com `useHash()`; ao mudar o id, `window.scrollTo(0,0)` (o navegador tentaria rolar até a âncora). Enquanto `!pronto`: `<div className="shell" />`. Produto = o do id ou, se não achar, o primeiro da lista.
- Sem produto: `<Vazio titulo="Nenhum produto por aqui" texto="Descubra o seu número e monte o seu primeiro produto em poucos minutos." />`.
- Com produto: `<span className="pronto"><IconeCheck size={15} />Seu produto está pronto{perfil ? ", " + primeiro nome : ""}</span>`; só em desenvolvimento e se `origem === "modelo"`: `<p className="dev-aviso">Texto do modelo, sem IA. Cadastre a ANTHROPIC_API_KEY nas variáveis do Convex para a IA escrever. (Só aparece no computador.)</p>`; `<ProdutoView produto anoColheita>` com children `<div style={{display:"grid",gap:8,marginTop:30}}>`: `Link /numero-que-vende#talentos` `btn btn-contorno` "Montar outro produto", `Link /` `btn btn-calmo` "Voltar ao início", `<a className="suporte" href="https://wa.me/{marca.whatsappSuporte}" target="_blank" rel="noopener noreferrer">Precisa de ajuda? <u>Fale no WhatsApp</u></a>` e, só em desenvolvimento se o WhatsApp ainda é o de exemplo, `<p className="dev-aviso">Configure o WhatsApp de suporte em config/marca.ts.</p>`.

### 5.4 Meus Produtos — `app/(pago)/produtos/page.tsx` (`<Moldura>`)

`<section className="saudacao entrar"><h1 className="display">Meus Produtos</h1><p className="lead">Tudo fica salvo neste celular. Abra um produto para copiar as mensagens.</p></section>`. Vazio: `<Vazio titulo="Nenhum produto ainda" texto="Monte o seu primeiro produto. Leva uns 2 minutos." />`. Lista `<div className="lista-produtos">`: cada produto `<Link href="/resultado#{id}" className={"ultimo entrar " + (i === 0 ? "card-destaque" : "card")}>` com `<div style={{flex:1,minWidth:0}}><h3>{nome}</h3><small>{talentos.join(", ")}</small></div><span className="preco-tag cromo"><Preco .../></span><IconeSeta />`. Se há produtos: `<div style={{marginTop:18,maxWidth:420}}>` com `Link /numero-que-vende#talentos` `btn btn-acao` "Montar um novo produto" e `<p className="pequeno" style={{textAlign:"center",marginTop:10}}>Preços de exemplo. Valor sugerido, não é garantia de venda.</p>`.

### 5.5 Agenda da Colheita — `app/(pago)/agenda/page.tsx` (`<Moldura>`)

Título "Agenda da Colheita". Lead com número: "Seu Ano de Colheita é {ano}: hora de {fase}. Cada dia tem um número que mostra para o que ele é bom."; sem número: "Cada dia tem um número pessoal. Ele aparece depois que você descobre o seu." Vazio: `<Vazio titulo="A agenda abre com o seu número" texto="Digite o seu nome e a sua data de nascimento para ver os próximos dias." />`. Com número: `<div className="lista-dias">` com 7 `<div className={"card linha-dia entrar " + (bom ? "bom-dia" : "")}>`: `<span className={"num-serif " + (bom ? "" : "cromo")}>{n}</span>`, `<p>{DIA[n]}<small>{i===0 ? "Hoje, " : ""}{data por extenso}</small></p>` (formato `Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" })`), e se bom `<span className="selo">Anunciar</span>`. Abaixo `<p className="pequeno" style={{marginTop:14}}>Qualquer dia serve. A agenda só te ajuda a escolher por onde começar.</p>`.

### 5.6 Meu Mapa — `app/(pago)/mapa/page.tsx` (`<Moldura voltar="/">`)

Título "Meu Mapa"; lead "Os seus três números, calculados letra por letra a partir do seu nome e da sua data.". Vazio: `<Vazio titulo="O mapa abre com o seu número" texto="Digite o seu nome e a sua data de nascimento para ver os seus números." />`. Com número, `<div className="mapa-cards">` com 3 cartões `mapa-num entrar` (o primeiro `card-destaque`, os outros `card`), cada um `<span className="num-serif cromo">{n}</span><div><h3>…</h3><p className="t">…</p><p className="d">…</p></div>`:
1. "Número de Ofício" / t = `SIGNIFICADOS[oficio].titulo` / d = `SIGNIFICADOS[oficio].oficio`.
2. "Número da Moeda" / t = "O dom que já valorizam em você" / d = `SIGNIFICADOS[moeda].moeda + " Vem da soma das vogais do seu nome."`.
3. "Ano de Colheita" / t = "Hora de {fase}" / d = `frase + " Vem do seu dia e mês de nascimento com o ano atual."`.
Depois `<p className="ornamento">Como chegamos no {oficio}</p>`, `<div className="abertura"><LetrasDoNome nome /><Soma passos={passosOficio} /></div>`, `<p className="pequeno" style={{textAlign:"center",marginTop:12}}>Tabela pitagórica: cada letra vale de 1 a 9. Somamos tudo e reduzimos até sobrar um número só.</p>`. Por fim `<div style={{marginTop:30,maxWidth:420}}>`: botão `btn btn-calmo` "Começar com outro nome"; ao tocar vira `<div className="confirmar"><p>Apagar o seu nome, a data e os produtos salvos neste celular?</p><div><button className="btn btn-contorno btn-sm">Cancelar</button><button className="btn btn-acao btn-sm">Apagar</button></div></div>`. Apagar: `apagarTudo()` e vai para `/numero-que-vende`.

### 5.7 Vitrine — `app/vitrine/page.tsx` (`<Moldura semAbas nomeMarca={marca.nomeVitrine}>`, aberta, sem login, sem salvar nada)

Antes do cálculo — `<div className="vitrine-grade">`:
- `<header className="vitrine-heroi entrar">`: kicker "Grátis, em 2 minutos"; `<h1 className="display lg">Existe um cofre no seu nome. E o que tem dentro não é bloqueio.</h1>`; lead "Digite o seu nome e a data de nascimento. O seu Número de Ofício mostra qual coisa que você já faz de graça para os outros tem mais chance de virar dinheiro."; `<div className="como">` com `<b>1</b> <strong>Você digita o nome e a data.</strong> Acesso por código, sem senha.`, `<b>2</b> <strong>O cofre abre letra por letra.</strong> Você vê a conta acontecer na tela.`, `<b>3</b> <strong>Você descobre o seu número.</strong> E o que ele diz sobre o que você faz bem.`
- `<form className="card-destaque entrar" style={{padding:"26px 22px 22px"}}>`: `<h2 className="display sm" style={{marginBottom:18}}>Digite a combinação do seu cofre</h2>`; `<div style={{display:"grid",gap:10}}>` com campo "Seu nome completo, como está na certidão" (`autoComplete="name"`) e `<div className="data">` Dia/Mês/Ano (sem placeholder); `<p className="erro" aria-live="polite">`; botão `btn btn-acao` "Revelar meu Número que Vende" + `<IconeSeta />`; `<p className="aviso"><IconeCadeado /><span>{AVISO_GOLPE}</span></p>`. Mesmas mensagens de erro do fluxo. Ao revelar, `window.scrollTo({top:0})`.
Depois do cálculo: `<CofreAbrindo nome numeros>` com o botão "Ver o que tem no cofre inteiro" + `<IconeSeta />` (some depois de clicado); ao clicar mostra a Oferta e rola suave até `#oferta` (50 ms depois).
**Oferta** — `<section id="oferta" className="oferta-grade entrar" style={{marginTop:40, scrollMarginTop:20}}>`:
- Coluna 1: `<div className="recap"><span className="numero-grande cromo">{oficio}</span><p><span>Seu Número de Ofício</span>o Número de {tituloNaFrase(oficio)}</p></div>`; `<p className="lead" style={{marginBottom:20}}>O seu Número de Ofício já está aqui. Falta abrir o cofre inteiro: o nome do seu Primeiro Produto, o preço de exemplo e o que dizer para a primeira pessoa.</p>`; `<div className="chips">` com os 3 primeiros talentos que combinam (`chip estrela` + estrela) e mais 7 outros BORRADOS (`chip borrado`, `aria-hidden`); `<ul className="inclui">` com OFERTA_ITENS (`<li><IconeCheck /><span>{item}</span></li>`).
- Coluna 2: `<div className="card-destaque oferta"><span className="rot">Cofre completo</span><p className="valor cromo">{marca.precoTexto}</p><p className="parc">{marca.parcelasTexto}</p><a className="btn btn-acao" href={marca.linkPagamento} target="_blank" rel="noopener noreferrer">Abrir o meu cofre agora</a><p className="aviso"><IconeCadeado /><span>{RODAPE_SEGURANCA}</span></p>` + só em desenvolvimento, se o link é o de exemplo, `<p className="dev-aviso">Configure o linkPagamento em config/marca.ts.</p>` `</div>` e `<p className="versus">Calculadora grátis te dá um número e um parágrafo. Aqui o número vira uma coisa que você manda hoje para alguém.</p>`.
Sempre no fim da vitrine: `<RodapeHonestidade />`.

### 5.8 Entrar — `app/entrar/page.tsx` (`<Moldura semAbas>`)

`<main className="auth-card entrar">`: `<span className="auth-emblema"><IconeCadeado size={28} /></span>`, kicker "Seu acesso", `<h1 className="display">` "Entre com seu e-mail" (depois de enviar: "Confira seu e-mail"), lead "Use o mesmo e-mail da sua compra. Você recebe um código e entra sem senha." (depois: "Enviamos um código para {email}. Ele vale por 15 minutos."). `<form className="auth-form">`:
- Passo e-mail: `<label className="campo" htmlFor="email"><span>Seu e-mail</span><input id="email" name="email" type="email" autoComplete="email" maxLength={254} placeholder="voce@exemplo.com" required autoFocus /></label>`.
- Passo código: input escondido com o e-mail + `<label className="campo" htmlFor="codigo"><span>Código de acesso</span><input id="codigo" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{8}" minLength={8} maxLength={8} placeholder="8 números" required autoFocus /></label>` (só dígitos).
- `<p className="erro" role="alert">`; botão `btn btn-acao` submit com texto "Receber meu código" / "Entrar" (ocupado: "Enviando código…" / "Conferindo código…") + `<IconeSeta />`; abaixo, no passo e-mail, `Link /vitrine` `btn btn-contorno` "Voltar para a vitrine"; no passo código, botão `btn btn-contorno` "Voltar" (zera e volta ao e-mail).
- `<p className="micro auth-note">Seu acesso pode durar até 30 dias neste navegador. Use “Sair” em aparelhos compartilhados.</p>`.
Lógica: e-mail vai `trim().toLowerCase()` e chama `signIn("resend-otp", { email })`; código chama `signIn("resend-otp", { email, code: codigo.trim() })`; se `!resultado.signingIn` → "Confira o código recebido no e-mail.". Exceções: no código "Código incorreto ou vencido. Confira o e-mail ou volte para pedir outro."; no e-mail "Não foi possível enviar o código. Tente novamente em alguns instantes.". Quando `useConvexAuth().isAuthenticated` vira verdadeiro: lê `?voltar=`, aceita só `/`, `/agenda`, `/mapa`, `/numero-que-vende`, `/produtos`, `/resultado` (senão `/`), faz `router.replace` + `router.refresh()`.

### 5.9 Acesso — `app/acesso/page.tsx` (`<Moldura semAbas>`; logado sem compra ativa)

`useQuery(api.acesso.atual)`; se ficar ativo → `router.replace("/")` + `router.refresh()`. `<main className="auth-card">`: kicker "Seu acesso"; `<h1 className="display">Sua compra ainda não está ativa.</h1>`; lead "Você entrou na sua conta. Para abrir as ferramentas, precisamos confirmar uma compra ativa no mesmo e-mail."; `<p>Se já comprou, confira o e-mail usado no pagamento. Você também pode sair e entrar com outro e-mail.</p>`; `<div className="auth-form">`: se o link de pagamento NÃO é o de exemplo, `<a className="btn btn-acao" href={marca.linkPagamento} target="_blank" rel="noopener noreferrer">Ver acesso · {marca.precoTexto}</a>`; `<button className="btn btn-contorno">Conferir novamente</button>` (`router.refresh()`); `Link /vitrine` `btn btn-contorno` "Ver a vitrine".

## 6. Lógica no aparelho (`lib/`)

**`lib/textos.ts`** — copie literalmente:

```ts
export const RODAPE_HONESTIDADE =
  "Exemplos ilustrativos. O app entrega o seu número, o produto e as mensagens prontos; as vendas dependem de você e não são garantidas. A numerologia é uma ferramenta de autoconhecimento e não substitui orientação financeira profissional.";

export const RODAPE_SEGURANCA =
  "Pagamento feito numa plataforma de pagamento segura, fora deste app. Nós não vemos nem guardamos os dados do seu cartão.";

export const AVISO_GOLPE = "Só nome e data. Ninguém aqui te pede senha, CPF nem Pix.";

export const OFERTA_ITENS = [
  "O seu Número de Ofício, o Número da Moeda e o Ano de Colheita, calculados letra por letra",
  "O Espelho do Talento",
  "O cartão Seu Primeiro Produto: nome, promessa e tópicos do mini-guia",
  "O preço de exemplo",
  "3 mensagens prontas com o botão Mandar no WhatsApp",
  "A Agenda da Colheita com os próximos 7 dias",
  "Tudo salvo no seu celular",
  "Suporte pelo WhatsApp para dúvidas de acesso",
];

export const PUBLICOS = ["Vizinhas e amigas", "Família", "Colegas de trabalho", "Grupos de WhatsApp", "Mães da escola"];
export const TEMPOS = ["Até 2 horas por semana", "De 3 a 5 horas por semana", "Mais de 5 horas por semana"];
export const FORMATOS = ["Deixa o app escolher", "Mini-guia em PDF", "Checklist de uma página", "Passo a passo com fotos"];

export const LIMITE_ATINGIDO = "Você já montou vários produtos hoje. Volte amanhã para montar mais.";
```

**`lib/numerologia/calculo.ts`** — numerologia pitagórica, em código (comentário no topo: "Numerologia pitagórica, calculada em código. A IA nunca calcula números."). Exporte exatamente:
- `VOGAIS = "AEIOU"` (Y e W contam como CONSOANTES).
- `normalizar(texto)`: `toUpperCase()` → `normalize("NFD")` → remove os sinais combinantes (faixa Unicode U+0300 a U+036F) → remove tudo que não for `A-Z`. Ç vira C pelo próprio NFD. Ex.: `"João Conceição d'Ávila-2"` → `"JOAOCONCEICAODAVILA"`.
- `valorLetra(letra) = ((letra.charCodeAt(0) - 65) % 9) + 1`. Tabela: 1 = A J S · 2 = B K T · 3 = C L U · 4 = D M V · 5 = E N W · 6 = F O X · 7 = G P Y · 8 = H Q Z · 9 = I R.
- `reduzir(n)`: soma os dígitos até sobrar de 1 a 9, guardando cada passo. Devolve `{ n, passos }`. `reduzir(47)` → `{ n: 2, passos: [47, 11, 2] }`; `reduzir(7)` → `{ n: 7, passos: [7] }`. (Não há números-mestre: 11 e 22 também reduzem.)
- `type LetraCalculada = { original: string; valor: number }` e `letrasDoNome(nome)`: separa o nome por espaços; em cada palavra mantém só os caracteres que, normalizados, sobram como letra; cada um vira `{ original: c.toUpperCase(), valor: valorLetra(normalizar(c)) }`; descarta palavras vazias. (Mostra a grafia original com acento, calcula pela normalizada.)
- `type Numeros = { oficio: number; passosOficio: number[]; moeda: number; anoColheita: number }`.
- `anoPessoal(dia, mes, anoAtual) = reduzir(dia + mes + anoAtual).n`.
- `diaPessoal(ano, data) = reduzir(ano + (data.getMonth() + 1) + data.getDate()).n`.
- `calcularNumeros(nome, dia, mes, hoje = new Date())`: letras = `normalizar(nome)`; **Ofício** = reduzir(soma de todas as letras), com os passos; **Moeda** = reduzir(soma só das vogais), e se o nome não tiver vogais, Moeda = Ofício; **Ano de Colheita** = `anoPessoal(dia, mes, hoje.getFullYear())`. O ano de nascimento NÃO entra no cálculo (só na validação).
- `proximosDias(ano, quantos = 7, hoje = new Date())`: hoje incluído; para cada dia `{ data, n: diaPessoal(ano, data), bomParaAnunciar: [1, 3, 5, 8].includes(n) }`.
- `primeiroNome(nome)`: primeira palavra.
- `nomeValido(nome)`: pelo menos 2 palavras que tenham letra.
- `dataValida(dia, mes, ano, hoje = new Date())`: falso se faltar algum ou ano < 1900; cria `new Date(ano, mes - 1, dia)` e exige que dia e mês batam (recusa 31/02) e que seja anterior a hoje.

Exemplos que os testes conferem: "Ana Silva" → ANA = 7, SILVA = 18, total 25 → Ofício 7 (passos [25, 7]); vogais A, A, I, A = 12 → Moeda 3. "Brynn Thz" → 46 → 10 → 1; sem vogais → Moeda 1. `anoPessoal(14, 3, 2026)` = 9. `diaPessoal(9, 7/out/2026)` = 9 + 10 + 7 = 26 → 8.

**`lib/numerologia/significados.ts`** — textos fixos, sempre positivos. Copie literalmente:

```ts
// Textos fixos de cada número, sempre positivos. Escritos em código, sem IA.

export type Significado = { titulo: string; oficio: string; moeda: string };

export const SIGNIFICADOS: Record<number, Significado> = {
  1: { titulo: "Quem Começa e Lidera", oficio: "Você dá o primeiro passo enquanto os outros ainda estão pensando. As pessoas seguem a sua iniciativa.", moeda: "Valorizam a sua coragem de resolver." },
  2: { titulo: "Quem Acolhe e Une", oficio: "Você escuta, junta as pessoas e faz todo mundo se sentir em casa.", moeda: "Valorizam o seu jeito de acolher." },
  3: { titulo: "Quem Comunica e Alegra", oficio: "Você explica, encanta e deixa mais bonito tudo o que passa pela sua mão.", moeda: "Valorizam o seu capricho e a sua alegria." },
  4: { titulo: "Quem Organiza e Constrói", oficio: "Você transforma bagunça em ordem e ideia em coisa pronta.", moeda: "Valorizam a sua mão firme e caprichosa." },
  5: { titulo: "Quem Movimenta e Adapta", oficio: "Você aprende rápido, se vira em qualquer situação e anima quem estava parado.", moeda: "Valorizam a sua energia e o seu jeito prático." },
  6: { titulo: "Quem Cuida e Ensina", oficio: "Você cuida com carinho e ensina com paciência. Quem passa por você sai melhor.", moeda: "Valorizam o seu cuidado e a sua paciência." },
  7: { titulo: "Quem Estuda e Explica", oficio: "Você vai a fundo, entende o detalhe e explica de um jeito que todo mundo entende.", moeda: "Valorizam o seu conhecimento e a sua calma." },
  8: { titulo: "Quem Administra e Negocia", oficio: "Você enxerga os números, faz o dinheiro render e sabe fechar um bom combinado.", moeda: "Valorizam a sua cabeça boa para contas." },
  9: { titulo: "Quem Serve e Inspira", oficio: "Você ajuda sem esperar nada em troca, e a sua palavra dá força a quem está perto.", moeda: "Valorizam a sua generosidade." },
};

/** "Quem Cuida e Ensina" → "quem Cuida e Ensina", para usar no meio da frase. */
export const tituloNaFrase = (n: number) => SIGNIFICADOS[n].titulo.replace(/^Quem/, "quem");

export function colheita(n: number): { fase: "começar" | "semear" | "colher"; frase: string } {
  if (n <= 3) return { fase: "começar", frase: "Um bom ano para dar o primeiro passo." };
  if (n <= 6) return { fase: "semear", frase: "Um bom ano para mostrar o seu trabalho." };
  return { fase: "colher", frase: "Um bom ano para cobrar pelo que você já sabe." };
}

export const DIA: Record<number, string> = {
  1: "Bom para anunciar algo novo",
  2: "Bom para conversar com quem já te conhece",
  3: "Bom para divulgar e mostrar o seu trabalho",
  4: "Bom para organizar e preparar o material",
  5: "Bom para anunciar novidades",
  6: "Bom para cuidar de quem já comprou",
  7: "Bom para estudar e caprichar no conteúdo",
  8: "Bom para combinar preço e fechar",
  9: "Bom para terminar o que começou",
};
```

**`lib/talentos.ts`** — os 28 talentos do Espelho, com os números com que combinam e a ideia de produto usada pelo modelo sem IA. Um talento "combina" se a lista dele contém o Ofício OU a Moeda. Copie literalmente:

```ts
// Talentos do Espelho. Cada um tem os números com que combina e uma ideia de produto
// que o modelo sem IA usa quando a chave de API não está configurada.

export type Talento = {
  nome: string;
  numeros: number[];
  tema: string;
  produto: string;
  promessa: string;
};

export const TALENTOS: Talento[] = [
  { nome: "Bolo e doces", numeros: [6, 3], tema: "bolos e doces", produto: "Caderno dos Doces que Saem Primeiro", promessa: "As receitas que mais fazem sucesso, com medida, custo e ponto certo." },
  { nome: "Marmita e comida caseira", numeros: [6, 4], tema: "marmita caseira", produto: "Cardápio da Semana em Marmitas", promessa: "Uma semana de marmitas planejada, com lista de compras e porções." },
  { nome: "Unha", numeros: [3, 5], tema: "unhas", produto: "Unhas de Salão Feitas em Casa", promessa: "O passo a passo para fazer as unhas em casa sem borrar." },
  { nome: "Cabelo e trança", numeros: [3, 6], tema: "cabelo e tranças", produto: "Tranças Fáceis para o Dia a Dia", promessa: "Cinco tranças explicadas foto a foto, da mais simples à de festa." },
  { nome: "Maquiagem", numeros: [3, 5], tema: "maquiagem", produto: "Maquiagem Bonita em 10 Minutos", promessa: "Pele bonita e olhar marcado usando poucos produtos." },
  { nome: "Organizar casa e armário", numeros: [4, 6], tema: "organização da casa", produto: "Armário Organizado em Um Fim de Semana", promessa: "Um roteiro de dois dias para arrumar o armário e manter assim." },
  { nome: "Limpeza pesada", numeros: [4, 8], tema: "limpeza pesada", produto: "Checklist da Faxina Completa", promessa: "A ordem certa de limpar cada cômodo, com os produtos de cada etapa." },
  { nome: "Reforço escolar", numeros: [6, 7], tema: "reforço escolar", produto: "Tabuada sem Choro: Guia para Pais", promessa: "Jogos e rotinas curtas para a criança aprender a tabuada em casa." },
  { nome: "Crochê e tricô", numeros: [4, 2], tema: "crochê e tricô", produto: "Minhas Primeiras Peças de Crochê", promessa: "Três peças fáceis para começar, com gráfico e lista de material." },
  { nome: "Costura e conserto de roupa", numeros: [4, 6], tema: "costura e conserto", produto: "Consertos de Roupa que Você Faz em Casa", promessa: "Barra, botão e zíper resolvidos sem máquina complicada." },
  { nome: "Artesanato e lembrancinha", numeros: [3, 2], tema: "artesanato", produto: "Lembrancinhas que Encantam e Custam Pouco", promessa: "Seis modelos de lembrancinha com material barato." },
  { nome: "Oração e palavra de conforto", numeros: [9, 2], tema: "palavras de conforto", produto: "30 Manhãs de Palavras de Conforto", promessa: "Uma mensagem curta para começar cada dia do mês com o coração leve." },
  { nome: "Conselho de relacionamento", numeros: [2, 9], tema: "relacionamento", produto: "Conversas que Aproximam o Casal", promessa: "Perguntas e combinados simples para conversar sem brigar." },
  { nome: "Cuidar de criança", numeros: [6, 2], tema: "cuidado com crianças", produto: "Rotina Tranquila para Crianças Pequenas", promessa: "Horários, brincadeiras e combinados para dias mais calmos em casa." },
  { nome: "Cuidar de idoso", numeros: [6, 9], tema: "cuidado com idosos", produto: "Guia do Cuidador de Família", promessa: "Remédios, comida e rotina para cuidar bem de quem você ama." },
  { nome: "Planilha e contas da casa", numeros: [8, 4], tema: "contas da casa", produto: "Planilha da Casa em Ordem", promessa: "Uma planilha pronta para ver para onde vai o dinheiro do mês." },
  { nome: "Economizar no mercado", numeros: [8, 4], tema: "economia no mercado", produto: "Lista Esperta do Mercado", promessa: "Como montar a lista do mês e gastar menos sem cortar o que importa." },
  { nome: "Vender e negociar", numeros: [8, 1], tema: "vendas", produto: "Primeiras Vendas pelo WhatsApp", promessa: "Como oferecer o que você faz sem vergonha e sem parecer insistente." },
  { nome: "Decoração de festa", numeros: [3, 5], tema: "decoração de festa", produto: "Festa Linda com Pouco", promessa: "Mesa, painel e lembranças montados com orçamento curto." },
  { nome: "Plantas e horta", numeros: [7, 4], tema: "plantas e horta", produto: "Horta na Janela", promessa: "Temperos e hortaliças que crescem em vaso, mesmo em apartamento." },
  { nome: "Receitas fit e saudáveis", numeros: [5, 7], tema: "receitas saudáveis", produto: "Semana Leve: 21 Receitas Fit", promessa: "Café, almoço e jantar leves com ingredientes de mercado comum." },
  { nome: "Treino em casa", numeros: [5, 1], tema: "treino em casa", produto: "Treino de 20 Minutos na Sala", promessa: "Quatro semanas de exercícios sem aparelho, do começo ao corpo firme." },
  { nome: "Fazer currículo e documentos", numeros: [7, 8], tema: "currículos e documentos", produto: "Currículo que Chama para Entrevista", promessa: "Um modelo pronto e o que escrever em cada parte." },
  { nome: "Ensinar a usar o celular", numeros: [7, 5], tema: "uso do celular", produto: "Celular sem Medo para os Pais", promessa: "Passo a passo com imagens para usar WhatsApp, fotos e chamada de vídeo." },
  { nome: "Inglês ou outra língua", numeros: [7, 5], tema: "inglês", produto: "Inglês de Viagem em 50 Frases", promessa: "As frases que resolvem aeroporto, hotel e restaurante." },
  { nome: "Instrumento musical", numeros: [3, 7], tema: "música", produto: "Primeiros Acordes no Violão", promessa: "Seis acordes e três músicas para tocar no primeiro mês." },
  { nome: "Animais de estimação", numeros: [2, 6], tema: "cuidado com pets", produto: "Pet Feliz em Casa", promessa: "Rotina, comida e cuidados do dia a dia com cães e gatos." },
  { nome: "Montar roteiro de viagem barata", numeros: [5, 1], tema: "viagens baratas", produto: "Viagem Boa e Barata", promessa: "Como montar um roteiro de fim de semana gastando pouco." },
];

export const combinaCom = (t: Talento, oficio: number, moeda: number) =>
  t.numeros.includes(oficio) || t.numeros.includes(moeda);

export const talentoPorNome = (nome: string) => TALENTOS.find((t) => t.nome === nome);
```

**`lib/tipos.ts`** — copie literalmente:

```ts
export type PedidoProduto = {
  primeiroNome: string;
  oficio: number;
  moeda: number;
  anoColheita: number;
  tituloOficio: string;
  significadoOficio: string;
  talentos: string[];
  outro?: string;
  publico?: string;
  tempo?: string;
  formato?: string;
  precoMin: number;
  precoMax: number;
};

export type Produto = {
  nomeProduto: string;
  promessa: string;
  topicos: string[];
  precoExemplo: number;
  mensagens: { status: string; grupo: string; privado: string };
};

export type ProdutoSalvo = Produto & {
  id: string;
  criadoEm: string;
  talentos: string[];
  origem: "ia" | "modelo";
};

export type Perfil = { nome: string; dia: number; mes: number; ano: number };

export type Respostas = { publico: string; tempo: string; formato: string };
```

**`lib/produtoModelo.ts`** — o produto montado em código (sem chave de IA, ou quando a IA falha), o corte de limites e a formatação do preço. Usado no navegador (sem internet) E no Convex. Copie literalmente:

```ts
// Produto montado em código. Usado quando não há chave de API ou quando a IA falha.
import { talentoPorNome } from "./talentos";
import type { PedidoProduto, Produto } from "./tipos";

const PRECOS = [19.9, 24.9, 27, 29.9, 17, 37, 14.9, 34.9];

function palavraDoFormato(formato?: string) {
  if (formato?.startsWith("Checklist")) return "checklist";
  if (formato?.startsWith("Passo a passo")) return "passo a passo com fotos";
  return "mini-guia";
}

export function montarProdutoModelo(p: PedidoProduto): Produto {
  const escolhido = p.talentos.map(talentoPorNome).find(Boolean);
  const tema = escolhido?.tema ?? (p.talentos[0] || p.outro || "o que você faz").toLowerCase();
  const nomeProduto = escolhido?.produto ?? `O Meu Jeito de Fazer ${p.talentos[0] ?? p.outro ?? ""}`.trim();
  const promessa = escolhido?.promessa ?? `Tudo o que eu sei sobre ${tema}, explicado de um jeito simples.`;
  const formato = palavraDoFormato(p.formato);
  const jeito = p.tituloOficio.replace(/^Quem /, "").toLowerCase();
  const indice = (nomeProduto.length + p.oficio) % PRECOS.length;
  const precoExemplo = Math.min(p.precoMax, Math.max(p.precoMin, PRECOS[indice]));

  const topicos = [
    `Por que tanta gente me pede ajuda com ${tema}`,
    "O que você precisa ter em casa antes de começar",
    "O meu passo a passo, do início ao fim",
    "Os 3 erros mais comuns e como evitar cada um",
    "Como adaptar ao seu tempo e ao seu bolso",
    "As dicas que eu guardava só para mim",
  ];
  if (p.outro?.trim()) topicos.push(`Extra: como eu faço ${p.outro.trim().toLowerCase()}`);

  const promessaMinuscula = promessa.charAt(0).toLowerCase() + promessa.slice(1);
  return {
    nomeProduto,
    promessa,
    topicos,
    precoExemplo,
    mensagens: {
      status: `Descobri que o meu número é de quem ${jeito} ✨ Por isso juntei tudo o que eu sei de ${tema} num ${formato}: “${nomeProduto}”. Quer que eu te mande?`,
      grupo: `Oi, pessoal! Tudo bem? Muita gente aqui já me pediu dica de ${tema}, então organizei tudo num ${formato} chamado “${nomeProduto}”. É simples e direto: ${promessaMinuscula} Se fizer sentido para alguém, posso mandar os detalhes no privado?`,
      privado: `Oi, [nome do contato]! Lembrei de você, que sempre me pergunta sobre ${tema}. Montei um ${formato}, o “${nomeProduto}”, com o meu passo a passo. Quer que eu te mande?`,
    },
  };
}

/** Corta textos acima dos limites e arruma o preço, venha de onde vier o produto. */
export function ajustarLimites(produto: Produto, precoMin: number, precoMax: number): Produto {
  const corta = (t: string, max: number) => (t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t);
  let preco = Number(produto.precoExemplo) || precoMin;
  preco = Math.min(precoMax, Math.max(precoMin, preco));
  if (!Number.isInteger(preco)) preco = Math.floor(preco) + 0.9;
  return {
    nomeProduto: corta(produto.nomeProduto, 70),
    promessa: corta(produto.promessa, 160),
    topicos: produto.topicos.slice(0, 7).map((t) => corta(t, 110)),
    precoExemplo: preco,
    mensagens: {
      status: corta(produto.mensagens.status, 280),
      grupo: corta(produto.mensagens.grupo, 400),
      privado: corta(produto.mensagens.privado, 300),
    },
  };
}

export const formatarPreco = (n: number) => "R$ " + n.toFixed(2).replace(".", ",");
```

**`lib/armazenamento.ts`** (client) — perfil e produtos ficam no APARELHO (`localStorage`), numa chave separada por usuário logado; a sessão e a compra são conferidas no Convex.
- `CHAVE_BASE = "cofre-do-nome:v1"`; a chave real é `"cofre-do-nome:v1:" + usuarioId`. Variável de módulo `donoDosDados: string | null = null`; `definirDonoDosDados(usuarioId)` troca o dono (se mudou) e dispara o evento de janela `cofre:mudou`. Sem dono, a chave é `null`: nada é lido nem gravado (dados antigos sem dono NÃO são atribuídos a ninguém).
- `type Dados = { perfil: Perfil | null; talentos: string[]; outro: string; respostas: Respostas | null; produtos: ProdutoSalvo[]; contador: { data: string; n: number } }`. VAZIO = `{ perfil: null, talentos: [], outro: "", respostas: null, produtos: [], contador: { data: "", n: 0 } }`.
- `lerDados()`: lê o texto bruto (try/catch → null) e interpreta `{ ...VAZIO, ...JSON.parse(bruto) }` (JSON quebrado → VAZIO).
- `gravarDados(mudar)`: sem dono, não faz nada; senão aplica `mudar(lerDados())`, grava (try/catch: aparelho cheio ou modo privado segue sem salvar) e dispara `cofre:mudou`.
- `apagarTudo()`: remove a chave do dono e dispara `cofre:mudou`.
- `useDados()`: `useSyncExternalStore` assinando os eventos `storage` e `cofre:mudou`; no servidor o valor é `undefined`. Devolve `{ dados, pronto: bruto !== undefined }`.
- Contador diário: `hoje = new Date().toISOString().slice(0, 10)`; `geracoesHoje(d)` = `d.contador.n` se a data é hoje, senão 0; `contarGeracao(d)` = `{ ...d, contador: { data: hoje, n: geracoesHoje(d) + 1 } }`.

**`lib/ui.ts`** (client): `avisar(msg)` dispara `CustomEvent("cofre:aviso", { detail: msg })`; `copiar(texto)` usa `navigator.clipboard.writeText` e avisa "Copiado!" (falhou: "Não deu para copiar. Segure no texto e copie."); `linkWhatsApp(texto) = "https://wa.me/?text=" + encodeURIComponent(texto)`; `semMovimento()` = `matchMedia("(prefers-reduced-motion: reduce)")` (falso no servidor).

**`lib/useHash.ts`** (client): `useSyncExternalStore` ouvindo `hashchange`, devolve `window.location.hash.slice(1)` (vazio no servidor).

**`config/marca.ts`** — o ÚNICO arquivo que o revendedor edita. Copie (com um comentário simples em cada campo):

```ts
// ÚNICO arquivo que o revendedor precisa editar.
// Troque os valores entre aspas e publique de novo na Vercel.
export const marca = {
  nomeApp: "Robô de Produtos Milionários", // nome que aparece no topo e na aba do navegador
  nomeVitrine: "Cofre do Nome", // nome que aparece na vitrine do anúncio (/vitrine)
  nomeDono: "Braian", // nome do dono da cópia (uso futuro)
  linkPagamento: "https://SEU-LINK-DE-PAGAMENTO", // link da plataforma de pagamento (Binyra, Kiwify, Hotmart...)
  precoTexto: "R$ 39,90", // só texto, aparece na vitrine
  parcelasTexto: "ou em até 3x no cartão",
  whatsappSuporte: "5511999999999", // só números, com 55 + DDD
  precoExemploMin: 9, // faixa que a IA usa para sugerir o preço de exemplo
  precoExemploMax: 47,
  limiteGeracoesPorDia: 5, // quantos produtos cada aparelho pode montar por dia (protege o custo da IA)
};

export const marcaDeExemplo = {
  link: marca.linkPagamento.includes("SEU-LINK"),
  whatsapp: marca.whatsappSuporte === "5511999999999",
};
```

`marcaDeExemplo` liga os avisos de desenvolvimento ("Configure … em config/marca.ts") e esconde o botão de pagamento da tela /acesso enquanto o link é o de exemplo.

## 7. Backend Convex

Antes de escrever código do Convex, se existir `convex/_generated/ai/guidelines.md`, leia. Use a sintaxe nova de funções (`query({ args, returns, handler })`) com validadores `v` em args e `returns`.

### 7.1 Esquema — `convex/schema.ts`

```ts
import {defineSchema,defineTable} from "convex/server";
import {authTables} from "@convex-dev/auth/server";
import {v} from "convex/values";
const status=v.union(v.literal("ativa"),v.literal("cancelada"),v.literal("expirada"));
export default defineSchema({
 ...authTables,
 compras:defineTable({email:v.string(),produtoId:v.string(),status,orderId:v.string(),criadoEm:v.number(),atualizadaEm:v.number(),accessEndsAt:v.optional(v.number()),evento:v.optional(v.string()),boasVindasId:v.optional(v.string())})
  .index("por_email",["email"]).index("por_orderId",["orderId"]).index("por_email_produtoId_status",["email","produtoId","status"]),
 comprasTeste:defineTable({email:v.string(),produtoId:v.string(),status,orderId:v.string(),criadoEm:v.number(),atualizadaEm:v.number(),accessEndsAt:v.optional(v.number()),evento:v.string(),teste:v.literal(true)})
  .index("por_email",["email"]).index("por_orderId",["orderId"]),
});
```
(`authTables` traz `users`, sessões, contas, códigos etc. do Convex Auth. `email` sempre gravado em minúsculas. `boasVindasId` = id do e-mail de boas-vindas na fila do Resend.)

### 7.2 Componentes e autenticação

- `convex/convex.config.ts`: `const app = defineApp(); app.use(resend)` com `import resend from "@convex-dev/resend/convex.config.js"`.
- `convex/auth.config.ts`: `export default { providers: [{ domain: process.env.CONVEX_SITE_URL, applicationID: "convex" }] };`
- `convex/auth.ts`: `convexAuth({ providers: [ResendOTP], session: { totalDurationMs: TRINTA_DIAS, inactiveDurationMs: TRINTA_DIAS } })` com `TRINTA_DIAS = 30*24*60*60*1000`; exporta `auth, signIn, signOut, store, isAuthenticated`.
- `convex/ResendOTP.ts`: provedor `Email` de `@convex-dev/auth/providers/Email` com `id: "resend-otp"`, `apiKey: process.env.AUTH_RESEND_KEY`, `from: process.env.AUTH_EMAIL_FROM ?? ""`, `maxAge: 60*15` (15 min). `generateVerificationToken`: 8 dígitos com `generateRandomString(random, "0123456789", 8)` de `@oslojs/crypto/random`, onde `random.read(bytes)` usa `crypto.getRandomValues`. `sendVerificationRequest({ identifier: email, provider, token })`: se faltar a chave ou o remetente, ou se o remetente não tiver o formato `Nome <acesso@send.SEUDOMINIO.com.br>` (regex `/^.+ <acesso@send\.[^<>\s]+\.com\.br>$/`), ou se usar `authjs.dev`/`resend.dev`, lança "Configure AUTH_RESEND_KEY e AUTH_EMAIL_FROM no Convex com seu domínio verificado." Envia com o SDK `resend` (`new Resend(apiKey).emails.send`) assunto "Seu código de acesso" e texto:
  ```
  Seu código de acesso é {token}.

  Ele vale por 15 minutos e só pode ser usado uma vez. Se você não pediu este código, ignore este e-mail.
  ```
  Se o Resend devolver erro: "Não foi possível enviar o código de acesso. Confira o domínio e o remetente no Resend."

### 7.3 Regra de acesso pago — `convex/acesso.ts`

- `verificarCompra(ctx)` (helper, QueryCtx|MutationCtx): `usuarioId = await getAuthUserId(ctx)`; sem usuário → `null`. Lê o usuário; `email = usuario.email.trim().toLowerCase()`. Se não há e-mail OU não há `emailVerificationTime` → `{ usuarioId, ativo: false }`. Se a variável `BINYRA_PRODUTO_ID` não existe → `{ usuarioId, ativo: false }`. Senão procura em `compras` pelo índice `por_email_produtoId_status` (email, produtoId = BINYRA_PRODUTO_ID, status "ativa") com `.take(1)` → `{ usuarioId, ativo: achou }`.
- `exigirCompra(ctx)`: `null` → lança `ConvexError("ENTRE_PARA_CONTINUAR")`; inativo → `ConvexError("COMPRA_INATIVA")`; devolve `usuarioId`.
- Funções PÚBLICAS: `atual` (query, sem args, returns `null | { usuarioId: Id<"users">, ativo: boolean }`, handler = verificarCompra); `temAcesso` (query, returns null, chama exigirCompra); `exigirAtiva = temAcesso` (apelido para chamadas antigas; os testes usam).

### 7.4 Compras — `convex/compras.ts` (todas INTERNAS)

`receberBinyra` (internalMutation) — args `{ email, produtoId, orderId, event: "venda.aprovada"|"venda.reembolsada"|"assinatura.cancelada", accessEndsAt?: number, teste: boolean }`, returns null. Regras, nesta ordem:
1. `email` em minúsculas; recusa (`ConvexError("Evento inválido.")`) e-mail mal formado (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) ou > 254, orderId vazio ou > 120, produtoId vazio.
2. Se `BINYRA_PRODUTO_ID` não existe ou é diferente → `ConvexError("Produto não autorizado.")`.
3. `assinatura.cancelada` sem `accessEndsAt` válido (finito, ≥ 0) → `ConvexError("Fim de acesso inválido.")`.
4. `fim` = accessEndsAt só quando o evento é `assinatura.cancelada`. `status` = `"cancelada"` se reembolso; senão `"expirada"` se `fim` ≤ agora; senão `"ativa"`.
5. **Teste** (`teste: true`): trabalha só em `comprasTeste` (índice `por_orderId`). Se já existe com outro e-mail/produto → `ConvexError("Pedido pertence a outro comprador ou produto.")`. Se já existe e (é aprovação chegando depois de outro evento, ou o registro está cancelado) → não faz nada. Senão insere/substitui com `{ email, produtoId, orderId, status, criadoEm (mantém o primeiro), atualizadaEm: agora, accessEndsAt: fim, evento, teste: true }`. Retorna SEM liberar acesso e SEM e-mail.
6. **Real**: busca em `compras` por `por_orderId`. Outro e-mail/produto no mesmo pedido → mesmo erro "Pedido pertence a outro comprador ou produto.". Se o registro está `cancelada`, ou se é aprovação chegando depois de outro evento → não faz nada (REEMBOLSO PREVALECE; aprovação atrasada/repetida não reativa). Se o evento e o `accessEndsAt` são os mesmos já gravados → não faz nada (idempotência).
7. Insere ou faz `patch` com `{ email, produtoId, orderId, status, criadoEm (mantém), atualizadaEm, accessEndsAt: fim, evento }`.
8. Se `status === "ativa"` e há `fim`: `ctx.scheduler.runAt(fim, internal.compras.expirar, { compraId, accessEndsAt: fim })`.
9. Se é `venda.aprovada` e a compra ainda não tem `boasVindasId`: confere `AUTH_EMAIL_FROM` (mesma regra de formato; senão `ConvexError("Configure o remetente Resend.")`) e `SITE_URL` (precisa começar com http(s); senão `ConvexError("Configure SITE_URL.")`); link = `new URL("/entrar", SITE_URL)`; `new Resend(components.resend, { testMode: false, apiKey: process.env.AUTH_RESEND_KEY })` de `@convex-dev/resend` e `sendEmail(ctx, { from, to: email, subject: "Seu acesso ao " + marca.nomeApp, text, idempotencyKey: "acesso:" + orderId })`, com o texto:
   ```
   Sua compra foi aprovada.

   Entre aqui: {link}
   Use este mesmo e-mail para receber seu código de acesso.

   Equipe {marca.nomeApp}
   ```
   Grava o id devolvido em `boasVindasId`. (O componente só enfileira dentro da transação: o webhook não espera o envio.)

`registrar` (internalMutation, para testes locais pelo terminal/painel, NÃO envia e-mail) — args `{ email, referencia, status: "ativa"|"cancelada"|"reembolsada", expiraEm?: number }`, returns `Id<"compras">`. Exige `BINYRA_PRODUTO_ID`, e-mail válido e referência (senão "Confira e-mail, referência e BINYRA_PRODUTO_ID."). `orderId = referencia`; se a referência já é de outro e-mail → "A referência já pertence a outro e-mail.". status gravado: qualquer coisa diferente de "ativa" vira `"cancelada"`; "ativa" com `expiraEm` ≤ agora vira `"expirada"`. Insere ou faz patch (mantém criadoEm); se ativa com `expiraEm`, agenda `expirar`. Repetir com os mesmos dados devolve o MESMO id.

`expirar` (internalMutation) — args `{ compraId, accessEndsAt }`: só muda para `"expirada"` (com `atualizadaEm`) se a compra ainda está ativa, o `accessEndsAt` gravado é o mesmo e o prazo já passou.

### 7.5 Webhook da Binyra — `convex/binyra.ts` e `convex/http.ts`

`convex/binyra.ts`:
- `EventoBinyra` (zod): `event` enum dos 3 eventos; `buyer.email` (trim, minúsculas, e-mail, máx. 254); `orderId` (trim, 1–120); `produtoId` e `productId` opcionais (trim, 1–120); `accessEndsAt` opcional = número finito ≥ 0 (Unix em MILISSEGUNDOS) OU texto ISO com fuso; `test` boolean opcional. Transforma: `produtoId = produtoId ?? productId`; ISO vira `Date.parse`. Recusa: sem produto ("Produto ausente"), `productId` diferente de `produtoId` ("Produtos diferentes"), `assinatura.cancelada` sem `accessEndsAt` ("Fim do acesso ausente").
- `assinaturaValida(corpo, assinatura, segredo)`: a assinatura precisa casar `/^sha256=[a-fA-F0-9]{64}$/` (senão falso); calcula HMAC-SHA256 do CORPO CRU (sem reserializar) com `crypto.subtle` e o segredo; compara os 32 bytes com `constantTimeEqual` de `@oslojs/crypto/subtle`.

`convex/http.ts`: `const http = httpRouter(); auth.addHttpRoutes(http);` e a rota `POST /webhooks/binyra` (httpAction), nesta ordem:
1. Sem `BINYRA_WEBHOOK_SECRET` → 503 "Webhook não configurado".
2. Lê `request.text()`; assinatura do cabeçalho `X-IC-Signature` inválida → 401 "Assinatura inválida" (nada é gravado).
3. Corpo > 64 000 caracteres → 413 "Evento muito grande".
4. JSON inválido → 400 "JSON inválido". Sem `event` texto → 400 "Evento ausente". Evento fora dos 3 → 200 "Evento ignorado".
5. `EventoBinyra.safeParse` falhou → 400 "Confira os campos do evento".
6. Sem `BINYRA_PRODUTO_ID` → 503 "Produto não configurado". Produto diferente → 200 "Produto ignorado".
7. `ctx.runMutation(internal.compras.receberBinyra, { email: buyer.email, produtoId, orderId, event, accessEndsAt, teste: test ?? false })` → 200 "OK". Qualquer erro → 503 "Não foi possível registrar o evento" (sem 200 falso: a Binyra repete). Nunca escreva segredo ou dados do comprador nos logs.

Contrato do evento (para o docs/BINYRA.md):
```json
{ "event": "venda.aprovada", "buyer": {"email": "cliente@exemplo.com"}, "orderId": "pedido-unico", "productId": "ID_REAL_DO_PRODUTO", "test": false }
```
`venda.aprovada` = compra ativa + e-mail de boas-vindas com link para /entrar · `venda.reembolsada` = cancelada e bloqueio imediato (usar também para chargeback) · `assinatura.cancelada` = exige `accessEndsAt`; mantém ativa até a data e agenda a expiração; prazo vencido bloqueia na hora · `test: true` = grava só em `comprasTeste`, não libera, não manda e-mail e não impede a venda real com o mesmo orderId · produto diferente = ignorado.

### 7.6 Geração do produto — `convex/produtos.ts` (`"use node"`, action PÚBLICA `gerar`)

- Importa `Anthropic` de `@anthropic-ai/sdk`, `zodOutputFormat` de `@anthropic-ai/sdk/helpers/zod`, `marca` de `../config/marca`, `ajustarLimites` e `montarProdutoModelo` de `../lib/produtoModelo`, tipos de `../lib/tipos`.
- `Pedido` (zod): `primeiroNome`, `tituloOficio` e cada talento = texto trim 1–60; `oficio`, `moeda`, `anoColheita` = inteiro 1–9; `significadoOficio` até 200; `talentos` array de 1 a 3; `outro`, `publico`, `tempo`, `formato` opcionais até 60; `precoMin`, `precoMax` números 1–10000.
- `Saida` (zod): `{ nomeProduto: string, promessa: string, topicos: string[], precoExemplo: number, mensagens: { status, grupo, privado } }`.
- `gerar` — args `{ pedido: v.string() }`; returns `{ produto: {…mesmo formato da Saida…}, origem: "ia" | "modelo" }`. Passos: (1) `await ctx.runQuery(api.acesso.temAcesso, {})` (sem login → ENTRE_PARA_CONTINUAR; sem compra → COMPRA_INATIVA); (2) `JSON.parse` (erro → `ConvexError("Confira os dados do produto.")`); (3) `Pedido.safeParse` (erro → `ConvexError("Faltou alguma informação. Volte uma etapa e confira.")`); (4) SOBRESCREVE `precoMin`/`precoMax` com os de `marca` (o navegador não manda no preço); (5) usa IA só se `ANTHROPIC_API_KEY` existe E `IA_PROVEDOR !== "modelo"`; até 2 tentativas; se `Anthropic.AuthenticationError`, para de tentar; resposta boa → confere o acesso DE NOVO e devolve `{ produto: ajustarLimites(produto, min, max), origem: "ia" }`; (6) senão confere o acesso de novo e devolve `{ produto: ajustarLimites(montarProdutoModelo(pedido), min, max), origem: "modelo" }`.
- Chamada à IA: `new Anthropic()` (lê `ANTHROPIC_API_KEY` do ambiente do Convex) e `client.messages.parse({ model: process.env.IA_MODELO || "claude-sonnet-5-5", max_tokens: 4000, system: SISTEMA, messages: [{ role: "user", content: pedidoEmTexto(p) }], output_config: { format: zodOutputFormat(Saida) } })`. Se `stop_reason === "refusal"` → null. Se `parsed_output` vazio ou com menos de 3 tópicos → null.
- `pedidoEmTexto(p)`: linhas, pulando as vazias:
  ```
  Primeiro nome: {primeiroNome}
  Número de Ofício: {oficio} ({tituloOficio}). {significadoOficio}
  Número da Moeda: {moeda}
  Ano de Colheita: {anoColheita}
  Talentos marcados: {talentos separados por ", "}
  Outra coisa que pedem: {outro}            (só se houver)
  Para quem costuma fazer: {publico}        (só se houver)
  Tempo disponível: {tempo}                 (só se houver)
  Formato preferido: {formato}              (só se houver)
  Preço mínimo: R$ {precoMin}. Preço máximo: R$ {precoMax}.
  ```
- `SISTEMA` — prompt de sistema. Copie literalmente (é uma template string):

```
Você escreve para uma pessoa comum do Brasil. Use linguagem simples e calorosa, tratando por "você".

Crie UM produto digital simples, que a pessoa consiga montar em poucas horas com o que já sabe: um mini-guia em PDF, uma lista, um cardápio, um passo a passo ou um checklist. Ele precisa ser ligado ao talento marcado e ao significado do Número de Ofício. Se a pessoa disse para quem costuma fazer, quanto tempo tem e que formato prefere, respeite isso.

- O nome do produto deve ser concreto e atrativo, com até 8 palavras. A promessa cabe em 1 frase concreta, sem exagero.
- Escreva de 5 a 7 tópicos do mini-guia, cada um com até 15 palavras.
- O preço de exemplo fica entre o preço mínimo e o máximo informados, em reais, inteiro ou terminado em ,90.
- Escreva 3 mensagens para a pessoa mandar no próprio WhatsApp:
  - status: até 280 caracteres, com 1 ou 2 emojis;
  - grupo: até 400 caracteres, educada, sem pressão, que não pareça spam;
  - privado: até 300 caracteres, pessoal, começando com "Oi, [nome do contato]" como espaço para preencher.
  Todas terminam com uma pergunta leve, do tipo "quer que eu te mande?". Todas podem citar o número de forma leve (ex.: "descobri que o meu número é de quem cuida e ensina").

PROIBIDO: prometer renda, ganho, sucesso ou cura; falar em bloqueio, carma ou azar; usar termos religiosos específicos de uma única fé; chamar alguém para "entrar" em negócio, grupo de investimento ou revenda.
```

## 8. A única rota de IA no Next — `app/api/produto/route.ts`

Não chama a IA diretamente: confere o acesso e repassa ao Convex.
```ts
import {convexAuthNextjsToken} from "@convex-dev/auth/nextjs/server";
import {fetchAction,fetchQuery} from "convex/nextjs";
import {api} from "@/convex/_generated/api";
export const maxDuration=60;
export async function POST(req:Request){
 const token=await convexAuthNextjsToken();
 if(!token)return Response.json({erro:"Entre com seu e-mail para continuar."},{status:401});
 try{
  const acesso=await fetchQuery(api.acesso.atual,{}, {token});
  if(!acesso)return Response.json({erro:"Entre com seu e-mail para continuar."},{status:401});
  if(!acesso.ativo)return Response.json({erro:"Sua compra precisa estar ativa para montar produtos."},{status:403});
  const pedido=await req.text();if(pedido.length>6000)return Response.json({erro:"O pedido ficou muito grande."},{status:400});
  try{JSON.parse(pedido);}catch{return Response.json({erro:"Não consegui ler o pedido."},{status:400});}
  const resultado=await fetchAction(api.produtos.gerar,{pedido},{token});
  return Response.json(resultado,{headers:{"Cache-Control":"no-store"}});
 }catch{return Response.json({erro:"Não foi possível montar seu produto. Confira seu acesso e tente novamente."},{status:400});}
}
```
Sem chave de IA tudo funciona: o Convex devolve o modelo com `origem: "modelo"`. Sem internet, o próprio navegador monta o modelo (seção 5.2).

## 9. Variáveis de ambiente (só os NOMES; valores eu cadastro depois)

No Next (`.env.local`, criado pelo `npx convex dev` que EU vou rodar): `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL` (endereços, não chaves).

No Convex (só lá): `AUTH_RESEND_KEY`, `AUTH_EMAIL_FROM` (formato `NOME DO APP <acesso@send.MEUDOMINIO.com.br>`), `JWT_PRIVATE_KEY`, `JWKS`, `SITE_URL` (endereço do site ligado a ESTE Convex; local `http://localhost:3000`), `BINYRA_WEBHOOK_SECRET`, `BINYRA_PRODUTO_ID`, `ANTHROPIC_API_KEY` (opcional), `IA_MODELO` (opcional, padrão `claude-sonnet-5-5`), `IA_PROVEDOR` (opcional; `modelo` desliga a IA). `CONVEX_SITE_URL` já vem do próprio Convex.

Na Vercel: SÓ `NEXT_PUBLIC_CONVEX_URL` e `NEXT_PUBLIC_CONVEX_SITE_URL` do Convex de produção. Nenhuma chave.

**`scripts/configurar-chaves-auth.mjs`** (eu rodo, não você): gera em memória um par RS256 com `jose` (`generateKeyPair("RS256", { extractable: true })`), `JWT_PRIVATE_KEY = exportPKCS8(...)` com as quebras de linha trocadas por espaço, `JWKS = JSON.stringify({ keys: [{ use: "sig", ...exportJWK(publica) }] })`, e cadastra os dois com `spawnSync("npx", ["convex", "env", "set", "NOME=valor", ...("--prod" se pedido)])`. Aceita só o argumento `--prod`. Antes, consulta `npx convex env get JWT_PRIVATE_KEY`: se já existe, NÃO troca a chave privada; só recria o `JWKS` a partir dela (com `createPublicKey` do `node:crypto`) se estiver faltando, e sai com "Chaves de sessão conferidas no Convex. Mantive a chave privada existente.". Nunca imprime nem salva os valores; imprime só "{NOME} cadastrado no Convex.".

## 10. Testes (recrie todos; são 27)

`lib/numerologia/calculo.test.ts` (9):
- normalizar `"João Conceição d'Ávila-2"` → `"JOAOCONCEICAODAVILA"`;
- tabela das 26 letras A..Z → `[1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8,9,1,2,3,4,5,6,7,8]`;
- `reduzir(47)` → `{ n: 2, passos: [47, 11, 2] }` e `reduzir(7)` → `{ n: 7, passos: [7] }`;
- "Ana Silva", 14/3, hoje 7/out/2026 → Ofício 7, passos [25, 7], Moeda 3;
- "Brynn Thz", 1/1, hoje 2/jan/2026 → Ofício 1, Moeda 1 (sem vogais, Y é consoante);
- `anoPessoal(14, 3, 2026)` = 9;
- `diaPessoal(9, new Date(2026, 9, 7))` = 8;
- `nomeValido("Maria")` falso, `nomeValido("Maria Silva")` verdadeiro;
- `dataValida` com hoje 7/out/2026: 31/2/1980 falso, 14/3/1972 verdadeiro, 1/1/2030 falso.

`convex/acesso.test.ts` (6) — `convexTest(schema, import.meta.glob("./**/*.{js,ts}"))`, `vi.stubEnv("BINYRA_PRODUTO_ID", "produto-app")`; usuário = insert em `users` com `email` e `emailVerificationTime`, depois `t.withIdentity({ subject: id })`:
1. sem login: `atual` é null; `exigirAtiva` e `produtos.gerar({ pedido: "{}" })` rejeitam com "ENTRE_PARA_CONTINUAR";
2. logado sem compra: `ativo` falso; ambos rejeitam com "COMPRA_INATIVA";
3. `registrar({ email: "ANA@EXEMPLO.COM", referencia, status: "ativa" })` libera ana@exemplo.com e NÃO libera bia@;
4. e-mail sem `emailVerificationTime` não libera mesmo com compra;
5. compra com `expiraEm` no passado não libera; registrar de novo ativa sem prazo libera; registrar "reembolsada" bloqueia;
6. repetir o mesmo `registrar` devolve o mesmo id; mesma referência com outro e-mail rejeita com "outro e-mail".

`convex/binyra.test.ts` (12) — `resendTest.register(t)` de `@convex-dev/resend/test`; `vi.useFakeTimers()`; envs fictícias: `BINYRA_WEBHOOK_SECRET="segredo-ficticio-dos-testes"`, `BINYRA_PRODUTO_ID="produto-app"`, `AUTH_RESEND_KEY="chave-ficticia-teste"`, `AUTH_EMAIL_FROM="App <acesso@send.exemplo.com.br>"`, `SITE_URL="https://app.exemplo.com.br"`; assinatura calculada com `crypto.subtle` e enviada por `t.fetch("/webhooks/binyra", { method: "POST", body, headers: { "X-IC-Signature": "sha256=..." } })`:
1. `assinaturaValida` aceita o corpo cru; recusa o mesmo JSON reserializado, `null`, `sha256=00`, `sha512=` + 64 zeros e `sha256=` + 64 letras "g";
2. assinatura errada → 401 e nada em `compras` nem `comprasTeste`;
3. aprovação enviada 2 vezes (usando `productId`) → 200 nas duas, UMA compra, ativa, e-mail em minúsculas, um único `boasVindasId`; o e-mail na fila (`components.resend.lib.get`) tem `idempotencyKey` "acesso:pedido-1", texto com `https://app.exemplo.com.br/entrar` e `to` = `["ana@exemplo.com"]`; o usuário fica ativo e `temAcesso` resolve null;
4. aprovação → reembolso → aprovação: fica bloqueado, `gerar` rejeita "COMPRA_INATIVA", status "cancelada";
5. reembolso ANTES da aprovação também impede liberar;
6. `assinatura.cancelada` com fim daqui a 60 s mantém ativo; depois de rodar os agendamentos (`finishAllScheduledFunctions(vi.runAllTimers)`) fica inativo, mesmo com uma aprovação repetida no meio;
7. cancelamento com prazo já passado bloqueia na hora;
8. `test: true` → 200, nada em `compras`, 1 em `comprasTeste`, não libera; o mesmo pedido com `test: false` depois libera;
9. produto diferente → 200 e nenhuma compra;
10. payload sem campos → 400; evento desconhecido → 200; `assinatura.cancelada` sem `accessEndsAt` → 400;
11. mesmo orderId com outro e-mail rejeita com "outro comprador";
12. `AUTH_EMAIL_FROM` vazio → 503 e nenhuma compra gravada.

Os testes do Convex só rodam depois que existir `convex/_generated` (criado quando EU rodar `npx convex dev`). Até lá, rode só `npx vitest run lib/numerologia`.

## 11. Documentos

- `BUSINESS.md` (raiz): produto e público (mulheres de 30 a 60 anos, numerologia e espiritualidade, WhatsApp, ajudam sem cobrar); promessa "Existe um cofre no seu nome. E o que tem dentro não é bloqueio." e a frase-guia; como funciona (cálculo em código, Ofício sugere talentos, 1 a 3 talentos, IA monta produto e mensagens; sem chave, modelo em código); o que o cliente recebe (os 3 números, Espelho do Talento, nome e promessa, 5 a 7 tópicos, preço de exemplo, 3 mensagens, Agenda de 7 dias, dados e produtos salvos no celular, suporte no WhatsApp); como vender (quiz grátis na `/vitrine` → link de pagamento externo na Binyra → webhook libera a compra → e-mail com link para `/entrar` → entra com código no mesmo e-mail); como revender (`config/marca.ts`); honestidade e segurança; o que fica fora (pagamento dentro do app, API do WhatsApp, câmera/áudio, upload, raspagem, push, painel administrativo).
- `README.md`: o que é, tabela de telas (`/`, `/numero-que-vende`, `/resultado`, `/produtos`, `/agenda`, `/mapa`, `/vitrine`, `/entrar`, `/acesso`, `/api/produto`), como rodar (`npm install`, `npm run dev`, `npm test`), identidade visual em 5 linhas, pastas.
- `docs/LOGIN.md`: como funciona o login por código, o que é protegido, e o passo a passo que EU vou rodar (script das chaves, `AUTH_RESEND_KEY` digitada com `read -s` no zsh sem aparecer na tela, `AUTH_EMAIL_FROM`, `SITE_URL`, como registrar uma compra de teste com `npx convex run compras:registrar '{"email":"SEU_EMAIL","referencia":"teste-login-local","status":"ativa"}'` e revogar com `"status":"reembolsada"`), e o roteiro de teste.
- `docs/BINYRA.md`: endereço do webhook = `https://SEU-DEPLOYMENT.convex.site/webhooks/binyra`, variáveis, contrato do evento (seção 7.5), repetições, códigos de resposta (200/400/401/413/503) e o roteiro de teste de 8 passos (teste com `test: true`, repetir, assinatura errada, compra real autorizada, entrar pelo link, reembolso, assinatura cancelada).
- `docs/PUBLICAR.md`: publicar na Vercel; na Vercel só os dois endereços públicos do Convex de produção; as chaves (Resend, IA, Binyra, JWT) ficam no Convex de produção (`--prod`); `SITE_URL` de produção = endereço real; os dois links (app `https://SEU-PROJETO.vercel.app/` e vitrine `https://SEU-PROJETO.vercel.app/vitrine`).
- `docs/COMO-REVENDER.md`: 1 página leiga: editar `config/marca.ts`, publicar de novo, na Binyra apontar o webhook e o produto, nos anúncios usar o link da `/vitrine`.
- `docs/ideias-futuras.md`: "Mensagens com variações (botão "outra versão").", "Exportar o mini-guia em PDF a partir dos tópicos.", "Instalar como app na tela inicial (ícone e tela de abertura)." — anotadas, NÃO construídas.

## 12. Tom de voz

Simples, caloroso e direto. Universo do cofre: combinação, abrir, chave, moeda, colheita. Sem medo, sem culpa, sem urgência falsa. "Você não falhou, só estava oferecendo a coisa errada." Espiritual sem religião específica.

## 13. Como eu testo no celular

Use o endereço de rede que o `next dev` mostra ("Network: http://192.168.x.x:3000") com o celular na mesma Wi-Fi. Teste também em 360 px de largura no computador.

## 14. ORDEM DE TRABALHO (fases curtas; PARE no fim de cada uma)

**Fase 0 — Nascimento.** Crie o projeto Next.js 16 + TypeScript nesta pasta (sem apagar AGENTS.md/CLAUDE.md), ajuste o `package.json` às versões da seção 3, instale, crie as configurações (`next.config.ts`, `tsconfig.json`, `vitest.config.mts`, `eslint.config.mjs`, `.gitignore`, `.vercelignore`, `.env.example`), a estrutura de pastas e o `BUSINESS.md`. Rode `npm run dev` e me passe `http://localhost:3000`. **PARE.**

**Fase 1 — Visual.** `app/globals.css` (literal), `app/icon.svg`, Geist no layout, `config/marca.ts`, `components/Icones.tsx`, `Disco.tsx`, `Preco.tsx`, `Vazio.tsx`, `RodapeHonestidade.tsx`, `Aviso.tsx`, `lib/textos.ts`, `lib/ui.ts`, e a `Moldura` SEM o BotaoSair por enquanto. Ainda sem Convex: o `app/layout.tsx` desta fase só tem `<html lang="pt-BR" className={geist.variable}><body>{children}<Aviso /></body></html>`. Mostre na `/vitrine` só o cabeçalho e o formulário (sem cálculo) para eu ver as cores, o disco e as fontes. Me diga para abrir no celular e no computador (abas embaixo x menu lateral). **PARE.**

**Fase 2 — Cálculo.** `lib/numerologia/calculo.ts`, `significados.ts`, `calculo.test.ts`. Rode `npx vitest run lib/numerologia` e me mostre quantos testes passaram (o número). **PARE.**

**Fase 3 — Vitrine completa e Cofre Abrindo.** `CofreAbrindo.tsx`, `lib/talentos.ts`, vitrine com a revelação e a oferta (seção 5.7). Me diga um nome de exemplo para testar ("Ana Silva", 14/03/1972 → Ofício 7, Moeda 3). **PARE.**

**Fase 4 — App pago sem login (provisório).** `lib/tipos.ts`, `lib/armazenamento.ts`, `lib/useHash.ts`, `lib/produtoModelo.ts`, `AgendaSemana`, `ProdutoView`, e as telas de `app/(pago)`: Início, Número que Vende, Resultado, Meus Produtos, Agenda, Mapa. PROVISÓRIO desta fase: `app/(pago)/layout.tsx` é um client component que chama `definirDonoDosDados("local")` num efeito e só mostra os filhos depois disso (marque com o comentário `// PROVISÓRIO: sai na Fase 6`). Ainda não existe `/api/produto`: o fluxo cai no modelo em código (é o comportamento sem internet), e é assim que eu testo o produto pronto. Me peça para testar o fluxo inteiro no celular. **PARE.**

**Fase 5 — Revisão de textos.** Confira cada texto com a seção 5 e as regras da seção 2 (nada de promessa de ganho; todo preço com "exemplo"), teste em 360 px e no computador, e me mostre uma lista curta do que conferiu. **PARE.**

**Fase 6 — Backend Convex (escrever, não conectar).** Escreva tudo da seção 7, a rota da seção 8, `ConvexClientProvider`, `AcessoPago`, `BotaoSair` (e coloque-o na `Moldura`), `app/entrar`, `app/acesso`, `proxy.ts`, o `app/layout.tsx` final com os providers, o `app/(pago)/layout.tsx` final (remova o PROVISÓRIO), `scripts/configurar-chaves-auth.mjs` e os dois testes do Convex. NÃO rode nenhum comando `npx convex ...`. Avise com honestidade: "a partir daqui o app só abre depois que você conectar o Convex; os testes do Convex e o `npm run build` também dependem disso". Rode o que der para rodar sem o Convex (`npx vitest run lib/numerologia`, `npm run lint`) e me diga os números. **PARE.**

**Fase 7 — Documentos e entrega.** Escreva `README.md`, `docs/LOGIN.md`, `docs/BINYRA.md`, `docs/PUBLICAR.md`, `docs/COMO-REVENDER.md`, `docs/ideias-futuras.md`. Faça uma varredura final: nenhuma chave no código; nenhum segredo em `NEXT_PUBLIC_`; `.env*` no `.gitignore`; números só em `lib/numerologia`; nenhuma promessa de ganho. Termine com um resumo curto do que foi feito. **PARE.**

**Fim das fases locais.** Ao terminar a Fase 7, siga a PARTE 2 do comando que eu colei no começo (conectar o banco de dados e publicar). Antes disso, não rode `npx convex dev`, `npx convex deploy`, `npx convex env` nem `vercel` por conta própria.

## 15. Lembretes finais

- Fidelidade: classes CSS, textos e números exatamente como aqui.
- Nenhuma chave no código nem em `NEXT_PUBLIC_*`; segredos só no Convex.
- Números só em código; a IA nunca calcula.
- Nenhuma promessa de ganho; todo preço é "de exemplo".
- Na dúvida, o caminho mais simples, explicado em 1 frase.
