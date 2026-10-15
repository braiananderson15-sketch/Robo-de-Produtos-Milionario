// ÚNICO arquivo que o revendedor precisa editar.
// Troque os valores entre aspas e publique de novo na Vercel.
export const marca = {
  nomeApp: "aula do braian", // nome que aparece no topo e na aba do navegador
  nomeVitrine: "Cofre do Nome", // nome que aparece na vitrine do anúncio (/vitrine)
  nomeDono: "Braian", // nome do dono da cópia (uso futuro)
  linkPagamento: "https://SEU-LINK-DE-PAGAMENTO", // link da plataforma de pagamento (Binyra, Kiwify, Hotmart...)
  precoTexto: "R$ 39,90", // só texto, aparece na vitrine
  parcelasTexto: "ou em até 3x no cartão",
  whatsappSuporte: "5511999999999", // só números, com 55 + DDD
  precoExemploMin: 9, // faixa que a IA usa para sugerir o preço de exemplo
  precoExemploMax: 47,
  limiteGeracoesPorDia: 5, // quantos produtos cada aparelho pode montar por dia (protege o custo da IA)
};

export const marcaDeExemplo = {
  link: marca.linkPagamento.includes("SEU-LINK"),
  whatsapp: marca.whatsappSuporte === "5511999999999",
};
