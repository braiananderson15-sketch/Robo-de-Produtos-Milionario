"use client";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  useDados,
  lerDados,
  gravarDados,
  geracoesHoje,
  contarGeracao,
  type Dados,
} from "@/lib/armazenamento";
import { useHash } from "@/lib/useHash";
import {
  calcularNumeros,
  nomeValido,
  dataValida,
  primeiroNome,
} from "@/lib/numerologia/calculo";
import { SIGNIFICADOS } from "@/lib/numerologia/significados";
import { TALENTOS, combinaCom } from "@/lib/talentos";
import {
  PUBLICOS,
  TEMPOS,
  FORMATOS,
  AVISO_GOLPE,
  LIMITE_ATINGIDO,
} from "@/lib/textos";
import { montarProdutoModelo, ajustarLimites } from "@/lib/produtoModelo";
import type { PedidoProduto, Produto } from "@/lib/tipos";
import { marca } from "@/config/marca";
import { Disco } from "@/components/Disco";
import { CofreAbrindo } from "@/components/CofreAbrindo";
import {
  IconeVoltar,
  IconeCadeado,
  IconeEstrela,
  IconeCheck,
} from "@/components/Icones";
const ETAPAS = [
  "Seu nome",
  "Sua data",
  "Seu número",
  "Seus talentos",
  "Seu jeito",
];
export default function Pagina() {
  const { dados, pronto } = useDados(),
    hash = useHash();
  return pronto ? (
    <Fluxo inicial={dados} hash={hash} />
  ) : (
    <div className="shell sem-abas" />
  );
}
function Fluxo({ inicial, hash }: { inicial: Dados; hash: string }) {
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);
  const router = useRouter();
  const [etapa, setEtapa] = useState(
      inicial.perfil && hash === "talentos" ? 3 : 0,
    ),
    [nome, setNome] = useState(inicial.perfil?.nome ?? ""),
    [dia, setDia] = useState(
      inicial.perfil ? String(inicial.perfil.dia).padStart(2, "0") : "",
    ),
    [mes, setMes] = useState(
      inicial.perfil ? String(inicial.perfil.mes).padStart(2, "0") : "",
    ),
    [ano, setAno] = useState(inicial.perfil ? String(inicial.perfil.ano) : ""),
    [talentos, setTalentos] = useState(inicial.talentos),
    [outro, setOutro] = useState(inicial.outro),
    [publico, setPublico] = useState(inicial.respostas?.publico ?? ""),
    [tempo, setTempo] = useState(inicial.respostas?.tempo ?? ""),
    [formato, setFormato] = useState(
      inicial.respostas?.formato ?? "Deixa o app escolher",
    ),
    [erro, setErro] = useState(""),
    [gerando, setGerando] = useState(false);
  const numeros = calcularNumeros(nome, +dia || 1, +mes || 1);
  const avancar = () => {
    setErro("");
    setEtapa((e) => e + 1);
    window.scrollTo(0, 0);
  };
  const voltar = () => {
    setErro("");
    if (etapa === 0) router.push("/");
    else setEtapa(etapa === 3 ? 1 : etapa - 1);
  };
  function validarNome(e: FormEvent) {
    e.preventDefault();
    if (!nomeValido(nome)) {
      setErro("Coloque o nome completo, com sobrenome.");
      return;
    }
    avancar();
  }
  function validarData(e: FormEvent) {
    e.preventDefault();
    if (!dataValida(+dia, +mes, +ano)) {
      setErro("Confira a data: dia, mês e ano em que você nasceu.");
      return;
    }
    gravarDados((d) => ({
      ...d,
      perfil: { nome: nome.trim(), dia: +dia, mes: +mes, ano: +ano },
    }));
    avancar();
  }
  async function montar() {
    if (gerando) return;
    if (geracoesHoje(lerDados()) >= marca.limiteGeracoesPorDia) {
      setErro(LIMITE_ATINGIDO);
      return;
    }
    setGerando(true);
    setErro("");
    gravarDados((d) => ({
      ...d,
      talentos,
      outro,
      respostas: { publico, tempo, formato },
    }));
    const pedido: PedidoProduto = {
      primeiroNome: primeiroNome(nome).slice(0, 60),
      ...numeros,
      tituloOficio: SIGNIFICADOS[numeros.oficio].titulo,
      significadoOficio: SIGNIFICADOS[numeros.oficio].oficio,
      talentos,
      outro: outro.trim() || undefined,
      publico: publico || undefined,
      tempo: tempo || undefined,
      formato: formato || undefined,
      precoMin: marca.precoExemploMin,
      precoMax: marca.precoExemploMax,
    };
    const inicio = Date.now();
    let produto: Produto,
      origem: "ia" | "modelo" = "modelo";
    try {
      const resposta = await fetch("/api/produto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
        signal: AbortSignal.timeout(60000),
      });
      if (resposta.status === 401 || resposta.status === 403) {
        router.replace(resposta.status === 401 ? "/entrar" : "/acesso");
        setGerando(false);
        return;
      }
      if (!resposta.ok) throw new Error("falha");
      const resultado = await resposta.json();
      produto = ajustarLimites(
        resultado.produto,
        pedido.precoMin,
        pedido.precoMax,
      );
      origem = resultado.origem;
    } catch {
      produto = ajustarLimites(
        montarProdutoModelo(pedido),
        pedido.precoMin,
        pedido.precoMax,
      );
    }
    await new Promise((r) =>
      setTimeout(r, Math.max(0, 1800 - (Date.now() - inicio))),
    );
    if (!montado.current) return;
    const id = crypto.randomUUID().slice(0, 8);
    gravarDados((d) =>
      contarGeracao({
        ...d,
        produtos: [
          {
            ...produto,
            id,
            criadoEm: new Date().toISOString(),
            talentos,
            origem,
          },
          ...d.produtos,
        ].slice(0, 20),
      }),
    );
    router.push(`/resultado#${id}`);
  }
  const aviso = (
    <p className="aviso">
      <IconeCadeado />
      <span>{AVISO_GOLPE}</span>
    </p>
  );
  const opcoes = (
    titulo: string,
    lista: string[],
    valor: string,
    set: (v: string) => void,
  ) => (
    <>
      <p className="pergunta">{titulo}</p>
      <div className="opcoes" role="group" aria-label={titulo}>
        {lista.map((o) => (
          <button
            key={o}
            className="opcao"
            aria-pressed={valor === o}
            onClick={() => set(valor === o ? "" : o)}
          >
            {o}
            <i />
          </button>
        ))}
      </div>
    </>
  );
  return (
    <div className="shell sem-abas">
      <header className="topbar">
        <button className="voltar" aria-label="Voltar" onClick={voltar}>
          <IconeVoltar />
        </button>
        <span className="passo-label">
          Passo <b>{etapa + 1}</b> de 5
        </span>
      </header>
      <div className="progresso" aria-hidden="true">
        {ETAPAS.map((_, i) => (
          <span key={i} className={i <= etapa ? "on" : ""} />
        ))}
      </div>
      <div className={"fluxo-grade " + (etapa === 2 ? "sem-lado" : "")}>
        <div className="coluna">
          {etapa === 0 && (
            <form className="entrar" onSubmit={validarNome}>
              <p className="kicker">Número que Vende</p>
              <h1 className="display">Qual é o seu nome completo?</h1>
              <p className="lead">
                Escreva como está na certidão. Cada letra vira um número.
              </p>
              <label className="campo grande" style={{ marginTop: 26 }}>
                <span>Nome completo</span>
                <input
                  autoFocus
                  autoComplete="name"
                  placeholder="Maria Aparecida da Silva"
                  maxLength={200}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </label>
              <p className="erro" aria-live="polite">
                {erro}
              </p>
              {aviso}
              <div className="doca">
                <button className="btn btn-acao" type="submit">
                  Continuar
                </button>
              </div>
            </form>
          )}
          {etapa === 1 && (
            <form className="entrar" onSubmit={validarData}>
              <p className="kicker">Número que Vende</p>
              <h1 className="display">Quando você nasceu?</h1>
              <p className="lead">
                A data mostra o seu momento: começar, semear ou colher.
              </p>
              <div className="data" style={{ marginTop: 26 }}>
                {[
                  ["Dia", dia, setDia, 2, "14"],
                  ["Mês", mes, setMes, 2, "03"],
                  ["Ano", ano, setAno, 4, "1972"],
                ].map(([r, v, s, max, placeholder]) => (
                  <label className="campo" key={String(r)}>
                    <span>{String(r)}</span>
                    <input
                      inputMode="numeric"
                      maxLength={Number(max)}
                      placeholder={String(placeholder)}
                      value={String(v)}
                      onChange={(e) =>
                        (s as (v: string) => void)(
                          e.target.value.replace(/\D/g, ""),
                        )
                      }
                    />
                  </label>
                ))}
              </div>
              <p className="erro" aria-live="polite">
                {erro}
              </p>
              {aviso}
              <div className="doca">
                <button className="btn btn-acao">
                  Revelar meu Número que Vende
                </button>
              </div>
            </form>
          )}
          {etapa === 2 && (
            <CofreAbrindo key={nome + dia + mes} nome={nome} numeros={numeros}>
              <button className="btn btn-acao" onClick={avancar}>
                Ver o que combina com o meu número
              </button>
            </CofreAbrindo>
          )}
          {etapa === 3 && (
            <div className="entrar">
              <p className="kicker">O Espelho do Talento</p>
              <h1 className="display">O que você já sabe fazer?</h1>
              <p className="lead">
                Toque no que te pedem sempre. Pode marcar até 3.
              </p>
              {[true, false].map((recomendado) => (
                <section key={String(recomendado)}>
                  <p className="ornamento">
                    {recomendado ? (
                      <>
                        <IconeEstrela /> Combina com o seu número{" "}
                        {numeros.oficio}
                        {numeros.oficio !== numeros.moeda
                          ? ` e ${numeros.moeda}`
                          : ""}
                      </>
                    ) : (
                      "Outros talentos"
                    )}
                  </p>
                  <div className="chips">
                    {TALENTOS.filter(
                      (t) =>
                        combinaCom(t, numeros.oficio, numeros.moeda) ===
                        recomendado,
                    ).map((t) => {
                      const marcado = talentos.includes(t.nome);
                      return (
                        <button
                          className={"chip " + (recomendado ? "estrela" : "")}
                          key={t.nome}
                          aria-pressed={marcado}
                          disabled={!marcado && talentos.length >= 3}
                          onClick={() =>
                            setTalentos(
                              marcado
                                ? talentos.filter((n) => n !== t.nome)
                                : [...talentos, t.nome],
                            )
                          }
                        >
                          {marcado ? (
                            <IconeCheck size={14} />
                          ) : recomendado ? (
                            <IconeEstrela />
                          ) : null}
                          {t.nome}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
              <label className="campo" style={{ marginTop: 24 }}>
                <span>Faz outra coisa que te pedem sempre? Escreva aqui</span>
                <input
                  maxLength={60}
                  placeholder="Opcional"
                  value={outro}
                  onChange={(e) => setOutro(e.target.value)}
                />
              </label>
              <div className="doca">
                <p className="contagem">
                  <b>{talentos.length}</b> de 3 marcados
                </p>
                <button
                  className="btn btn-acao"
                  disabled={!talentos.length}
                  onClick={avancar}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}
          {etapa === 4 && (
            <div className="entrar">
              <p className="kicker">Quase lá</p>
              <h1 className="display">Conte um pouco do seu jeito</h1>
              <p className="lead">
                Isso ajuda a montar um produto que cabe na sua rotina. Pode
                pular o que quiser.
              </p>
              {opcoes(
                "Para quem você mais faz isso hoje?",
                PUBLICOS,
                publico,
                setPublico,
              )}
              {opcoes(
                "Quanto tempo você tem para isso?",
                TEMPOS,
                tempo,
                setTempo,
              )}
              {opcoes("Como prefere entregar?", FORMATOS, formato, setFormato)}
              <p className="erro" role="alert">
                {erro}
              </p>
              <div className="doca">
                <button
                  className="btn btn-acao"
                  disabled={gerando}
                  onClick={montar}
                >
                  Montar meu produto
                </button>
              </div>
            </div>
          )}
        </div>
        <aside className="fluxo-lado" aria-hidden="true">
          <Disco tamanho={240} />
          <ol>
            {ETAPAS.map((t, i) => (
              <li
                key={t}
                className={i < etapa ? "feito" : i === etapa ? "atual" : ""}
              >
                <b>{i < etapa ? "✓" : i + 1}</b>
                {t}
              </li>
            ))}
          </ol>
          <p>{AVISO_GOLPE}</p>
        </aside>
      </div>
      {gerando && (
        <div className="sobreposicao" role="status">
          <Disco tamanho={132} girando />
          <p>Abrindo o seu cofre…</p>
        </div>
      )}
    </div>
  );
}
