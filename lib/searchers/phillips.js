export const SOURCE = 'Phillips'
export const SOURCE_URL = 'https://www.phillips.com'

export async function search({ query, brand, model, reference, maxPrice }) {
  const baseQuery = reference
    ? [brand, reference].filter(Boolean).join(' ')
    : [brand, model].filter(Boolean).join(' ') || query
  return [{
    source: SOURCE,
    title: `Browse Phillips results for "${baseQuery}"`,
    price: null,
    priceDisplay: `Budget $${maxPrice.toLocaleString()}`,
    saleDate: null,
    saleName: 'Search link · Watches department',
    url: `https://www.phillips.com/search/${encodeURIComponent(baseQuery)}`,
    imageUrl: null,
    currency: 'USD',
    isLink: true,
  }]
}
