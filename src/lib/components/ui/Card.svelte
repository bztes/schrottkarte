<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title?: string;
    description?: string;
    /** content next to the title, e.g. buttons */
    actions?: Snippet;
    /** remove the body padding, for lists that span the full width */
    flush?: boolean;
    children: Snippet;
  }

  let { title, description, actions, flush = false, children }: Props = $props();
</script>

<section class="card">
  {#if title || actions}
    <header>
      <div class="heading">
        {#if title}<h2>{title}</h2>{/if}
        {#if description}<p>{description}</p>{/if}
      </div>
      {@render actions?.()}
    </header>
  {/if}
  <div class={['body', { flush }]}>
    {@render children()}
  </div>
</section>

<style>
  .card {
    display: flex;
    flex-direction: column;
    background-color: var(--c-base-100);
    border: 1px solid var(--c-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem 1.5rem 0;
  }

  .heading {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  h2 {
    font-size: var(--fs-lg);
    font-weight: 600;
  }

  p {
    margin: 0;
    color: var(--c-muted);
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem 1.5rem 1.5rem;
  }

  .body.flush {
    padding: 1rem 0 0;
    gap: 0;
  }
</style>
