// Backend functions import npm packages through Deno's "npm:" specifier. Tests import some of those shared
// modules directly (vitest maps the specifier to node_modules), so the app type-check needs matching declarations.
declare module 'npm:pdf-lib@1.17.1' {
  export * from 'pdf-lib';
}
