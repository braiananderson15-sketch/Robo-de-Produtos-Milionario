"use node";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { v, ConvexError } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { marca } from "../config/marca";
import { montarProdutoModelo, ajustarLimites } from "../lib/produtoModelo";
import type { PedidoProduto, Produto } from "../lib/tipos";
const texto = z.string().trim().min(1).max(60),
  opcional = z.string().trim().max(60).optional();
const Pedido = z.object({
  primeiroNome: texto,
  oficio: z.number().int().min(1).max(9),
  moeda: z.number().int().min(1).max(9),
  anoColheita: z.number().int().min(1).max(9),
  tituloOficio: texto,
  significadoOficio: z.string().max(200),
  talentos: z.array(texto).min(1).max(3),
  outro: opcional,
  publico: opcional,
  tempo: opcional,
  formato: opcional,
  precoMin: z.number().min(1).max(10000),
  precoMax: z.number().min(1).max(10000),
});
const Saida = z.object({
  nomeProduto: z.string(),
  promessa: z.string(),
  topicos: z.array(z.string()),
  precoExemplo: z.number(),
  mensagens: z.object({
    status: z.string(),
    grupo: z.string(),
    privado: z.string(),
  }),
});
const produtoValidator = v.object({
  nomeProduto: v.string(),
  promessa: v.string(),
  topicos: v.array(v.string()),
  precoExemplo: v.number(),
  mensagens: v.object({
    status: v.string(),
    grupo: v.string(),
    privado: v.string(),
  }),
});
const SISTEMA = `Você escreve para uma pessoa comum do Brasil. Use linguagem simples e calorosa, tratando por "você".

Crie UM produto digital simples, que a pessoa consiga montar em poucas horas com o que já sabe: um mini-guia em PDF, uma lista, um cardápio, um passo a passo ou um checklist. Ele precisa ser ligado ao talento marcado e ao significado do Número de Ofício. Se a pessoa disse para quem costuma fazer, quanto tempo tem e que formato prefere, respeite isso.

- O nome do produto deve ser concreto e atrativo, com até 8 palavras. A promessa cabe em 1 frase concreta, sem exagero.
- Escreva de 5 a 7 tópicos do mini-guia, cada um com até 15 palavras.
- O preço de exemplo fica entre o preço mínimo e o máximo informados, em reais, inteiro ou terminado em ,90.
- Escreva 3 mensagens para a pessoa mandar no próprio WhatsApp:
  - status: até 280 caracteres, com 1 ou 2 emojis;
  - grupo: até 400 caracteres, educada, sem pressão, que não pareça spam;
  - privado: até 300 caracteres, pessoal, começando com "Oi, [nome do contato]" como espaço para preencher.
  Todas terminam com uma pergunta leve, do tipo "quer que eu te mande?". Todas podem citar o número de forma leve (ex.: "descobri que o meu número é de quem cuida e ensina").

PROIBIDO: prometer renda, ganho, sucesso ou cura; falar em bloqueio, carma ou azar; usar termos religiosos específicos de uma única fé; chamar alguém para "entrar" em negócio, grupo de investimento ou revenda.`;
function pedidoEmTexto(p: PedidoProduto) {
  return [
    `Primeiro nome: ${p.primeiroNome}`,
    `Número de Ofício: ${p.oficio} (${p.tituloOficio}). ${p.significadoOficio}`,
    `Número da Moeda: ${p.moeda}`,
    `Ano de Colheita: ${p.anoColheita}`,
    `Talentos marcados: ${p.talentos.join(", ")}`,
    p.outro && `Outra coisa que pedem: ${p.outro}`,
    p.publico && `Para quem costuma fazer: ${p.publico}`,
    p.tempo && `Tempo disponível: ${p.tempo}`,
    p.formato && `Formato preferido: ${p.formato}`,
    `Preço mínimo: R$ ${p.precoMin}. Preço máximo: R$ ${p.precoMax}.`,
  ]
    .filter(Boolean)
    .join("\n");
}
export const gerar = action({
  args: { pedido: v.string() },
  returns: v.object({
    produto: produtoValidator,
    origem: v.union(v.literal("ia"), v.literal("modelo")),
  }),
  handler: async (
    ctx,
    a,
  ): Promise<{ produto: Produto; origem: "ia" | "modelo" }> => {
    await ctx.runQuery(api.acesso.temAcesso, {});
    let json;
    try {
      if (a.pedido.length > 6000) throw new Error();
      json = JSON.parse(a.pedido);
    } catch {
      throw new ConvexError("Confira os dados do produto.");
    }
    const resultado = Pedido.safeParse(json);
    if (!resultado.success)
      throw new ConvexError(
        "Faltou alguma informação. Volte uma etapa e confira.",
      );
    const min = marca.precoExemploMin,
      max = marca.precoExemploMax,
      pedido = { ...resultado.data, precoMin: min, precoMax: max };
    if (process.env.ANTHROPIC_API_KEY && process.env.IA_PROVEDOR !== "modelo") {
      const client = new Anthropic();
      for (let i = 0; i < 2; i++) {
        let produto: Produto | null = null;
        try {
          const resposta = await client.messages.parse({
            model: process.env.IA_MODELO || "claude-sonnet-5-5",
            max_tokens: 4000,
            system: SISTEMA,
            messages: [{ role: "user", content: pedidoEmTexto(pedido) }],
            output_config: { format: zodOutputFormat(Saida) },
          });
          if (
            resposta.stop_reason !== "refusal" &&
            resposta.parsed_output &&
            resposta.parsed_output.topicos.length >= 3
          )
            produto = resposta.parsed_output;
        } catch (e) {
          if (e instanceof Anthropic.AuthenticationError) break;
        }
        if (produto) {
          await ctx.runQuery(api.acesso.temAcesso, {});
          return { produto: ajustarLimites(produto, min, max), origem: "ia" };
        }
      }
    }
    await ctx.runQuery(api.acesso.temAcesso, {});
    return {
      produto: ajustarLimites(montarProdutoModelo(pedido), min, max),
      origem: "modelo",
    };
  },
});
