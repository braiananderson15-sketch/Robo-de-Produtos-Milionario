import { proximosDias } from "@/lib/numerologia/calculo";
const SEM = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
export function AgendaSemana({ ano }: { ano: number }) {
  return (
    <>
      <div className="agenda">
        {proximosDias(ano).map(({ data, n, bomParaAnunciar: bom }, i) => (
          <div
            key={i}
            className={
              "dia " + (i === 0 ? "hoje-dia" : "") + " " + (bom ? "bom" : "")
            }
            aria-label={
              (i === 0 ? "hoje, " : "") +
              `${SEM[data.getDay()]} ${data.getDate()}, dia ${n}` +
              (bom ? ", bom para anunciar" : "")
            }
          >
            <span className="sem">{i === 0 ? "hoje" : SEM[data.getDay()]}</span>
            <span className="dt">{data.getDate()}</span>
            <span className="pn">{n}</span>
            <span className="ponto" />
          </div>
        ))}
      </div>
      <p className="legenda">
        <i />
        bom para anunciar
      </p>
      <p className="pequeno">
        Qualquer dia serve. A agenda só te ajuda a escolher por onde começar.
      </p>
    </>
  );
}
