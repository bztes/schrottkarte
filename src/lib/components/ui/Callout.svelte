<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    tone?: 'info' | 'warning' | 'error' | 'success';
    children: Snippet;
  }

  let { tone = 'info', children }: Props = $props();
</script>

<p class={['callout', tone]} role={tone === 'error' ? 'alert' : undefined}>
  {@render children()}
</p>

<style>
  .callout {
    margin: 0;
    padding: 0.7rem 0.9rem;
    border-radius: 0.7rem;
  }

  .callout :global(svg) {
    vertical-align: -0.15em;
  }

  .info {
    background-color: var(--c-primary-soft);
    color: var(--c-primary-active);
  }

  .success {
    background-color: var(--c-primary-soft);
    color: var(--c-primary-active);
  }

  .warning {
    background-color: #ffedd5;
    color: #c2410c;
  }

  .error {
    background-color: #fdecec;
    color: var(--c-accent-active);
  }
</style>
