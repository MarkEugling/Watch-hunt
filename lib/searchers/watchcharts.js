export const SOURCE = 'WatchCharts'
export const SOURCE_URL = 'https://marketplace.watchcharts.com'

export async function search({ query, maxPrice }) {
  const results = []
  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://marketplace.watchcharts.com/api/listings?q=${encodedQuery}&max_price=${maxPrice}&currency=USD&sort=price_asc&page_size=20`

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://marketplace.watchcharts.com/',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) return results

    const data = await res.json()
    const listings = data?.results || data?.listings || data?.data || []

    for (const item of listings) {
      const price = item.price || item.asking_price || 0
      if (price > maxPrice) continue

      results.push({
        source: SOURCE,
        title: `${item.brand || ''} ${item.model || item.title || query}`.trim(),
        price: price,
        priceDisplay: price ? `$${price.toLocaleString()}` : 'Price on request',
        saleDate: null,
        saleName: 'Grey Market',
        lotNumber: null,
        url: item.url || item.listing_url || `https://marketplace.watchcharts.com/listings?q=${encodedQuery}&max_price=${maxPrice}`,
        imageUrl: item.image || item.thumbnail || null,
        currency: 'USD',
        condition: item.condition || null,
        seller: item.seller || item.dealer || null,
      })
    }
  } catch (err) {
    console.error('[WatchCharts] Search error:', err.message)
    // On error, provide a direct search link
    results.push({
      source: SOURCE,
      title: `Search "${query}" on WatchCharts`,
      price: null,
      priceDisplay: `Up to $${maxPrice.toLocaleString()}`,
      saleDate: null,
      saleName: 'Grey Market',
      url: `https://marketplace.watchcharts.com/listings?q=${encodeURIComponent(query)}&max_price=${maxPrice}`,
      imageUrl: null,
      currency: 'USD',
      isLink: true,
    })
  }
  return results
}
