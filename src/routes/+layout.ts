import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { LayoutLoad } from './$types';
import type { Database } from '$lib/supabase.types';
import { jwtDecode } from 'jwt-decode';
import type { CustomJwtPayload, CustomUser } from '$lib/types';
import { searchQueryToFilters } from '$lib/filter.svelte';
import { parserLngLat, parserZoom } from '$lib/utils';

export const load: LayoutLoad = async ({ data, depends, fetch, url }) => {
  /**
   * Declare a dependency so the layout can be invalidated, for example, on
   * session refresh.
   */
  depends('supabase:auth');

  const supabase = isBrowser()
    ? createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: {
          fetch,
        },
      })
    : createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: {
          fetch,
        },
        cookies: {
          getAll() {
            return data.cookies;
          },
        },
      });

  /**
   * It's fine to use `getSession` here, because on the client, `getSession` is
   * safe, and on the server, it reads `session` from the `LayoutData`, which
   * safely checked the session using `safeGetSession`.
   */
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let customUser: CustomUser | null = null;
  if (session && user) {
    const userRole = jwtDecode<CustomJwtPayload>(session.access_token).user_role;
    customUser = Object.assign(user, { userRole });
  }

  const filters = searchQueryToFilters(url.searchParams.get('filter') ?? '');
  const center = parserLngLat(url.searchParams.get('center') ?? '');
  const zoom = parserZoom(url.searchParams.get('zoom') ?? '');

  return {
    session,
    supabase,
    user: customUser,
    filters,
    center,
    zoom,
  };
};
