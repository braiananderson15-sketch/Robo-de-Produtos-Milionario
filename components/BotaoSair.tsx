"use client";
import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { definirDonoDosDados } from "@/lib/armazenamento";
export function BotaoSair() {
  const { isAuthenticated } = useConvexAuth(),
    { signOut } = useAuthActions(),
    router = useRouter(),
    [ocupado, setOcupado] = useState(false),
    [erro, setErro] = useState(false);
  if (!isAuthenticated) return null;
  return (
    <div className="sair">
      <button
        className="btn btn-contorno btn-sm"
        disabled={ocupado}
        onClick={async () => {
          setOcupado(true);
          setErro(false);
          try {
            await signOut();
            definirDonoDosDados(null);
            router.replace("/entrar");
            router.refresh();
          } catch {
            setErro(true);
          } finally {
            setOcupado(false);
          }
        }}
      >
        {ocupado ? "Saindo…" : "Sair"}
      </button>
      {erro && (
        <small role="alert">Não foi possível sair. Tente novamente.</small>
      )}
    </div>
  );
}
