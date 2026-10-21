import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  plugins: [
    sveltekit({
      preprocess: vitePreprocess(),
      adapter: adapter(),
      // only for local http test images, otherwise the origin comes from the request
      paths: { origin: process.env.BUILD_ORIGIN },
      experimental: { remoteFunctions: true },
    }),
    Icons({ compiler: 'svelte' }),
  ],
  ssr: { noExternal: ['maplibre-gl'] },
  test: { include: ['src/**/*.{test,spec}.{js,ts}'] },
});
