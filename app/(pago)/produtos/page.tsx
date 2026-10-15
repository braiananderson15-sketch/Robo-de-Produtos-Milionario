"use client";
import Link from "next/link";
import { useDados } from "@/lib/armazenamento";
import { formatarPreco } from "@/lib/produtoModelo";
import { Moldura } from "@/components/Moldura";
import { Vazio } from "@/components/Vazio";
import { Preco } from "@/components/Preco";
import { IconeSeta } from "@/components/Icones";
export default function Produtos() {
  const { dados, pronto } = useDados();
  if (!pronto) return <div className="shell" />;
  return (
    <Moldura>
      <section className="saudacao entrar">
        <h1 className="display">Meus Produtos</h1>
        <p className="lead">
          Tudo fica salvo neste celular. Abra um produto para copiar as
          mensagens.
        </p>
      </section>
      {!dados.produtos.length ? (
        <Vazio
          titulo="Nenhum produto ainda"
          texto="Monte o seu primeiro produto. Leva uns 2 minutos."
        />
      ) : (
        <>
          <div className="lista-produtos">
            {dados.produtos.map((p, i) => (
              <Link
                key={p.id}
                href={`/resultado#${p.id}`}
                className={
                  "ultimo entrar " + (i === 0 ? "card-destaque" : "card")
                }
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3>{p.nomeProduto}</h3>
                  <small>{p.talentos.join(", ")}</small>
                </div>
                <span className="preco-tag cromo">
                  <Preco texto={formatarPreco(p.precoExemplo)} />
                </span>
                <IconeSeta />
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 18, maxWidth: 420 }}>
            <Link href="/numero-que-vende#talentos" className="btn btn-acao">
              Montar um novo produto
            </Link>
            <p
              className="pequeno"
              style={{ textAlign: "center", marginTop: 10 }}
            >
              Preços de exemplo. Valor sugerido, não é garantia de venda.
            </p>
          </div>
        </>
      )}
    </Moldura>
  );
}
