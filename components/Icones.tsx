import { useId } from "react";

type P = { size?: number };
const base = (size = 22) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });

export const IconeInicio = ({ size }: P) => (<svg {...base(size)}><path d="M3.5 10.5 12 4l8.5 6.5V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z" /></svg>);
export const IconeCofre = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2" /></svg>);
export const IconeProdutos = ({ size }: P) => (<svg {...base(size)}><path d="M6 3.5h9l3.5 3.5v13.5H6z" /><path d="M14.5 3.5V7.5H18.5M9 12h6M9 15.5h6" /></svg>);
export const IconeAgenda = ({ size }: P) => (<svg {...base(size)}><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /><circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none" /></svg>);
export const IconeMapa = ({ size }: P) => (<svg {...base(size)}><path d="M12 3.5 14.5 9l5.9.6-4.4 4 1.3 5.9L12 16.5l-5.3 3 1.3-5.9-4.4-4L9.5 9z" /></svg>);
export const IconeMensagem = ({ size }: P) => (<svg {...base(size)}><path d="M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1-4.4A8.5 8.5 0 1 1 20.5 12z" /></svg>);
export const IconeVoltar = ({ size }: P) => (<svg {...base(size)}><path d="M15 5l-7 7 7 7" /></svg>);
export const IconeSeta = ({ size = 18 }: P) => (<svg {...base(size)}><path d="M9 5l7 7-7 7" /></svg>);

export const IconeCadeado = ({ size = 14 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.3" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
);
export const IconeCheck = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const IconeEstrela = ({ size = 12 }: P) => (
  <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true"><path fill="currentColor" d="M6 .7l1.55 3.3 3.6.42-2.68 2.46.72 3.56L6 8.66 2.81 10.44l.72-3.56L.85 4.42l3.6-.42z" /></svg>
);

/** Emblema da marca: um disco de cofre em cromo, com ponteiro lilás. */
export function Emblema({ size = 28 }: P) {
  const id = useId().replace(/:/g, "");
  const marcas = Array.from({ length: 24 }, (_, i) => {
    const a = (i * 15 * Math.PI) / 180;
    const r2 = i % 6 === 0 ? 11.2 : 12.4;
    return <line key={i} x1={16 + 14 * Math.sin(a)} y1={16 - 14 * Math.cos(a)} x2={16 + r2 * Math.sin(a)} y2={16 - r2 * Math.cos(a)} />;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" /><stop offset=".5" stopColor="#d6e2e8" /><stop offset="1" stopColor="#7f93a6" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="none" stroke={`url(#${id})`} strokeWidth="1.2" />
      <g stroke={`url(#${id})`} strokeWidth="1">{marcas}</g>
      <circle cx="16" cy="16" r="5.2" fill={`url(#${id})`} />
      <path d="M16 1.6l1.6 2.6h-3.2z" fill="#a497f5" />
    </svg>
  );
}
