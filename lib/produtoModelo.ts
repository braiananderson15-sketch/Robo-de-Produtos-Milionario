// Produto montado em código. Usado quando não há chave de API ou quando a IA falha.
import { talentoPorNome } from "./talentos";
import type { PedidoProduto, Produto } from "./tipos";

const PRECOS = [19.9, 24.9, 27, 29.9, 17, 37, 14.9, 34.9];

function palavraDoFormato(formato?: string) {
  if (formato?.startsWith("Checklist")) return "checklist";
  if (formato?.startsWith("Passo a passo")) return "passo a passo com fotos";
  return "mini-guia";
}

export function montarProdutoModelo(p: PedidoProduto): Produto {
  const escolhido = p.talentos.map(talentoPorNome).find(Boolean);
  const tema = escolhido?.tema ?? (p.talentos[0] || p.outro || "o que você faz").toLowerCase();
  const nomeProduto = escolhido?.produto ?? `O Meu Jeito de Fazer ${p.talentos[0] ?? p.outro ?? ""}`.trim();
  const promessa = escolhido?.promessa ?? `Tudo o que eu sei sobre ${tema}, explicado de um jeito simples.`;
  const formato = palavraDoFormato(p.formato);
  const jeito = p.tituloOficio.replace(/^Quem /, "").toLowerCase();
  const indice = (nomeProduto.length + p.oficio) % PRECOS.length;
  const precoExemplo = Math.min(p.precoMax, Math.max(p.precoMin, PRECOS[indice]));

  const topicos = [
    `Por que tanta gente me pede ajuda com ${tema}`,
    "O que você precisa ter em casa antes de começar",
    "O meu passo a passo, do início ao fim",
    "Os 3 erros mais comuns e como evitar cada um",
    "Como adaptar ao seu tempo e ao seu bolso",
    "As dicas que eu guardava só para mim",
  ];
  if (p.outro?.trim()) topicos.push(`Extra: como eu faço ${p.outro.trim().toLowerCase()}`);

  const promessaMinuscula = promessa.charAt(0).toLowerCase() + promessa.slice(1);
  return {
    nomeProduto,
    promessa,
    topicos,
    precoExemplo,
    mensagens: {
      status: `Descobri que o meu número é de quem ${jeito} ✨ Por isso juntei tudo o que eu sei de ${tema} num ${formato}: “${nomeProduto}”. Quer que eu te mande?`,
      grupo: `Oi, pessoal! Tudo bem? Muita gente aqui já me pediu dica de ${tema}, então organizei tudo num ${formato} chamado “${nomeProduto}”. É simples e direto: ${promessaMinuscula} Se fizer sentido para alguém, posso mandar os detalhes no privado?`,
      privado: `Oi, [nome do contato]! Lembrei de você, que sempre me pergunta sobre ${tema}. Montei um ${formato}, o “${nomeProduto}”, com o meu passo a passo. Quer que eu te mande?`,
    },
  };
}

/** Corta textos acima dos limites e arruma o preço, venha de onde vier o produto. */
export function ajustarLimites(produto: Produto, precoMin: number, precoMax: number): Produto {
  const corta = (t: string, max: number) => (t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t);
  let preco = Number(produto.precoExemplo) || precoMin;
  preco = Math.min(precoMax, Math.max(precoMin, preco));
  if (!Number.isInteger(preco)) preco = Math.floor(preco) + 0.9;
  return {
    nomeProduto: corta(produto.nomeProduto, 70),
    promessa: corta(produto.promessa, 160),
    topicos: produto.topicos.slice(0, 7).map((t) => corta(t, 110)),
    precoExemplo: preco,
    mensagens: {
      status: corta(produto.mensagens.status, 280),
      grupo: corta(produto.mensagens.grupo, 400),
      privado: corta(produto.mensagens.privado, 300),
    },
  };
}

export const formatarPreco = (n: number) => "R$ " + n.toFixed(2).replace(".", ",");
