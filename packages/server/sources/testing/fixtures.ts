import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

export interface TestFixture {
  root: string;
  cleanup: () => Promise<void>;
}

export async function createTestFixture(): Promise<TestFixture> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'gallery-test-'));
  return {
    root,
    cleanup: () => fs.rm(root, { recursive: true, force: true }),
  };
}

export async function createTestImage(
  directory: string,
  filename: string,
  content?: string | Buffer,
): Promise<string> {
  const filePath = path.join(directory, filename);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content ?? `fake-image-data-${filename}`);
  return filePath;
}
