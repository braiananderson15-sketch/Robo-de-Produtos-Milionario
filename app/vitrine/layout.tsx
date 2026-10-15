import { marca } from "@/config/marca";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: marca.nomeVitrine,
  appleWebApp: {
    capable: true,
    title: marca.nomeVitrine,
    statusBarStyle: "black-translucent",
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
