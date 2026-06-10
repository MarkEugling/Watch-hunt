export const SOURCE = 'WatchCharts'
export const SOURCE_URL = 'https://marketplace.watchcharts.com'

export async function search({ query, brand, model, reference, maxPrice }) {
  // No stable public API — link to their real marketplace search.
  // Reference is the sharpest query when set; WatchCharts indexes refs well.
  const baseQuery = reference
    ? [brand, reference].filter(Boolean).join(' ')
    : [brand, model].filter(Boolean).join(' ') || query
  return [{
    source: SOURCE,
    title: `Browse WatchCharts listings for "${baseQuery}"`,
    price: null,
    priceDisplay: `Budget $${maxPrice.toLocaleString()}`,
    saleDate: null,
    saleName: 'Search link · Marketplace',
    url: `https://marketplace.watchcharts.com/search?q=${encodeURIComponent(baseQuery)}`,
    imageUrl: null,
    currency: 'USD',
    isLink: true,
  }]
}
