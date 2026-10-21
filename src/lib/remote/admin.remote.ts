import { error, invalid, redirect } from '@sveltejs/kit';
import { command, form, getRequestEvent, query } from '$app/server';
import { hashPassword } from 'better-auth/crypto';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '#lib/server/db/index.js';
import { account, session, user } from '#lib/server/db/schema.js';
import { isSetupMode, requireAdminOrSetup, requireUser } from '#lib/server/guard.js';
import { insertCredentialAccount, insertUser } from '#lib/server/users.js';
import { importFromSupabase } from '#lib/server/supabase-import.js';
import { userRoles } from '#lib/types.js';

export const getSetupMode = query(async () => {
  return isSetupMode();
});

export const getUsers = query(async () => {
  requireAdminOrSetup();
  return db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(user.email)
    .all();
});

export const createUser = form(
  z.object({
    email: z.email(),
    name: z.string().optional(),
    _password: z.string().min(8, 'The password must be at least 8 characters long'),
    role: z.enum(userRoles),
  }),
  async ({ email, name, _password, role }) => {
    const setupMode = requireAdminOrSetup();

    const existing = db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email.toLowerCase()))
      .get();
    if (existing) {
      invalid('A user with this email address already exists');
    }

    insertUser(
      db,
      {
        email,
        name: name || email.split('@')[0],
        // the first user has to be able to manage the others
        role: setupMode ? 'admin' : role,
      },
      await hashPassword(_password),
    );

    if (setupMode) {
      redirect(303, '/auth');
    }
    void getUsers().refresh();
  },
);

export const updateUserRole = command(
  z.object({ id: z.string(), role: z.enum(userRoles) }),
  async ({ id, role }) => {
    const me = requireUser('admin');
    if (id === me.id) {
      error(400, 'You cannot change your own role');
    }
    db.update(user).set({ role }).where(eq(user.id, id)).run();
    await getUsers().refresh();
  },
);

export const setUserPassword = command(
  z.object({ id: z.string(), password: z.string().min(8) }),
  async ({ id, password }) => {
    requireUser('admin');
    const hash = await hashPassword(password);
    db.transaction((tx) => {
      const credential = tx
        .select({ id: account.id })
        .from(account)
        .where(and(eq(account.userId, id), eq(account.providerId, 'credential')))
        .get();
      if (credential) {
        tx.update(account).set({ password: hash }).where(eq(account.id, credential.id)).run();
      } else {
        insertCredentialAccount(tx, id, hash);
      }
      // sign the user out everywhere
      tx.delete(session).where(eq(session.userId, id)).run();
    });
  },
);

export const deleteUser = command(z.string(), async (id) => {
  const me = requireUser('admin');
  if (id === me.id) {
    error(400, 'You cannot delete yourself');
  }
  db.delete(user).where(eq(user.id, id)).run();
  await getUsers().refresh();
});

export const importSupabase = form(
  z.object({
    _connectionString: z
      .string()
      .regex(/^postgres(ql)?:\/\//, 'Expected a connection string like postgresql://…'),
    replace: z.boolean().optional(),
  }),
  async ({ _connectionString, replace }) => {
    requireAdminOrSetup();
    const { locals } = getRequestEvent();

    try {
      const result = await importFromSupabase({
        connectionString: _connectionString,
        replace: replace ?? false,
      });
      void getUsers().refresh();
      return { ...result, signedIn: locals.user !== null };
    } catch (e) {
      console.error('Supabase import failed', e);
      invalid(`Import failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  },
);
