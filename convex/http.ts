import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { EventoBinyra, assinaturaValida } from "./binyra";
const http = httpRouter();
auth.addHttpRoutes(http);
http.route({
  path: "/webhooks/binyra",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const segredo = process.env.BINYRA_WEBHOOK_SECRET;
    if (!segredo)
      return new Response("Webhook não configurado", { status: 503 });
    const corpo = await request.text();
    if (
      !(await assinaturaValida(
        corpo,
        request.headers.get("X-IC-Signature"),
        segredo,
      ))
    )
      return new Response("Assinatura inválida", { status: 401 });
    if (corpo.length > 64000)
      return new Response("Evento muito grande", { status: 413 });
    let json;
    try {
      json = JSON.parse(corpo);
    } catch {
      return new Response("JSON inválido", { status: 400 });
    }
    if (!json || typeof json.event !== "string")
      return new Response("Evento ausente", { status: 400 });
    if (
      !["venda.aprovada", "venda.reembolsada", "assinatura.cancelada"].includes(
        json.event,
      )
    )
      return new Response("Evento ignorado");
    const resultado = EventoBinyra.safeParse(json);
    if (!resultado.success)
      return new Response("Confira os campos do evento", { status: 400 });
    if (!process.env.BINYRA_PRODUTO_ID)
      return new Response("Produto não configurado", { status: 503 });
    const a = resultado.data;
    if (a.produtoId !== process.env.BINYRA_PRODUTO_ID)
      return new Response("Produto ignorado");
    try {
      await ctx.runMutation(internal.compras.receberBinyra, {
        email: a.buyer.email,
        produtoId: a.produtoId,
        orderId: a.orderId,
        event: a.event,
        accessEndsAt: a.accessEndsAt,
        teste: a.test ?? false,
      });
      return new Response("OK");
    } catch {
      return new Response("Não foi possível registrar o evento", {
        status: 503,
      });
    }
  }),
});
export default http;
