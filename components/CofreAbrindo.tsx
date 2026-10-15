"use client";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Disco } from "./Disco";
import { letrasDoNome, type Numeros } from "@/lib/numerologia/calculo";
import {
  SIGNIFICADOS,
  colheita,
  tituloNaFrase,
} from "@/lib/numerologia/significados";
import { semMovimento } from "@/lib/ui";
export function Soma({
  passos,
  on = true,
}: {
  passos: number[];
  on?: boolean;
}) {
  return (
    <p className={"soma " + (on ? "on" : "")}>
      Soma <b>{passos[0]}</b>
      {passos.slice(1).map((n, i) => (
        <Fragment key={i}>
          {" "}
          → {[...String(passos[i])].join(" + ")} ={" "}
          {i === passos.length - 2 ? <em>{n}</em> : <b>{n}</b>}
        </Fragment>
      ))}
    </p>
  );
}
export function LetrasDoNome({
  nome,
  visiveis = Infinity,
}: {
  nome: string;
  visiveis?: number;
}) {
  let indice = 0;
  return (
    <div className="letras" aria-label="Letras do nome e seus números">
      {letrasDoNome(nome).map((p, i) => (
        <span className="palavra" key={i}>
          {p.map((l, j) => (
            <span
              key={j}
              className={"letra " + (indice++ < visiveis ? "on" : "")}
            >
              <b>{l.original}</b>
              <i>{l.valor}</i>
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}
export function CofreAbrindo({
  nome,
  numeros,
  children,
}: {
  nome: string;
  numeros: Numeros;
  children: ReactNode;
}) {
  const [aberto, setAberto] = useState(false),
    [visiveis, setVisiveis] = useState(0),
    [somaOn, setSomaOn] = useState(false);
  const giro = useRef<SVGGElement>(null),
    timers = useRef<ReturnType<typeof setTimeout>[]>([]),
    rot = useRef(0);
  const { oficio, moeda, anoColheita } = numeros;
  const { fase, frase } = colheita(anoColheita);
  const limpar = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const terminar = () => {
    limpar();
    if (giro.current) {
      giro.current.style.transition = "none";
      giro.current.style.transform = `rotate(${-(oficio - 1) * 40}deg)`;
    }
    setVisiveis(Infinity);
    setSomaOn(true);
    setAberto(true);
  };
  useEffect(() => {
    function fim() {
      limpar();
      if (giro.current) {
        giro.current.style.transition = "none";
        giro.current.style.transform = `rotate(${-(oficio - 1) * 40}deg)`;
      }
      setVisiveis(Infinity);
      setSomaOn(true);
      setAberto(true);
    }
    const agendar = (fn: () => void, t: number) =>
      timers.current.push(setTimeout(fn, t));
    const girar = (k: number, sentido: number, voltas: number) => {
      const alvo = -(k - 1) * 40;
      let dif = (((alvo - rot.current) % 360) + 360) % 360;
      if (sentido === -1) dif = dif === 0 ? 0 : dif - 360;
      rot.current += dif + sentido * 360 * voltas;
      if (giro.current)
        giro.current.style.transform = `rotate(${rot.current}deg)`;
    };
    if (semMovimento()) {
      agendar(fim, 0);
      return limpar;
    }
    const total = letrasDoNome(nome).flat().length,
      fimLetras = 300 + total * 80 + 150;
    for (let i = 0; i < total; i++)
      agendar(() => setVisiveis(i + 1), 300 + i * 80);
    agendar(() => setSomaOn(true), fimLetras);
    agendar(() => girar(moeda, 1, 1), fimLetras + 250);
    agendar(() => girar(anoColheita, -1, 1), fimLetras + 1300);
    agendar(() => girar(oficio, 1, 0), fimLetras + 2350);
    agendar(fim, fimLetras + 3350);
    return limpar;
  }, [nome, oficio, moeda, anoColheita]);
  return (
    <div className="abertura" onClick={() => !aberto && terminar()}>
      <Disco aberto={aberto} refGiro={giro} />
      <LetrasDoNome nome={nome} visiveis={visiveis} />
      <Soma passos={numeros.passosOficio} on={somaOn} />
      {!aberto && <p className="pular">Toque para pular</p>}
      <section
        className={"revelacao " + (aberto ? "on" : "")}
        aria-live="polite"
        aria-hidden={!aberto}
      >
        <p className="kicker">Seu Número de Ofício é</p>
        <p className="numero-grande cromo">{oficio}</p>
        <h2 className="titulo-oficio">o Número de {tituloNaFrase(oficio)}</h2>
        <p className="texto-oficio">{SIGNIFICADOS[oficio].oficio}</p>
        <div className="par">
          <div className="mini">
            <span>Número da Moeda</span>
            <strong className="cromo">{moeda}</strong>
            <p>{SIGNIFICADOS[moeda].moeda}</p>
          </div>
          <div className="mini">
            <span>Ano de Colheita</span>
            <strong className="cromo">{anoColheita}</strong>
            <p>
              Hora de {fase}. {frase}
            </p>
          </div>
        </div>
        {aberto && children}
      </section>
    </div>
  );
}
