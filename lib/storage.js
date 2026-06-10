import pg from 'pg'

const connectionString = process.env.DATABASE_URL || ''
// Local Postgres typically has no SSL; hosted (Vercel/Neon/Supabase) requires it
const useSsl = !/localhost|127\.0\.0\.1/.test(connectionString)

const pool = new pg.Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
})

async function initTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS watches (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      reference TEXT DEFAULT '',
      max_price NUMERIC NOT NULL,
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_searched TIMESTAMPTZ,
      results JSONB DEFAULT '[]'
    )
  `)
}

export async function readWatches() {
  await initTable()
  const { rows } = await pool.query('SELECT * FROM watches ORDER BY created_at DESC')
  return rows.map(toWatch)
}

export async function addWatch(watch) {
  await initTable()
  const id = Date.now().toString()
  const { rows } = await pool.query(
    `INSERT INTO watches (id, brand, model, reference, max_price, notes)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [id, watch.brand, watch.model, watch.reference || '', watch.maxPrice, watch.notes || '']
  )
  return toWatch(rows[0])
}

export async function updateWatch(id, updates) {
  await initTable()
  const fields = []
  const values = []
  let i = 1
  if (updates.brand !== undefined) { fields.push(`brand = $${i++}`); values.push(updates.brand) }
  if (updates.model !== undefined) { fields.push(`model = $${i++}`); values.push(updates.model) }
  if (updates.reference !== undefined) { fields.push(`reference = $${i++}`); values.push(updates.reference) }
  if (updates.lastSearched !== undefined) { fields.push(`last_searched = $${i++}`); values.push(updates.lastSearched) }
  if (updates.results !== undefined) { fields.push(`results = $${i++}`); values.push(JSON.stringify(updates.results)) }
  if (updates.maxPrice !== undefined) { fields.push(`max_price = $${i++}`); values.push(updates.maxPrice) }
  if (updates.notes !== undefined) { fields.push(`notes = $${i++}`); values.push(updates.notes) }
  if (!fields.length) return null
  values.push(id)
  const { rows } = await pool.query(
    `UPDATE watches SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  )
  return rows[0] ? toWatch(rows[0]) : null
}

export async function deleteWatch(id) {
  await initTable()
  await pool.query('DELETE FROM watches WHERE id = $1', [id])
  return readWatches()
}

function toWatch(row) {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    reference: row.reference,
    maxPrice: Number(row.max_price),
    notes: row.notes,
    createdAt: row.created_at,
    lastSearched: row.last_searched,
    results: row.results || [],
  }
}
