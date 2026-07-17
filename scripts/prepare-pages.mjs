import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(scriptDir, '..', 'dist');

await mkdir(distDir, { recursive: true });
await copyFile(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));