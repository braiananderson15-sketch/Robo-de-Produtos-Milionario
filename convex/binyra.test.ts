import { convexTest } from "convex-test";
import resendTest from "@convex-dev/resend/test";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import schema from "./schema";
import { api, internal, components } from "./_generated/api";
import { assinaturaValida } from "./binyra";
const modules = import.meta.glob("./**/*.{js,ts}");
const SEGREDO = "segredo-ficticio-dos-testes";
const evento = {
  event: "venda.aprovada",
  buyer: { email: "ANA@EXEMPLO.COM" },
  orderId: "pedido-1",
  productId: "produto-app",
  test: false,
};
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv("BINYRA_WEBHOOK_SECRET", SEGREDO);
  vi.stubEnv("BINYRA_PRODUTO_ID", "produto-app");
  vi.stubEnv("AUTH_RESEND_KEY", "chave-ficticia-teste");
  vi.stubEnv("AUTH_EMAIL_FROM", "App <acesso@send.exemplo.com.br>");
  vi.stubEnv("SITE_URL", "https://app.exemplo.com.br");
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});
function setup() {
  const t = convexTest(schema, modules);
  resendTest.register(t);
  return t;
}
async function assinar(body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SEGREDO),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return (
    "sha256=" +
    [
      ...new Uint8Array(
        await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)),
      ),
    ]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
  );
}
async function enviar(
  t: ReturnType<typeof setup>,
  payload: unknown,
  errada = false,
) {
  const body = JSON.stringify(payload);
  return t.fetch("/webhooks/binyra", {
    method: "POST",
    body,
    headers: {
      "X-IC-Signature": errada
        ? "sha256=" + "0".repeat(64)
        : await assinar(body),
    },
  });
}
async function usuario(t: ReturnType<typeof setup>) {
  const id = await t.run((ctx) =>
    ctx.db.insert("users", {
      email: "ana@exemplo.com",
      emailVerificationTime: Date.now(),
    }),
  );
  return t.withIdentity({ subject: id });
}
const compras = (t: ReturnType<typeof setup>) =>
  t.run((ctx) => ctx.db.query("compras").collect());
describe("webhook Binyra", () => {
  it("HMAC usa corpo cru e rejeita assinaturas mal formadas", async () => {
    const body = '{ "a": 1 }',
      s = await assinar(body);
    expect(await assinaturaValida(body, s, SEGREDO)).toBe(true);
    expect(
      await assinaturaValida(JSON.stringify(JSON.parse(body)), s, SEGREDO),
    ).toBe(false);
    for (const s of [
      null,
      "sha256=00",
      "sha512=" + "0".repeat(64),
      "sha256=" + "g".repeat(64),
    ])
      expect(await assinaturaValida(body, s, SEGREDO)).toBe(false);
  });
  it("assinatura errada não grava", async () => {
    const t = setup();
    expect((await enviar(t, evento, true)).status).toBe(401);
    expect(await compras(t)).toHaveLength(0);
    expect(
      await t.run((ctx) => ctx.db.query("comprasTeste").collect()),
    ).toHaveLength(0);
  });
  it("aprovação repetida cria uma compra e um e-mail", async () => {
    const t = setup(),
      u = await usuario(t);
    expect((await enviar(t, evento)).status).toBe(200);
    expect((await enviar(t, evento)).status).toBe(200);
    const lista = await compras(t);
    expect(lista).toHaveLength(1);
    const c = lista[0];
    expect(c.status).toBe("ativa");
    expect(c.email).toBe("ana@exemplo.com");
    expect(c.boasVindasId).toBeTruthy();
    const mail = await t.query(components.resend.lib.get, {
      emailId: c.boasVindasId!,
    });
    expect(mail?.idempotencyKey).toBe("acesso:pedido-1");
    expect(mail?.text).toContain("https://app.exemplo.com.br/entrar");
    expect(mail?.to).toEqual(["ana@exemplo.com"]);
    expect((await u.query(api.acesso.atual))?.ativo).toBe(true);
    expect(await u.query(api.acesso.temAcesso)).toBeNull();
  });
  it("reembolso prevalece sobre aprovação atrasada", async () => {
    const t = setup(),
      u = await usuario(t);
    await enviar(t, evento);
    await enviar(t, { ...evento, event: "venda.reembolsada" });
    await enviar(t, evento);
    expect((await compras(t))[0].status).toBe("cancelada");
    await expect(
      u.action(api.produtos.gerar, { pedido: "{}" }),
    ).rejects.toThrow("COMPRA_INATIVA");
  });
  it("reembolso antes da venda bloqueia", async () => {
    const t = setup(),
      u = await usuario(t);
    await enviar(t, { ...evento, event: "venda.reembolsada" });
    await enviar(t, evento);
    expect((await u.query(api.acesso.atual))?.ativo).toBe(false);
  });
  it("cancelamento futuro expira sem reativar por repetição", async () => {
    const t = setup(),
      u = await usuario(t);
    await enviar(t, evento);
    await enviar(t, {
      ...evento,
      event: "assinatura.cancelada",
      accessEndsAt: Date.now() + 60000,
    });
    expect((await u.query(api.acesso.atual))?.ativo).toBe(true);
    await enviar(t, evento);
    await t.finishAllScheduledFunctions(vi.runAllTimers);
    expect((await u.query(api.acesso.atual))?.ativo).toBe(false);
  });
  it("cancelamento vencido bloqueia imediatamente", async () => {
    const t = setup(),
      u = await usuario(t);
    await enviar(t, {
      ...evento,
      event: "assinatura.cancelada",
      accessEndsAt: Date.now() - 1,
    });
    expect((await u.query(api.acesso.atual))?.ativo).toBe(false);
  });
  it("teste fica isolado e não impede venda real", async () => {
    const t = setup(),
      u = await usuario(t);
    expect((await enviar(t, { ...evento, test: true })).status).toBe(200);
    expect(await compras(t)).toHaveLength(0);
    expect(
      await t.run((ctx) => ctx.db.query("comprasTeste").collect()),
    ).toHaveLength(1);
    expect((await u.query(api.acesso.atual))?.ativo).toBe(false);
    await enviar(t, evento);
    expect((await u.query(api.acesso.atual))?.ativo).toBe(true);
  });
  it("ignora outro produto", async () => {
    const t = setup();
    expect((await enviar(t, { ...evento, productId: "outro" })).status).toBe(
      200,
    );
    expect(await compras(t)).toHaveLength(0);
  });
  it("valida payload e ignora evento desconhecido", async () => {
    const t = setup();
    expect((await enviar(t, { event: "venda.aprovada" })).status).toBe(400);
    expect((await enviar(t, { event: "outro" })).status).toBe(200);
    expect(
      (await enviar(t, { ...evento, event: "assinatura.cancelada" })).status,
    ).toBe(400);
  });
  it("mesmo pedido não troca comprador", async () => {
    const t = setup();
    await enviar(t, evento);
    await expect(
      t.mutation(internal.compras.receberBinyra, {
        email: "bia@exemplo.com",
        produtoId: "produto-app",
        orderId: "pedido-1",
        event: "venda.aprovada",
        teste: false,
      }),
    ).rejects.toThrow("outro comprador");
  });
  it("sem remetente, transação reverte e retorna 503", async () => {
    const t = setup();
    vi.stubEnv("AUTH_EMAIL_FROM", "");
    expect((await enviar(t, evento)).status).toBe(503);
    expect(await compras(t)).toHaveLength(0);
  });
});
