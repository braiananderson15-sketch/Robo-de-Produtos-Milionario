"use client";
import { useDados } from "@/lib/armazenamento";
import { calcularNumeros, proximosDias } from "@/lib/numerologia/calculo";
import { colheita, DIA } from "@/lib/numerologia/significados";
import { Moldura } from "@/components/Moldura";
import { Vazio } from "@/components/Vazio";
export default function Agenda() {
  const { dados, pronto } = useDados();
  if (!pronto) return <div className="shell" />;
  const p = dados.perfil,
    numeros = p ? calcularNumeros(p.nome, p.dia, p.mes) : null;
  return (
    <Moldura>
      <section className="saudacao entrar">
        <h1 className="display">Agenda da Colheita</h1>
        <p className="lead">
          {numeros
            ? `Seu Ano de Colheita é ${numeros.anoColheita}: hora de ${colheita(numeros.anoColheita).fase}. Cada dia tem um número que mostra para o que ele é bom.`
            : "Cada dia tem um número pessoal. Ele aparece depois que você descobre o seu."}
        </p>
      </section>
      {!numeros ? (
        <Vazio
          titulo="A agenda abre com o seu número"
          texto="Digite o seu nome e a sua data de nascimento para ver os próximos dias."
        />
      ) : (
        <>
          <div className="lista-dias">
            {proximosDias(numeros.anoColheita).map(
              ({ data, n, bomParaAnunciar: bom }, i) => (
                <div
                  key={i}
                  className={"card linha-dia entrar " + (bom ? "bom-dia" : "")}
                >
                  <span className={"num-serif " + (bom ? "" : "cromo")}>
                    {n}
                  </span>
                  <p>
                    {DIA[n]}
                    <small>
                      {i === 0 ? "Hoje, " : ""}
                      {new Intl.DateTimeFormat("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      }).format(data)}
                    </small>
                  </p>
                  {bom && <span className="selo">Anunciar</span>}
                </div>
              ),
            )}
          </div>
          <p className="pequeno" style={{ marginTop: 14 }}>
            Qualquer dia serve. A agenda só te ajuda a escolher por onde
            começar.
          </p>
        </>
      )}
    </Moldura>
  );
}
