// Stub para turbopack.resolveAlias — anki-apkg-export tiene un require('script-loader!sql.js')
// dentro de una rama solo-navegador (if (typeof window !== 'undefined')) que en Node nunca se
// ejecuta, pero Turbopack igual intenta resolverlo estáticamente al armar el bundle del servidor.
// Ver next.config.ts.
module.exports = {}
