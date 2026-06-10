/**
 * Curated reference database for smart lookup.
 * Type a reference number (e.g. "116610LN") or nickname (e.g. "hulk")
 * and the Add Watch form autofills brand + model.
 */

const REFERENCES = [
  // ── Rolex ──────────────────────────────────────────────
  { ref: '116610LN', brand: 'Rolex', model: 'Submariner Date', nicknames: [] },
  { ref: '116610LV', brand: 'Rolex', model: 'Submariner Date', nicknames: ['hulk'] },
  { ref: '126610LN', brand: 'Rolex', model: 'Submariner Date', nicknames: [] },
  { ref: '126610LV', brand: 'Rolex', model: 'Submariner Date', nicknames: ['starbucks', 'cermit'] },
  { ref: '124060', brand: 'Rolex', model: 'Submariner No-Date', nicknames: [] },
  { ref: '114060', brand: 'Rolex', model: 'Submariner No-Date', nicknames: [] },
  { ref: '16610', brand: 'Rolex', model: 'Submariner Date', nicknames: [] },
  { ref: '16610LV', brand: 'Rolex', model: 'Submariner Date 50th Anniversary', nicknames: ['kermit'] },
  { ref: '5513', brand: 'Rolex', model: 'Submariner (Vintage)', nicknames: [] },
  { ref: '1680', brand: 'Rolex', model: 'Submariner Date (Vintage)', nicknames: ['red sub'] },
  { ref: '116500LN', brand: 'Rolex', model: 'Cosmograph Daytona', nicknames: ['panda'] },
  { ref: '126500LN', brand: 'Rolex', model: 'Cosmograph Daytona', nicknames: ['panda'] },
  { ref: '116520', brand: 'Rolex', model: 'Cosmograph Daytona', nicknames: [] },
  { ref: '6263', brand: 'Rolex', model: 'Cosmograph Daytona (Vintage)', nicknames: ['big red'] },
  { ref: '126710BLRO', brand: 'Rolex', model: 'GMT-Master II', nicknames: ['pepsi'] },
  { ref: '126710BLNR', brand: 'Rolex', model: 'GMT-Master II', nicknames: ['batman', 'batgirl'] },
  { ref: '116710LN', brand: 'Rolex', model: 'GMT-Master II', nicknames: [] },
  { ref: '16710', brand: 'Rolex', model: 'GMT-Master II', nicknames: [] },
  { ref: '1675', brand: 'Rolex', model: 'GMT-Master (Vintage)', nicknames: [] },
  { ref: '126711CHNR', brand: 'Rolex', model: 'GMT-Master II', nicknames: ['root beer'] },
  { ref: '226570', brand: 'Rolex', model: 'Explorer II', nicknames: ['polar'] },
  { ref: '216570', brand: 'Rolex', model: 'Explorer II', nicknames: ['polar'] },
  { ref: '16570', brand: 'Rolex', model: 'Explorer II', nicknames: [] },
  { ref: '124270', brand: 'Rolex', model: 'Explorer', nicknames: [] },
  { ref: '114270', brand: 'Rolex', model: 'Explorer', nicknames: [] },
  { ref: '1016', brand: 'Rolex', model: 'Explorer (Vintage)', nicknames: [] },
  { ref: '126600', brand: 'Rolex', model: 'Sea-Dweller', nicknames: [] },
  { ref: '126334', brand: 'Rolex', model: 'Datejust 41', nicknames: [] },
  { ref: '126234', brand: 'Rolex', model: 'Datejust 36', nicknames: [] },
  { ref: '228238', brand: 'Rolex', model: 'Day-Date 40', nicknames: ['president'] },
  { ref: '124300', brand: 'Rolex', model: 'Oyster Perpetual 41', nicknames: [] },
  { ref: '226659', brand: 'Rolex', model: 'Yacht-Master 42', nicknames: [] },
  { ref: '126603', brand: 'Rolex', model: 'Sea-Dweller Two-Tone', nicknames: [] },
  { ref: '116508', brand: 'Rolex', model: 'Cosmograph Daytona Yellow Gold', nicknames: ['john mayer'] },

  // ── Omega ──────────────────────────────────────────────
  { ref: '310.30.42.50.01.001', brand: 'Omega', model: 'Speedmaster Moonwatch Professional', nicknames: ['moonwatch'] },
  { ref: '311.30.42.30.01.005', brand: 'Omega', model: 'Speedmaster Moonwatch Professional', nicknames: ['moonwatch'] },
  { ref: '105.012', brand: 'Omega', model: 'Speedmaster Professional (Vintage)', nicknames: [] },
  { ref: '145.022', brand: 'Omega', model: 'Speedmaster Professional (Vintage)', nicknames: [] },
  { ref: '210.30.42.20.01.001', brand: 'Omega', model: 'Seamaster Diver 300M', nicknames: [] },
  { ref: '210.30.42.20.03.001', brand: 'Omega', model: 'Seamaster Diver 300M', nicknames: [] },
  { ref: '234.10.39.20.01.001', brand: 'Omega', model: 'Seamaster 300 Heritage', nicknames: [] },
  { ref: '220.10.41.21.10.001', brand: 'Omega', model: 'Aqua Terra 150M', nicknames: [] },

  // ── Tudor ──────────────────────────────────────────────
  { ref: '79030N', brand: 'Tudor', model: 'Black Bay Fifty-Eight', nicknames: ['bb58'] },
  { ref: '79030B', brand: 'Tudor', model: 'Black Bay Fifty-Eight Navy', nicknames: ['bb58 blue'] },
  { ref: '7941A1A0NU', brand: 'Tudor', model: 'Black Bay 41', nicknames: [] },
  { ref: '79830RB', brand: 'Tudor', model: 'Black Bay GMT', nicknames: [] },
  { ref: '25600TN', brand: 'Tudor', model: 'Pelagos', nicknames: [] },
  { ref: '25407N', brand: 'Tudor', model: 'Pelagos 39', nicknames: [] },

  // ── Patek Philippe ─────────────────────────────────────
  { ref: '5711/1A-010', brand: 'Patek Philippe', model: 'Nautilus', nicknames: ['nautilus'] },
  { ref: '5712/1A-001', brand: 'Patek Philippe', model: 'Nautilus Moonphase', nicknames: [] },
  { ref: '5811/1G-001', brand: 'Patek Philippe', model: 'Nautilus', nicknames: [] },
  { ref: '5167A-001', brand: 'Patek Philippe', model: 'Aquanaut', nicknames: [] },
  { ref: '5168G-001', brand: 'Patek Philippe', model: 'Aquanaut', nicknames: [] },
  { ref: '5396G-001', brand: 'Patek Philippe', model: 'Annual Calendar', nicknames: [] },
  { ref: '5227G-001', brand: 'Patek Philippe', model: 'Calatrava', nicknames: [] },
  { ref: '5170P-001', brand: 'Patek Philippe', model: 'Chronograph', nicknames: [] },

  // ── Audemars Piguet ────────────────────────────────────
  { ref: '15500ST.OO.1220ST.01', brand: 'Audemars Piguet', model: 'Royal Oak 41', nicknames: ['royal oak'] },
  { ref: '15510ST.OO.1320ST.01', brand: 'Audemars Piguet', model: 'Royal Oak 41', nicknames: [] },
  { ref: '15202ST.OO.1240ST.01', brand: 'Audemars Piguet', model: 'Royal Oak Jumbo Extra-Thin', nicknames: ['jumbo'] },
  { ref: '16202ST.OO.1240ST.01', brand: 'Audemars Piguet', model: 'Royal Oak Jumbo Extra-Thin', nicknames: ['jumbo'] },
  { ref: '26470ST.OO.A801CR.01', brand: 'Audemars Piguet', model: 'Royal Oak Offshore', nicknames: [] },

  // ── A. Lange & Söhne ───────────────────────────────────
  { ref: '101.039', brand: 'A. Lange & Söhne', model: 'Lange 1', nicknames: [] },
  { ref: '191.039', brand: 'A. Lange & Söhne', model: 'Lange 1', nicknames: [] },
  { ref: '384.026', brand: 'A. Lange & Söhne', model: 'Datograph Up/Down', nicknames: ['datograph'] },
  { ref: '405.035', brand: 'A. Lange & Söhne', model: 'Datograph Up/Down', nicknames: ['datograph'] },
  { ref: '380.026', brand: 'A. Lange & Söhne', model: 'Saxonia Annual Calendar', nicknames: [] },
  { ref: '206.025', brand: 'A. Lange & Söhne', model: 'Zeitwerk', nicknames: [] },

  // ── Jaeger-LeCoultre ───────────────────────────────────
  { ref: 'Q1338421', brand: 'Jaeger-LeCoultre', model: 'Master Ultra Thin Moon', nicknames: [] },
  { ref: 'Q3978480', brand: 'Jaeger-LeCoultre', model: 'Reverso Tribute Duoface', nicknames: ['reverso'] },
  { ref: 'Q9008180', brand: 'Jaeger-LeCoultre', model: 'Polaris Date', nicknames: [] },

  // ── Vacheron Constantin ────────────────────────────────
  { ref: '4500V/110A-B128', brand: 'Vacheron Constantin', model: 'Overseas', nicknames: ['overseas'] },
  { ref: '4500V/110A-B483', brand: 'Vacheron Constantin', model: 'Overseas Blue', nicknames: [] },
  { ref: '5500V/110A-B148', brand: 'Vacheron Constantin', model: 'Overseas Chronograph', nicknames: [] },
  { ref: '85180/000R-9248', brand: 'Vacheron Constantin', model: 'Patrimony', nicknames: [] },

  // ── Cartier ────────────────────────────────────────────
  { ref: 'WSSA0029', brand: 'Cartier', model: 'Santos Medium', nicknames: ['santos'] },
  { ref: 'WSSA0018', brand: 'Cartier', model: 'Santos Large', nicknames: ['santos'] },
  { ref: 'WSTA0041', brand: 'Cartier', model: 'Tank Must Large', nicknames: ['tank'] },
  { ref: 'WGTA0011', brand: 'Cartier', model: 'Tank Louis Cartier', nicknames: ['tank'] },

  // ── Grand Seiko ────────────────────────────────────────
  { ref: 'SBGA211', brand: 'Grand Seiko', model: 'Spring Drive', nicknames: ['snowflake'] },
  { ref: 'SBGA413', brand: 'Grand Seiko', model: 'Heritage Spring Drive', nicknames: ['shunbun'] },
  { ref: 'SBGW231', brand: 'Grand Seiko', model: 'Elegance Manual', nicknames: [] },
  { ref: 'SLGH005', brand: 'Grand Seiko', model: 'Evolution 9 Hi-Beat', nicknames: ['white birch'] },

  // ── IWC ────────────────────────────────────────────────
  { ref: 'IW328201', brand: 'IWC', model: 'Mark XX', nicknames: [] },
  { ref: 'IW377709', brand: 'IWC', model: 'Pilot’s Chronograph', nicknames: [] },
  { ref: 'IW358305', brand: 'IWC', model: 'Portugieser Automatic 40', nicknames: [] },

  // ── Zenith / Breitling ─────────────────────────────────
  { ref: '03.3100.3600/69.M3100', brand: 'Zenith', model: 'Chronomaster Sport', nicknames: [] },
  { ref: 'AB0138241B1A1', brand: 'Breitling', model: 'Navitimer B01 Chronograph 43', nicknames: ['navitimer'] },
]

/** Normalize for matching: lowercase, strip spaces/dashes/dots/slashes */
function norm(s) {
  return (s || '').toLowerCase().replace(/[\s\-./]/g, '')
}

/**
 * Look up references matching the input.
 * Matches against reference number (prefix/substring), nickname, brand, or model.
 * Returns up to `limit` matches.
 */
export function lookupReference(input, limit = 6) {
  const q = norm(input)
  if (q.length < 2) return []

  const scored = []
  for (const entry of REFERENCES) {
    const ref = norm(entry.ref)
    const model = norm(entry.model)
    const brand = norm(entry.brand)
    const brandModel = brand + model

    let score = 0
    if (ref === q) score = 100
    else if (ref.startsWith(q)) score = 80
    else if (entry.nicknames.some(n => norm(n) === q)) score = 75
    else if (entry.nicknames.some(n => norm(n).startsWith(q))) score = 65
    else if (ref.includes(q)) score = 60
    else if (model.startsWith(q) || brandModel.includes(q)) score = 40
    else continue

    scored.push({ ...entry, score })
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit)
}

export { REFERENCES }
