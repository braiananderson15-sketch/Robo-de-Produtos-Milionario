# Contrato do webhook Binyra

Endereço: `https://SEU-DEPLOYMENT.convex.site/webhooks/binyra`.

No deployment do Convex, cadastre `BINYRA_WEBHOOK_SECRET`, `BINYRA_PRODUTO_ID`, `AUTH_RESEND_KEY`, `AUTH_EMAIL_FROM` e `SITE_URL`. Não cadastre segredo na Vercel. O remetente deve ser verificado no Resend.

O contrato abaixo precisa ser suportado/configurado na sua integração Binyra. Não foi enviado evento de venda real. Se o fornecedor usar outro formato, adapte o contrato antes de vender.

```json
{ "event": "venda.aprovada", "buyer": {"email": "cliente@exemplo.com"}, "orderId": "pedido-unico", "productId": "ID_REAL_DO_PRODUTO", "test": false }
```

Cabeçalho `X-IC-Signature`: `sha256=` seguido de 64 dígitos hexadecimais do HMAC-SHA256 do **corpo cru**, usando o segredo combinado. Não reserialize o JSON depois de assinar.

| Evento | Efeito |
| --- | --- |
| `venda.aprovada` | Ativa e enfileira um e-mail com /entrar, uma única vez |
| `venda.reembolsada` | Cancela e bloqueia imediatamente; usar também para chargeback |
| `assinatura.cancelada` | Exige `accessEndsAt`, em milissegundos Unix ou ISO com fuso; mantém até o prazo e agenda a expiração |
| `test:true` | Só `comprasTeste`; não libera e não envia e-mail |
| Produto diferente | Ignorado |

`produtoId` também é aceito. Se vier junto de `productId`, os dois devem ser iguais. Um orderId nunca muda de comprador/produto. Reembolso prevalece e aprovação atrasada não reativa; evento repetido não duplica compra/e-mail. Teste não impede a venda real com o mesmo orderId.

| Código | Significado |
| --- | --- |
| 200 | Registrado, repetido ou ignorado conforme contrato |
| 400 | JSON, campos ou prazo inválidos |
| 401 | Assinatura inválida; nenhuma gravação |
| 413 | Corpo maior que 64.000 caracteres |
| 503 | Falta configuração ou falha de registro; remetente deve repetir |

## Roteiro de 8 passos no ambiente de teste

1. Configure o webhook de teste do fornecedor para o `.convex.site` do Preview.
2. Envie aprovação assinada com `test:true`. Veja uma linha em comprasTeste e nenhuma compra real/e-mail.
3. Repita o mesmo evento. Continua uma linha.
4. Envie assinatura errada. Deve receber 401 sem alteração.
5. Envie compra real **autorizada para teste** (`test:false`) com produto/e-mail de teste. Deve haver uma compra e um e-mail de boas-vindas.
6. Abra o link recebido, entre com o mesmo e-mail e o código. Confirme acesso; outro e-mail não libera.
7. Envie reembolso; o acesso fecha. Repita aprovação e confira que continua bloqueado.
8. Com outro pedido de teste, cancele a assinatura com prazo futuro; antes do prazo abre, depois fecha. Teste também prazo passado. Não use pedidos reais de clientes neste roteiro.
