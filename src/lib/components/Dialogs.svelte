<script lang="ts">
  import type { DialogsService } from '$lib/dialogs.svelte';
  import Dialog from './Dialog.svelte';

  interface Props {
    dialogsService: DialogsService;
  }

  let { dialogsService }: Props = $props();

  let firstDialog = $derived(dialogsService.all.at(0));

  function handleActionClick(actionId: string) {
    if (firstDialog) {
      firstDialog.onaction(actionId);
    }
  }

  function handleCloseClick() {
    if (firstDialog) {
      firstDialog.onaction('close');
    }
  }
</script>

{#if firstDialog}
  <div class="overlay">
    <Dialog
      title={firstDialog.title}
      buttons={firstDialog.buttons ? buttons : undefined}
      onclose={handleCloseClick}
    >
      {#each firstDialog.msg.split('\n') as msg}
        <p>{msg}</p>
      {/each}
    </Dialog>
  </div>

  {#snippet buttons()}
    {#if firstDialog.buttons}
      {#each Object.entries(firstDialog.buttons) as [id, button] (id)}
        <button
          class:button-primary={button.type === 'primary'}
          class:button-secondary={button.type === 'secondary'}
          class:button-accent={button.type === 'accent'}
          onclick={() => handleActionClick(id)}
        >
          {button.label}
        </button>
      {/each}
    {/if}
  {/snippet}
{/if}

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    background-color: #55555555;
    z-index: 1000;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    box-sizing: border-box;
  }
</style>
