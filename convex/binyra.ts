import { z } from "zod";
import { constantTimeEqual } from "@oslojs/crypto/subtle";
const texto = z.string().trim().min(1).max(120);
export const EventoBinyra = z
  .object({
    event: z.enum([
      "venda.aprovada",
      "venda.reembolsada",
      "assinatura.cancelada",
    ]),
    buyer: z.object({
      email: z.string().trim().toLowerCase().email().max(254),
    }),
    orderId: texto,
    produtoId: texto.optional(),
    productId: texto.optional(),
    accessEndsAt: z
      .union([z.number().finite().min(0), z.iso.datetime({ offset: true })])
      .optional(),
    test: z.boolean().optional(),
  })
  .superRefine((a, ctx) => {
    if (!a.produtoId && !a.productId)
      ctx.addIssue({ code: "custom", message: "Produto ausente" });
    if (a.produtoId && a.productId && a.produtoId !== a.productId)
      ctx.addIssue({ code: "custom", message: "Produtos diferentes" });
    if (a.event === "assinatura.cancelada" && a.accessEndsAt === undefined)
      ctx.addIssue({ code: "custom", message: "Fim do acesso ausente" });
  })
  .transform((a) => ({
    ...a,
    produtoId: (a.produtoId ?? a.productId)!,
    accessEndsAt:
      typeof a.accessEndsAt === "string"
        ? Date.parse(a.accessEndsAt)
        : a.accessEndsAt,
  }));
export async function assinaturaValida(
  corpo: string,
  assinatura: string | null,
  segredo: string,
) {
  if (!assinatura || !/^sha256=[a-fA-F0-9]{64}$/.test(assinatura)) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(segredo),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const esperado = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(corpo)),
  );
  const recebido = Uint8Array.from(assinatura.slice(7).match(/../g)!, (x) =>
    parseInt(x, 16),
  );
  return constantTimeEqual(esperado, recebido);
}
