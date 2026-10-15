"use client";
import { useEffect, useState } from "react";
export function Aviso() {
  const [texto, setTexto] = useState("");
  const [on, setOn] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const ouvir = (e: Event) => {
      setTexto(String((e as CustomEvent).detail));
      setOn(true);
      clearTimeout(timer);
      timer = setTimeout(() => setOn(false), 1900);
    };
    window.addEventListener("cofre:aviso", ouvir);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("cofre:aviso", ouvir);
    };
  }, []);
  return (
    <div
      className={"toast " + (on ? "on" : "")}
      role="status"
      aria-live="polite"
    >
      {texto}
    </div>
  );
}
