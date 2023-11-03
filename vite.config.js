import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import { viteSingleFile } from 'vite-plugin-singlefile';
import htmlMinimize from '@sergeymakinen/vite-plugin-html-minimize';

const { MINIFY } = process.env;
const minify = ['esbuild', 'terser'].includes(MINIFY) ? MINIFY : false;

export default defineConfig({
  plugins: [
    glsl({ compress: true }),
    viteSingleFile({ removeViteModuleLoader: true }),
    htmlMinimize.default(),
  ],
  build: {
    target: 'esnext',
    minify,
    terserOptions: minify === 'terser' ? { format: { comments: false } } : null,
  },
  esbuild: { legalComments: 'none' },
});
