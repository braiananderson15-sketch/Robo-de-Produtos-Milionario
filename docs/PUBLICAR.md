# Publicar pelo celular, sem terminal

Nada foi publicado pelo assistente. A Vercel executará o comando de publicação somente quando você mandar criar/recriar o deployment no painel.

## 1. Convex de produção

1. Abra https://dashboard.convex.dev e entre na sua conta.
2. Crie um projeto. Selecione **Production** no seletor de deployment. Crie o ambiente de produção se ainda não existir.
3. Abra **Settings > Deploy keys** (em algumas telas, dentro de **General**).
4. Gere uma chave com **deployment:deploy**. Dê um nome que identifique a Vercel. Não mande essa chave em mensagens nem a coloque no GitHub.
5. Em **Settings > Environment Variables**, cadastre as variáveis da tabela abaixo, neste Production. Chaves da aplicação ficam aqui, nunca na Vercel.

## 2. Vercel

1. Abra https://vercel.com/new e entre com GitHub.
2. Em **Import Git Repository**, selecione `braiananderson15-sketch/Robo-de-Produtos-Milionario` e **Import**. Root Directory: raiz. Framework: Next.js.
3. Em **Environment Variables**, adicione `CONVEX_DEPLOY_KEY` com a chave de produção. Selecione **somente Production**.
4. O `vercel.json` já define `npx convex deploy --cmd 'npm run build'`.
5. **Importante para revisar a PR:** não faça Merge ainda. O código completo está na branch da Pull Request. O primeiro deployment da branch main pode continuar exibindo o template antigo até o Merge. Use o Preview da PR para revisar o código novo.
6. Para gerar o Preview da PR, conecte o projeto Vercel ao repositório e siga a seção Preview abaixo. Se a PR já existia, em **Deployments > Create Deployment**, escolha a branch da PR, ou use **Redeploy** do deployment dessa branch.
7. Para a publicação definitiva, só depois dos testes, faça **Merge pull request** no GitHub. A Vercel publicará main automaticamente.
8. Em cada ambiente do Convex, ajuste `SITE_URL` para o endereço real correspondente. Em produção use o domínio estável do projeto; em Preview use a URL do Preview que você estiver testando. Não misture ambientes.

O Convex CLI 1.46 injeta os dois endereços públicos no build Next. Se for configurá-los manualmente, copie de **Convex > Settings > General** para **Vercel > Settings > Environment Variables**, no ambiente correspondente. Não copie endereços locais 127.0.0.1.

## 3. Variáveis por painel

| Variável | Painel / ambiente | Valor a usar |
| --- | --- | --- |
| `CONVEX_DEPLOY_KEY` | Vercel / Production | Chave do deployment Production, permissão `deployment:deploy` |
| `CONVEX_DEPLOY_KEY` | Vercel / Preview | Chave própria de Preview do projeto, nunca a de Production |
| `NEXT_PUBLIC_CONVEX_URL` | Vercel / cada ambiente, se não injetada pelo CLI | Endereço `.convex.cloud` daquele deployment; público, não é chave |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Vercel / cada ambiente, se não injetada pelo CLI | Endereço `.convex.site` daquele deployment; público, não é chave |
| `AUTH_RESEND_KEY` | Convex / Production e cada Preview a testar | Chave Resend com autorização de envio no seu domínio verificado |
| `AUTH_EMAIL_FROM` | Convex / Production e cada Preview | Seu remetente verificado no formato `NOME DO APP <acesso@send.MEUDOMINIO.com.br>` |
| `JWT_PRIVATE_KEY` | Convex / Production e cada Preview | Gerada pela função interna `chaves:configurar`, abaixo; nunca digite uma chave de exemplo |
| `JWKS` | Convex / Production e cada Preview | Gerada junto da chave de sessão |
| `SITE_URL` | Convex / Production e cada Preview | URL real da aplicação naquele ambiente, com https |
| `BINYRA_WEBHOOK_SECRET` | Convex / Production | Segredo real de assinatura combinado com a Binyra |
| `BINYRA_PRODUTO_ID` | Convex / Production e Preview de teste | ID exato do produto autorizado; em teste use um produto de teste próprio |
| `ANTHROPIC_API_KEY` | Convex / Production; Preview se quiser testar IA | Opcional, chave real Anthropic |
| `IA_MODELO` | Convex / ambiente escolhido | Opcional. Padrão do manual `claude-sonnet-5-5`; confirme a disponibilidade na sua conta Anthropic |
| `IA_PROVEDOR` | Convex / ambiente escolhido | Opcional. `modelo` desliga a IA e usa o modelo em código |
| `CHAVE_CONFIGURACAO_CONVEX` | Convex / deployment escolhido, temporária | Chave temporária desse mesmo deployment, com `deployment:env:write`, para gerar as chaves sem terminal |
| `CONVEX_SITE_URL` / `CONVEX_CLOUD_URL` | Convex | Já fornecidas pelo serviço. Não cadastre manualmente |
| `CONVEX_DEPLOYMENT` | Desenvolvimento local somente | Gerada pelo CLI local; não copiar para Vercel |

