"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDados, apagarTudo } from "@/lib/armazenamento";
import { calcularNumeros } from "@/lib/numerologia/calculo";
import { SIGNIFICADOS, colheita } from "@/lib/numerologia/significados";
import { Moldura } from "@/components/Moldura";
import { Vazio } from "@/components/Vazio";
import { LetrasDoNome, Soma } from "@/components/CofreAbrindo";
export default function Mapa() {
  const { dados, pronto } = useDados(),
    [confirmar, setConfirmar] = useState(false),
    router = useRouter();
  if (!pronto) return <div className="shell" />;
  const p = dados.perfil,
    n = p ? calcularNumeros(p.nome, p.dia, p.mes) : null,
    c = n ? colheita(n.anoColheita) : null;
  return (
    <Moldura voltar="/">
      <section className="saudacao entrar">
        <h1 className="display">Meu Mapa</h1>
        <p className="lead">
          Os seus três números, calculados letra por letra a partir do seu nome
          e da sua data.
        </p>
      </section>
      {!n || !p || !c ? (
        <Vazio
          titulo="O mapa abre com o seu número"
          texto="Digite o seu nome e a sua data de nascimento para ver os seus números."
        />
      ) : (
        <>
          <div className="mapa-cards">
            {[
              [
                n.oficio,
                "Número de Ofício",
                SIGNIFICADOS[n.oficio].titulo,
                SIGNIFICADOS[n.oficio].oficio,
              ],
              [
                n.moeda,
                "Número da Moeda",
                "O dom que já valorizam em você",
                SIGNIFICADOS[n.moeda].moeda +
                  " Vem da soma das vogais do seu nome.",
              ],
              [
                n.anoColheita,
                "Ano de Colheita",
                `Hora de ${c.fase}`,
                c.frase +
                  " Vem do seu dia e mês de nascimento com o ano atual.",
              ],
            ].map(([num, titulo, t, d], i) => (
              <div
                key={String(titulo)}
                className={
                  "mapa-num entrar " + (i === 0 ? "card-destaque" : "card")
                }
              >
                <span className="num-serif cromo">{num}</span>
                <div>
                  <h3>{titulo}</h3>
                  <p className="t">{t}</p>
                  <p className="d">{d}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="ornamento">Como chegamos no {n.oficio}</p>
          <div className="abertura">
            <LetrasDoNome nome={p.nome} />
            <Soma passos={n.passosOficio} />
          </div>
          <p className="pequeno" style={{ textAlign: "center", marginTop: 12 }}>
            Tabela pitagórica: cada letra vale de 1 a 9. Somamos tudo e
            reduzimos até sobrar um número só.
          </p>
          <div style={{ marginTop: 30, maxWidth: 420 }}>
            {!confirmar ? (
              <button
                className="btn btn-calmo"
                onClick={() => setConfirmar(true)}
              >
                Começar com outro nome
              </button>
            ) : (
              <div className="confirmar">
                <p>
                  Apagar o seu nome, a data e os produtos salvos neste celular?
                </p>
                <div>
                  <button
                    className="btn btn-contorno btn-sm"
                    onClick={() => setConfirmar(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-acao btn-sm"
                    onClick={() => {
                      apagarTudo();
                      router.push("/numero-que-vende");
                    }}
                  >
                    Apagar
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Moldura>
  );
}
