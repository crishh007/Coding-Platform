import * as esbuild from 'esbuild';
import esbuildPluginPino from 'esbuild-plugin-pino';

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  outdir: 'dist',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
  plugins: [],
  external: [
    'pg', 
    'pg-native', 
    'drizzle-orm', 
    'express', 
    'cors', 
    'ws',
    'pino',
    'pino-http',
    'pino-pretty'
  ],
  sourcemap: true,
}).catch(() => process.exit(1));
