import { SvelteMap } from 'svelte/reactivity';

export enum AlertLevel {
  info,
  warn,
  error,
}

export interface Alert {
  id: string;
  title: string;
  msg?: string;
  details?: string;
  level: AlertLevel;
  canClose: boolean;
}

export type AlertsService = ReturnType<typeof createAlertsService>;

export function createAlertsService() {
  const alertsMap = new SvelteMap<string, Alert>();
  const allAlerts = $derived(Array.from(alertsMap.values()));

  return {
    get all() {
      return allAlerts;
    },
    delete: (id: string) => {
      alertsMap.delete(id);
    },
    has: (alert: Alert) => alertsMap.has(alert.id),
    info: (partial: Partial<Alert>) => {
      const alert: Alert = {
        id: partial.id ?? crypto.randomUUID(),
        title: partial.title ?? 'Info',
        msg: partial.msg,
        canClose: partial.canClose ?? true,
        level: AlertLevel.info,
      };
      alertsMap.set(alert.id, alert);
      return alert;
    },
    warn: (partial: Partial<Alert>) => {
      const alert: Alert = {
        id: partial.id ?? crypto.randomUUID(),
        title: partial.title ?? 'Warning',
        msg: partial.msg,
        canClose: partial.canClose ?? true,
        level: AlertLevel.warn,
      };
      alertsMap.set(alert.id, alert);
      return alert;
    },
    error: (partial: Partial<Alert> & { error: Error }) => {
      const alert: Alert = {
        id: partial.id ?? crypto.randomUUID(),
        title: partial.title ?? 'Error',
        msg: partial.msg,
        details: partial.error.message,
        canClose: partial.canClose ?? true,
        level: AlertLevel.error,
      };
      alertsMap.set(alert.id, alert);
      return alert;
    },
  };
}
