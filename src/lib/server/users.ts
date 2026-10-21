import type { UserRole } from '#lib/types.js';
import type { Db, Tx } from './db/index.js';
import { account, user } from './db/schema.js';

export interface NewUser {
  id?: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Inserts a user with an email/password account. `passwordHash` may be a bcrypt hash (imported from Supabase)
 * or a hash created by better-auth, see the `verify` option in `auth.ts`.
 */
export function insertUser(tx: Db | Tx, data: NewUser, passwordHash: string | null) {
  const now = new Date();
  const created = tx
    .insert(user)
    .values({
      id: data.id ?? crypto.randomUUID(),
      email: data.email.toLowerCase(),
      name: data.name,
      role: data.role,
      emailVerified: data.emailVerified ?? false,
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    })
    .returning()
    .get();

  if (passwordHash) {
    insertCredentialAccount(tx, created.id, passwordHash, created.createdAt);
  }

  return created;
}

/**
 * Inserts the better-auth email/password account of a user.
 */
export function insertCredentialAccount(
  tx: Db | Tx,
  userId: string,
  passwordHash: string,
  createdAt = new Date(),
) {
  tx.insert(account)
    .values({
      id: crypto.randomUUID(),
      accountId: userId,
      providerId: 'credential',
      userId,
      password: passwordHash,
      createdAt,
      updatedAt: createdAt,
    })
    .run();
}
