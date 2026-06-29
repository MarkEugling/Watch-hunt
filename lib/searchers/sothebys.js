export const SOURCE = 'Sotheby\'s'
export const SOURCE_URL = 'https://www.sothebys.com'

export async function search({ query, brand, model, reference, maxPrice }) {
  const baseQuery = reference
    ? [brand, reference].filter(Boolean).join(' ')
    : [brand, model].filter(Boolean).join(' ') || query
  return [{
    source: SOURCE,
    title: `Browse Sotheby's results for "${baseQuery}"`,
    price: null,
    priceDisplay: `Budget $${maxPrice.toLocaleString()}`,
    saleDate: null,
    saleName: 'Search link · Auctions & Buy Now',
    url: `https://www.sothebys.com/en/search?query=${encodeURIComponent(baseQuery)}`,
    imageUrl: null,
    currency: 'USD',
    isLink: true,
  }]
}
