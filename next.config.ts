import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // anki-apkg-export solo pide esto en su rama de navegador, que en el servidor (Node)
      // nunca corre — pero Turbopack igual intenta resolverlo al armar el bundle. Ver lib/empty-module.js.
      "script-loader!sql.js": "./lib/empty-module.js",
    },
  },
};

export default nextConfig;
