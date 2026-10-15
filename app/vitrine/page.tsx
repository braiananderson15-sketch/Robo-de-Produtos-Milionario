"use client";
import { useRef, useState } from "react";
import { Moldura } from "@/components/Moldura";
import { CofreAbrindo } from "@/components/CofreAbrindo";
import {
  IconeCadeado,
  IconeCheck,
  IconeEstrela,
  IconeSeta,
} from "@/components/Icones";
import { RodapeHonestidade } from "@/components/RodapeHonestidade";
import {
  calcularNumeros,
  nomeValido,
  dataValida,
  type Numeros,
} from "@/lib/numerologia/calculo";
import { tituloNaFrase } from "@/lib/numerologia/significados";
import { TALENTOS, combinaCom } from "@/lib/talentos";
import { AVISO_GOLPE, OFERTA_ITENS, RODAPE_SEGURANCA } from "@/lib/textos";
import { marca, marcaDeExemplo } from "@/config/marca";
import { semMovimento } from "@/lib/ui";
export default function Vitrine() {
  const [nome, setNome] = useState(""),
    [dia, setDia] = useState(""),
    [mes, setMes] = useState(""),
    [ano, setAno] = useState(""),
    [erro, setErro] = useState(""),
    [numeros, setNumeros] = useState<Numeros | null>(null),
    [oferta, setOferta] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revelar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeValido(nome)) {
      setErro("Coloque o nome completo, com sobrenome.");
      return;
    }
    if (!dataValida(+dia, +mes, +ano)) {
      setErro("Confira a data: dia, mês e ano em que você nasceu.");
      return;
    }
    setErro("");
    setNumeros(calcularNumeros(nome, +dia, +mes));
    window.scrollTo({ top: 0 });
  };
  function abrirOferta() {
    setOferta(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(
      () =>
        document
          .getElementById("oferta")
          ?.scrollIntoView({ behavior: semMovimento() ? "instant" : "smooth" }),
      50,
    );
  }
  return (
    <Moldura semAbas nomeMarca={marca.nomeVitrine}>
      {!numeros ? (
        <div className="vitrine-grade">
          <header className="vitrine-heroi entrar">
            <p className="kicker">Grátis, em 2 minutos</p>
            <h1 className="display lg">
              Existe um cofre no seu nome. E o que tem dentro não é bloqueio.
            </h1>
            <p className="lead">
              Digite o seu nome e a data de nascimento. O seu Número de Ofício
              mostra qual coisa que você já faz de graça para os outros tem mais
              chance de virar dinheiro.
            </p>
            <div className="como">
              <div>
                <b>1</b>
                <p>
                  <strong>Você digita o nome e a data.</strong> Acesso por
                  código, sem senha.
                </p>
              </div>
              <div>
                <b>2</b>
                <p>
                  <strong>O cofre abre letra por letra.</strong> Você vê a conta
                  acontecer na tela.
                </p>
              </div>
              <div>
                <b>3</b>
                <p>
                  <strong>Você descobre o seu número.</strong> E o que ele diz
                  sobre o que você faz bem.
                </p>
              </div>
            </div>
          </header>
          <form
            className="card-destaque entrar"
            style={{ padding: "26px 22px 22px" }}
            onSubmit={revelar}
          >
            <h2 className="display sm" style={{ marginBottom: 18 }}>
              Digite a combinação do seu cofre
            </h2>
            <div style={{ display: "grid", gap: 10 }}>
              <label className="campo">
                <span>Seu nome completo, como está na certidão</span>
                <input
                  autoComplete="name"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  maxLength={200}
                />
              </label>
              <div className="data">
                {[
                  ["Dia", dia, setDia, 2],
                  ["Mês", mes, setMes, 2],
                  ["Ano", ano, setAno, 4],
                ].map(([rotulo, valor, set, max]) => (
                  <label className="campo" key={String(rotulo)}>
                    <span>{String(rotulo)}</span>
                    <input
                      inputMode="numeric"
                      value={String(valor)}
                      maxLength={Number(max)}
                      onChange={(e) =>
                        (set as (v: string) => void)(
                          e.target.value.replace(/\D/g, ""),
                        )
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
            <p className="erro" aria-live="polite">
              {erro}
            </p>
            <button className="btn btn-acao">
              Revelar meu Número que Vende
              <IconeSeta />
            </button>
            <p className="aviso">
              <IconeCadeado />
              <span>{AVISO_GOLPE}</span>
            </p>
          </form>
        </div>
      ) : (
        <>
          <CofreAbrindo nome={nome} numeros={numeros}>
            {!oferta && (
              <button className="btn btn-acao" onClick={abrirOferta}>
                Ver o que tem no cofre inteiro
                <IconeSeta />
              </button>
            )}
          </CofreAbrindo>
          {oferta && (
            <section
              id="oferta"
              className="oferta-grade entrar"
              style={{ marginTop: 40, scrollMarginTop: 20 }}
            >
              <div className="coluna">
                <div className="recap">
                  <span className="numero-grande cromo">{numeros.oficio}</span>
                  <p>
                    <span>Seu Número de Ofício</span>o Número de{" "}
                    {tituloNaFrase(numeros.oficio)}
                  </p>
                </div>
                <p className="lead" style={{ marginBottom: 20 }}>
                  O seu Número de Ofício já está aqui. Falta abrir o cofre
                  inteiro: o nome do seu Primeiro Produto, o preço de exemplo e
                  o que dizer para a primeira pessoa.
                </p>
                <div className="chips">
                  {TALENTOS.filter((t) =>
                    combinaCom(t, numeros.oficio, numeros.moeda),
                  )
                    .slice(0, 3)
                    .map((t) => (
                      <span className="chip estrela" key={t.nome}>
                        <IconeEstrela />
                        {t.nome}
                      </span>
                    ))}
                  {TALENTOS.filter(
                    (t) => !combinaCom(t, numeros.oficio, numeros.moeda),
                  )
                    .slice(0, 7)
                    .map((t) => (
                      <span
                        className="chip borrado"
                        aria-hidden="true"
                        key={t.nome}
                      >
                        {t.nome}
                      </span>
                    ))}
                </div>
                <ul className="inclui">
                  {OFERTA_ITENS.map((item) => (
                    <li key={item}>
                      <IconeCheck />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="coluna">
                <div className="card-destaque oferta">
                  <span className="rot">Cofre completo</span>
                  <p className="valor cromo">{marca.precoTexto}</p>
                  <p className="parc">{marca.parcelasTexto}</p>
                  <a
                    className="btn btn-acao"
                    href={marca.linkPagamento}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir o meu cofre agora
                  </a>
                  <p className="aviso">
                    <IconeCadeado />
                    <span>{RODAPE_SEGURANCA}</span>
                  </p>
                  {process.env.NODE_ENV === "development" &&
                    marcaDeExemplo.link && (
                      <p className="dev-aviso">
                        Configure o linkPagamento em config/marca.ts.
                      </p>
                    )}
                </div>
                <p className="versus">
                  Calculadora grátis te dá um número e um parágrafo. Aqui o
                  número vira uma coisa que você manda hoje para alguém.
                </p>
              </div>
            </section>
          )}
        </>
      )}
      <RodapeHonestidade />
    </Moldura>
  );
}
