import { NextResponse } from 'next/server'
import { runAllSearches } from '../../../lib/searchers/index.js'
import { readWatches, updateWatch } from '../../../lib/storage.js'

// Search a single watch by ID
export async function POST(request) {
  try {
    const { id, all } = await request.json()

    if (all) {
      // Search all watches
      const watches = readWatches()
      const results = await Promise.all(
        watches.map(async (watch) => {
          const query = [watch.brand, watch.model, watch.reference].filter(Boolean).join(' ')
          const searchResult = await runAllSearches({ query, maxPrice: watch.maxPrice })
          updateWatch(watch.id, {
            lastSearched: searchResult.searchedAt,
            results: searchResult.results,
            sourceStatus: searchResult.sourceStatus,
          })
          return { watchId: watch.id, ...searchResult }
        })
      )
      return NextResponse.json({ success: true, results })
    }

    // Search a single watch
    const watches = readWatches()
    const watch = watches.find(w => w.id === id)
    if (!watch) {
      return NextResponse.json({ error: 'Watch not found' }, { status: 404 })
    }

    const query = [watch.brand, watch.model, watch.reference].filter(Boolean).join(' ')
    const searchResult = await runAllSearches({ query, maxPrice: watch.maxPrice })

    // Save results to disk
    updateWatch(watch.id, {
      lastSearched: searchResult.searchedAt,
      results: searchResult.results,
      sourceStatus: searchResult.sourceStatus,
    })

    return NextResponse.json({ success: true, watchId: id, ...searchResult })
  } catch (err) {
    console.error('[Search API] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
