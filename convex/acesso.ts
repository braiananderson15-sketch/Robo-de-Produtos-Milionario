import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { query, type QueryCtx, type MutationCtx } from "./_generated/server";
export async function verificarCompra(ctx: QueryCtx | MutationCtx) {
  const usuarioId = await getAuthUserId(ctx);
  if (!usuarioId) return null;
  const usuario = await ctx.db.get(usuarioId),
    email = usuario?.email?.trim().toLowerCase();
  if (
    !email ||
    !usuario?.emailVerificationTime ||
    !process.env.BINYRA_PRODUTO_ID
  )
    return { usuarioId, ativo: false };
  const compras = await ctx.db
    .query("compras")
    .withIndex("por_email_produtoId_status", (q) =>
      q
        .eq("email", email)
        .eq("produtoId", process.env.BINYRA_PRODUTO_ID!)
        .eq("status", "ativa"),
    )
    .collect();
  // Confere também o prazo diretamente: um agendamento atrasado nunca libera acesso vencido.
  return {
    usuarioId,
    ativo: compras.some(
      (c) => c.accessEndsAt === undefined || c.accessEndsAt > Date.now(),
    ),
  };
}
export async function exigirCompra(ctx: QueryCtx | MutationCtx) {
  const a = await verificarCompra(ctx);
  if (!a) throw new ConvexError("ENTRE_PARA_CONTINUAR");
  if (!a.ativo) throw new ConvexError("COMPRA_INATIVA");
  return a.usuarioId;
}
export const atual = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({ usuarioId: v.id("users"), ativo: v.boolean() }),
  ),
  handler: verificarCompra,
});
export const temAcesso = query({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await exigirCompra(ctx);
    return null;
  },
});
export const exigirAtiva = temAcesso;
