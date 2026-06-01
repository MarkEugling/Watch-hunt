export const SOURCE = "Christie's"
export const SOURCE_URL = 'https://www.christies.com'

export async function search({ query, maxPrice }) {
  const results = []
  try {
    const encodedQuery = encodeURIComponent(query)
    // Christie's internal discovery API
    const url = `https://www.christies.com/api/discovery/search?keyword=${encodedQuery}&categories=65&priceTo=${maxPrice}&currency=usd&rows=20&start=0&upcoming=true`

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Referer': 'https://www.christies.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) return results

    const data = await res.json()
    const lots = data?.lots?.lots || data?.lots || data?.results || []

    for (const lot of lots) {
      const lowEst = lot.price_realised || lot.estimate_low || lot.price?.from || 0
      const highEst = lot.estimate_high || lot.price?.to || 0
      const price = lowEst || highEst || 0

      if (price > maxPrice) continue

      results.push({
        source: SOURCE,
        title: lot.title || lot.object_type || query,
        price: price,
        priceDisplay: price
          ? `$${price.toLocaleString()} – $${(highEst || price * 1.5).toLocaleString()} est.`
          : 'Est. on request',
        saleDate: lot.sale_date || lot.end_date || null,
        saleName: lot.sale_name || lot.auction_title || null,
        lotNumber: lot.lot_number || null,
        url: lot.url
          ? `https://www.christies.com${lot.url}`
          : `https://www.christies.com/en/results?keyword=${encodedQuery}&department=65`,
        imageUrl: lot.primary_image?.thumbnail || lot.image?.src || null,
        currency: 'USD',
      })
    }
  } catch (err) {
    console.error("[Christie's] Search error:", err.message)
  }
  return results
}
