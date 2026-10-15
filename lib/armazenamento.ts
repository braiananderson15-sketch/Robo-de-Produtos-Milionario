"use client";
import { useMemo, useSyncExternalStore } from "react";
import type { Perfil, ProdutoSalvo, Respostas } from "./tipos";
const CHAVE_BASE = "cofre-do-nome:v1";
let donoDosDados: string | null = null;
export type Dados = {
  perfil: Perfil | null;
  talentos: string[];
  outro: string;
  respostas: Respostas | null;
  produtos: ProdutoSalvo[];
  contador: { data: string; n: number };
};
const VAZIO: Dados = {
  perfil: null,
  talentos: [],
  outro: "",
  respostas: null,
  produtos: [],
  contador: { data: "", n: 0 },
};
const mudou = () => window.dispatchEvent(new Event("cofre:mudou"));
export function definirDonoDosDados(id: string | null) {
  if (donoDosDados !== id) {
    donoDosDados = id;
    mudou();
  }
}
function bruto() {
  if (!donoDosDados) return null;
  try {
    return localStorage.getItem(CHAVE_BASE + ":" + donoDosDados);
  } catch {
    return null;
  }
}
function interpretar(texto: string | null | undefined): Dados {
  try {
    return texto ? { ...VAZIO, ...JSON.parse(texto) } : VAZIO;
  } catch {
    return VAZIO;
  }
}
export const lerDados = () => interpretar(bruto());
export function gravarDados(mudar: (d: Dados) => Dados) {
  if (!donoDosDados) return;
  try {
    localStorage.setItem(
      CHAVE_BASE + ":" + donoDosDados,
      JSON.stringify(mudar(lerDados())),
    );
  } catch {
    /* Segue sem salvar se o aparelho estiver cheio. */
  }
  mudou();
}
export function apagarTudo() {
  if (!donoDosDados) return;
  try {
    localStorage.removeItem(CHAVE_BASE + ":" + donoDosDados);
  } catch {}
  mudou();
}
function assinar(fn: () => void) {
  window.addEventListener("storage", fn);
  window.addEventListener("cofre:mudou", fn);
  return () => {
    window.removeEventListener("storage", fn);
    window.removeEventListener("cofre:mudou", fn);
  };
}
export function useDados() {
  const texto = useSyncExternalStore(assinar, bruto, () => undefined);
  return {
    dados: useMemo(() => interpretar(texto), [texto]),
    pronto: texto !== undefined,
  };
}
const hoje = () => new Date().toISOString().slice(0, 10);
export const geracoesHoje = (d: Dados) =>
  d.contador.data === hoje() ? d.contador.n : 0;
export const contarGeracao = (d: Dados): Dados => ({
  ...d,
  contador: { data: hoje(), n: geracoesHoje(d) + 1 },
});
