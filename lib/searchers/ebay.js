export const SOURCE = 'eBay'
export const SOURCE_URL = 'https://www.ebay.com'

// eBay category 31387 = Jewelry & Watches > Watches, Parts & Accessories > Wristwatches
const WRISTWATCH_CATEGORY = '31387'

let cachedToken = null

/** OAuth client-credentials token for the eBay Browse API */
async function getToken() {
  const id = process.env.EBAY_CLIENT_ID
  const secret = process.env.EBAY_CLIENT_SECRET
  if (!id || !secret) return null
  if (cachedToken && Date.now() < cachedToken.exp - 60000) return cachedToken.value

  const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
    },
    body: 'grant_type=client_credentials&scope=' + encodeURIComponent('https://api.ebay.com/oauth/api_scope'),
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`eBay token request failed (${res.status})`)
  const data = await res.json()
  cachedToken = { value: data.access_token, exp: Date.now() + (data.expires_in || 7200) * 1000 }
  return cachedToken.value
}

/** Real listings from the official Browse API */
async function browseSearch(token, q, maxPrice) {
  // Price floor filters out straps/bezels/parts that pollute price-ascending sort
  const floor = Math.max(100, Math.round(maxPrice * 0.25))
  const ceiling = Math.round(maxPrice * 2)
  const params = new URLSearchParams({
    q,
    category_ids: WRISTWATCH_CATEGORY,
    limit: '10',
    sort: 'price',
    filter: `priceCurrency:USD,price:[${floor}..${ceiling}]`,
  })
  const res = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
    },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`eBay search failed (${res.status})`)
  const data = await res.json()
  return data.itemSummaries || []
}

function searchLinkUrl(keywords, maxPrice) {
  const params = new URLSearchParams({
    _nkw: keywords,
    _sacat: WRISTWATCH_CATEGORY,
    _udhi: String(maxPrice),
    _sop: '15',
  })
  return `https://www.ebay.com/sch/i.html?${params.toString()}`
}

function linkResult(keywords, maxPrice, label) {
  return {
    source: SOURCE,
    title: `Browse eBay listings for "${keywords}"`,
    price: null,
    priceDisplay: `≤ $${maxPrice.toLocaleString()}`,
    saleDate: null,
    saleName: label,
    url: searchLinkUrl(keywords, maxPrice),
    imageUrl: null,
    currency: 'USD',
    isLink: true,
  }
}

export async function search({ query, brand, model, reference, maxPrice }) {
  const baseQuery = [brand, model].filter(Boolean).join(' ') || query
  const refQuery = reference ? [brand, reference].filter(Boolean).join(' ') : null

  // Preferred path: official Browse API → real listings with seller history
  try {
    const token = await getToken()
    if (token) {
      let matchedQuery = refQuery || baseQuery
      let items = await browseSearch(token, matchedQuery, maxPrice)
      if (!items.length && refQuery) {
        matchedQuery = baseQuery
        items = await browseSearch(token, baseQuery, maxPrice)
      }

      const results = items.map(item => ({
        source: SOURCE,
        title: item.title,
        price: Number(item.price?.value) || 0,
        priceDisplay: item.price?.value
          ? `$${Math.round(Number(item.price.value)).toLocaleString()}`
          : 'See listing',
        saleDate: item.itemEndDate || null,
        saleName: item.buyingOptions?.includes('AUCTION') ? 'Auction' : 'Buy It Now',
        url: item.itemWebUrl,
        imageUrl: item.image?.imageUrl || null,
        currency: item.price?.currency || 'USD',
        condition: item.condition || null,
        matchedQuery,
        seller: item.seller ? {
          name: item.seller.username || null,
          rating: item.seller.feedbackPercentage != null ? Number(item.seller.feedbackPercentage) : null,
          ratingMax: 100,
          reviewCount: item.seller.feedbackScore ?? null,
        } : null,
      }))

      results.push(linkResult(baseQuery, maxPrice, 'Search link · Full results'))
      return results
    }
  } catch (err) {
    console.error('[eBay] Browse API error:', err.message)
  }

  // Fallback: no API key configured (or API error) → verified search links
  const results = [linkResult(baseQuery, maxPrice, 'Search link · Wristwatches category')]
  if (refQuery) results.push(linkResult(refQuery, maxPrice, 'Search link · By reference'))
  return results
}
