import type { Database } from '$lib/supabase.types';
import type { CustomUser } from '$lib/types';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import 'unplugin-icons/types/svelte';

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      supabase: SupabaseClient<Database>;
      safeGetSession: () => Promise<{ session: Session | null; user: CustomUser | null }>;
      session: Session | null;
      user: CustomUser | null;
    }
    interface PageData {
      session: Session | null;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
