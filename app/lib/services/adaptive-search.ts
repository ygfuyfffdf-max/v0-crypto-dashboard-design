// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔍 CHRONOS INFINITY 2026 — ADAPTIVE SEARCH SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Búsqueda adaptativa: Usa Algolia cuando está disponible, Fuse.js como fallback.
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import Fuse from 'fuse.js'
import CONFIG from './config'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface SearchableItem {
  id: string
  type: 'product' | 'client' | 'order' | 'sale' | 'other'
  title: string
  description?: string
  metadata?: Record<string, unknown>
}

export interface SearchResult<T = SearchableItem> {
  hits: T[]
  totalHits: number
  query: string
  mode: 'algolia' | 'fuse'
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// IN-MEMORY SEARCH INDEX (Fuse.js fallback)
// ═══════════════════════════════════════════════════════════════════════════════════════

const searchIndex = new Map<string, SearchableItem[]>()
let fuseInstance: Fuse<SearchableItem> | null = null

const fuseOptions: Fuse.IFuseOptions<SearchableItem> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'description', weight: 0.3 },
    { name: 'type', weight: 0.2 },
    { name: 'metadata', weight: 0.1 },
  ],
  threshold: 0.3,
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
  shouldSort: true,
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ALGOLIA CLIENT (LAZY LOAD)
// ═══════════════════════════════════════════════════════════════════════════════════════

let algoliaClient: unknown = null

async function getAlgoliaClient() {
  if (CONFIG.SEARCH_MODE !== 'algolia') return null
  
  if (!algoliaClient) {
    try {
      const { default: algoliasearch } = await import('algoliasearch')
      algoliaClient = algoliasearch(
        process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
        process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!
      )
    } catch {
      console.warn('⚠️ Algolia not available, using Fuse.js')
      return null
    }
  }
  
  return algoliaClient
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SEARCH FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Perform search using available provider
 */
export async function search<T extends SearchableItem>(
  query: string,
  options?: {
    type?: SearchableItem['type']
    limit?: number
  }
): Promise<SearchResult<T>> {
  const { type, limit = 20 } = options || {}

  // Try Algolia first
  if (CONFIG.SEARCH_MODE === 'algolia') {
    try {
      const client = await getAlgoliaClient()
      if (client) {
        const index = (client as ReturnType<typeof import('algoliasearch').default>).initIndex('chronos_global')
        const filters = type ? `type:${type}` : undefined
        
        const result = await index.search<T>(query, {
          hitsPerPage: limit,
          filters,
        })

        return {
          hits: result.hits,
          totalHits: result.nbHits,
          query,
          mode: 'algolia',
        }
      }
    } catch (error) {
      console.warn('⚠️ Algolia search failed, falling back to Fuse.js:', error)
    }
  }

  // Fallback to Fuse.js
  return searchWithFuse(query, { type, limit })
}

/**
 * Search using Fuse.js (local search)
 */
function searchWithFuse<T extends SearchableItem>(
  query: string,
  options?: {
    type?: SearchableItem['type']
    limit?: number
  }
): SearchResult<T> {
  const { type, limit = 20 } = options || {}

  // Get all items from index
  let items: SearchableItem[] = []
  searchIndex.forEach((indexItems) => {
    items.push(...indexItems)
  })

  // Filter by type if specified
  if (type) {
    items = items.filter((item) => item.type === type)
  }

  // Create or update Fuse instance
  fuseInstance = new Fuse(items, fuseOptions)

  // Perform search
  const results = fuseInstance.search(query, { limit })

  return {
    hits: results.map((r) => r.item) as T[],
    totalHits: results.length,
    query,
    mode: 'fuse',
  }
}

/**
 * Add items to search index
 */
export async function indexItems(
  collection: string,
  items: SearchableItem[]
): Promise<void> {
  // Update local index
  searchIndex.set(collection, items)

  // Try to sync with Algolia
  if (CONFIG.SEARCH_MODE === 'algolia') {
    try {
      // This would require admin key - only do server-side
      if (typeof window === 'undefined' && process.env.ALGOLIA_ADMIN_KEY) {
        const { default: algoliasearch } = await import('algoliasearch')
        const adminClient = algoliasearch(
          process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
          process.env.ALGOLIA_ADMIN_KEY
        )
        const index = adminClient.initIndex(`chronos_${collection}`)
        await index.saveObjects(items.map((item) => ({ objectID: item.id, ...item })))
      }
    } catch (error) {
      console.warn('⚠️ Failed to sync with Algolia:', error)
    }
  }
}

/**
 * Remove items from search index
 */
export async function removeItems(collection: string, ids: string[]): Promise<void> {
  // Update local index
  const items = searchIndex.get(collection) || []
  const filtered = items.filter((item) => !ids.includes(item.id))
  searchIndex.set(collection, filtered)

  // Try to sync with Algolia
  if (CONFIG.SEARCH_MODE === 'algolia' && typeof window === 'undefined') {
    try {
      if (process.env.ALGOLIA_ADMIN_KEY) {
        const { default: algoliasearch } = await import('algoliasearch')
        const adminClient = algoliasearch(
          process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
          process.env.ALGOLIA_ADMIN_KEY
        )
        const index = adminClient.initIndex(`chronos_${collection}`)
        await index.deleteObjects(ids)
      }
    } catch (error) {
      console.warn('⚠️ Failed to remove from Algolia:', error)
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const adaptiveSearch = {
  search,
  index: indexItems,
  remove: removeItems,
  mode: CONFIG.SEARCH_MODE,
}

export default adaptiveSearch
