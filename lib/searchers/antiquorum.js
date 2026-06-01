export const SOURCE = 'Antiquorum'
export const SOURCE_URL = 'https://www.antiquorum.swiss'

export async function search({ query, maxPrice }) {
  const results = []
  try {
    const encodedQuery = encodeURIComponent(query)
    // Antiquorum uses a search endpoint with JSON response
    const url = `https://www.antiquorum.swiss/en/api/lots?search=${encodedQuery}&maxEstimate=${maxPrice}&currency=CHF&upcoming=1&limit=20`

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) return results

    const data = await res.json()
    const lots = data?.items || data?.lots || data?.data || []

    for (const lot of lots) {
      const lowEst = lot.estimateLow || lot.low || lot.estimate_min || 0
      const highEst = lot.estimateHigh || lot.high || lot.estimate_max || 0
      // Convert CHF to USD roughly (1 CHF ≈ 1.1 USD)
      const priceUSD = Math.round((lowEst || highEst || 0) * 1.1)

      if (priceUSD > maxPrice) continue

      results.push({
        source: SOURCE,
        title: lot.title || lot.description || query,
        price: priceUSD,
        priceDisplay: lowEst
          ? `CHF ${lowEst.toLocaleString()} – ${(highEst || lowEst * 1.5).toLocaleString()} est.`
          : 'Est. on request',
        saleDate: lot.saleDate || lot.date || null,
        saleName: lot.saleName || lot.auction || null,
        lotNumber: lot.lotNumber || lot.lot || null,
        url: lot.url || lot.link || `https://www.antiquorum.swiss/en/lots?search=${encodedQuery}`,
        imageUrl: lot.image || lot.thumbnail || null,
        currency: 'CHF',
      })
    }
  } catch (err) {
    console.error('[Antiquorum] Search error:', err.message)
  }
  return results
}
