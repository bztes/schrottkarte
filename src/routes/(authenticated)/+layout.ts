import type { LayoutLoad } from './$types';
import { getUser } from '#lib/remote/auth.remote.js';

// lives in the (authenticated) group so it runs again after signing in on /auth
export const load: LayoutLoad = async () => {
  return {
    user: await getUser(),
  };
};
