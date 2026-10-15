import {convexAuthNextjsToken} from "@convex-dev/auth/nextjs/server";
import {fetchAction,fetchQuery} from "convex/nextjs";
import {api} from "@/convex/_generated/api";
export const maxDuration=60;
export async function POST(req:Request){
 const token=await convexAuthNextjsToken();
 if(!token)return Response.json({erro:"Entre com seu e-mail para continuar."},{status:401});
 try{
  const acesso=await fetchQuery(api.acesso.atual,{}, {token});
  if(!acesso)return Response.json({erro:"Entre com seu e-mail para continuar."},{status:401});
  if(!acesso.ativo)return Response.json({erro:"Sua compra precisa estar ativa para montar produtos."},{status:403});
  const pedido=await req.text();if(pedido.length>6000)return Response.json({erro:"O pedido ficou muito grande."},{status:400});
  try{JSON.parse(pedido);}catch{return Response.json({erro:"Não consegui ler o pedido."},{status:400});}
  const resultado=await fetchAction(api.produtos.gerar,{pedido},{token});
  return Response.json(resultado,{headers:{"Cache-Control":"no-store"}});
 }catch{return Response.json({erro:"Não foi possível montar seu produto. Confira seu acesso e tente novamente."},{status:400});}
}
