export const SOURCE = 'NYC Diamond District'
export const SOURCE_URL = 'https://www.watchguynyc.com'

/**
 * Boutique / physical resellers — NYC Diamond District (W 47th St).
 * Shopify-based dealers expose a public search endpoint
 * (/search/suggest.json) with live inventory: real titles, prices, photos.
 * Verified June 2026.
 */
const SHOPIFY_DEALERS = [
  { name: 'WatchGuyNYC', base: 'https://www.watchguynyc.com', location: '47th St, NYC' },
  { name: 'The Watch King', base: 'https://thewatchkingnyc.com', location: '13 W 47th St, NYC' },
  { name: 'ECI Jewelers', base: 'https://www.ecijewelers.com', location: 'Diamond District, NYC' },
]

const LINK_DEALERS = [
  { name: 'Avi & Co.', url: 'https://www.aviandco.com/shop-luxury-watches-nyc', location: '15 W 47th St, NYC' },
  { name: 'Watch My Diamonds', url: 'https://watchmydiamonds.com', location: 'Diamond District, NYC' },
]

async function searchShopify(dealer, q) {
  const url = `${dealer.base}/search/suggest.json?q=${encodeURIComponent(q)}&resources[type]=product&resources[limit]=6`
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) return []
  const data = await res.json()
  return data?.resources?.results?.products || []
}

export async function search({ query, brand, model, reference, maxPrice }) {
  const results = []
  const refQuery = reference ? [brand, reference].filter(Boolean).join(' ') : null
  const modelQuery = [brand, model].filter(Boolean).join(' ') || query
  const baseQuery = refQuery || modelQuery

  const settled = await Promise.allSettled(
    SHOPIFY_DEALERS.map(async dealer => {
      let usedQuery = baseQuery
      let products = await searchShopify(dealer, baseQuery)
      // Ref-format mismatches are common — retry with brand+model
      if (!products.length && refQuery && modelQuery !== refQuery) {
        usedQuery = modelQuery
        products = await searchShopify(dealer, modelQuery)
      }
      return { dealer, products, usedQuery }
    })
  )

  for (const outcome of settled) {
    if (outcome.status !== 'fulfilled') continue
    const { dealer, products, usedQuery } = outcome.value
    for (const p of products.slice(0, 4)) {
      if (p.available === false) continue
      const price = Math.round(Number(p.price || p.price_min || 0))
      results.push({
        source: SOURCE,
        title: p.title,
        price,
        priceDisplay: price ? `$${price.toLocaleString()}` : 'Price on request',
        saleDate: null,
        saleName: `${dealer.name} · ${dealer.location}`,
        url: p.url ? `${dealer.base}${p.url.split('?')[0]}` : dealer.base,
        imageUrl: p.featured_image?.url || p.image || null,
        currency: 'USD',
        condition: /unworn|never worn/i.test(p.body || '') ? 'Unworn' : null,
        matchedQuery: usedQuery,
        seller: { name: dealer.name },
      })
    }
  }

  results.sort((a, b) => (a.price || Infinity) - (b.price || Infinity))
  const capped = results.slice(0, 10)

  // Non-parseable dealers as browse links
  for (const d of LINK_DEALERS) {
    capped.push({
      source: SOURCE,
      title: `Browse ${d.name} (${d.location})`,
      price: null,
      priceDisplay: `Budget $${maxPrice.toLocaleString()}`,
      saleDate: null,
      saleName: 'Search link · Physical dealer',
      url: d.url,
      imageUrl: null,
      currency: 'USD',
      isLink: true,
    })
  }

  return capped
}
