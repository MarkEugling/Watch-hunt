import { search as searchSothebys, SOURCE as SOTHEBYS } from './sothebys.js'
import { search as searchChristies, SOURCE as CHRISTIES } from './christies.js'
import { search as searchPhillips, SOURCE as PHILLIPS } from './phillips.js'
import { search as searchAntiquorum, SOURCE as ANTIQUORUM } from './antiquorum.js'
import { search as searchChrono24, SOURCE as CHRONO24 } from './chrono24.js'
import { search as searchWatchCharts, SOURCE as WATCHCHARTS } from './watchcharts.js'
import { search as searchWatchPatrol, SOURCE as WATCHPATROL } from './watchpatrol.js'
import { search as searchEbay, SOURCE as EBAY } from './ebay.js'

const SEARCHERS = [
  { name: SOTHEBYS, fn: searchSothebys, type: 'auction' },
  { name: CHRISTIES, fn: searchChristies, type: 'auction' },
  { name: PHILLIPS, fn: searchPhillips, type: 'auction' },
  { name: ANTIQUORUM, fn: searchAntiquorum, type: 'auction' },
  { name: CHRONO24, fn: searchChrono24, type: 'grey' },
  { name: WATCHCHARTS, fn: searchWatchCharts, type: 'grey' },
  { name: WATCHPATROL, fn: searchWatchPatrol, type: 'grey' },
  { name: EBAY, fn: searchEbay, type: 'grey' },
]

/**
 * Run all searchers for a given watch in parallel.
 * Returns { results: [], sourceStatus: {}, searchedAt }
 */
export async function runAllSearches({ query, maxPrice }) {
  const searchedAt = new Date().toISOString()

  const settled = await Promise.allSettled(
    SEARCHERS.map(async ({ name, fn, type }) => {
      const start = Date.now()
      try {
        const results = await fn({ query, maxPrice })
        return { name, type, results, ms: Date.now() - start, error: null }
      } catch (err) {
        return { name, type, results: [], ms: Date.now() - start, error: err.message }
      }
    })
  )

  const allResults = []
  const sourceStatus = {}

  for (const outcome of settled) {
    const { name, type, results, ms, error } = outcome.status === 'fulfilled'
      ? outcome.value
      : { name: 'Unknown', type: 'unknown', results: [], ms: 0, error: outcome.reason?.message }

    sourceStatus[name] = {
      count: results.length,
      ms,
      error,
      type,
    }

    for (const r of results) {
      allResults.push({ ...r, sourceType: type })
    }
  }

  // Sort: items with actual prices first (ascending), then link-only results
  allResults.sort((a, b) => {
    if (a.isLink && !b.isLink) return 1
    if (!a.isLink && b.isLink) return -1
    return (a.price || 0) - (b.price || 0)
  })

  return { results: allResults, sourceStatus, searchedAt }
}

export { SEARCHERS }
