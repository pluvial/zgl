import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl({ compress: true })],
  publicDir: false,
  build: {
    lib: { entry: 'src/zgl.ts', formats: ['es'] },
    target: 'esnext',
  },
  esbuild: { legalComments: 'none' },
});
