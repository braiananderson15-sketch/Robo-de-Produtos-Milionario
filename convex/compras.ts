import { v, ConvexError } from "convex/values";
import { Resend } from "@convex-dev/resend";
import { internalMutation } from "./_generated/server";
import { internal, components } from "./_generated/api";
import { marca } from "../config/marca";
import { remetenteValido } from "./remetente";
const evento = v.union(
  v.literal("venda.aprovada"),
  v.literal("venda.reembolsada"),
  v.literal("assinatura.cancelada"),
);
const emailValido = (e: string) =>
  e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
export const receberBinyra = internalMutation({
  args: {
    email: v.string(),
    produtoId: v.string(),
    orderId: v.string(),
    event: evento,
    accessEndsAt: v.optional(v.number()),
    teste: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, a) => {
    const email = a.email.trim().toLowerCase(),
      agora = Date.now();
    if (
      !emailValido(email) ||
      !a.orderId.trim() ||
      a.orderId.length > 120 ||
      !a.produtoId.trim()
    )
      throw new ConvexError("Evento inválido.");
    if (
      !process.env.BINYRA_PRODUTO_ID ||
      a.produtoId !== process.env.BINYRA_PRODUTO_ID
    )
      throw new ConvexError("Produto não autorizado.");
    if (
      a.event === "assinatura.cancelada" &&
      (a.accessEndsAt === undefined ||
        !Number.isFinite(a.accessEndsAt) ||
        a.accessEndsAt < 0)
    )
      throw new ConvexError("Fim de acesso inválido.");
    const fim = a.event === "assinatura.cancelada" ? a.accessEndsAt : undefined,
      status =
        a.event === "venda.reembolsada"
          ? ("cancelada" as const)
          : fim !== undefined && fim <= agora
            ? ("expirada" as const)
            : ("ativa" as const);
    if (a.teste) {
      const anterior = await ctx.db
        .query("comprasTeste")
        .withIndex("por_orderId", (q) => q.eq("orderId", a.orderId))
        .unique();
      if (
        anterior &&
        (anterior.email !== email || anterior.produtoId !== a.produtoId)
      )
        throw new ConvexError("Pedido pertence a outro comprador ou produto.");
      if (
        anterior &&
        (anterior.status === "cancelada" ||
          (a.event === "venda.aprovada" &&
            anterior.evento !== "venda.aprovada"))
      )
        return null;
      const dados = {
        email,
        produtoId: a.produtoId,
        orderId: a.orderId,
        status,
        criadoEm: anterior?.criadoEm ?? agora,
        atualizadaEm: agora,
        accessEndsAt: fim,
        evento: a.event,
        teste: true as const,
      };
      if (anterior) await ctx.db.replace(anterior._id, dados);
      else await ctx.db.insert("comprasTeste", dados);
      return null;
    }
    const anterior = await ctx.db
      .query("compras")
      .withIndex("por_orderId", (q) => q.eq("orderId", a.orderId))
      .unique();
    if (
      anterior &&
      (anterior.email !== email || anterior.produtoId !== a.produtoId)
    )
      throw new ConvexError("Pedido pertence a outro comprador ou produto.");
    if (
      anterior &&
      (anterior.status === "cancelada" ||
        (a.event === "venda.aprovada" && anterior.evento !== "venda.aprovada"))
    )
      return null;
    if (anterior?.evento === a.event && anterior.accessEndsAt === fim)
      return null;
    const dados = {
      email,
      produtoId: a.produtoId,
      orderId: a.orderId,
      status,
      criadoEm: anterior?.criadoEm ?? agora,
      atualizadaEm: agora,
      accessEndsAt: fim,
      evento: a.event,
    };
    const compraId = anterior
      ? anterior._id
      : await ctx.db.insert("compras", dados);
    if (anterior) await ctx.db.patch(compraId, dados);
    if (status === "ativa" && fim !== undefined)
      await ctx.scheduler.runAt(fim, internal.compras.expirar, {
        compraId,
        accessEndsAt: fim,
      });
    if (a.event === "venda.aprovada" && !anterior?.boasVindasId) {
      const from = process.env.AUTH_EMAIL_FROM ?? "",
        site = process.env.SITE_URL ?? "";
      if (!remetenteValido(from) || !process.env.AUTH_RESEND_KEY)
        throw new ConvexError("Configure o remetente Resend.");
      if (!/^https?:\/\//.test(site))
        throw new ConvexError("Configure SITE_URL.");
      const link = new URL("/entrar", site).toString();
      const resend = new Resend(components.resend, {
        testMode: false,
        apiKey: process.env.AUTH_RESEND_KEY,
      });
      const id = await resend.sendEmail(ctx, {
        from,
        to: email,
        subject: "Seu acesso ao " + marca.nomeApp,
        text: `Sua compra foi aprovada.\n\nEntre aqui: ${link}\nUse este mesmo e-mail para receber seu código de acesso.\n\nEquipe ${marca.nomeApp}`,
        idempotencyKey: "acesso:" + a.orderId,
      });
      await ctx.db.patch(compraId, { boasVindasId: id });
    }
    return null;
  },
});
export const registrar = internalMutation({
  args: {
    email: v.string(),
    referencia: v.string(),
    status: v.union(
      v.literal("ativa"),
      v.literal("cancelada"),
      v.literal("reembolsada"),
    ),
    expiraEm: v.optional(v.number()),
  },
  returns: v.id("compras"),
  handler: async (ctx, a) => {
    const email = a.email.trim().toLowerCase(),
      produtoId = process.env.BINYRA_PRODUTO_ID,
      agora = Date.now();
    if (
      !produtoId ||
      !emailValido(email) ||
      !a.referencia.trim() ||
      a.referencia.length > 120
    )
      throw new ConvexError("Confira e-mail, referência e BINYRA_PRODUTO_ID.");
    const anterior = await ctx.db
      .query("compras")
      .withIndex("por_orderId", (q) => q.eq("orderId", a.referencia))
      .unique();
    if (anterior && anterior.email !== email)
      throw new ConvexError("A referência já pertence a outro e-mail.");
    const status =
      a.status !== "ativa"
        ? ("cancelada" as const)
        : a.expiraEm !== undefined && a.expiraEm <= agora
          ? ("expirada" as const)
          : ("ativa" as const);
    const dados = {
      email,
      produtoId,
      orderId: a.referencia,
      status,
      accessEndsAt: a.expiraEm,
      criadoEm: anterior?.criadoEm ?? agora,
      atualizadaEm: agora,
    };
    const id = anterior ? anterior._id : await ctx.db.insert("compras", dados);
    if (anterior) await ctx.db.patch(id, dados);
    if (status === "ativa" && a.expiraEm !== undefined)
      await ctx.scheduler.runAt(a.expiraEm, internal.compras.expirar, {
        compraId: id,
        accessEndsAt: a.expiraEm,
      });
    return id;
  },
});
export const expirar = internalMutation({
  args: { compraId: v.id("compras"), accessEndsAt: v.number() },
  returns: v.null(),
  handler: async (ctx, a) => {
    const c = await ctx.db.get(a.compraId);
    if (
      c?.status === "ativa" &&
      c.accessEndsAt === a.accessEndsAt &&
      a.accessEndsAt <= Date.now()
    )
      await ctx.db.patch(a.compraId, {
        status: "expirada",
        atualizadaEm: Date.now(),
      });
    return null;
  },
});
