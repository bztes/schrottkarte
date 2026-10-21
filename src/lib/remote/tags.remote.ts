import { getRequestEvent, query } from '$app/server';
import { once } from 'node:events';
import { db } from '#lib/server/db/index.js';
import { tags } from '#lib/server/db/schema.js';
import { requireUser } from '#lib/server/guard.js';
import { tagEvents } from '#lib/server/tags.js';

// shared by all subscribers, reloaded once per change instead of once per open tab
let cachedTags: string[] | undefined;
tagEvents.on('change', () => (cachedTags = undefined));

function loadTags() {
  cachedTags ??= db
    .select()
    .from(tags)
    .orderBy(tags.tag)
    .all()
    .map((r) => r.tag);
  return cachedTags;
}

export const getTags = query.live(async () => {
  requireUser();
  const { signal } = getRequestEvent().request;

  return (async function* () {
    while (!signal.aborted) {
      yield loadTags();
      try {
        await once(tagEvents, 'change', { signal });
      } catch {
        return;
      }
    }
  })();
});
