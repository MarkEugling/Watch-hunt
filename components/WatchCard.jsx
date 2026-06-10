'use client'
import { useState } from 'react'
import { Search, Trash2, Pencil, ChevronDown, ChevronUp, Clock, Tag } from 'lucide-react'
import SearchResults from './SearchResults'
import AddWatchModal from './AddWatchModal'

function formatPrice(n) {
  return '$' + Number(n).toLocaleString()
}

function timeAgo(iso) {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function WatchCard({ watch, onDelete, onUpdate }) {
  const [searching, setSearching] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [localResults, setLocalResults] = useState(watch.results || [])
  const [localStatus, setLocalStatus] = useState(watch.sourceStatus || {})
  const [searchedAt, setSearchedAt] = useState(watch.lastSearched || null)

  const matchCount = localResults.filter(r => r.price && r.price <= watch.maxPrice).length
  const hasResults = localResults.length > 0

  const handleSearch = async () => {
    setSearching(true)
    setExpanded(true)
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: watch.id }),
      })
      const data = await res.json()
      if (data.results) {
        setLocalResults(data.results)
        setLocalStatus(data.sourceStatus || {})
        setSearchedAt(data.searchedAt)
        onUpdate({ ...watch, results: data.results, sourceStatus: data.sourceStatus, lastSearched: data.searchedAt })
      }
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setSearching(false)
    }
  }

  const handleEdited = (updated) => {
    onUpdate({ ...watch, ...updated })
  }

  return (
    <div className={`bg-surface border rounded-2xl overflow-hidden transition-all ${
      matchCount > 0 ? 'border-success/30' : 'border-white/5 hover:border-white/10'
    }`}>
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Brand + match badge */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gold/70 uppercase tracking-wider">
                {watch.brand}
              </span>
              {matchCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-success/15 text-success border border-success/25 font-medium">
                  {matchCount} match{matchCount !== 1 ? 'es' : ''}
                </span>
              )}
            </div>

            {/* Model */}
            <h3 className="text-white font-semibold text-lg leading-tight">
              {watch.model}
            </h3>

            {/* Reference + price */}
            <div className="flex items-center gap-3 mt-2">
              {watch.reference && (
                <span className="inline-flex items-center gap-1 text-xs text-white/40">
                  <Tag size={11} />
                  {watch.reference}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-gold">
                Max {formatPrice(watch.maxPrice)}
              </span>
            </div>

            {/* Notes */}
            {watch.notes && (
              <p className="mt-2 text-xs text-white/30 leading-relaxed">{watch.notes}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleSearch}
              disabled={searching}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 border border-gold/20 text-gold text-xs font-medium transition-all disabled:opacity-50"
            >
              {searching ? (
                <span className="inline-block w-3.5 h-3.5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              ) : (
                <Search size={13} />
              )}
              {searching ? 'Searching…' : 'Search'}
            </button>

            <button
              onClick={() => setShowEdit(true)}
              title="Edit watch"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-gold/70 hover:bg-gold/10 transition-all"
            >
              <Pencil size={13} />
            </button>

            <button
              onClick={() => onDelete(watch.id)}
              title="Delete watch"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-danger/60 hover:bg-danger/10 transition-all"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-white/25">
            <Clock size={11} />
            {searchedAt ? `Last searched ${timeAgo(searchedAt)}` : 'Not yet searched'}
          </div>

          {hasResults && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {expanded ? 'Hide results' : `View ${localResults.length} result${localResults.length !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>

      {/* Expandable results */}
      {expanded && hasResults && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4">
          <SearchResults
            results={localResults}
            sourceStatus={localStatus}
            searchedAt={searchedAt}
            maxPrice={watch.maxPrice}
          />
        </div>
      )}

      {/* Edit modal */}
      {showEdit && (
        <AddWatchModal
          watch={watch}
          onClose={() => setShowEdit(false)}
          onAdd={handleEdited}
        />
      )}
    </div>
  )
}
