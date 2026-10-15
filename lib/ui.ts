"use client";
export function avisar(msg: string) {
  window.dispatchEvent(new CustomEvent("cofre:aviso", { detail: msg }));
}
export async function copiar(texto: string) {
  try {
    await navigator.clipboard.writeText(texto);
    avisar("Copiado!");
  } catch {
    avisar("Não deu para copiar. Segure no texto e copie.");
  }
}
export const linkWhatsApp = (texto: string) =>
  "https://wa.me/?text=" + encodeURIComponent(texto);
export const semMovimento = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
