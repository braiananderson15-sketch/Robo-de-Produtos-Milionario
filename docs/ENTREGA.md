# Entrega e validação

As instruções desta tarefa substituem as pausas e os comandos locais do manual: todas as fases foram reunidas em uma única PR. Nada foi publicado ou mesclado pelo assistente.

| Fase | Entrega |
| --- | --- |
| 0 | Next 16.4, TypeScript, dependências e configurações, estrutura e BUSINESS.md |
| 1 | CSS literal, azul-noite/cromo/lilás, Geist, ícones, disco e moldura responsiva |
| 2 | Cálculos pitagóricos em código e 9 testes do manual |
| 3 | Vitrine aberta, cálculo animado, oferta e checkout externo configurável |
| 4 | Fluxo de 5 passos, modelo local, resultado, produtos, agenda e mapa; armazenamento por conta, até 20 produtos |
| 5 | Revisão de textos e preços de exemplo; ensaio em 360 px e 1440 px |
| 6 | Convex Auth, Resend OTP, compra ativa no servidor, webhook HMAC idempotente, IA via action, expiração e 18 testes do manual |
| 7 | README, login, Binyra, publicação pelo celular, revenda e ideias futuras |

Também incluída a função **interna** `chaves:configurar`, para gerar o par de sessão pelo painel Convex sem terminal, sem imprimir os valores e sem trocar a chave privada existente. Mais 4 testes; total 31.

## Verificado

- 31 testes passaram (9 cálculo, 6 acesso, 12 Binyra, 4 configuração de chaves).
- Lint sem erros.
- Build Next de produção passou com endereços públicos locais, sem segredos.
- No navegador, a vitrine funciona em 360 px e 1440 px, sem rolagem horizontal ou erros JavaScript.
- Ana Silva, 14/03/1972: Ofício 7, Moeda 3.
- Ensaio da interface paga com dados fictícios e modelo em código: nome/data/talento → resultado; persistência após navegar; mensagem de grupo; link WhatsApp; 7 dias de agenda; 3 cartões de mapa. Sem erros JavaScript e sem overflow. A autenticação foi substituída apenas durante esse ensaio, em arquivos temporários depois restaurados; não existe esse atalho no código entregue.
- No código final, `/` redireciona para `/entrar` sem sessão; `/api/produto` retorna 401 sem sessão.
- Nenhum `.env`, `.env.local`, `.convex`, banco temporário, dependência instalada ou captura de tela entrou na PR.

## Limites da validação

- Não foram usadas credenciais reais de Resend, Anthropic, Binyra ou Convex hospedado. Envio de e-mail, domínio/DNS, compra real, assinatura enviada pelo fornecedor e IA paga precisam ser validados no Preview configurado pelo dono.
- O backend local foi iniciado para conferir a geração, mas a análise de ações Node foi bloqueada pela restrição de sockets Unix deste ambiente. A API de módulos foi regenerada offline pelo CLI; a referência tipada do componente Resend usa o tipo exportado pelo pacote instalado. A pasta `_generated` atualizada está versionada e passa no TypeScript. A Vercel fará a geração/análise completa ao executar o comando de deploy autorizado pelo dono.
- Checkout e WhatsApp permanecem com os exemplos do manual. Não os use para vender antes de fornecer os dados reais.
- Cada aparelho tem seus próprios produtos. O login protege o acesso, mas não sincroniza produtos entre aparelhos.
- Não é gerado um PDF final. O cliente recebe a proposta e os tópicos para produzi-lo.
- O contrato Binyra implementado é o solicitado no manual; confirme o suporte no seu fornecedor antes de ativar vendas.

## Antes de Merge

Siga PUBLICAR.md para configurar Production e um Preview separado. No Preview, teste e-mail/código, conta sem compra, compra ativa, geração sem IA e com IA opcional, persistência, mensagens, duas contas, reembolso e expiração. Só depois faça Merge na PR.
