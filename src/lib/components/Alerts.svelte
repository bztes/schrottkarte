<script lang="ts">
  import { AlertLevel, type Alert, type AlertsService } from '$lib/alerts.svelte';
  import type { DialogsService } from '$lib/dialogs.svelte';
  import IcRoundClose from '~icons/ic/round-close';

  interface Props {
    alertsService: AlertsService;
    dialogsService: DialogsService;
  }

  let { alertsService, dialogsService }: Props = $props();

  const visible = $derived.by(() => {
    let result: Alert | undefined = undefined;
    for (const item of alertsService.all) {
      if (!result) {
        result = item;
      } else if (item.level > result.level) {
        result = item;
      }
      if (result.level === AlertLevel.error) {
        break;
      }
    }
    return result ? [result] : [];
  });

  function handleAlertClick(alert: Alert) {
    if (alert.canClose) {
      alertsService.delete(alert.id);
    } else {
      dialogsService.modal({
        title: alert.title,
        msg: (alert.msg ?? '') + (alert.details ? `\nError: ${alert.details}` : ''),
      });
    }
  }
</script>

{#each visible as alert}
  <button
    class="badge"
    class:button-accent={alert.level === AlertLevel.error || alert.level === AlertLevel.warn}
    class:button-secondary={alert.level === AlertLevel.info}
    onclick={() => handleAlertClick(alert)}
  >
    {#if alertsService.all.length > 1}
      <strong>{alertsService.all.length}</strong>
    {/if}
    {alert.title}
    {#if alert.canClose}
      <IcRoundClose />
    {/if}
  </button>
{/each}

<style>
  .badge {
    position: fixed;
    top: 1rem;
    left: 50%;
    z-index: 100;
    transform: translateX(-50%);
  }
</style>
