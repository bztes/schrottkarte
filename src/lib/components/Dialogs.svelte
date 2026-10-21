<script lang="ts">
  import type { DialogParamsAction, DialogsService } from '#lib/dialogs.svelte.js';
  import Modal from './ui/Modal.svelte';
  import Button from './ui/Button.svelte';

  interface Props {
    dialogsService: DialogsService;
  }

  let { dialogsService }: Props = $props();

  let firstDialog = $derived(dialogsService.all.at(0));

  const variants = {
    none: 'ghost',
    primary: 'primary',
    secondary: 'secondary',
    accent: 'danger',
  } as const satisfies Record<DialogParamsAction['type'], string>;
</script>

{#if firstDialog}
  {#key firstDialog}
    <Modal
      title={firstDialog.title}
      footer={firstDialog.buttons ? buttons : undefined}
      onclose={() => firstDialog.onaction('close')}
    >
      {#each firstDialog.msg.split('\n') as msg, i (i)}
        <p>{msg}</p>
      {/each}
    </Modal>
  {/key}

  {#snippet buttons()}
    {#each Object.entries(firstDialog.buttons ?? {}) as [id, button] (id)}
      <Button variant={variants[button.type]} onclick={() => firstDialog.onaction(id)}>
        {button.label}
      </Button>
    {/each}
  {/snippet}
{/if}

<style>
  p {
    margin: 0 0 0.5rem;
  }

  p:last-child {
    margin-bottom: 0;
  }
</style>
