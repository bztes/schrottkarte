<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    tone?: 'neutral' | 'primary' | 'warning' | 'danger' | 'blue' | 'amber' | 'pink';
    children: Snippet;
  }

  let { tone = 'neutral', children }: Props = $props();
</script>

<span class={['badge', tone]}>{@render children()}</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.1rem 0.55rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
  }

  .neutral {
    background-color: var(--c-base-400);
    color: var(--c-base-600);
  }

  .primary {
    background-color: var(--c-primary-soft);
    color: var(--c-primary-active);
  }

  .warning {
    background-color: #ffedd5;
    color: #c2410c;
  }

  .danger {
    background-color: #fdecec;
    color: var(--c-accent-active);
  }

  .blue {
    background-color: #e7f0fd;
    color: #1d4ed8;
  }

  .amber {
    background-color: #fef3e2;
    color: #b45309;
  }

  .pink {
    background-color: #fde7f3;
    color: var(--c-secondary-active);
  }
</style>
