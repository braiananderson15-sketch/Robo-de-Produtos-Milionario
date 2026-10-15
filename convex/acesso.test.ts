import { convexTest } from "convex-test";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import schema from "./schema";
import { api, internal } from "./_generated/api";
const modules = import.meta.glob("./**/*.{js,ts}");
beforeEach(() => vi.stubEnv("BINYRA_PRODUTO_ID", "produto-app"));
afterEach(() => vi.unstubAllEnvs());
async function usuario(
  t: ReturnType<typeof convexTest<typeof schema>>,
  email: string,
  verificado = true,
) {
  const id = await t.run((ctx) =>
    ctx.db.insert("users", {
      email,
      ...(verificado ? { emailVerificationTime: Date.now() } : {}),
    }),
  );
  return t.withIdentity({ subject: id });
}
describe("acesso pago", () => {
  it("sem login bloqueia query e IA", async () => {
    const t = convexTest(schema, modules);
    expect(await t.query(api.acesso.atual)).toBeNull();
    await expect(t.query(api.acesso.exigirAtiva)).rejects.toThrow(
      "ENTRE_PARA_CONTINUAR",
    );
    await expect(
      t.action(api.produtos.gerar, { pedido: "{}" }),
    ).rejects.toThrow("ENTRE_PARA_CONTINUAR");
  });
  it("login sem compra não libera", async () => {
    const t = convexTest(schema, modules),
      u = await usuario(t, "ana@exemplo.com");
    expect((await u.query(api.acesso.atual))?.ativo).toBe(false);
    await expect(u.query(api.acesso.exigirAtiva)).rejects.toThrow(
      "COMPRA_INATIVA",
    );
    await expect(
      u.action(api.produtos.gerar, { pedido: "{}" }),
    ).rejects.toThrow("COMPRA_INATIVA");
  });
  it("compra só libera o e-mail correto", async () => {
    const t = convexTest(schema, modules),
      ana = await usuario(t, "ana@exemplo.com"),
      bia = await usuario(t, "bia@exemplo.com");
    await t.mutation(internal.compras.registrar, {
      email: "ANA@EXEMPLO.COM",
      referencia: "teste",
      status: "ativa",
    });
    expect((await ana.query(api.acesso.atual))?.ativo).toBe(true);
    expect((await bia.query(api.acesso.atual))?.ativo).toBe(false);
  });
  it("e-mail precisa estar verificado", async () => {
    const t = convexTest(schema, modules),
      u = await usuario(t, "ana@exemplo.com", false);
    await t.mutation(internal.compras.registrar, {
      email: "ana@exemplo.com",
      referencia: "teste",
      status: "ativa",
    });
    expect((await u.query(api.acesso.atual))?.ativo).toBe(false);
  });
  it("prazo vencido, reativação manual e reembolso", async () => {
    const t = convexTest(schema, modules),
      u = await usuario(t, "ana@exemplo.com");
    const args = {
      email: "ana@exemplo.com",
      referencia: "teste",
      status: "ativa" as const,
    };
    await t.mutation(internal.compras.registrar, {
      ...args,
      expiraEm: Date.now() - 1,
    });
    expect((await u.query(api.acesso.atual))?.ativo).toBe(false);
    await t.mutation(internal.compras.registrar, args);
    expect((await u.query(api.acesso.atual))?.ativo).toBe(true);
    await t.mutation(internal.compras.registrar, {
      ...args,
      status: "reembolsada",
    });
    expect((await u.query(api.acesso.atual))?.ativo).toBe(false);
  });
  it("referência idempotente não troca comprador", async () => {
    const t = convexTest(schema, modules),
      a = {
        email: "ana@exemplo.com",
        referencia: "teste",
        status: "ativa" as const,
      };
    expect(await t.mutation(internal.compras.registrar, a)).toBe(
      await t.mutation(internal.compras.registrar, a),
    );
    await expect(
      t.mutation(internal.compras.registrar, {
        ...a,
        email: "bia@exemplo.com",
      }),
    ).rejects.toThrow("outro e-mail");
  });
});
