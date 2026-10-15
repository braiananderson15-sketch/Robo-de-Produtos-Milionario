"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Moldura } from "@/components/Moldura";
import { IconeCadeado, IconeSeta } from "@/components/Icones";
export default function Entrar() {
  const { signIn } = useAuthActions(),
    { isAuthenticated } = useConvexAuth(),
    router = useRouter(),
    [email, setEmail] = useState(""),
    [codigo, setCodigo] = useState(""),
    [enviado, setEnviado] = useState(false),
    [ocupado, setOcupado] = useState(false),
    [erro, setErro] = useState("");
  useEffect(() => {
    if (isAuthenticated) {
      const voltar =
        new URLSearchParams(window.location.search).get("voltar") ?? "/";
      router.replace(
        [
          "/",
          "/agenda",
          "/mapa",
          "/numero-que-vende",
          "/produtos",
          "/resultado",
        ].includes(voltar)
          ? voltar
          : "/",
      );
      router.refresh();
    }
  }, [isAuthenticated, router]);
  return (
    <Moldura semAbas>
      <main className="auth-card entrar">
        <span className="auth-emblema">
          <IconeCadeado size={28} />
        </span>
        <p className="kicker">Seu acesso</p>
        <h1 className="display">
          {enviado ? "Confira seu e-mail" : "Entre com seu e-mail"}
        </h1>
        <p className="lead">
          {enviado
            ? `Enviamos um código para ${email}. Ele vale por 15 minutos.`
            : "Use o mesmo e-mail da sua compra. Você recebe um código e entra sem senha."}
        </p>
        <form
          className="auth-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (ocupado) return;
            setOcupado(true);
            setErro("");
            const normalizado = email.trim().toLowerCase();
            setEmail(normalizado);
            try {
              if (enviado) {
                const resultado = await signIn("resend-otp", {
                  email: normalizado,
                  code: codigo.trim(),
                });
                if (!resultado.signingIn)
                  setErro("Confira o código recebido no e-mail.");
              } else {
                await signIn("resend-otp", { email: normalizado });
                setEnviado(true);
              }
            } catch {
              setErro(
                enviado
                  ? "Código incorreto ou vencido. Confira o e-mail ou volte para pedir outro."
                  : "Não foi possível enviar o código. Tente novamente em alguns instantes.",
              );
            } finally {
              setOcupado(false);
            }
          }}
        >
          {!enviado ? (
            <label className="campo" htmlFor="email">
              <span>Seu e-mail</span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                placeholder="voce@exemplo.com"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          ) : (
            <>
              <input type="hidden" name="email" value={email} />
              <label className="campo" htmlFor="codigo">
                <span>Código de acesso</span>
                <input
                  key="codigo"
                  id="codigo"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{8}"
                  minLength={8}
                  maxLength={8}
                  placeholder="8 números"
                  required
                  autoFocus
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                />
              </label>
            </>
          )}
          <p className="erro" role="alert">
            {erro}
          </p>
          <button className="btn btn-acao" type="submit" disabled={ocupado}>
            {ocupado
              ? enviado
                ? "Conferindo código…"
                : "Enviando código…"
              : enviado
                ? "Entrar"
                : "Receber meu código"}
            <IconeSeta />
          </button>
          {!enviado ? (
            <Link href="/vitrine" className="btn btn-contorno">
              Voltar para a vitrine
            </Link>
          ) : (
            <button
              type="button"
              className="btn btn-contorno"
              disabled={ocupado}
              onClick={() => {
                setEnviado(false);
                setCodigo("");
                setErro("");
              }}
            >
              Voltar
            </button>
          )}
        </form>
        <p className="micro auth-note">
          Seu acesso pode durar até 30 dias neste navegador. Use “Sair” em
          aparelhos compartilhados.
        </p>
      </main>
    </Moldura>
  );
}
