export const SOURCE = 'Antiquorum'
export const SOURCE_URL = 'https://www.antiquorum.swiss'

export async function search({ query, brand, model, reference, maxPrice }) {
  const baseQuery = reference
    ? [brand, reference].filter(Boolean).join(' ')
    : [brand, model].filter(Boolean).join(' ') || query
  return [{
    source: SOURCE,
    title: `Browse Antiquorum results for "${baseQuery}"`,
    price: null,
    priceDisplay: `Budget $${maxPrice.toLocaleString()}`,
    saleDate: null,
    saleName: 'Search link · Horology auctions',
    url: `https://www.antiquorum.swiss/en/search?q=${encodeURIComponent(baseQuery)}`,
    imageUrl: null,
    currency: 'USD',
    isLink: true,
  }]
}
