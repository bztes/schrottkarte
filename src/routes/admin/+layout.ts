import type { LayoutLoad } from './$types';
import { getSetupMode } from '#lib/remote/admin.remote.js';
import { getUser } from '#lib/remote/auth.remote.js';

export const load: LayoutLoad = async () => {
  const [setupMode, user] = await Promise.all([getSetupMode(), getUser()]);
  return { setupMode, user };
};
