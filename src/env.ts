import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
  DATABASE_PATH: {
    description: 'Path of the SQLite database file',
    schema: (value) => value || './data/schrottkarte.db',
  },
  BETTER_AUTH_SECRET: {
    description: 'Secret used to sign sessions, generate one with `openssl rand -base64 32`',
    schema: (value) => {
      if (!value || value.length < 32) {
        throw new Error(
          'must be at least 32 characters, generate one with `openssl rand -base64 32`',
        );
      }
      return value;
    },
  },
  ORIGIN: {
    description: 'Public origin of the app, e.g. https://schrottkarte.example.com',
    schema: (value) => value || undefined,
  },
});
