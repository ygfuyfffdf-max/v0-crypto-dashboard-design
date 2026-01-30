/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔍 CHRONOS INFINITY 2026 — ALGOLIA SEARCH SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Servicio de búsqueda avanzada:
 * - Full-text search
 * - Faceted search
 * - Geo search
 * - Analytics de búsqueda
 * - Índices múltiples
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { algoliasearch, type SearchClient as AlgoliaClient } from 'algoliasearch'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

// Re-export client type
export type SearchClient = AlgoliaClient
export type SearchIndex = ReturnType<AlgoliaClient['initIndex']>

export interface SearchableRecord {
  objectID: string
  [key: string]: unknown
}

export interface SearchOptions {
  query: string
  filters?: string
  facetFilters?: string[][]
  numericFilters?: string[]
  page?: number
  hitsPerPage?: number
  attributesToRetrieve?: string[]
  attributesToHighlight?: string[]
  facets?: string[]
  distinct?: boolean | number
  analytics?: boolean
  userToken?: string
}

export interface SearchResult<T> {
  hits: T[]
  nbHits: number
  page: number
  nbPages: number
  hitsPerPage: number
  processingTimeMS: number
  query: string
  facets?: Record<string, Record<string, number>>
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// INDEX DEFINITIONS — CHRONOS SPECIFIC
// ═══════════════════════════════════════════════════════════════════════════════════════

export const ChronosIndices = {
  // Main indices
  PRODUCTS: 'chronos_products',
  CLIENTS: 'chronos_clients',
  ORDERS: 'chronos_orders',
  SALES: 'chronos_sales',
  
  // Supporting indices
  CATEGORIES: 'chronos_categories',
  DISTRIBUTORS: 'chronos_distributors',
  
  // Search suggestions
  SUGGESTIONS: 'chronos_suggestions',
  
  // Global search (combined)
  GLOBAL: 'chronos_global',
} as const

export type IndexName = (typeof ChronosIndices)[keyof typeof ChronosIndices]

// ═══════════════════════════════════════════════════════════════════════════════════════
// ALGOLIA CLIENT
// ═══════════════════════════════════════════════════════════════════════════════════════

let searchClient: SearchClient | null = null
let adminClient: SearchClient | null = null

/**
 * Get search client (read-only)
 */
export function getSearchClient(): SearchClient {
  if (searchClient) return searchClient

  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
  const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY

  if (!appId || !searchKey) {
    throw new Error('❌ Algolia search credentials not configured')
  }

  searchClient = algoliasearch(appId, searchKey)
  return searchClient
}

/**
 * Get admin client (read-write)
 */
export function getAdminClient(): SearchClient {
  if (adminClient) return adminClient

  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID
  const adminKey = process.env.ALGOLIA_ADMIN_KEY

  if (!appId || !adminKey) {
    throw new Error('❌ Algolia admin credentials not configured')
  }

  adminClient = algoliasearch(appId, adminKey)
  return adminClient
}

/**
 * Get index
 */
export function getIndex(indexName: IndexName | string): SearchIndex {
  const client = getSearchClient()
  return client.initIndex(indexName)
}

/**
 * Get admin index
 */
export function getAdminIndex(indexName: IndexName | string): SearchIndex {
  const client = getAdminClient()
  return client.initIndex(indexName)
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SEARCH OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Search in index
 */
export async function search<T extends SearchableRecord>(
  indexName: IndexName | string,
  options: SearchOptions
): Promise<SearchResult<T>> {
  const index = getIndex(indexName)
  
  const result = await index.search<T>(options.query, {
    filters: options.filters,
    facetFilters: options.facetFilters,
    numericFilters: options.numericFilters,
    page: options.page || 0,
    hitsPerPage: options.hitsPerPage || 20,
    attributesToRetrieve: options.attributesToRetrieve,
    attributesToHighlight: options.attributesToHighlight || ['*'],
    facets: options.facets,
    distinct: options.distinct,
    analytics: options.analytics !== false,
    userToken: options.userToken,
  })

  return {
    hits: result.hits,
    nbHits: result.nbHits,
    page: result.page,
    nbPages: result.nbPages,
    hitsPerPage: result.hitsPerPage,
    processingTimeMS: result.processingTimeMS,
    query: result.query,
    facets: result.facets,
  }
}

/**
 * Multi-index search
 */
export async function multiSearch<T extends SearchableRecord>(
  queries: Array<{
    indexName: IndexName | string
    query: string
    params?: Omit<SearchOptions, 'query'>
  }>
): Promise<SearchResult<T>[]> {
  const client = getSearchClient()
  
  const results = await client.multipleQueries<T>(
    queries.map((q) => ({
      indexName: q.indexName,
      query: q.query,
      params: {
        ...q.params,
        hitsPerPage: q.params?.hitsPerPage || 20,
      },
    }))
  )

  return results.results.map((result) => ({
    hits: result.hits,
    nbHits: result.nbHits,
    page: result.page,
    nbPages: result.nbPages,
    hitsPerPage: result.hitsPerPage,
    processingTimeMS: result.processingTimeMS,
    query: result.query,
    facets: result.facets,
  }))
}

/**
 * Global search across all indices
 */
export async function globalSearch<T extends SearchableRecord>(
  query: string,
  options?: {
    hitsPerPage?: number
    userToken?: string
  }
): Promise<{
  products: SearchResult<T>
  clients: SearchResult<T>
  orders: SearchResult<T>
  sales: SearchResult<T>
  totalHits: number
}> {
  const results = await multiSearch<T>([
    { indexName: ChronosIndices.PRODUCTS, query, params: options },
    { indexName: ChronosIndices.CLIENTS, query, params: options },
    { indexName: ChronosIndices.ORDERS, query, params: options },
    { indexName: ChronosIndices.SALES, query, params: options },
  ])

  return {
    products: results[0],
    clients: results[1],
    orders: results[2],
    sales: results[3],
    totalHits: results.reduce((acc, r) => acc + r.nbHits, 0),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// INDEX OPERATIONS (Admin)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Save object to index
 */
export async function saveObject<T extends SearchableRecord>(
  indexName: IndexName | string,
  object: T
): Promise<void> {
  const index = getAdminIndex(indexName)
  await index.saveObject(object)
}

/**
 * Save multiple objects
 */
export async function saveObjects<T extends SearchableRecord>(
  indexName: IndexName | string,
  objects: T[]
): Promise<void> {
  const index = getAdminIndex(indexName)
  await index.saveObjects(objects)
}

/**
 * Partial update object
 */
export async function partialUpdateObject<T extends Partial<SearchableRecord>>(
  indexName: IndexName | string,
  object: T & { objectID: string }
): Promise<void> {
  const index = getAdminIndex(indexName)
  await index.partialUpdateObject(object)
}

/**
 * Delete object from index
 */
export async function deleteObject(
  indexName: IndexName | string,
  objectID: string
): Promise<void> {
  const index = getAdminIndex(indexName)
  await index.deleteObject(objectID)
}

/**
 * Delete multiple objects
 */
export async function deleteObjects(
  indexName: IndexName | string,
  objectIDs: string[]
): Promise<void> {
  const index = getAdminIndex(indexName)
  await index.deleteObjects(objectIDs)
}

/**
 * Clear all objects from index
 */
export async function clearIndex(indexName: IndexName | string): Promise<void> {
  const index = getAdminIndex(indexName)
  await index.clearObjects()
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// INDEX SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface IndexSettings {
  searchableAttributes?: string[]
  attributesForFaceting?: string[]
  customRanking?: string[]
  ranking?: string[]
  attributesToHighlight?: string[]
  attributesToSnippet?: string[]
  distinct?: boolean | number
  attributeForDistinct?: string
  typoTolerance?: boolean | 'min' | 'strict'
  minWordSizefor1Typo?: number
  minWordSizefor2Typos?: number
}

/**
 * Configure index settings
 */
export async function setIndexSettings(
  indexName: IndexName | string,
  settings: IndexSettings
): Promise<void> {
  const index = getAdminIndex(indexName)
  await index.setSettings(settings)
}

/**
 * Get index settings
 */
export async function getIndexSettings(
  indexName: IndexName | string
): Promise<IndexSettings> {
  const index = getIndex(indexName)
  return await index.getSettings()
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CHRONOS INDEX CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const ChronosIndexSettings: Record<IndexName, IndexSettings> = {
  [ChronosIndices.PRODUCTS]: {
    searchableAttributes: ['name', 'sku', 'description', 'category'],
    attributesForFaceting: ['category', 'brand', 'filterOnly(price)', 'inStock'],
    customRanking: ['desc(popularity)', 'asc(price)'],
    attributesToHighlight: ['name', 'description'],
  },
  [ChronosIndices.CLIENTS]: {
    searchableAttributes: ['name', 'email', 'phone', 'company'],
    attributesForFaceting: ['type', 'status', 'filterOnly(creditLimit)'],
    customRanking: ['desc(totalPurchases)'],
    attributesToHighlight: ['name', 'company'],
  },
  [ChronosIndices.ORDERS]: {
    searchableAttributes: ['orderNumber', 'clientName', 'products.name'],
    attributesForFaceting: ['status', 'filterOnly(total)', 'filterOnly(date)'],
    customRanking: ['desc(date)'],
    attributesToHighlight: ['orderNumber', 'clientName'],
  },
  [ChronosIndices.SALES]: {
    searchableAttributes: ['saleNumber', 'clientName', 'seller'],
    attributesForFaceting: ['status', 'paymentMethod', 'filterOnly(total)'],
    customRanking: ['desc(date)'],
    attributesToHighlight: ['saleNumber', 'clientName'],
  },
  [ChronosIndices.CATEGORIES]: {
    searchableAttributes: ['name', 'slug'],
    attributesToHighlight: ['name'],
  },
  [ChronosIndices.DISTRIBUTORS]: {
    searchableAttributes: ['name', 'code', 'zone'],
    attributesForFaceting: ['zone', 'status'],
    customRanking: ['desc(totalSales)'],
    attributesToHighlight: ['name'],
  },
  [ChronosIndices.SUGGESTIONS]: {
    searchableAttributes: ['query'],
    customRanking: ['desc(popularity)'],
  },
  [ChronosIndices.GLOBAL]: {
    searchableAttributes: ['title', 'content', 'type'],
    attributesForFaceting: ['type'],
    attributesToHighlight: ['title', 'content'],
  },
}

/**
 * Initialize all Chronos indices with settings
 */
export async function initializeAllIndices(): Promise<void> {
  const indices = Object.entries(ChronosIndexSettings)
  
  for (const [indexName, settings] of indices) {
    await setIndexSettings(indexName, settings)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  latency: number
  details?: string
}> {
  const start = Date.now()
  
  try {
    const index = getIndex(ChronosIndices.GLOBAL)
    await index.search('', { hitsPerPage: 1 })
    const latency = Date.now() - start
    
    return {
      status: latency < 200 ? 'healthy' : 'degraded',
      latency,
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const algoliaSearch = {
  searchClient: getSearchClient,
  adminClient: getAdminClient,
  getIndex,
  getAdminIndex,
  search,
  multiSearch,
  globalSearch,
  objects: {
    save: saveObject,
    saveMany: saveObjects,
    update: partialUpdateObject,
    delete: deleteObject,
    deleteMany: deleteObjects,
    clear: clearIndex,
  },
  settings: {
    get: getIndexSettings,
    set: setIndexSettings,
    initializeAll: initializeAllIndices,
  },
  health: healthCheck,
  indices: ChronosIndices,
  indexSettings: ChronosIndexSettings,
}

export default algoliaSearch
