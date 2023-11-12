import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import { viteSingleFile } from 'vite-plugin-singlefile';
import htmlMinimizeModule from '@sergeymakinen/vite-plugin-html-minimize';

const { default: htmlMinimize } =
  htmlMinimizeModule as unknown as typeof import('@sergeymakinen/vite-plugin-html-minimize');

const { ESBUILD, TERSER } = process.env;
const minify = ESBUILD ? 'esbuild' : TERSER ? 'terser' : false;

export default defineConfig({
  resolve: { alias: [{ find: '@', replacement: 'dist' }] },
  plugins: [
    glsl({ compress: true }),
    viteSingleFile({ removeViteModuleLoader: true }),
    htmlMinimize(),
  ],
  build: {
    target: 'esnext',
    minify,
    terserOptions: minify === 'terser' ? { format: { comments: false } } : undefined,
  },
  esbuild: { legalComments: 'none' },
});
