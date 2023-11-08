import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import { viteSingleFile } from 'vite-plugin-singlefile';
import htmlMinimizeModule from '@sergeymakinen/vite-plugin-html-minimize';

const htmlMinimize = (htmlMinimizeModule as any).default as typeof htmlMinimizeModule;

const minify = process.env.MINIFY ?? false;
if (minify && minify !== 'terser' && minify !== 'esbuild') {
  throw new Error('MINIFY must be either "terser" or "esbuild"');
}

export default defineConfig({
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
