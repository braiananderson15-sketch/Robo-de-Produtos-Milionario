import { describe, it, expect } from "vitest";
import {
  normalizar,
  valorLetra,
  reduzir,
  calcularNumeros,
  anoPessoal,
  diaPessoal,
  nomeValido,
  dataValida,
} from "./calculo";
describe("Numerologia em código", () => {
  it("normaliza nome com acentos", () =>
    expect(normalizar("João Conceição d'Ávila-2")).toBe("JOAOCONCEICAODAVILA"));
  it("mapeia as 26 letras", () =>
    expect([..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map(valorLetra)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7,
      8,
    ]));
  it("reduz sem números-mestre", () => {
    expect(reduzir(47)).toEqual({ n: 2, passos: [47, 11, 2] });
    expect(reduzir(7)).toEqual({ n: 7, passos: [7] });
  });
  it("calcula Ana Silva", () =>
    expect(
      calcularNumeros("Ana Silva", 14, 3, new Date(2026, 9, 7)),
    ).toMatchObject({ oficio: 7, passosOficio: [25, 7], moeda: 3 }));
  it("Y é consoante, sem vogais usa Ofício", () =>
    expect(
      calcularNumeros("Brynn Thz", 1, 1, new Date(2026, 0, 2)),
    ).toMatchObject({ oficio: 1, moeda: 1 }));
  it("ano pessoal", () => expect(anoPessoal(14, 3, 2026)).toBe(9));
  it("dia pessoal", () => expect(diaPessoal(9, new Date(2026, 9, 7))).toBe(8));
  it("exige sobrenome", () => {
    expect(nomeValido("Maria")).toBe(false);
    expect(nomeValido("Maria Silva")).toBe(true);
  });
  it("valida datas reais e passadas", () => {
    const hoje = new Date(2026, 9, 7);
    expect(dataValida(31, 2, 1980, hoje)).toBe(false);
    expect(dataValida(14, 3, 1972, hoje)).toBe(true);
    expect(dataValida(1, 1, 2030, hoje)).toBe(false);
  });
});
