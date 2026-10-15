import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { AcessoPago } from "@/components/AcessoPago";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await convexAuthNextjsToken();
  if (!token) redirect("/entrar");
  const acesso = await fetchQuery(api.acesso.atual, {}, { token });
  if (!acesso) redirect("/entrar");
  if (!acesso.ativo) redirect("/acesso");
  return <AcessoPago>{children}</AcessoPago>;
}
