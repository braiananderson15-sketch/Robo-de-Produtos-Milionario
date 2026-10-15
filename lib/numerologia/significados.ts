// Textos fixos de cada número, sempre positivos. Escritos em código, sem IA.

export type Significado = { titulo: string; oficio: string; moeda: string };

export const SIGNIFICADOS: Record<number, Significado> = {
  1: { titulo: "Quem Começa e Lidera", oficio: "Você dá o primeiro passo enquanto os outros ainda estão pensando. As pessoas seguem a sua iniciativa.", moeda: "Valorizam a sua coragem de resolver." },
  2: { titulo: "Quem Acolhe e Une", oficio: "Você escuta, junta as pessoas e faz todo mundo se sentir em casa.", moeda: "Valorizam o seu jeito de acolher." },
  3: { titulo: "Quem Comunica e Alegra", oficio: "Você explica, encanta e deixa mais bonito tudo o que passa pela sua mão.", moeda: "Valorizam o seu capricho e a sua alegria." },
  4: { titulo: "Quem Organiza e Constrói", oficio: "Você transforma bagunça em ordem e ideia em coisa pronta.", moeda: "Valorizam a sua mão firme e caprichosa." },
  5: { titulo: "Quem Movimenta e Adapta", oficio: "Você aprende rápido, se vira em qualquer situação e anima quem estava parado.", moeda: "Valorizam a sua energia e o seu jeito prático." },
  6: { titulo: "Quem Cuida e Ensina", oficio: "Você cuida com carinho e ensina com paciência. Quem passa por você sai melhor.", moeda: "Valorizam o seu cuidado e a sua paciência." },
  7: { titulo: "Quem Estuda e Explica", oficio: "Você vai a fundo, entende o detalhe e explica de um jeito que todo mundo entende.", moeda: "Valorizam o seu conhecimento e a sua calma." },
  8: { titulo: "Quem Administra e Negocia", oficio: "Você enxerga os números, faz o dinheiro render e sabe fechar um bom combinado.", moeda: "Valorizam a sua cabeça boa para contas." },
  9: { titulo: "Quem Serve e Inspira", oficio: "Você ajuda sem esperar nada em troca, e a sua palavra dá força a quem está perto.", moeda: "Valorizam a sua generosidade." },
};

/** "Quem Cuida e Ensina" → "quem Cuida e Ensina", para usar no meio da frase. */
export const tituloNaFrase = (n: number) => SIGNIFICADOS[n].titulo.replace(/^Quem/, "quem");

export function colheita(n: number): { fase: "começar" | "semear" | "colher"; frase: string } {
  if (n <= 3) return { fase: "começar", frase: "Um bom ano para dar o primeiro passo." };
  if (n <= 6) return { fase: "semear", frase: "Um bom ano para mostrar o seu trabalho." };
  return { fase: "colher", frase: "Um bom ano para cobrar pelo que você já sabe." };
}

export const DIA: Record<number, string> = {
  1: "Bom para anunciar algo novo",
  2: "Bom para conversar com quem já te conhece",
  3: "Bom para divulgar e mostrar o seu trabalho",
  4: "Bom para organizar e preparar o material",
  5: "Bom para anunciar novidades",
  6: "Bom para cuidar de quem já comprou",
  7: "Bom para estudar e caprichar no conteúdo",
  8: "Bom para combinar preço e fechar",
  9: "Bom para terminar o que começou",
};
