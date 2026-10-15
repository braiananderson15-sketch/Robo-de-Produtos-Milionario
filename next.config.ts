import type { NextConfig } from "next";
// O app roda todo no aparelho (dados no localStorage), então não usamos o cache de componentes.
const nextConfig: NextConfig = {
  agentRules: false,
  turbopack: {
    rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
  },
};
export default nextConfig;
