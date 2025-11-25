// Typed wrapper around the JS supabase client so TypeScript imports resolve to a module
import { supabase as supabaseAny } from './supabaseClient.js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Re-export the runtime client with proper database typing
export const supabase: SupabaseClient<Database> =
  supabaseAny as unknown as SupabaseClient<Database>

export default supabase
