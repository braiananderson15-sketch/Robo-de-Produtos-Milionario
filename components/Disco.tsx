import type { Ref } from "react";

const MARCAS = Array.from({ length: 90 }, (_, i) => {
  const maior = i % 10 === 0;
  const a = (i * 4 * Math.PI) / 180;
  const r1 = 90;
  const r2 = maior ? 79 : 85;
  return { x1: 100 + r1 * Math.sin(a), y1: 100 - r1 * Math.cos(a), x2: 100 + r2 * Math.sin(a), y2: 100 - r2 * Math.cos(a), maior };
});
const NUMEROS = Array.from({ length: 9 }, (_, i) => {
  const a = (i * 40 * Math.PI) / 180;
  return { k: i + 1, x: 100 + 65 * Math.sin(a), y: 100 - 65 * Math.cos(a) };
});

/** Disco de cofre em metal escovado com os números de 1 a 9. O número sob o ponteiro lilás é a combinação. */
export function Disco({ tamanho = 216, aberto = false, girando = false, refGiro }: { tamanho?: number; aberto?: boolean; girando?: boolean; refGiro?: Ref<SVGGElement> }) {
  return (
    <div className={`disco ${aberto ? "aberto" : ""} ${girando ? "girando" : ""}`} style={{ ["--d" as string]: `${tamanho}px` }}>
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <g className="giro" ref={refGiro}>
          {MARCAS.map((m, i) => (
            <line key={i} x1={m.x1.toFixed(2)} y1={m.y1.toFixed(2)} x2={m.x2.toFixed(2)} y2={m.y2.toFixed(2)} strokeWidth={m.maior ? 1.6 : 0.7} />
          ))}
          {NUMEROS.map((n) => (
            <text key={n.k} x={n.x.toFixed(2)} y={n.y.toFixed(2)}>{n.k}</text>
          ))}
        </g>
        <path className="ponteiro" d="M100 14 L94.5 2 L105.5 2 Z" />
      </svg>
      <div className="miolo" />
    </div>
  );
}
