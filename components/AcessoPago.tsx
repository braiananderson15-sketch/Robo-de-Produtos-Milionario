"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { definirDonoDosDados } from "@/lib/armazenamento";
export function AcessoPago({ children }: { children: ReactNode }) {
  const acesso = useQuery(api.acesso.atual),
    router = useRouter(),
    [dono, setDono] = useState<string | null>(null);
  useEffect(() => {
    if (acesso === undefined) return;
    if (!acesso || !acesso.ativo) {
      definirDonoDosDados(null);
      router.replace(acesso ? "/acesso" : "/entrar");
      return;
    }
    definirDonoDosDados(acesso.usuarioId); // A sincronização do dono impede renderizar dados de outra conta.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setDono(acesso.usuarioId);
    return () => definirDonoDosDados(null);
  }, [acesso, router]);
  return acesso?.ativo && dono === acesso.usuarioId ? (
    children
  ) : (
    <main className="shell">
      <p role="status">Conferindo seu acesso…</p>
    </main>
  );
}
