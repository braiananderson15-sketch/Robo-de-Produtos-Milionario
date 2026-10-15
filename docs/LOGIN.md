# Login por código

O cliente usa o mesmo e-mail da compra. Um código de 8 números vale por 15 minutos e uma utilização. A sessão pode durar até 30 dias; use Sair em aparelhos compartilhados.

Proxy, layout de servidor, guarda reativa no navegador e funções do Convex conferem a identidade. A compra deve estar ativa, não vencida, no produto configurado e no e-mail verificado. O cliente não escolhe seu ID. Dados do aparelho ficam separados por usuário.

## Só pelo celular

Siga PUBLICAR.md para instalar as funções, cadastrar Resend, SITE_URL e gerar `JWT_PRIVATE_KEY`/`JWKS` pela função interna `chaves:configurar`, sem terminal.

No Convex, selecione o **Preview da PR**, depois **Functions > compras:registrar > Run**. Use:

```json
{"email":"SEU_EMAIL_REAL","referencia":"teste-login-preview","status":"ativa"}
```

Troque apenas o e-mail pelo seu. `BINYRA_PRODUTO_ID` deve estar cadastrado nesse Preview. Isso registra uma compra interna de teste sem e-mail de boas-vindas. Não é um endpoint público e não é a simulação `test:true` do webhook.

Para revogar, execute no mesmo Preview:

```json
{"email":"SEU_EMAIL_REAL","referencia":"teste-login-preview","status":"reembolsada"}
```

Teste: /entrar → e-mail → código recebido → início. Código inválido deve mostrar erro. Sem compra vai para /acesso. Após revogar, a tela paga deve fechar e /api/produto deve recusar. Saia e entre com outro e-mail: nenhum perfil ou produto da primeira conta deve aparecer.

## Para quem dispõe de terminal (alternativa)

Não é necessário no fluxo pelo celular. Nunca envie estes comandos com segredos na linha gravada.

```sh
node scripts/configurar-chaves-auth.mjs
# No zsh, esconde a chave enquanto digita:
read -s 'RESEND_CHAVE?Chave Resend: '
npx convex env set AUTH_RESEND_KEY "$RESEND_CHAVE"
unset RESEND_CHAVE
npx convex env set AUTH_EMAIL_FROM 'NOME DO APP <acesso@send.SEUDOMINIO.com.br>'
npx convex env set SITE_URL 'http://localhost:3000'
npx convex run compras:registrar '{"email":"SEU_EMAIL","referencia":"teste-login-local","status":"ativa"}'
npx convex run compras:registrar '{"email":"SEU_EMAIL","referencia":"teste-login-local","status":"reembolsada"}'
```

O script de chaves não salva ou imprime valores, não troca a chave privada existente, e aceita somente `--prod` como argumento opcional. Configure as variáveis de produção no ambiente de produção, separadamente.
