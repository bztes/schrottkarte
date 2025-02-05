<script lang="ts" module>
  import { createContext } from '$lib/utils';
  import { createDialogsService, type DialogsService } from '$lib/dialogs.svelte';
  import { createAlertsService, type AlertsService } from '$lib/alerts.svelte';
  import { createMarkersService, type MarkersService } from '$lib/markers.svelte';
  import { createDrawingsService, type DrawingsService } from '$lib/drawings.svelte';
  import { createTagsService, type TagsService } from '$lib/tags.svelte';

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
  import '../../global.css';
  import { goto, invalidate } from '$app/navigation';
  import Alerts from '$lib/components/Alerts.svelte';
  import { onMount } from 'svelte';
  import Dialogs from '$lib/components/Dialogs.svelte';

  let { children, data: pageData } = $props();

  const dialogsService = createDialogsService();
  setDialogsService(dialogsService);
  const alertsService = createAlertsService();
  setAlertsService(alertsService);
  setMarkersService(createMarkersService(pageData.supabase, alertsService));
  setDrawingService(createDrawingsService(pageData.supabase, alertsService));
  setTagsService(createTagsService(pageData.supabase, alertsService));

  onMount(() => {
    const response = pageData.supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession === null) {
        goto('/auth');
      } else if (newSession?.expires_at !== pageData.session?.expires_at) {
        invalidate('supabase:auth');
      }
    });

    return () => response.data.subscription.unsubscribe();
  });
</script>

{@render children()}

<Alerts {alertsService} {dialogsService} />
<Dialogs {dialogsService} />
