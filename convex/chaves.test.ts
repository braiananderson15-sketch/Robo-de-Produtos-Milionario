import { convexTest } from "convex-test";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { generateKeyPair, exportPKCS8, exportJWK } from "jose";
import schema from "./schema";
import { internal } from "./_generated/api";
const modules = import.meta.glob("./**/*.{js,ts}");
beforeEach(() => {
  vi.stubEnv("JWT_PRIVATE_KEY", "");
  vi.stubEnv("JWKS", "");
  vi.stubEnv("CHAVE_CONFIGURACAO_CONVEX", "");
  vi.stubEnv("CONVEX_CLOUD_URL", "https://teste.convex.cloud");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it("configuração exige chave temporária, não é uma action pública", async () => {
  const t = convexTest(schema, modules);
  await expect(t.action(internal.chaves.configurar)).rejects.toThrow(
    "CHAVE_CONFIGURACAO_CONVEX",
  );
});
it("gera o par só no servidor e remove credencial temporária sem retorná-la", async () => {
  const t = convexTest(schema, modules);
  vi.stubEnv("CHAVE_CONFIGURACAO_CONVEX", "ficticia-configuracao");
  const fetchMock = vi.fn().mockResolvedValue(new Response("{}"));
  vi.stubGlobal("fetch", fetchMock);
  const retorno = await t.action(internal.chaves.configurar);
  expect(retorno).not.toContain("PRIVATE KEY");
  expect(retorno).not.toContain("ficticia-configuracao");
  const body = JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(
    body.changes.find((c: { name: string }) => c.name === "JWT_PRIVATE_KEY")
      .value,
  ).toContain("BEGIN PRIVATE KEY");
  expect(
    JSON.parse(
      body.changes.find((c: { name: string }) => c.name === "JWKS").value,
    ).keys[0].kty,
  ).toBe("RSA");
  expect(body.changes.at(-1)).toEqual({ name: "CHAVE_CONFIGURACAO_CONVEX" });
});
it("preserva a chave privada existente ao recuperar JWKS", async () => {
  const t = convexTest(schema, modules),
    { privateKey, publicKey } = await generateKeyPair("RS256", {
      extractable: true,
    });
  vi.stubEnv(
    "JWT_PRIVATE_KEY",
    (await exportPKCS8(privateKey)).trimEnd().replace(/\n/g, " "),
  );
  vi.stubEnv("CHAVE_CONFIGURACAO_CONVEX", "ficticia-configuracao");
  const f = vi.fn().mockResolvedValue(new Response("{}"));
  vi.stubGlobal("fetch", f);
  await t.action(internal.chaves.configurar);
  const changes = JSON.parse(f.mock.calls[0][1].body).changes;
  expect(
    changes.some((c: { name: string }) => c.name === "JWT_PRIVATE_KEY"),
  ).toBe(false);
  expect(JSON.parse(changes[0].value).keys[0]).toMatchObject(
    await exportJWK(publicKey),
  );
});
it("par existente não altera variáveis", async () => {
  const t = convexTest(schema, modules);
  vi.stubEnv("JWT_PRIVATE_KEY", "chave-existente-ficticia");
  vi.stubEnv("JWKS", "jwks-existente-ficticio");
  const f = vi.fn();
  vi.stubGlobal("fetch", f);
  expect(await t.action(internal.chaves.configurar)).toContain(
    "Mantive a chave privada existente",
  );
  expect(f).not.toHaveBeenCalled();
});
