/**
 * Offer-quality / trust scoring.
 *
 * Two signal layers:
 *  1. Platform — does the marketplace guarantee the transaction?
 *     (escrow, authentication, buyer protection)
 *  2. Seller — track record where the source exposes it
 *     (rating, review count, years active)
 *
 * computeTrust(result) → { score 0-100, tier, platform, seller, factors }
 * Plain JS, importable from both server (searchers) and client (UI).
 */

export const PLATFORM_TRUST = {
  "Sotheby's": {
    baseScore: 92,
    guarantee: 'Authenticity Guaranteed',
    detail: 'Lots authenticated by in-house specialists; sale backed by Sotheby’s authenticity guarantee.',
    type: 'auction-house',
  },
  "Christie's": {
    baseScore: 92,
    guarantee: 'Authenticity Guaranteed',
    detail: 'Lots vetted by specialist department; limited warranty of authenticity (5 years).',
    type: 'auction-house',
  },
  'Phillips': {
    baseScore: 92,
    guarantee: 'Authenticity Guaranteed',
    detail: 'Watches department vets every lot; authorship guarantee on all sales.',
    type: 'auction-house',
  },
  'Antiquorum': {
    baseScore: 85,
    guarantee: 'Specialist Vetted',
    detail: 'Horology-specialist auction house; lots described and vetted by experts. Review condition reports carefully.',
    type: 'auction-house',
  },
  'Chrono24': {
    baseScore: 78,
    guarantee: 'Buyer Protection + Escrow',
    detail: 'Payment held in escrow until you confirm receipt; 14-day money-back guarantee via Chrono24 Buyer Protection.',
    type: 'marketplace',
  },
  'eBay': {
    baseScore: 68,
    guarantee: 'Authenticity Guarantee ($2k+)',
    detail: 'Watches sold over $2,000 in the US are physically inspected by eBay authenticators before delivery. Below that, standard eBay Money Back Guarantee applies.',
    type: 'marketplace',
  },
  'WatchCharts': {
    baseScore: 65,
    guarantee: 'Verified Dealers',
    detail: 'Marketplace listings from registered dealers and private sellers; no escrow — verify seller history before wiring funds.',
    type: 'marketplace',
  },
  'NYC Diamond District': {
    baseScore: 62,
    guarantee: 'Physical Storefront',
    detail: 'Established W 47th St dealers with walk-in showrooms; most offer 1-3 year dealer warranties. No marketplace escrow — you deal with the store directly, and can inspect in person before buying.',
    type: 'dealer',
  },
  'WatchPatrol': {
    baseScore: 35,
    guarantee: 'No Platform Protection',
    detail: 'Aggregates forum and private-sale listings. No escrow or guarantee — deal directly with seller at your own risk. Use a payment method with recourse.',
    type: 'aggregator',
  },
}

const TIERS = [
  { min: 80, tier: 'excellent', label: 'Excellent', color: 'success' },
  { min: 60, tier: 'good', label: 'Good', color: 'gold' },
  { min: 40, tier: 'fair', label: 'Fair', color: 'warning' },
  { min: 0, tier: 'caution', label: 'Caution', color: 'danger' },
]

/**
 * Score a seller's track record 0-100 from whatever fields the source exposed.
 */
function scoreSeller(seller) {
  if (!seller) return null
  // A bare name carries no track-record evidence — fall back to platform score
  if (seller.rating == null && seller.reviewCount == null && seller.yearsActive == null && !seller.verified) return null

  let score = 50 // neutral starting point for a known-but-unrated seller
  const factors = []

  if (seller.rating != null) {
    const max = seller.ratingMax || 5
    const pct = Math.max(0, Math.min(1, seller.rating / max))
    // rating dominates: maps 0..1 → 20..95
    score = 20 + pct * 75
    factors.push(`${seller.rating.toFixed(1)}/${max} rating`)
  }

  if (seller.reviewCount != null) {
    if (seller.reviewCount >= 500) { score += 5; factors.push(`${seller.reviewCount.toLocaleString()} reviews`) }
    else if (seller.reviewCount >= 50) { score += 2; factors.push(`${seller.reviewCount} reviews`) }
    else if (seller.reviewCount < 10) { score -= 10; factors.push(`only ${seller.reviewCount} reviews`) }
    else factors.push(`${seller.reviewCount} reviews`)
  }

  if (seller.yearsActive != null) {
    if (seller.yearsActive >= 5) { score += 5; factors.push(`${seller.yearsActive}+ yrs active`) }
    else if (seller.yearsActive >= 2) score += 2
  }

  if (seller.verified) { score += 5; factors.push('verified seller') }

  return { score: Math.max(0, Math.min(100, Math.round(score))), factors }
}

/**
 * Compute combined trust for a search result.
 * Auction-house lots: the house IS the seller, platform score stands alone.
 * Marketplace listings: blend platform protection with seller track record.
 */
export function computeTrust(result) {
  const platform = PLATFORM_TRUST[result.source]
  if (!platform) return null

  const sellerScore = platform.type === 'auction-house' ? null : scoreSeller(result.seller)

  let score
  const factors = [platform.guarantee]

  if (sellerScore) {
    // 45% platform protection, 55% seller track record
    score = Math.round(platform.baseScore * 0.45 + sellerScore.score * 0.55)
    factors.push(...sellerScore.factors)
  } else {
    score = platform.baseScore
    if (platform.type !== 'auction-house') factors.push('seller history unavailable')
  }

  // A weak seller rating caps the score — platform protection mitigates
  // but shouldn't mask a poor track record
  if (result.seller?.rating != null) {
    const pct = result.seller.rating / (result.seller.ratingMax || 5)
    if (pct < 0.7) {
      score = Math.min(score, 55)
      factors.push('low seller rating')
    }
  }

  const tier = TIERS.find(t => score >= t.min)

  return {
    score,
    tier: tier.tier,
    tierLabel: tier.label,
    tierColor: tier.color,
    sellerScored: !!sellerScore,
    factors,
    guarantee: platform.guarantee,
    guaranteeDetail: platform.detail,
    platformType: platform.type,
  }
}

/**
 * Normalize raw seller data from a searcher into the shape scoreSeller expects.
 * Tolerates strings ("WatchBros NYC") and varied object keys.
 */
export function normalizeSeller(raw) {
  if (!raw) return null
  if (typeof raw === 'string') return { name: raw }

  const rating = raw.rating ?? raw.dealerRating ?? raw.sellerRating ?? raw.stars ?? null
  return {
    name: raw.name || raw.username || raw.dealerName || raw.merchantName || null,
    rating: rating != null ? Number(rating) : null,
    ratingMax: raw.ratingMax || (rating != null && rating > 5 ? 100 : 5),
    reviewCount: raw.reviewCount ?? raw.reviews ?? raw.ratingCount ?? raw.feedbackCount ?? null,
    yearsActive: raw.yearsActive != null
      ? Number(raw.yearsActive)
      : raw.memberSince
        ? new Date().getFullYear() - new Date(raw.memberSince).getFullYear()
        : null,
    verified: !!(raw.verified || raw.isVerified || raw.trustedSeller || raw.isDealer),
  }
}