## 4. Gerar as chaves de login com toques

Faça isso **depois que a Vercel tiver enviado as funções da PR ao Convex**. O build não depende das chaves; o login depende.

1. No Convex, escolha o deployment correto (Production ou o Preview da branch).
2. **Settings > Deploy keys > Generate a deploy key**: crie uma chave temporária com `deployment:env:write`.
3. **Settings > Environment Variables > Add**: nome `CHAVE_CONFIGURACAO_CONVEX`; valor = a chave temporária recém-gerada.
4. **Functions > chaves:configurar > Run**; argumentos `{}`. Execute uma única vez e espere a confirmação. É uma função interna, acessível ao dono no painel, não aos visitantes do app.
5. A função cria `JWT_PRIVATE_KEY` e `JWKS` diretamente nas variáveis do Convex e remove `CHAVE_CONFIGURACAO_CONVEX`. Não exibe nem retorna os valores. Se a chave privada já existir, ela é mantida.
6. Volte a **Deploy keys** e revogue a chave temporária. Se as chaves já existiam e a função só conferiu, remova também `CHAVE_CONFIGURACAO_CONVEX` do painel.
7. Repita no Preview se quiser testar o login lá. Cada deployment deve ter seu próprio par.

A chave da Vercel continua com `deployment:deploy`; não é necessário lhe dar permissão de alterar variáveis.

## 5. Preview antes do Merge

**Somente uma chave Production não gera Preview funcional.**

1. No Convex, abra **Project Settings** e gere uma **Preview Deploy Key**.
2. Na Vercel, **Settings > Environment Variables > Add**: nome `CONVEX_DEPLOY_KEY`, valor = essa chave de Preview, ambiente **somente Preview**.
3. Não substitua a variável de Production. Mesmo nome, dois valores, dois ambientes.
4. Em **Deployments**, crie/recrie o deployment da branch da PR. O CLI cria um backend separado por branch.
5. No Convex, selecione esse Preview no seletor de deployments. Cadastre as variáveis da tabela para ele, gere suas chaves pelo painel e use seu e-mail de teste.
6. **Functions > compras:registrar > Run**: argumentos com seu e-mail real de teste, `referencia` única e `status: "ativa"`. A função é interna e não envia e-mail. Exemplos completos em LOGIN.md.
7. Abra a PR no GitHub. Em **Checks** / comentário da Vercel, toque em **Visit Preview** ou **View deployment**.
8. Teste a vitrine, login, bloqueio sem compra, fluxo pago, mensagens, troca de conta e reembolso. Só então use **Merge pull request**.

Preview não compartilha compras nem configuração com Production. Não envie webhooks de vendas reais ao Preview. Nunca use a chave de Production no ambiente Preview.

## 6. Antes de vender

- No arquivo `config/marca.ts`, configure nome, preço, checkout e WhatsApp reais. As configurações de exemplo são intencionais; o assistente não conhece seus valores reais.
- No Resend, verifique seu domínio e seus registros DNS. O código exige remetente no subdomínio `send` com domínio `.com.br`, como manda o manual.
- Confirme com a Binyra o contrato, assinatura `X-IC-Signature` e eventos descritos em BINYRA.md. Este é o contrato solicitado; não é uma afirmação de que todo painel Binyra o fornece automaticamente.
- Sem chave Anthropic ou em caso de falha, o modelo em código funciona. Não foi feita uma chamada paga à IA nesta implementação.

Links finais: app `https://SEU-PROJETO.vercel.app/`; anúncio `https://SEU-PROJETO.vercel.app/vitrine`.

Fontes: https://docs.convex.dev/production/hosting/vercel · https://docs.convex.dev/dashboard/deployments/deployment-settings · https://docs.convex.dev/team-management/role-actions
