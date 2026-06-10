export const SOURCE = 'eBay'
export const SOURCE_URL = 'https://www.ebay.com'

// eBay category 31387 = Jewelry & Watches > Watches, Parts & Accessories > Wristwatches
const WRISTWATCH_CATEGORY = '31387'

function searchUrl(keywords, { maxPrice } = {}) {
  const params = new URLSearchParams({
    _nkw: keywords,
    _sacat: WRISTWATCH_CATEGORY,
    _udhi: String(maxPrice),
    _sop: '15', // price + shipping lowest first
  })
  return `https://www.ebay.com/sch/i.html?${params.toString()}`
}

export async function search({ query, brand, model, reference, maxPrice }) {
  const results = []
  try {
    // Brand + model is the reliable keyword set — appending the reference
    // usually over-constrains eBay's AND-matching and surfaces "similar" junk
    const baseQuery = [brand, model].filter(Boolean).join(' ') || query

    results.push({
      source: SOURCE,
      title: `Wristwatch listings: "${baseQuery}"`,
      price: null,
      priceDisplay: `≤ $${maxPrice.toLocaleString()}`,
      saleDate: null,
      saleName: 'Search link · Wristwatches category',
      url: searchUrl(baseQuery, { maxPrice }),
      imageUrl: null,
      currency: 'USD',
      isLink: true,
    })

    // Precise reference search — narrower, may miss listings that omit the ref
    if (reference) {
      const refQuery = [brand, reference].filter(Boolean).join(' ')
      results.push({
        source: SOURCE,
        title: `Exact reference: "${refQuery}"`,
        price: null,
        priceDisplay: `≤ $${maxPrice.toLocaleString()}`,
        saleDate: null,
        saleName: 'Search link · By reference',
        url: searchUrl(refQuery, { maxPrice }),
        imageUrl: null,
        currency: 'USD',
        isLink: true,
      })
    }
  } catch (err) {
    console.error('[eBay] Search error:', err.message)
  }
  return results
}
