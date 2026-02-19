import * as esbuild from 'esbuild';
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import module from 'node:module';

const ENTRY = 'sources/server.ts';
const GLOBAL_NAME = 'ImageGalleryServer';

const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
const nodeBuiltins = module.builtinModules.flatMap((m) => [m, `node:${m}`]);
const external = [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
  ...nodeBuiltins,
];

const shared: esbuild.BuildOptions = {
  entryPoints: [ENTRY],
  bundle: true,
  external,
  sourcemap: true,
  platform: 'node',
  target: 'node20',
};

const umdBanner = `;(function(root, factory) {
  if (typeof define === 'function' && define.amd) define([], factory);
  else if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.${GLOBAL_NAME} = factory();
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function() {
var module = { exports: {} }; var exports = module.exports;`;

const umdFooter = `return module.exports;
});`;

// Clean
await fs.rm('exports', { recursive: true, force: true });

// Build all formats in parallel
await Promise.all([
  esbuild.build({
    ...shared,
    format: 'esm',
    outfile: 'exports/esm/index.js',
  }),
  esbuild.build({
    ...shared,
    format: 'cjs',
    outfile: 'exports/cjs/index.cjs',
  }),
  esbuild.build({
    ...shared,
    format: 'iife',
    globalName: GLOBAL_NAME,
    outfile: 'exports/iife/index.cjs',
  }),
  esbuild.build({
    ...shared,
    format: 'cjs',
    outfile: 'exports/umd/index.cjs',
    banner: { js: umdBanner },
    footer: { js: umdFooter },
  }),
]);

// Generate type declarations with tsc
execSync('pnpm exec tsc --project tsconfig.build.json', { stdio: 'inherit' });

console.log('Build complete: exports/{esm,cjs,iife,umd,types}');
