<script lang="ts">
  import type { Snippet } from 'svelte';

  /** numbered instructions, pass one <li> per step */
  let { children }: { children: Snippet } = $props();
</script>

<ol class="steps">
  {@render children()}
</ol>

<style>
  .steps {
    margin: 0;
    padding: 0;
    list-style: none;
    counter-reset: step;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .steps :global(li) {
    counter-increment: step;
    position: relative;
    padding-left: 2.1rem;
    line-height: 1.45rem;
  }

  .steps :global(li)::before {
    content: counter(step);
    position: absolute;
    left: 0;
    top: 0;
    width: 1.45rem;
    height: 1.45rem;
    display: grid;
    place-items: center;
    border-radius: 999px;
    background-color: var(--c-primary-soft);
    color: var(--c-primary);
    font-size: 0.75rem;
    font-weight: 600;
  }
</style>
