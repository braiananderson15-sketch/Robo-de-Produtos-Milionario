import {convexAuthNextjsMiddleware,createRouteMatcher} from "@convex-dev/auth/nextjs/server";
import {NextResponse} from "next/server";
const protegido=createRouteMatcher(["/","/agenda(.*)","/mapa(.*)","/numero-que-vende(.*)","/produtos(.*)","/resultado(.*)","/api/produto(.*)","/acesso(.*)"]);
export default convexAuthNextjsMiddleware(async(request,{convexAuth})=>{
 if(protegido(request)&&!await convexAuth.isAuthenticated()){
  if(request.nextUrl.pathname.startsWith("/api/"))return NextResponse.json({erro:"Entre com seu e-mail para continuar."},{status:401});
  const url=request.nextUrl.clone();url.pathname="/entrar";url.search="";url.searchParams.set("voltar",request.nextUrl.pathname);return NextResponse.redirect(url);
 }
},{cookieConfig:{maxAge:60*60*24*30},shouldHandleCode:()=>false});
export const config={matcher:["/((?!_next|.*\\..*).*)","/","/(api|trpc)(.*)"]};
