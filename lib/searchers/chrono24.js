export const SOURCE = 'Chrono24'
export const SOURCE_URL = 'https://www.chrono24.com'

/** Pull dealer/seller info out of a Chrono24 article item when present */
function extractSeller(item) {
  const name = item.dealerName || item.merchantName || item.sellerName || null
  const rating = item.dealerRating ?? item.sellerRating ?? item.rating ?? null
  const reviewCount = item.dealerReviewCount ?? item.ratingCount ?? item.reviewCount ?? null
  const isDealer = item.commercial === true || item.sellerType === 'dealer' || !!item.dealerName
  if (!name && rating == null && reviewCount == null) return null
  return { name, rating, reviewCount, isDealer }
}

export async function search({ query, brand, model, reference, maxPrice }) {
  const results = []
  // Chrono24 indexes reference numbers extremely well — prefer ref when set
  const baseQuery = reference
    ? [brand, reference].filter(Boolean).join(' ')
    : [brand, model].filter(Boolean).join(' ') || query
  const encodedQuery = encodeURIComponent(baseQuery)
  // Fetch WITHOUT a price ceiling so over-budget listings still appear
  // (with their budget delta) instead of being silently hidden
  const fetchUrl = `https://www.chrono24.com/search/index.htm?query=${encodedQuery}&dosearch=true&currencyId=USD`
  const browseUrl = `https://www.chrono24.com/search/index.htm?query=${encodedQuery}&dosearch=true&priceTo=${maxPrice}&currencyId=USD`

  try {
    const res = await fetch(fetchUrl, {
      headers: {
        'Accept': 'application/json, text/html',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(12000),
    })

    if (res.ok) {
      const text = await res.text()

      // Listing data embedded in the real results page — URLs here are genuine
      const jsonMatch = text.match(/"articleItems"\s*:\s*(\[[\s\S]*?\])\s*[,}]/)
      if (jsonMatch) {
        try {
          const items = JSON.parse(jsonMatch[1])
          const parsed = []
          for (const item of items) {
            const price = item.price || item.priceValue || 0
            // Only emit listings whose URL comes from the page itself
            if (!item.detailPageUrl) continue
            parsed.push({
              source: SOURCE,
              title: `${item.manufacturer || ''} ${item.name || item.modelName || baseQuery}`.trim(),
              price: price,
              priceDisplay: price ? `$${price.toLocaleString()}` : 'Price on request',
              saleDate: null,
              saleName: 'Grey Market',
              lotNumber: null,
              url: `https://www.chrono24.com${item.detailPageUrl}`,
              imageUrl: item.image || item.imageUrl || null,
              currency: 'USD',
              seller: extractSeller(item),
            })
          }
          // Cheapest first, cap at 10
          parsed.sort((a, b) => (a.price || Infinity) - (b.price || Infinity))
          results.push(...parsed.slice(0, 10))
        } catch {
          // fall through to search link below
        }
      }
    }
  } catch (err) {
    console.error('[Chrono24] Search error:', err.message)
  }

  // Always include the live price-filtered search link
  results.push({
    source: SOURCE,
    title: `Browse Chrono24 listings for "${baseQuery}"`,
    price: null,
    priceDisplay: `≤ $${maxPrice.toLocaleString()}`,
    saleDate: null,
    saleName: 'Search link · Price-filtered',
    url: browseUrl,
    imageUrl: null,
    currency: 'USD',
    isLink: true,
  })

  return results
}
