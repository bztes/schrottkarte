<script lang="ts">
  import type { Snippet } from 'svelte';
  import IcRoundClose from '~icons/ic/round-close';

  interface Props {
    title: string;
    children: Snippet;
    buttons?: Snippet;
    onclose?: () => void;
  }

  let { title, children, buttons, onclose }: Props = $props();

  function handleCloseClick() {
    onclose?.();
  }
</script>

<div class="dialog" role="dialog" aria-modal="true">
  <div class="header">
    <h3>{title}</h3>
    {#if !buttons}
      <button class="button-round" onclick={handleCloseClick}>
        <IcRoundClose />
      </button>
    {/if}
  </div>
  <div class="msg">
    {@render children()}
  </div>
  {#if buttons}
    <div class="buttons">
      {@render buttons()}
    </div>
  {/if}
</div>

<style>
  .dialog {
    all: unset;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
    max-height: 100%;
    background-color: var(--c-base-100);
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid var(--c-base-300);
    box-sizing: border-box;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .msg {
    overflow: auto;
  }

  .buttons {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }
</style>
