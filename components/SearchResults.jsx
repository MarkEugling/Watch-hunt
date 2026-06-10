'use client'
import { useState } from 'react'
import { ExternalLink, ChevronDown, ChevronUp, Gavel, ShoppingBag, ShieldCheck, ShieldAlert, Star, TrendingDown, TrendingUp } from 'lucide-react'
import { computeTrust } from '../lib/trust'

const SOURCE_COLORS = {
  "Sotheby's": 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  "Christie's": 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  'Phillips': 'bg-red-500/10 text-red-300 border-red-500/20',
  'Antiquorum': 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  'Chrono24': 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  'WatchCharts': 'bg-green-500/10 text-green-300 border-green-500/20',
  'WatchPatrol': 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  'eBay': 'bg-pink-500/10 text-pink-300 border-pink-500/20',
}

const TRUST_CHIP = {
  success: 'bg-success/15 text-success border-success/30',
  gold: 'bg-gold/15 text-gold border-gold/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  danger: 'bg-danger/15 text-danger border-danger/30',
}

function BudgetDelta({ price, maxPrice }) {
  if (!price || !maxPrice) return null
  const delta = price - maxPrice

  if (delta <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-success/15 text-success border border-success/30">
        <TrendingDown size={10} />
        {delta === 0 ? 'At budget' : `$${Math.abs(delta).toLocaleString()} under`}
      </span>
    )
  }

  const pctOver = Math.round((delta / maxPrice) * 100)
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-danger/15 text-danger border border-danger/30">
      <TrendingUp size={10} />
      +${delta.toLocaleString()} over ({pctOver}%)
    </span>
  )
}

function TrustBadges({ result }) {
  // Older cached results won't have trust attached — compute on the fly
  const trust = result.trust || computeTrust(result)
  if (!trust) return null

  const chip = TRUST_CHIP[trust.tierColor] || TRUST_CHIP.gold
  const ShieldIcon = trust.score >= 60 ? ShieldCheck : ShieldAlert
  const seller = result.seller

  return (
    <>
      {/* Trust score chip */}
      <span
        title={trust.factors.join(' · ')}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold border ${chip}`}
      >
        {trust.score} · {trust.tierLabel}
      </span>

      {/* Platform guarantee badge */}
      <span
        title={trust.guaranteeDetail}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] border bg-white/5 text-white/50 border-white/10 cursor-help"
      >
        <ShieldIcon size={11} className={trust.score >= 60 ? 'text-success/70' : 'text-warning/70'} />
        {trust.guarantee}
      </span>

      {/* Seller track record */}
      {seller && (seller.name || seller.rating != null) && (
        <span className="inline-flex items-center gap-1 text-[11px] text-white/40">
          {seller.rating != null && (
            <>
              <Star size={10} className="text-gold/70 fill-gold/70" />
              {Number(seller.rating).toFixed(1)}
            </>
          )}
          {seller.reviewCount != null && (
            <span>({Number(seller.reviewCount).toLocaleString()})</span>
          )}
          {seller.name && <span className="truncate max-w-[120px]">{seller.name}</span>}
        </span>
      )}
    </>
  )
}

function ResultItem({ result, maxPrice }) {
  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-3 rounded-xl bg-surface-3 hover:bg-surface-2 border border-white/5 hover:border-gold/20 transition-all group"
    >
      {/* Source badge */}
      <div className="flex-shrink-0 mt-0.5">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${SOURCE_COLORS[result.source] || 'bg-white/5 text-white/50 border-white/10'}`}>
          {result.sourceType === 'auction' ? <Gavel size={10} className="mr-1" /> : <ShoppingBag size={10} className="mr-1" />}
          {result.source}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/90 font-medium leading-tight truncate group-hover:text-white">
          {result.title}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className={result.isLink ? 'text-xs text-white/40' : 'text-sm font-bold text-white'}>
            {result.priceDisplay}
          </span>
          {result.saleName && (
            <span className="text-xs text-white/30">{result.saleName}</span>
          )}
          {result.saleDate && (
            <span className="text-xs text-white/30">
              {new Date(result.saleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <BudgetDelta price={result.price} maxPrice={maxPrice} />
          <TrustBadges result={result} />
        </div>
      </div>

      <ExternalLink size={14} className="flex-shrink-0 text-white/20 group-hover:text-gold/60 transition-colors mt-1" />
    </a>
  )
}

export default function SearchResults({ results, sourceStatus, searchedAt, maxPrice }) {
  const [tab, setTab] = useState('all')
  const [showAll, setShowAll] = useState(false)

  const TABS = [
    { id: 'all', label: 'All' },
    { id: 'auction', label: 'Auctions' },
    { id: 'grey', label: 'Grey Market' },
  ]

  const filtered = results.filter(r => {
    if (tab === 'auction') return r.sourceType === 'auction'
    if (tab === 'grey') return r.sourceType === 'grey'
    return true
  })

  const priceMatches = filtered.filter(r => r.price && r.price <= maxPrice)
  const overBudget = filtered.filter(r => r.price && r.price > maxPrice)
  const displayed = showAll ? filtered : filtered.slice(0, 8)

  return (
    <div className="mt-4 animate-fade-in">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                tab === t.id
                  ? 'bg-gold/20 text-gold border border-gold/30'
                  : 'text-white/40 hover:text-white/70 border border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {searchedAt && (
          <span className="text-xs text-white/25">
            Searched {new Date(searchedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Summary pill */}
      {(priceMatches.length > 0 || overBudget.length > 0) && (
        <div className={`mb-3 px-3 py-2 rounded-lg border text-xs ${
          priceMatches.length > 0
            ? 'bg-success/10 border-success/20 text-success'
            : 'bg-warning/10 border-warning/20 text-warning'
        }`}>
          {priceMatches.length > 0
            ? `✓ ${priceMatches.length} listing${priceMatches.length !== 1 ? 's' : ''} at or below your budget`
            : `Closest listing is $${Math.min(...overBudget.map(r => r.price - maxPrice)).toLocaleString()} over budget`}
          {priceMatches.length > 0 && overBudget.length > 0 && ` · ${overBudget.length} more over budget`}
        </div>
      )}

      {/* Source status */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {Object.entries(sourceStatus || {}).map(([name, status]) => (
          <span
            key={name}
            title={status.error ? `Error: ${status.error}` : `${status.count} results in ${status.ms}ms`}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${
              status.error
                ? 'bg-danger/10 text-danger/60 border-danger/20'
                : status.count > 0
                  ? 'bg-success/10 text-success border-success/20'
                  : 'bg-white/5 text-white/25 border-white/10'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${
              status.error ? 'bg-danger' : status.count > 0 ? 'bg-success' : 'bg-white/20'
            }`} />
            {name}
            {status.count > 0 && <span className="opacity-60">({status.count})</span>}
          </span>
        ))}
      </div>

      {/* Results list */}
      {displayed.length === 0 ? (
        <div className="text-center py-8 text-white/25 text-sm">
          No results found at this price point
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((result, i) => (
            <ResultItem key={i} result={result} maxPrice={maxPrice} />
          ))}
        </div>
      )}

      {filtered.length > 8 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          {showAll ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show all {filtered.length} results</>}
        </button>
      )}
    </div>
  )
}
