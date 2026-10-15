// Numerologia pitagórica, calculada em código. A IA nunca calcula números.
export const VOGAIS = "AEIOU";
export function normalizar(texto: string) {
  return texto
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z]/g, "");
}
export const valorLetra = (letra: string) =>
  ((letra.charCodeAt(0) - 65) % 9) + 1;
export function reduzir(n: number) {
  const passos = [n];
  while (n > 9) {
    n = [...String(n)].reduce((s, c) => s + Number(c), 0);
    passos.push(n);
  }
  return { n, passos };
}
export type LetraCalculada = { original: string; valor: number };
export function letrasDoNome(nome: string): LetraCalculada[][] {
  return nome
    .trim()
    .split(/\s+/)
    .map((p) =>
      [...p]
        .filter((c) => normalizar(c))
        .map((c) => ({
          original: c.toUpperCase(),
          valor: valorLetra(normalizar(c)),
        })),
    )
    .filter((p) => p.length);
}
export type Numeros = {
  oficio: number;
  passosOficio: number[];
  moeda: number;
  anoColheita: number;
};
export const anoPessoal = (dia: number, mes: number, anoAtual: number) =>
  reduzir(dia + mes + anoAtual).n;
export const diaPessoal = (ano: number, data: Date) =>
  reduzir(ano + data.getMonth() + 1 + data.getDate()).n;
export function calcularNumeros(
  nome: string,
  dia: number,
  mes: number,
  hoje = new Date(),
): Numeros {
  const letras = [...normalizar(nome)];
  const oficio = reduzir(letras.reduce((s, c) => s + valorLetra(c), 0));
  const vogais = letras.filter((c) => VOGAIS.includes(c));
  return {
    oficio: oficio.n,
    passosOficio: oficio.passos,
    moeda: vogais.length
      ? reduzir(vogais.reduce((s, c) => s + valorLetra(c), 0)).n
      : oficio.n,
    anoColheita: anoPessoal(dia, mes, hoje.getFullYear()),
  };
}
export function proximosDias(ano: number, quantos = 7, hoje = new Date()) {
  return Array.from({ length: quantos }, (_, i) => {
    const data = new Date(hoje);
    data.setDate(data.getDate() + i);
    const n = diaPessoal(ano, data);
    return { data, n, bomParaAnunciar: [1, 3, 5, 8].includes(n) };
  });
}
export const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0];
export const nomeValido = (nome: string) => letrasDoNome(nome).length >= 2;
export function dataValida(
  dia: number,
  mes: number,
  ano: number,
  hoje = new Date(),
) {
  if (![dia, mes, ano].every((n) => Number.isInteger(n) && n > 0) || ano < 1900)
    return false;
  const d = new Date(ano, mes - 1, dia);
  return (
    d.getFullYear() === ano &&
    d.getMonth() === mes - 1 &&
    d.getDate() === dia &&
    d < hoje
  );
}
