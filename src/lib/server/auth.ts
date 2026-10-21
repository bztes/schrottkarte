import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { hashPassword, verifyPassword } from 'better-auth/crypto';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { BETTER_AUTH_SECRET, ORIGIN } from '$app/env/private';
import bcrypt from 'bcryptjs';
import { db } from './db/index.js';
import * as schema from './db/schema.js';

export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  baseURL: ORIGIN,
  database: drizzleAdapter(db, { provider: 'sqlite', schema }),
  emailAndPassword: {
    enabled: true,
    // users are created by editors on the admin page
    disableSignUp: true,
    password: {
      hash: hashPassword,
      // users imported from Supabase still have bcrypt hashes
      verify: async ({ hash, password }) =>
        hash.startsWith('$2') ? bcrypt.compare(password, hash) : verifyPassword({ hash, password }),
    },
  },
  user: {
    additionalFields: {
      role: { type: 'string', required: false, defaultValue: 'street', input: false },
    },
  },
  plugins: [sveltekitCookies(getRequestEvent)],
});

export type Session = typeof auth.$Infer.Session;
