export const SOURCE = 'WatchPatrol'
export const SOURCE_URL = 'https://www.watchpatrol.net'

export async function search({ query, brand, model, maxPrice }) {
  const results = []
  const baseQuery = [brand, model].filter(Boolean).join(' ') || query
  try {
    const encodedQuery = encodeURIComponent(baseQuery)
    const url = `https://www.watchpatrol.net/api/listings?q=${encodedQuery}&max_price=${maxPrice}&currency=USD&sort=price`

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.watchpatrol.net/',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      // WatchPatrol has no public API; provide a direct search link
      results.push({
        source: SOURCE,
        title: `Search "${baseQuery}" on WatchPatrol`,
        price: null,
        priceDisplay: `≤ $${maxPrice.toLocaleString()}`,
        saleDate: null,
        saleName: 'Search link · Community listings',
        url: `https://www.watchpatrol.net/search?q=${encodedQuery}`,
        imageUrl: null,
        currency: 'USD',
        isLink: true,
      })
      return results
    }

    const data = await res.json()
    const listings = data?.results || data?.listings || []

    for (const item of listings) {
      const price = item.price || item.asking_price || 0
      if (price > maxPrice) continue

      results.push({
        source: SOURCE,
        title: item.title || item.name || query,
        price: price,
        priceDisplay: price ? `$${price.toLocaleString()}` : 'See listing',
        saleDate: item.date || item.listed_at || null,
        saleName: item.source || 'Grey Market',
        url: item.url || item.link || `https://www.watchpatrol.net/search?q=${encodedQuery}`,
        imageUrl: item.image || null,
        currency: 'USD',
      })
    }
  } catch (err) {
    console.error('[WatchPatrol] Search error:', err.message)
    results.push({
      source: SOURCE,
      title: `Search "${baseQuery}" on WatchPatrol`,
      price: null,
      priceDisplay: `≤ $${maxPrice.toLocaleString()}`,
      saleDate: null,
      saleName: 'Search link · Community listings',
      url: `https://www.watchpatrol.net/search?q=${encodeURIComponent(baseQuery)}`,
      imageUrl: null,
      currency: 'USD',
      isLink: true,
    })
  }
  return results
}
