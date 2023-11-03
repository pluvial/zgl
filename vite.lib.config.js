import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

const { MINIFY } = process.env;
const minify = ['esbuild', 'terser'].includes(MINIFY) ? MINIFY : false;

export default defineConfig({
  plugins: [glsl({ compress: true })],
  build: {
    lib: { entry: 'src/zgl.ts', formats: ['es'] },
    target: 'esnext',
    minify,
    terserOptions: minify === 'terser' ? { format: { comments: false } } : null,
  },
  esbuild: { legalComments: 'none' },
});
