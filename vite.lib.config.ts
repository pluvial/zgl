import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

const minify = process.env.MINIFY ?? false;
if (minify && minify !== 'terser' && minify !== 'esbuild') {
  throw new Error('MINIFY must be either "terser" or "esbuild"');
}

export default defineConfig({
  plugins: [glsl({ compress: true })],
  publicDir: false,
  build: {
    lib: { entry: 'src/zgl.ts', formats: ['es'] },
    target: 'esnext',
    minify,
    terserOptions: minify === 'terser' ? { format: { comments: false } } : undefined,
  },
  esbuild: { legalComments: 'none' },
});
