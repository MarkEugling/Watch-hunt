import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'watches.json')

function ensureFile() {
  const dir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8')
}

export function readWatches() {
  ensureFile()
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function writeWatches(watches) {
  ensureFile()
  fs.writeFileSync(DATA_FILE, JSON.stringify(watches, null, 2), 'utf8')
}

export function addWatch(watch) {
  const watches = readWatches()
  const newWatch = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    lastSearched: null,
    results: [],
    ...watch,
  }
  watches.push(newWatch)
  writeWatches(watches)
  return newWatch
}

export function updateWatch(id, updates) {
  const watches = readWatches()
  const idx = watches.findIndex(w => w.id === id)
  if (idx === -1) return null
  watches[idx] = { ...watches[idx], ...updates }
  writeWatches(watches)
  return watches[idx]
}

export function deleteWatch(id) {
  const watches = readWatches()
  const filtered = watches.filter(w => w.id !== id)
  writeWatches(filtered)
  return filtered
}
