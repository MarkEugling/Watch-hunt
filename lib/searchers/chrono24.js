export const SOURCE = 'Chrono24'
export const SOURCE_URL = 'https://www.chrono24.com'

export async function search({ query, maxPrice }) {
  const results = []
  try {
    const encodedQuery = encodeURIComponent(query)
    // Chrono24 JSON search endpoint
    const url = `https://www.chrono24.com/search/index.htm?query=${encodedQuery}&maxPrice=${maxPrice}&currencyId=USD&resultview=list&pageSize=20&dosearch=dosearch`

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json, text/html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(12000),
    })

    if (!res.ok) return results

    // Try to parse as JSON first; fall back to constructing a link result
    const text = await res.text()

    // Try to extract JSON from page
    const jsonMatch = text.match(/"articleItems"\s*:\s*(\[[\s\S]*?\])\s*[,}]/)
    if (jsonMatch) {
      try {
        const items = JSON.parse(jsonMatch[1])
        for (const item of items.slice(0, 10)) {
          const price = item.price || item.priceValue || 0
          if (price > maxPrice) continue
          results.push({
            source: SOURCE,
            title: `${item.manufacturer || ''} ${item.name || item.modelName || query}`.trim(),
            price: price,
            priceDisplay: price ? `$${price.toLocaleString()}` : 'Price on request',
            saleDate: null,
            saleName: 'Grey Market',
            lotNumber: null,
            url: item.detailPageUrl
              ? `https://www.chrono24.com${item.detailPageUrl}`
              : `https://www.chrono24.com/search/index.htm?query=${encodedQuery}&maxPrice=${maxPrice}`,
            imageUrl: item.image || item.imageUrl || null,
            currency: 'USD',
          })
        }
        return results
      } catch {
        // Fall through to link result
      }
    }

    // If we can't parse the results, return a search link result
    const count = (text.match(/"resultCount"\s*:\s*(\d+)/) || [])[1]
    if (count && parseInt(count) > 0) {
      results.push({
        source: SOURCE,
        title: `${count} listings found for "${query}"`,
        price: null,
        priceDisplay: `Up to $${maxPrice.toLocaleString()}`,
        saleDate: null,
        saleName: 'Grey Market',
        lotNumber: null,
        url: `https://www.chrono24.com/search/index.htm?query=${encodedQuery}&maxPrice=${maxPrice}&currencyId=USD&resultview=list`,
        imageUrl: null,
        currency: 'USD',
        isLink: true,
      })
    }
  } catch (err) {
    console.error('[Chrono24] Search error:', err.message)
  }
  return results
}
