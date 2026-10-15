"use node";
// Operação exclusiva do dono, pelo painel Convex. Não é chamada pelo navegador do app.
import { internalAction } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { generateKeyPair, exportPKCS8, exportJWK } from "jose";
import { createPublicKey } from "node:crypto";
export const configurar = internalAction({
  args: {},
  returns: v.string(),
  handler: async () => {
    const existente = process.env.JWT_PRIVATE_KEY;
    if (existente && process.env.JWKS)
      return "Chaves de sessão conferidas no Convex. Mantive a chave privada existente.";
    const chave = process.env.CHAVE_CONFIGURACAO_CONVEX,
      url = process.env.CONVEX_CLOUD_URL;
    if (!chave || !url)
      throw new ConvexError(
        "Cadastre CHAVE_CONFIGURACAO_CONVEX com permissão deployment:env:write neste ambiente do Convex.",
      );
    const changes: { name: string; value?: string }[] = [];
    if (existente) {
      const publica = createPublicKey(
        existente.replace(
          /-----BEGIN PRIVATE KEY-----\s*([\s\S]*?)\s*-----END PRIVATE KEY-----/,
          (_, corpo: string) =>
            `-----BEGIN PRIVATE KEY-----\n${corpo.replace(/\s/g, "")}\n-----END PRIVATE KEY-----`,
        ),
      );
      changes.push({
        name: "JWKS",
        value: JSON.stringify({
          keys: [{ use: "sig", ...publica.export({ format: "jwk" }) }],
        }),
      });
    } else {
      const { privateKey, publicKey } = await generateKeyPair("RS256", {
        extractable: true,
      });
      changes.push(
        {
          name: "JWT_PRIVATE_KEY",
          value: (await exportPKCS8(privateKey)).trimEnd().replace(/\n/g, " "),
        },
        {
          name: "JWKS",
          value: JSON.stringify({
            keys: [{ use: "sig", ...(await exportJWK(publicKey)) }],
          }),
        },
      );
    }
    // Retira a chave temporária da configuração na mesma operação.
    changes.push({ name: "CHAVE_CONFIGURACAO_CONVEX" });
    const resposta = await fetch(`${url}/api/update_environment_variables`, {
      method: "POST",
      headers: {
        Authorization: `Convex ${chave}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ changes }),
    });
    if (!resposta.ok)
      throw new ConvexError(
        "Não foi possível cadastrar as chaves. Confira o ambiente e a permissão deployment:env:write.",
      );
    return existente
      ? "Chaves de sessão conferidas no Convex. Mantive a chave privada existente."
      : "Chaves de sessão cadastradas no Convex. Nenhum valor foi exibido.";
  },
});
