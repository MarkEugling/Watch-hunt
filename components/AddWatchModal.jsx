'use client'
import { useState, useRef } from 'react'
import { X, Plus, Check, Sparkles } from 'lucide-react'
import { lookupReference } from '../lib/references'

export default function AddWatchModal({ onClose, onAdd, watch }) {
  const isEdit = !!watch
  const [form, setForm] = useState({
    brand: watch?.brand || '',
    model: watch?.model || '',
    reference: watch?.reference || '',
    maxPrice: watch?.maxPrice != null ? String(watch.maxPrice) : '',
    notes: watch?.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lookup, setLookup] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [autofilled, setAutofilled] = useState(false)
  const priceRef = useRef(null)

  const handleLookup = (value) => {
    setLookup(value)
    setAutofilled(false)
    setSuggestions(lookupReference(value))
  }

  const applySuggestion = (s) => {
    setForm(f => ({ ...f, brand: s.brand, model: s.model, reference: s.ref }))
    setLookup(`${s.brand} ${s.model} — ${s.ref}`)
    setSuggestions([])
    setAutofilled(true)
    priceRef.current?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.brand || !form.model || !form.maxPrice) {
      setError('Brand, model, and max price are required.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/watches', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEdit ? { id: watch.id } : {}),
          ...form,
          maxPrice: Number(form.maxPrice),
        }),
      })
      if (!res.ok) throw new Error(isEdit ? 'Failed to save changes' : 'Failed to add watch')
      const saved = await res.json()
      onAdd(saved)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface border border-gold/20 rounded-2xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-lg font-semibold text-white">{isEdit ? 'Edit Watch' : 'Add Watch'}</h2>
            <p className="text-sm text-white/40 mt-0.5">
              {isEdit ? 'Update the details of this watch' : 'Track a reference across all markets'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Smart lookup */}
          <div className="relative">
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              <span className="inline-flex items-center gap-1">
                <Sparkles size={11} className="text-gold" />
                Smart Lookup
              </span>
            </label>
            <input
              type="text"
              placeholder={'Type a reference or nickname — "116610LN", "pepsi", "bb58"…'}
              value={lookup}
              onChange={e => handleLookup(e.target.value)}
              className={`w-full bg-surface-2 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none transition-colors ${
                autofilled ? 'border-success/40' : 'border-gold/30 focus:border-gold/60'
              }`}
              autoFocus={!isEdit}
            />
            {autofilled && (
              <p className="mt-1 text-xs text-success">✓ Brand, model & reference filled in below</p>
            )}
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-surface-2 border border-gold/20 rounded-xl shadow-2xl overflow-hidden">
                {suggestions.map(s => (
                  <button
                    key={s.ref}
                    type="button"
                    onClick={() => applySuggestion(s)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-gold/10 transition-colors border-b border-white/5 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <span className="block text-sm text-white truncate">
                        {s.brand} <span className="text-white/60">{s.model}</span>
                      </span>
                      {s.nicknames.length > 0 && (
                        <span className="block text-xs text-gold/60">“{s.nicknames[0]}”</span>
                      )}
                    </div>
                    <span className="flex-shrink-0 text-xs font-mono text-white/40">{s.ref}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-white/25">or enter manually</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                Brand <span className="text-gold">*</span>
              </label>
              <input
                type="text"
                placeholder="A. Lange & Söhne"
                value={form.brand}
                onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
                Model <span className="text-gold">*</span>
              </label>
              <input
                type="text"
                placeholder="Lange 1"
                value={form.model}
                onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              Reference Number
            </label>
            <input
              type="text"
              placeholder="101.039 (optional)"
              value={form.reference}
              onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
              className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              Max Price (USD) <span className="text-gold">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
              <input
                ref={priceRef}
                type="number"
                placeholder="25,000"
                value={form.maxPrice}
                onChange={e => setForm(f => ({ ...f, maxPrice: e.target.value }))}
                className="w-full bg-surface-2 border border-white/10 rounded-lg pl-7 pr-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              Notes
            </label>
            <textarea
              placeholder="White dial only, yellow gold preferred..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full bg-surface-2 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gold text-bg text-sm font-semibold hover:bg-gold-light transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
              ) : isEdit ? (
                <Check size={16} />
              ) : (
                <Plus size={16} />
              )}
              {isEdit ? 'Save Changes' : 'Add Watch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
