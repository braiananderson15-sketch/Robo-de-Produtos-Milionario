// Execução manual. Nenhuma chave é impressa ou salva em arquivo.
import { generateKeyPair, exportPKCS8, exportJWK } from "jose";
import { createPublicKey } from "node:crypto";
import { spawnSync } from "node:child_process";
const args = process.argv.slice(2);
if (args.some((a) => a !== "--prod") || args.length > 1)
  throw new Error("Use somente --prod, ou nenhum argumento.");
const alvo = args.includes("--prod") ? ["--prod"] : [];
function executar(partes) {
  return spawnSync("npx", ["convex", "env", ...partes, ...alvo], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}
function ler(nome) {
  const r = executar(["get", nome]);
  if (r.error || r.status !== 0)
    throw new Error(
      "Não foi possível consultar as variáveis do Convex. Confira a conexão e as permissões.",
    );
  return r.stdout.trim();
}
function cadastrar(nome, valor) {
  const r = executar(["set", `${nome}=${valor}`]);
  if (r.error || r.status !== 0)
    throw new Error(`Não foi possível cadastrar ${nome}.`);
  console.log(`${nome} cadastrado no Convex.`);
}
const existente = ler("JWT_PRIVATE_KEY");
if (existente) {
  if (!ler("JWKS")) {
    const publica = createPublicKey(
      existente.replace(
        /-----BEGIN PRIVATE KEY-----\s*([\s\S]*?)\s*-----END PRIVATE KEY-----/,
        (_, corpo) =>
          `-----BEGIN PRIVATE KEY-----\n${corpo.replace(/\s/g, "")}\n-----END PRIVATE KEY-----`,
      ),
    );
    cadastrar(
      "JWKS",
      JSON.stringify({
        keys: [{ use: "sig", ...publica.export({ format: "jwk" }) }],
      }),
    );
  }
  console.log(
    "Chaves de sessão conferidas no Convex. Mantive a chave privada existente.",
  );
} else {
  const { privateKey, publicKey } = await generateKeyPair("RS256", {
    extractable: true,
  });
  cadastrar(
    "JWT_PRIVATE_KEY",
    (await exportPKCS8(privateKey)).trimEnd().replace(/\n/g, " "),
  );
  cadastrar(
    "JWKS",
    JSON.stringify({ keys: [{ use: "sig", ...(await exportJWK(publicKey)) }] }),
  );
}
