import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { marca } from "@/config/marca";
import { Aviso } from "@/components/Aviso";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import "./globals.css";
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
export const metadata: Metadata = {
  title: marca.nomeApp,
  description:
    "Descubra o seu Número que Vende e monte o seu primeiro produto, pronto para mandar no WhatsApp.",
  appleWebApp: {
    capable: true,
    title: marca.nomeApp,
    statusBarStyle: "black-translucent",
  },
};
export const viewport: Viewport = {
  themeColor: "#090e18",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={geist.variable}>
      <body>
        <ConvexAuthNextjsServerProvider
          storage="inMemory"
          shouldHandleCode={false}
        >
          <ConvexClientProvider>
            {children}
            <Aviso />
          </ConvexClientProvider>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
