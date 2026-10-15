"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useHash } from "@/lib/useHash";
import { useDados } from "@/lib/armazenamento";
import { calcularNumeros, primeiroNome } from "@/lib/numerologia/calculo";
import { Moldura } from "@/components/Moldura";
import { Vazio } from "@/components/Vazio";
import { ProdutoView } from "@/components/ProdutoView";
import { IconeCheck } from "@/components/Icones";
import { marca, marcaDeExemplo } from "@/config/marca";
export default function Resultado() {
  const id = useHash(),
    { dados, pronto } = useDados();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  if (!pronto) return <div className="shell" />;
  const produto = dados.produtos.find((p) => p.id === id) ?? dados.produtos[0],
    perfil = dados.perfil,
    numeros = perfil
      ? calcularNumeros(perfil.nome, perfil.dia, perfil.mes)
      : null;
  return (
    <Moldura voltar="/">
      {!produto ? (
        <Vazio
          titulo="Nenhum produto por aqui"
          texto="Descubra o seu número e monte o seu primeiro produto em poucos minutos."
        />
      ) : (
        <>
          <span className="pronto">
            <IconeCheck size={15} />
            Seu produto está pronto
            {perfil ? ", " + primeiroNome(perfil.nome) : ""}
          </span>
          {process.env.NODE_ENV === "development" &&
            produto.origem === "modelo" && (
              <p className="dev-aviso">
                Texto do modelo, sem IA. Cadastre a ANTHROPIC_API_KEY nas
                variáveis do Convex para a IA escrever. (Só aparece no
                computador.)
              </p>
            )}
          <ProdutoView
            produto={produto}
            anoColheita={numeros?.anoColheita ?? null}
          >
            <div style={{ display: "grid", gap: 8, marginTop: 30 }}>
              <Link
                href="/numero-que-vende#talentos"
                className="btn btn-contorno"
              >
                Montar outro produto
              </Link>
              <Link href="/" className="btn btn-calmo">
                Voltar ao início
              </Link>
              <a
                className="suporte"
                href={`https://wa.me/${marca.whatsappSuporte}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Precisa de ajuda? <u>Fale no WhatsApp</u>
              </a>
              {process.env.NODE_ENV === "development" &&
                marcaDeExemplo.whatsapp && (
                  <p className="dev-aviso">
                    Configure o WhatsApp de suporte em config/marca.ts.
                  </p>
                )}
            </div>
          </ProdutoView>
        </>
      )}
    </Moldura>
  );
}
