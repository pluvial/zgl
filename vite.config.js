import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import { viteSingleFile } from 'vite-plugin-singlefile';
import htmlMinimize from '@sergeymakinen/vite-plugin-html-minimize';

export default defineConfig({
  plugins: [
    glsl({ compress: true }),
    viteSingleFile({ removeViteModuleLoader: true }),
    htmlMinimize.default(),
  ],
  build: { target: 'esnext' },
});
