// Talentos do Espelho. Cada um tem os números com que combina e uma ideia de produto
// que o modelo sem IA usa quando a chave de API não está configurada.

export type Talento = {
  nome: string;
  numeros: number[];
  tema: string;
  produto: string;
  promessa: string;
};

export const TALENTOS: Talento[] = [
  { nome: "Bolo e doces", numeros: [6, 3], tema: "bolos e doces", produto: "Caderno dos Doces que Saem Primeiro", promessa: "As receitas que mais fazem sucesso, com medida, custo e ponto certo." },
  { nome: "Marmita e comida caseira", numeros: [6, 4], tema: "marmita caseira", produto: "Cardápio da Semana em Marmitas", promessa: "Uma semana de marmitas planejada, com lista de compras e porções." },
  { nome: "Unha", numeros: [3, 5], tema: "unhas", produto: "Unhas de Salão Feitas em Casa", promessa: "O passo a passo para fazer as unhas em casa sem borrar." },
  { nome: "Cabelo e trança", numeros: [3, 6], tema: "cabelo e tranças", produto: "Tranças Fáceis para o Dia a Dia", promessa: "Cinco tranças explicadas foto a foto, da mais simples à de festa." },
  { nome: "Maquiagem", numeros: [3, 5], tema: "maquiagem", produto: "Maquiagem Bonita em 10 Minutos", promessa: "Pele bonita e olhar marcado usando poucos produtos." },
  { nome: "Organizar casa e armário", numeros: [4, 6], tema: "organização da casa", produto: "Armário Organizado em Um Fim de Semana", promessa: "Um roteiro de dois dias para arrumar o armário e manter assim." },
  { nome: "Limpeza pesada", numeros: [4, 8], tema: "limpeza pesada", produto: "Checklist da Faxina Completa", promessa: "A ordem certa de limpar cada cômodo, com os produtos de cada etapa." },
  { nome: "Reforço escolar", numeros: [6, 7], tema: "reforço escolar", produto: "Tabuada sem Choro: Guia para Pais", promessa: "Jogos e rotinas curtas para a criança aprender a tabuada em casa." },
  { nome: "Crochê e tricô", numeros: [4, 2], tema: "crochê e tricô", produto: "Minhas Primeiras Peças de Crochê", promessa: "Três peças fáceis para começar, com gráfico e lista de material." },
  { nome: "Costura e conserto de roupa", numeros: [4, 6], tema: "costura e conserto", produto: "Consertos de Roupa que Você Faz em Casa", promessa: "Barra, botão e zíper resolvidos sem máquina complicada." },
  { nome: "Artesanato e lembrancinha", numeros: [3, 2], tema: "artesanato", produto: "Lembrancinhas que Encantam e Custam Pouco", promessa: "Seis modelos de lembrancinha com material barato." },
  { nome: "Oração e palavra de conforto", numeros: [9, 2], tema: "palavras de conforto", produto: "30 Manhãs de Palavras de Conforto", promessa: "Uma mensagem curta para começar cada dia do mês com o coração leve." },
  { nome: "Conselho de relacionamento", numeros: [2, 9], tema: "relacionamento", produto: "Conversas que Aproximam o Casal", promessa: "Perguntas e combinados simples para conversar sem brigar." },
  { nome: "Cuidar de criança", numeros: [6, 2], tema: "cuidado com crianças", produto: "Rotina Tranquila para Crianças Pequenas", promessa: "Horários, brincadeiras e combinados para dias mais calmos em casa." },
  { nome: "Cuidar de idoso", numeros: [6, 9], tema: "cuidado com idosos", produto: "Guia do Cuidador de Família", promessa: "Remédios, comida e rotina para cuidar bem de quem você ama." },
  { nome: "Planilha e contas da casa", numeros: [8, 4], tema: "contas da casa", produto: "Planilha da Casa em Ordem", promessa: "Uma planilha pronta para ver para onde vai o dinheiro do mês." },
  { nome: "Economizar no mercado", numeros: [8, 4], tema: "economia no mercado", produto: "Lista Esperta do Mercado", promessa: "Como montar a lista do mês e gastar menos sem cortar o que importa." },
  { nome: "Vender e negociar", numeros: [8, 1], tema: "vendas", produto: "Primeiras Vendas pelo WhatsApp", promessa: "Como oferecer o que você faz sem vergonha e sem parecer insistente." },
  { nome: "Decoração de festa", numeros: [3, 5], tema: "decoração de festa", produto: "Festa Linda com Pouco", promessa: "Mesa, painel e lembranças montados com orçamento curto." },
  { nome: "Plantas e horta", numeros: [7, 4], tema: "plantas e horta", produto: "Horta na Janela", promessa: "Temperos e hortaliças que crescem em vaso, mesmo em apartamento." },
  { nome: "Receitas fit e saudáveis", numeros: [5, 7], tema: "receitas saudáveis", produto: "Semana Leve: 21 Receitas Fit", promessa: "Café, almoço e jantar leves com ingredientes de mercado comum." },
  { nome: "Treino em casa", numeros: [5, 1], tema: "treino em casa", produto: "Treino de 20 Minutos na Sala", promessa: "Quatro semanas de exercícios sem aparelho, do começo ao corpo firme." },
  { nome: "Fazer currículo e documentos", numeros: [7, 8], tema: "currículos e documentos", produto: "Currículo que Chama para Entrevista", promessa: "Um modelo pronto e o que escrever em cada parte." },
  { nome: "Ensinar a usar o celular", numeros: [7, 5], tema: "uso do celular", produto: "Celular sem Medo para os Pais", promessa: "Passo a passo com imagens para usar WhatsApp, fotos e chamada de vídeo." },
  { nome: "Inglês ou outra língua", numeros: [7, 5], tema: "inglês", produto: "Inglês de Viagem em 50 Frases", promessa: "As frases que resolvem aeroporto, hotel e restaurante." },
  { nome: "Instrumento musical", numeros: [3, 7], tema: "música", produto: "Primeiros Acordes no Violão", promessa: "Seis acordes e três músicas para tocar no primeiro mês." },
  { nome: "Animais de estimação", numeros: [2, 6], tema: "cuidado com pets", produto: "Pet Feliz em Casa", promessa: "Rotina, comida e cuidados do dia a dia com cães e gatos." },
  { nome: "Montar roteiro de viagem barata", numeros: [5, 1], tema: "viagens baratas", produto: "Viagem Boa e Barata", promessa: "Como montar um roteiro de fim de semana gastando pouco." },
];

export const combinaCom = (t: Talento, oficio: number, moeda: number) =>
  t.numeros.includes(oficio) || t.numeros.includes(moeda);

export const talentoPorNome = (nome: string) => TALENTOS.find((t) => t.nome === nome);
