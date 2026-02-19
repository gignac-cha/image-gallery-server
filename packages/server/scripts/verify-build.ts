import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const exportsDir = path.resolve(import.meta.dirname, '..', 'exports');

const EXPECTED_EXPORTS = ['createServer', 'DEFAULT_OPTIONS'];

describe('ESM', () => {
  it('exports expected symbols', async () => {
    const esm = await import(path.join(exportsDir, 'esm', 'index.js'));
    for (const name of EXPECTED_EXPORTS) {
      assert.equal(typeof esm[name] !== 'undefined', true, `missing export: ${name}`);
    }
  });

  it('createServer is a function', async () => {
    const { createServer } = await import(path.join(exportsDir, 'esm', 'index.js'));
    assert.equal(typeof createServer, 'function');
  });

  it('DEFAULT_OPTIONS has required fields', async () => {
    const { DEFAULT_OPTIONS } = await import(path.join(exportsDir, 'esm', 'index.js'));
    assert.equal(typeof DEFAULT_OPTIONS.port, 'number');
    assert.equal(typeof DEFAULT_OPTIONS.host, 'string');
    assert.equal(typeof DEFAULT_OPTIONS.title, 'string');
    assert.ok(DEFAULT_OPTIONS.imageExtensions instanceof Set);
  });
});

describe('CJS', () => {
  it('exports expected symbols', () => {
    const cjs = require(path.join(exportsDir, 'cjs', 'index.cjs'));
    for (const name of EXPECTED_EXPORTS) {
      assert.equal(typeof cjs[name] !== 'undefined', true, `missing export: ${name}`);
    }
  });

  it('createServer is a function', () => {
    const { createServer } = require(path.join(exportsDir, 'cjs', 'index.cjs'));
    assert.equal(typeof createServer, 'function');
  });
});

describe('IIFE', () => {
  it('assigns to global name', () => {
    const code = fs.readFileSync(path.join(exportsDir, 'iife', 'index.cjs'), 'utf-8');
    const fn = new Function('require', code + '; return ImageGalleryServer;');
    const iife = fn(require);
    for (const name of EXPECTED_EXPORTS) {
      assert.equal(typeof iife[name] !== 'undefined', true, `missing export: ${name}`);
    }
  });

  it('createServer is a function', () => {
    const code = fs.readFileSync(path.join(exportsDir, 'iife', 'index.cjs'), 'utf-8');
    const fn = new Function('require', code + '; return ImageGalleryServer;');
    assert.equal(typeof fn(require).createServer, 'function');
  });
});

describe('UMD', () => {
  it('exports expected symbols via require', () => {
    const umd = require(path.join(exportsDir, 'umd', 'index.cjs'));
    for (const name of EXPECTED_EXPORTS) {
      assert.equal(typeof umd[name] !== 'undefined', true, `missing export: ${name}`);
    }
  });

  it('createServer is a function', () => {
    const { createServer } = require(path.join(exportsDir, 'umd', 'index.cjs'));
    assert.equal(typeof createServer, 'function');
  });
});

describe('Types', () => {
  const typesDir = path.join(exportsDir, 'types');

  it('server.d.ts exists', () => {
    assert.ok(fs.existsSync(path.join(typesDir, 'server.d.ts')));
  });

  it('options.d.ts exists', () => {
    assert.ok(fs.existsSync(path.join(typesDir, 'options.d.ts')));
  });

  it('scanner.d.ts exists', () => {
    assert.ok(fs.existsSync(path.join(typesDir, 'scanner.d.ts')));
  });

  it('server.d.ts exports createServer', () => {
    const content = fs.readFileSync(path.join(typesDir, 'server.d.ts'), 'utf-8');
    assert.ok(content.includes('createServer'));
    assert.ok(content.includes('ServerOptions'));
  });

  it('sourcemaps exist for each format', () => {
    assert.ok(fs.existsSync(path.join(exportsDir, 'esm', 'index.js.map')));
    assert.ok(fs.existsSync(path.join(exportsDir, 'cjs', 'index.cjs.map')));
    assert.ok(fs.existsSync(path.join(exportsDir, 'iife', 'index.cjs.map')));
    assert.ok(fs.existsSync(path.join(exportsDir, 'umd', 'index.cjs.map')));
  });
});
