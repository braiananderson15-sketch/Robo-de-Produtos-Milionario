import Link from "next/link";
import { Disco } from "./Disco";
export function Vazio({
  titulo,
  texto,
  acao = "Descobrir o meu número",
  href = "/numero-que-vende",
}: {
  titulo: string;
  texto: string;
  acao?: string;
  href?: string;
}) {
  return (
    <section className="card-destaque vazio entrar">
      <Disco tamanho={96} />
      <h2>{titulo}</h2>
      <p>{texto}</p>
      <Link href={href} className="btn btn-acao">
        {acao}
      </Link>
    </section>
  );
}
