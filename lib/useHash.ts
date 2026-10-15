"use client";
import { useSyncExternalStore } from "react";
const assinar = (fn: () => void) => {
  window.addEventListener("hashchange", fn);
  return () => window.removeEventListener("hashchange", fn);
};
export function useHash() {
  return useSyncExternalStore(
    assinar,
    () => window.location.hash.slice(1),
    () => "",
  );
}
