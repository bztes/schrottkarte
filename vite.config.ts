import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  plugins: [sveltekit(), Icons({ compiler: 'svelte' })],
  ssr: {
    noExternal: ['maplibre-gl'],
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
});
