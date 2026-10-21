import { invalid } from '@sveltejs/kit';
import { form } from '$app/server';
import { z } from 'zod';
import { requireUser } from '#lib/server/guard.js';
import { importFromSupabase } from '#lib/server/supabase-import.js';
import { getUsers } from '#lib/remote/users.remote.js';

export const importSupabase = form(
  z.object({
    _connectionString: z
      .string()
      .regex(/^postgres(ql)?:\/\//, 'Expected a connection string like postgresql://…'),
    replace: z.boolean().optional(),
  }),
  async ({ _connectionString, replace }) => {
    requireUser('admin');

    try {
      const result = await importFromSupabase({
        connectionString: _connectionString,
        replace: replace ?? false,
      });
      void getUsers().refresh();
      return result;
    } catch (e) {
      console.error('Supabase import failed', e);
      invalid(`Import failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
);
