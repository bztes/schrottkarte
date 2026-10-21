import { getTags } from '#lib/remote/tags.remote.js';

export type TagsService = ReturnType<typeof createTagsService>;

export function createTagsService() {
  // live query, the server pushes new tags as soon as they are saved
  const tags = $derived(getTags());

  return {
    get values() {
      return tags.current ?? [];
    },
  };
}
