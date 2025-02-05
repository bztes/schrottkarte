import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export async function load({ url }) {
  const redirect = url.searchParams.get('redirect');
  return { redirect };
}

export const actions = {
  signin: async ({ request, locals }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString();
    const password = data.get('password')?.toString();
    const redirectTo = decodeURIComponent(data.get('redirect')?.toString() || '/');

    if (!email || !password) {
      return fail(400, { success: false });
    }

    const { error } = await locals.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return fail(400, { success: false });
    }

    return redirect(303, redirectTo);
  },
} satisfies Actions;
