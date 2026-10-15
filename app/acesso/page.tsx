"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { marca, marcaDeExemplo } from "@/config/marca";
import { Moldura } from "@/components/Moldura";
export default function Acesso() {
  const acesso = useQuery(api.acesso.atual),
    router = useRouter();
  useEffect(() => {
    if (acesso?.ativo) {
      router.replace("/");
      router.refresh();
    }
  }, [acesso, router]);
  return (
    <Moldura semAbas>
      <main className="auth-card">
        <p className="kicker">Seu acesso</p>
        <h1 className="display">Sua compra ainda não está ativa.</h1>
        <p className="lead">
          Você entrou na sua conta. Para abrir as ferramentas, precisamos
          confirmar uma compra ativa no mesmo e-mail.
        </p>
        <p>
          Se já comprou, confira o e-mail usado no pagamento. Você também pode
          sair e entrar com outro e-mail.
        </p>
        <div className="auth-form">
          {!marcaDeExemplo.link && (
            <a
              className="btn btn-acao"
              href={marca.linkPagamento}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver acesso · {marca.precoTexto}
            </a>
          )}
          <button className="btn btn-contorno" onClick={() => router.refresh()}>
            Conferir novamente
          </button>
          <Link href="/vitrine" className="btn btn-contorno">
            Ver a vitrine
          </Link>
        </div>
      </main>
    </Moldura>
  );
}
