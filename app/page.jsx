'use client'
import { useState, useEffect } from 'react'
import { Plus, Search, RefreshCw, Watch, Target } from 'lucide-react'
import AddWatchModal from '../components/AddWatchModal'
import WatchCard from '../components/WatchCard'

export default function Home() {
  const [watches, setWatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchingAll, setSearchingAll] = useState(false)
  const [searchProgress, setSearchProgress] = useState('')

  useEffect(() => {
    fetchWatches()
  }, [])

  const fetchWatches = async () => {
    try {
      const res = await fetch('/api/watches')
      const data = await res.json()
      setWatches(data)
    } catch (err) {
      console.error('Failed to fetch watches:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = (newWatch) => {
    setWatches(prev => [...prev, newWatch])
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/watches?id=${id}`, { method: 'DELETE' })
      setWatches(prev => prev.filter(w => w.id !== id))
    } catch (err) {
      console.error('Failed to delete watch:', err)
    }
  }

  const handleUpdate = (updatedWatch) => {
    setWatches(prev => prev.map(w => w.id === updatedWatch.id ? updatedWatch : w))
  }

  const handleSearchAll = async () => {
    setSearchingAll(true)
    setSearchProgress('Searching all markets…')
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      const data = await res.json()
      if (data.results) {
        // Refresh the watch list to get updated results
        await fetchWatches()
        const totalMatches = data.results.reduce((acc, r) =>
          acc + (r.results?.filter(item => item.price && item.price <= watches.find(w => w.id === r.watchId)?.maxPrice)?.length || 0), 0)
        setSearchProgress(totalMatches > 0 ? `✓ Found ${totalMatches} match${totalMatches !== 1 ? 'es' : ''} across your watchlist` : 'Search complete — no new matches')
      }
    } catch (err) {
      setSearchProgress('Search failed — check console')
    } finally {
      setSearchingAll(false)
      setTimeout(() => setSearchProgress(''), 5000)
    }
  }

  const totalMatches = watches.reduce((acc, w) =>
    acc + (w.results?.filter(r => r.price && r.price <= w.maxPrice)?.length || 0), 0)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Watch size={16} className="text-gold" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                <span className="gold-shimmer">WATCH HUNT</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {watches.length > 0 && (
              <button
                onClick={handleSearchAll}
                disabled={searchingAll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/10 text-sm text-white/70 hover:text-white transition-all disabled:opacity-50"
              >
                <RefreshCw size={14} className={searchingAll ? 'animate-spin' : ''} />
                {searchingAll ? 'Searching…' : 'Search All'}
              </button>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold hover:bg-gold-light text-bg text-sm font-semibold transition-all"
            >
              <Plus size={16} />
              Add Watch
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* Search progress banner */}
        {searchProgress && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-surface-2 border border-white/10 text-sm text-white/70 animate-fade-in">
            {searchProgress}
          </div>
        )}

        {/* Stats bar */}
        {watches.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-surface rounded-xl p-4 border border-white/5">
              <div className="text-2xl font-bold text-white">{watches.length}</div>
              <div className="text-xs text-white/40 mt-0.5 uppercase tracking-wider">Watches tracked</div>
            </div>
            <div className="bg-surface rounded-xl p-4 border border-white/5">
              <div className="text-2xl font-bold text-gold">
                {totalMatches}
              </div>
              <div className="text-xs text-white/40 mt-0.5 uppercase tracking-wider">Active matches</div>
            </div>
            <div className="bg-surface rounded-xl p-4 border border-white/5">
              <div className="text-2xl font-bold text-white">8</div>
              <div className="text-xs text-white/40 mt-0.5 uppercase tracking-wider">Markets monitored</div>
            </div>
          </div>
        )}

        {/* Watchlist */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-white/20">
            <div className="w-6 h-6 border-2 border-white/10 border-t-gold/50 rounded-full animate-spin" />
          </div>
        ) : watches.length === 0 ? (
          <EmptyState onAdd={() => setShowModal(true)} />
        ) : (
          <div className="space-y-4">
            {watches.map(watch => (
              <WatchCard
                key={watch.id}
                watch={watch}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <AddWatchModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gold/5 border border-gold/10 flex items-center justify-center mb-6">
        <Target size={28} className="text-gold/40" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Your watchlist is empty</h2>
      <p className="text-white/35 text-sm max-w-sm mb-8 leading-relaxed">
        Add a watch reference and your max price. Every morning, Watch Hunt scans 8 markets and alerts you when it appears at or below your threshold.
      </p>
      <div className="flex flex-col gap-2 text-xs text-white/20 mb-8">
        {["Sotheby's", "Christie's", "Phillips", "Antiquorum", "Chrono24", "WatchCharts", "WatchPatrol", "eBay"].map(src => (
          <span key={src}>{src}</span>
        ))}
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold hover:bg-gold-light text-bg font-semibold transition-all"
      >
        <Plus size={18} />
        Add your first watch
      </button>
    </div>
  )
}
