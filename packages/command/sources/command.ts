import path from 'node:path';
import { Command } from 'commander';
import opener from 'opener';
import { createServer } from 'server/sources/server.ts';

const program = new Command();

program
  .name('media-gallery-server')
  .description('Media gallery server — browse images and videos in a directory')
  .version('0.0.1')
  .argument('[path]', 'directory to serve', '.')
  .option('-p, --port <number>', 'listen port', '8080')
  .option('-a, --host <address>', 'binding address', '::')
  .option('-c, --cache <seconds>', 'Cache-Control max-age, -1 to disable', '3600')
  .option('--cors', 'enable CORS')
  .option('-o, --open', 'open browser on start')
  .option('-s, --silent', 'suppress log output')
  .option('--title <string>', 'page title', 'Media Gallery')
  .action(async (targetPath: string, flags: Record<string, string | boolean | undefined>) => {
    const root = path.resolve(targetPath);

    const { fastify, options } = await createServer({
      root,
      port: Number(flags.port),
      host: flags.host as string,
      cache: Number(flags.cache),
      cors: flags.cors === true,
      title: flags.title as string,
      silent: flags.silent === true,
    });

    await fastify.listen({ port: options.port, host: options.host });

    const address = options.host === '::' ? 'localhost' : options.host;
    const url = `http://${address}:${options.port}`;

    if (!options.silent) {
      console.log(`\n  Media Gallery Server\n`);
      console.log(`  Local:   ${url}`);
      console.log(`  Serving: ${options.root}\n`);
    }

    if (flags.open) {
      opener(url);
    }
  });

program.parse();
