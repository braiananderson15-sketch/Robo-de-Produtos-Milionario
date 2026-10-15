"use client";
import { useState, type ReactNode } from "react";
import type { ProdutoSalvo } from "@/lib/tipos";
import { copiar, linkWhatsApp } from "@/lib/ui";
import { formatarPreco } from "@/lib/produtoModelo";
import { Preco } from "./Preco";
import { AgendaSemana } from "./AgendaSemana";
export function ProdutoView({
  produto,
  anoColheita,
  children,
}: {
  produto: ProdutoSalvo;
  anoColheita: number | null;
  children?: ReactNode;
}) {
  const [aba, setAba] = useState<"status" | "grupo" | "privado">("status");
  return (
    <div className="resultado-grade">
      <div className="coluna">
        <article className="card-destaque produto entrar">
          <h1>{produto.nomeProduto}</h1>
          <p className="promessa">{produto.promessa}</p>
          <div className="sec-titulo">
            <h2>O que vai no seu mini-guia</h2>
            <button
              onClick={() =>
                copiar(
                  produto.topicos.map((t, i) => `${i + 1}. ${t}`).join("\n"),
                )
              }
            >
              Copiar tópicos
            </button>
          </div>
          <ol className="topicos">
            {produto.topicos.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
          <div className="preco">
            <span>Preço de exemplo</span>
            <strong className="cromo">
              <Preco texto={formatarPreco(produto.precoExemplo)} />
            </strong>
          </div>
          <p className="preco-nota">valor sugerido, não é garantia de venda</p>
        </article>
      </div>
      <div className="coluna coluna-lado">
        <section>
          <div className="sec-titulo">
            <h2>Mensagens prontas</h2>
          </div>
          <div className="abas" role="group" aria-label="Tipo de mensagem">
            {(["status", "grupo", "privado"] as const).map((a) => (
              <button
                key={a}
                aria-pressed={aba === a}
                onClick={() => setAba(a)}
              >
                {a[0].toUpperCase() + a.slice(1)}
              </button>
            ))}
          </div>
          <p className="balao">{produto.mensagens[aba]}</p>
          <div className="acoes-msg">
            <a
              className="btn btn-acao"
              href={linkWhatsApp(produto.mensagens[aba])}
              target="_blank"
              rel="noopener noreferrer"
            >
              Mandar no WhatsApp
            </a>
            <button
              className="btn btn-contorno"
              style={{ width: "auto" }}
              onClick={() => copiar(produto.mensagens[aba])}
            >
              Copiar
            </button>
          </div>
          <p className="pequeno">
            O botão só abre o WhatsApp. Você escolhe a pessoa ou o grupo e
            envia.
          </p>
        </section>
        {anoColheita !== null && (
          <section>
            <div className="sec-titulo">
              <h2>Agenda da Colheita</h2>
            </div>
            <AgendaSemana ano={anoColheita} />
          </section>
        )}
        {children}
      </div>
    </div>
  );
}
