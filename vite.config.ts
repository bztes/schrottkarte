import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  // @ts-expect-error vitest 2 does not support vite 6
  plugins: [sveltekit(), Icons({ compiler: 'svelte' })],
  ssr: {
    noExternal: ['maplibre-gl'],
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
});
