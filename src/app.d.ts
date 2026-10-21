import type { Session } from '#lib/server/auth.js';
import type { AppUser } from '#lib/types.js';
import 'unplugin-icons/types/svelte';

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: Session['session'] | null;
      user: AppUser | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
