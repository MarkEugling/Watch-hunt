export const SOURCE = "Christie's"
export const SOURCE_URL = 'https://www.christies.com'

export async function search({ query, brand, model, reference, maxPrice }) {
  const baseQuery = reference
    ? [brand, reference].filter(Boolean).join(' ')
    : [brand, model].filter(Boolean).join(' ') || query
  return [{
    source: SOURCE,
    title: `Browse Christie's results for "${baseQuery}"`,
    price: null,
    priceDisplay: `Budget $${maxPrice.toLocaleString()}`,
    saleDate: null,
    saleName: 'Search link · Upcoming auctions',
    url: `https://www.christies.com/en/search?keyword=${encodeURIComponent(baseQuery)}&sortby=relevance`,
    imageUrl: null,
    currency: 'USD',
    isLink: true,
  }]
}
