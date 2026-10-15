"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { marca } from "@/config/marca";
import {
  Emblema,
  IconeInicio,
  IconeCofre,
  IconeProdutos,
  IconeAgenda,
  IconeMapa,
  IconeCheck,
  IconeCadeado,
  IconeVoltar,
} from "./Icones";
import { BotaoSair } from "./BotaoSair";
const MENU = [
  ["/", "Início", IconeInicio],
  ["/numero-que-vende", "Número que Vende", IconeCofre],
  ["/produtos", "Meus Produtos", IconeProdutos],
  ["/agenda", "Agenda da Colheita", IconeAgenda],
  ["/mapa", "Meu Mapa", IconeMapa],
] as const;
const ABAS = ["Início", "Número", "Produtos", "Agenda"];
export function Moldura({
  children,
  voltar,
  semAbas = false,
  direita,
  nomeMarca = marca.nomeApp,
}: {
  children: ReactNode;
  voltar?: string | true;
  semAbas?: boolean;
  direita?: ReactNode;
  nomeMarca?: string;
}) {
  const caminho = usePathname(),
    router = useRouter();
  return (
    <>
      <div className={"app " + (semAbas ? "" : "com-lateral")}>
        {!semAbas && (
          <aside className="lateral" aria-label="Menu">
            <Link href="/" className="marca">
              <Emblema />
              <span>{marca.nomeApp}</span>
            </Link>
            {MENU.map(([href, rotulo, Icone]) => (
              <Link
                key={href}
                href={href}
                className="item"
                aria-current={caminho === href ? "page" : undefined}
              >
                <Icone size={20} />
                {rotulo}
              </Link>
            ))}
            <div className="rodape-lateral">
              <span>
                <IconeCheck size={14} />
                Acesso por código no e-mail
              </span>
              <span>
                <IconeCadeado size={13} />
                Tudo salvo neste aparelho
              </span>
            </div>
          </aside>
        )}
        <div className={"shell " + (semAbas ? "sem-abas" : "")}>
          <header className="topbar">
            {voltar === true ? (
              <button
                className="voltar"
                aria-label="Voltar"
                onClick={() => router.back()}
              >
                <IconeVoltar />
              </button>
            ) : voltar ? (
              <Link href={voltar} className="voltar" aria-label="Voltar">
                <IconeVoltar />
              </Link>
            ) : (
              <Link href="/" className="marca">
                <Emblema />
                <span>{nomeMarca}</span>
              </Link>
            )}
            <div className="topbar-direita">
              {direita}
              <BotaoSair />
            </div>
          </header>
          {children}
        </div>
      </div>
      {!semAbas && (
        <div className="tabbar">
          <nav aria-label="Navegação principal">
            {MENU.slice(0, 4).map(([href, , Icone], i) => (
              <Link
                key={href}
                href={href}
                className="tab"
                aria-current={caminho === href ? "page" : undefined}
              >
                <Icone />
                {ABAS[i]}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
