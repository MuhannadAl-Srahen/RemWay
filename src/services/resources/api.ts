import { supabase } from '@/lib/supabaseClient'
import type { ResourceItem } from '@/types'

/**
 * Fetch resources from the database
 * Reads the resources row and returns the requested JSONB column
 */
export async function getResources(
  type?: 'video' | 'documentation' | 'tools'
): Promise<ResourceItem[]> {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('docs, videos, tools')
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[getResources] Supabase error:', error)
      console.error(
        '[getResources] ⚠️  Please apply RLS policies - see database-setup.sql'
      )
      return []
    }

    if (!data) {
      return []
    }

    const row = data as Record<string, unknown>

    const ensureArray = (val: unknown): ResourceItem[] =>
      Array.isArray(val) ? (val as ResourceItem[]) : []

    switch (type) {
      case 'video':
        return ensureArray(row.videos ?? row.video)
      case 'documentation':
        return ensureArray(row.docs ?? row.documentation)
      case 'tools':
        return ensureArray(row.tools ?? row.tool)
      default:
        return []
    }
  } catch (err) {
    console.error('[getResources] Unexpected error:', err)
    return []
  }
}
