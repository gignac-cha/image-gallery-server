import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'node:path';

vi.mock('server/sources/server.ts', () => ({
  createServer: vi.fn(),
}));

vi.mock('opener', () => ({
  default: vi.fn(),
}));

import { createProgram } from './command.ts';
import { createServer } from 'server/sources/server.ts';
import opener from 'opener';

const mockedCreateServer = vi.mocked(createServer);
const mockedOpener = vi.mocked(opener);

function mockServer() {
  const fastify = {
    listen: vi.fn().mockResolvedValue(undefined),
  };
  mockedCreateServer.mockResolvedValue({
    fastify: fastify as any,
    options: {
      root: '/tmp',
      port: 8080,
      host: '::',
      cache: 3600,
      cors: false,
      thumbnailWidth: 400,
      thumbnailQuality: 80,
      imageExtensions: new Set(['.jpg']),
      title: 'Image Gallery',
      silent: true,
    },
  });
  return fastify;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CLI', () => {
  it('--help output includes "Image gallery server"', () => {
    const program = createProgram();
    // Commander writes to process.stdout and calls process.exit on --help
    // We capture the help text instead
    const helpText = program.helpInformation();
    expect(helpText).toContain('Image gallery server');
  });

  it('--version output includes "0.0.1"', () => {
    const program = createProgram();
    expect(program.version()).toBe('0.0.1');
  });

  it('uses default options: port 8080, host ::', async () => {
    mockServer();
    const program = createProgram();
    await program.parseAsync(['node', 'command.ts', '/tmp']);

    expect(mockedCreateServer).toHaveBeenCalledWith(
      expect.objectContaining({
        port: 8080,
        host: '::',
      }),
    );
  });

  it('accepts --port flag', async () => {
    mockServer();
    const program = createProgram();
    await program.parseAsync(['node', 'command.ts', '--port', '9999', '/tmp']);

    expect(mockedCreateServer).toHaveBeenCalledWith(
      expect.objectContaining({ port: 9999 }),
    );
  });

  it('accepts --host flag', async () => {
    mockServer();
    const program = createProgram();
    await program.parseAsync(['node', 'command.ts', '--host', '0.0.0.0', '/tmp']);

    expect(mockedCreateServer).toHaveBeenCalledWith(
      expect.objectContaining({ host: '0.0.0.0' }),
    );
  });

  it('accepts --cache flag', async () => {
    mockServer();
    const program = createProgram();
    await program.parseAsync(['node', 'command.ts', '--cache', '0', '/tmp']);

    expect(mockedCreateServer).toHaveBeenCalledWith(
      expect.objectContaining({ cache: 0 }),
    );
  });

  it('accepts --cors flag', async () => {
    mockServer();
    const program = createProgram();
    await program.parseAsync(['node', 'command.ts', '--cors', '/tmp']);

    expect(mockedCreateServer).toHaveBeenCalledWith(
      expect.objectContaining({ cors: true }),
    );
  });

  it('accepts --silent flag', async () => {
    mockServer();
    const program = createProgram();
    await program.parseAsync(['node', 'command.ts', '--silent', '/tmp']);

    expect(mockedCreateServer).toHaveBeenCalledWith(
      expect.objectContaining({ silent: true }),
    );
  });

  it('accepts --title flag', async () => {
    mockServer();
    const program = createProgram();
    await program.parseAsync(['node', 'command.ts', '--title', 'My Title', '/tmp']);

    expect(mockedCreateServer).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'My Title' }),
    );
  });

  it('--open flag calls opener with the URL', async () => {
    const fastify = mockServer();
    const program = createProgram();
    await program.parseAsync(['node', 'command.ts', '--open', '--silent', '/tmp']);

    expect(mockedOpener).toHaveBeenCalledWith('http://localhost:8080');
  });

  it('resolves relative path argument to absolute', async () => {
    mockServer();
    const program = createProgram();
    await program.parseAsync(['node', 'command.ts', './images']);

    const callArgs = mockedCreateServer.mock.calls[0][0]!;
    expect(path.isAbsolute(callArgs.root!)).toBe(true);
  });
});
