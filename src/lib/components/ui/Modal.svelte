<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import LucideX from '~icons/lucide/x';
  import IconButton from './IconButton.svelte';

  interface Props {
    title: string;
    description?: string;
    size?: 'md' | 'lg';
    /** buttons at the bottom, stay visible while the content scrolls */
    footer?: Snippet;
    /** called on escape and the close button, the parent removes the modal */
    onclose: () => void;
    children: Snippet;
  }

  let { title, description, size = 'md', footer, onclose, children }: Props = $props();
  let dialog = $state<HTMLDialogElement>();

  onMount(() => dialog?.showModal());
</script>

<!-- no close on backdrop clicks, the modal may contain unsaved input -->
<dialog class={['modal', size]} aria-label={title} bind:this={dialog} onclose={() => onclose()}>
  <header>
    <div class="heading">
      <h2>{title}</h2>
      {#if description}<p>{description}</p>{/if}
    </div>
    <IconButton label="Close" onclick={() => onclose()}>
      <LucideX />
    </IconButton>
  </header>
  <div class="body">
    {@render children()}
  </div>
  {#if footer}
    <footer>
      {@render footer()}
    </footer>
  {/if}
</dialog>

<style>
  .modal {
    flex-direction: column;
    width: min(32rem, calc(100vw - 2rem));
    max-height: calc(100svh - 2rem);
    padding: 0;
    color: inherit;
    background-color: var(--c-base-100);
    border: 1px solid var(--c-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
  }

  .modal[open] {
    display: flex;
  }

  .modal.lg {
    width: min(48rem, calc(100vw - 2rem));
  }

  .modal::backdrop {
    background-color: rgb(16 24 40 / 0.4);
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
    min-width: 0;
  }

  h2 {
    margin: 0;
    font-size: var(--fs-lg);
    font-weight: 600;
  }

  p {
    margin: 0;
    color: var(--c-muted);
  }

  .body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 1.25rem 1.5rem;
  }

  footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 0.9rem 1.5rem;
    border-top: 1px solid var(--c-border);
    background-color: var(--c-base-200);
  }

  @media (max-width: 720px) {
    header,
    .body,
    footer {
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }
</style>
