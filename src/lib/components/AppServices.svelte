<script lang="ts" module>
  import { createContext } from '#lib/utils.js';
  import { createDialogsService, type DialogsService } from '#lib/dialogs.svelte.js';
  import { createAlertsService, type AlertsService } from '#lib/alerts.svelte.js';
  import { createMarkersService, type MarkersService } from '#lib/markers.svelte.js';
  import { createDrawingsService, type DrawingsService } from '#lib/drawings.svelte.js';
  import { createTagsService, type TagsService } from '#lib/tags.svelte.js';

  export const { get: getDialogsService, set: setDialogsService } =
    createContext<DialogsService>('dialogs');

  export const { get: getAlertsService, set: setAlertsService } =
    createContext<AlertsService>('alerts');

  export const { get: getMarkersService, set: setMarkersService } =
    createContext<MarkersService>('markers');

  export const { get: getDrawingsService, set: setDrawingService } =
    createContext<DrawingsService>('drawings');

  export const { get: getTagsService, set: setTagsService } = createContext<TagsService>('tags');
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import Alerts from '#lib/components/Alerts.svelte';
  import Dialogs from '#lib/components/Dialogs.svelte';

  let { children }: { children: Snippet } = $props();

  const dialogsService = createDialogsService();
  setDialogsService(dialogsService);
  const alertsService = createAlertsService();
  setAlertsService(alertsService);
  setMarkersService(createMarkersService(alertsService));
  setDrawingService(createDrawingsService(alertsService));
  setTagsService(createTagsService());
</script>

{@render children()}

<Alerts {alertsService} {dialogsService} />
<Dialogs {dialogsService} />
