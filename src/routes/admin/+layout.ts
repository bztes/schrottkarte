import type { LayoutLoad } from './$types';
import { getUser } from '#lib/remote/auth.remote.js';

export const load: LayoutLoad = async () => {
  return { user: await getUser() };
};
