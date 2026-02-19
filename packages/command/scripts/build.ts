import * as esbuild from 'esbuild';
import fs from 'node:fs/promises';
import module from 'node:module';

const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
const nodeBuiltins = module.builtinModules.flatMap((m) => [m, `node:${m}`]);
const external = [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
  ...nodeBuiltins,
];

await fs.rm('outputs', { recursive: true, force: true });

await esbuild.build({
  entryPoints: ['sources/command.ts'],
  bundle: true,
  external,
  sourcemap: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'outputs/command.js',
  banner: { js: '#!/usr/bin/env node\n' },
});

await fs.chmod('outputs/command.js', 0o755);

console.log('Build complete: outputs/command.js');
