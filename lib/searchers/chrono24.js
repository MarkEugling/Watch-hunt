export const SOURCE = 'Chrono24'
export const SOURCE_URL = 'https://www.chrono24.com'

/**
 * Parses Chrono24's server-rendered search results page.
 * Markup verified June 2026: each listing is
 *   <a href="/rolex/submariner-date--id46708592.htm" class="...listing-item-link...">
 *     <p class="text-bold text-sm ...">Rolex Submariner Date</p>
 *     <p class="text-ellipsis m-b-0 text-sm text-sm-md">116610LN</p>
 *     <p class="text-bold text-md m-b-0">$10,999</p>
 *     ... data-content="This dealer is from Miami, United States of America."
 */
function parseListings(html, baseQuery) {
  const out = []
  const blockRe = /<a href="([^"]*--id\d+\.htm)"[^>]*class="[^"]*listing-item-link[^"]*"[\s\S]*?<\/a>/g
  let m
  const seen = new Set()
  while ((m = blockRe.exec(html)) !== null) {
    const url = m[1]
    if (seen.has(url)) continue
    const block = m[0]

    const priceM = block.match(/<p class="text-bold text-md[^"]*"[^>]*>\s*\$?\s*([\d,]+)\s*<\/p>/)
    const titleM = block.match(/<p class="text-bold text-sm[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/p>/)
    const refM = block.match(/<p class="text-ellipsis[^"]*text-sm[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/p>/)
    const locM = block.match(/This dealer is from ([^."]+)/)
    const certified = block.includes('certified')

    if (!titleM) continue
    seen.add(url)

    const title = [titleM[1], refM ? refM[1] : null].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
    const price = priceM ? Number(priceM[1].replace(/,/g, '')) : 0

    out.push({
      source: SOURCE,
      title,
      price,
      priceDisplay: price ? `$${price.toLocaleString()}` : 'Price on request',
      saleDate: null,
      saleName: locM ? `Dealer · ${locM[1].trim()}` : 'Grey Market',
      lotNumber: null,
      url: `https://www.chrono24.com${url}`,
      imageUrl: null,
      currency: 'USD',
      condition: certified ? 'Chrono24 Certified available' : null,
      matchedQuery: baseQuery,
      seller: locM ? { name: locM[1].trim() } : null,
    })
  }
  return out
}

export async function search({ query, brand, model, reference, maxPrice }) {
  const results = []
  // Chrono24 indexes reference numbers extremely well — prefer ref when set
  const baseQuery = reference
    ? [brand, reference].filter(Boolean).join(' ')
    : [brand, model].filter(Boolean).join(' ') || query
  const encodedQuery = encodeURIComponent(baseQuery)
  // Fetch without a price ceiling so over-budget listings appear with deltas
  const fetchUrl = `https://www.chrono24.com/search/index.htm?query=${encodedQuery}&dosearch=true&currencyId=USD`
  const browseUrl = `https://www.chrono24.com/search/index.htm?query=${encodedQuery}&dosearch=true&priceTo=${maxPrice}&currencyId=USD`

  try {
    const res = await fetch(fetchUrl, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (res.ok) {
      const html = await res.text()
      const parsed = parseListings(html, baseQuery)
      if (parsed.length) {
        parsed.sort((a, b) => (a.price || Infinity) - (b.price || Infinity))
        results.push(...parsed.slice(0, 10))
      } else if (/captcha|cf-challenge|are you a robot/i.test(html) || html.length < 30000) {
        console.error('[Chrono24] Bot protection page returned, listings unavailable')
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
