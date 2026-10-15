export type PedidoProduto = {
  primeiroNome: string;
  oficio: number;
  moeda: number;
  anoColheita: number;
  tituloOficio: string;
  significadoOficio: string;
  talentos: string[];
  outro?: string;
  publico?: string;
  tempo?: string;
  formato?: string;
  precoMin: number;
  precoMax: number;
};

export type Produto = {
  nomeProduto: string;
  promessa: string;
  topicos: string[];
  precoExemplo: number;
  mensagens: { status: string; grupo: string; privado: string };
};

export type ProdutoSalvo = Produto & {
  id: string;
  criadoEm: string;
  talentos: string[];
  origem: "ia" | "modelo";
};

export type Perfil = { nome: string; dia: number; mes: number; ano: number };

export type Respostas = { publico: string; tempo: string; formato: string };
