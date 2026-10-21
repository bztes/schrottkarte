<script lang="ts">
  import { AlertLevel, type Alert, type AlertsService } from '#lib/alerts.svelte.js';
  import type { DialogsService } from '#lib/dialogs.svelte.js';
  import Toast from './ui/Toast.svelte';
  import LucideX from '~icons/lucide/x';

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

{#each visible as alert (alert.id)}
  <Toast
    tone={alert.level === AlertLevel.info ? 'info' : 'danger'}
    onclick={() => handleAlertClick(alert)}
  >
    {#if alertsService.all.length > 1}
      <strong>{alertsService.all.length}</strong>
    {/if}
    {alert.title}
    {#if alert.canClose}
      <LucideX />
    {/if}
  </Toast>
{/each}
