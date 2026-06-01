export const SOURCE = 'Phillips'
export const SOURCE_URL = 'https://www.phillips.com'

export async function search({ query, maxPrice }) {
  const results = []
  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://www.phillips.com/api/lots?keywords=${encodedQuery}&status=upcoming&priceHigh=${maxPrice}&category=watches&count=20`

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Referer': 'https://www.phillips.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) return results

    const data = await res.json()
    const lots = data?.data || data?.lots || data?.results || []

    for (const lot of lots) {
      const lowEst = lot.lowEstimate || lot.low_estimate || lot.priceFrom || 0
      const highEst = lot.highEstimate || lot.high_estimate || lot.priceTo || 0
      const price = lowEst || highEst || 0

      if (price > maxPrice) continue

      results.push({
        source: SOURCE,
        title: lot.title || lot.name || query,
        price: price,
        priceDisplay: price
          ? `$${price.toLocaleString()} – $${(highEst || price * 1.5).toLocaleString()} est.`
          : 'Est. on request',
        saleDate: lot.saleDate || lot.sale_date || null,
        saleName: lot.saleName || lot.auction_name || null,
        lotNumber: lot.lotNumber || lot.lot_number || null,
        url: lot.url
          ? `https://www.phillips.com${lot.url}`
          : `https://www.phillips.com/search?keywords=${encodedQuery}&category=watches`,
        imageUrl: lot.image?.url || lot.imageUrl || null,
        currency: 'USD',
      })
    }
  } catch (err) {
    console.error('[Phillips] Search error:', err.message)
  }
  return results
}
