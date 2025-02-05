import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase.types';
import type { AlertsService } from './alerts.svelte';
import { SvelteSet } from 'svelte/reactivity';

export type TagRow = Database['public']['Tables']['tags']['Row'];
export type TagsService = ReturnType<typeof createTagsService>;

export function createTagsService(supabase: SupabaseClient<Database>, alerts: AlertsService) {
  const tagsSet = new SvelteSet<string>();
  const tags = $derived(Array.from(tagsSet.values()).sort());

  const channel = supabase
    .channel('tags-changes')
    .on<TagRow>('postgres_changes', { event: '*', schema: 'public', table: 'tags' }, (payload) => {
      if (payload.eventType === 'INSERT') {
        tagsSet.add(payload.new.tag);
      }
    })
    .subscribe();

  loadTags();

  async function loadTags() {
    const { data, error } = await supabase.from('tags').select('tag').order('tag');
    if (error) {
      console.error('Failed to fetch tags', error);
      alerts.error({ title: 'Failed to fetch tags', msg: error.message, error });
      return;
    }
    tagsSet.clear();
    data.forEach((r) => tagsSet.add(r.tag));
  }

  return {
    get values() {
      return tags;
    },
    destroy: () => channel.unsubscribe(),
  };
}
