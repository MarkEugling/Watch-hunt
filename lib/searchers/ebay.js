export const SOURCE = 'eBay'
export const SOURCE_URL = 'https://www.ebay.com'

export async function search({ query, maxPrice }) {
  const results = []
  try {
    const encodedQuery = encodeURIComponent(`${query} watch`)
    // eBay Finding API (no key needed for basic browse)
    const url = `https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=WatchHunt-00&RESPONSE-DATA-FORMAT=JSON&keywords=${encodedQuery}&itemFilter(0).name=MaxPrice&itemFilter(0).value=${maxPrice}&itemFilter(0).paramName=Currency&itemFilter(0).paramValue=USD&itemFilter(1).name=ListingType&itemFilter(1).value(0)=Auction&itemFilter(1).value(1)=AuctionWithBIN&itemFilter(1).value(2)=FixedPrice&sortOrder=PricePlusShippingLowest&paginationInput.entriesPerPage=20`

    // eBay Finding API requires an App ID; fall back to search link
    // For now, provide a well-constructed search URL
    const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodedQuery}&_udhi=${maxPrice}&_sop=15&LH_Auction=1`
    const completedUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodedQuery}&_udhi=${maxPrice}&LH_Complete=1&LH_Sold=1&_sop=15`

    results.push({
      source: SOURCE,
      title: `Active auctions for "${query}"`,
      price: null,
      priceDisplay: `Up to $${maxPrice.toLocaleString()}`,
      saleDate: null,
      saleName: 'Live Auctions',
      url: searchUrl,
      imageUrl: null,
      currency: 'USD',
      isLink: true,
    })

    results.push({
      source: SOURCE,
      title: `Recently sold — "${query}"`,
      price: null,
      priceDisplay: `Up to $${maxPrice.toLocaleString()}`,
      saleDate: null,
      saleName: 'Sold Listings (Price Reference)',
      url: completedUrl,
      imageUrl: null,
      currency: 'USD',
      isLink: true,
    })

  } catch (err) {
    console.error('[eBay] Search error:', err.message)
  }
  return results
}
