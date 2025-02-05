import type { User } from '@supabase/supabase-js';
import type { Database } from './supabase.types';
import type { JwtPayload } from 'jwt-decode';

type JsonNode = string | number | boolean | null | undefined | JsonNode[];
export type Json = Record<string, JsonNode>;

export interface CustomJwtPayload extends JwtPayload {
  user_role: Database['public']['Enums']['app_role'];
}

export interface CustomUser extends User {
  userRole: Database['public']['Enums']['app_role'];
}
