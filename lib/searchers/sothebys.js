export const SOURCE = 'Sotheby\'s'
export const SOURCE_URL = 'https://www.sothebys.com'

export async function search({ query, maxPrice }) {
  const results = []
  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://www.sothebys.com/api/lots/search?keyword=${encodedQuery}&estimateLow=0&estimateHigh=${maxPrice}&currency=USD&from=0&size=20&status=upcoming,open`

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) return results

    const data = await res.json()
    const lots = data?.lots || data?.results || data?.data?.lots || []

    for (const lot of lots) {
      const lowEst = lot.estimateLow || lot.lowEstimate || lot.estimate_low || 0
      const highEst = lot.estimateHigh || lot.highEstimate || lot.estimate_high || 0
      const price = lowEst || highEst || 0

      if (price > maxPrice) continue

      results.push({
        source: SOURCE,
        title: lot.title || lot.description || query,
        price: price,
        priceDisplay: price ? `$${price.toLocaleString()} – $${(highEst || price).toLocaleString()} est.` : 'Est. on request',
        saleDate: lot.saleDate || lot.auctionDate || lot.sale_date || null,
        saleName: lot.saleName || lot.auction_name || null,
        lotNumber: lot.lotNumber || lot.lot_number || null,
        url: lot.url ? `https://www.sothebys.com${lot.url}` : (lot.permalink || `https://www.sothebys.com/en/search#keyword=${encodedQuery}`),
        imageUrl: lot.image || lot.imageUrl || lot.hero_image || null,
        currency: 'USD',
      })
    }
  } catch (err) {
    console.error('[Sotheby\'s] Search error:', err.message)
  }
  return results
}
