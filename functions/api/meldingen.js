const CODES = ['geel', 'oranje', 'rood'];
const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const IMG = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic' };
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json' } });
const list = (v) => {
  try { const a = JSON.parse(v || '[]'); return Array.isArray(a) ? a.slice(0, 10).map((x) => String(x).slice(0, 40)) : []; } catch { return []; }
};

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT * FROM meldingen ORDER BY datum DESC, begintijd DESC LIMIT 2000').all();
  return json(results);
}

export async function onRequestPost({ request, env }) {
  const f = await request.formData();
  const s = (k, n) => String(f.get(k) || '').trim().slice(0, n);
  const datum = s('datum', 10), begin = s('begintijd', 5), eind = s('eindtijd', 5);
  const code = s('stookwijzer_code', 10), dir = s('windrichting', 2), bft = parseInt(f.get('windkracht'), 10);
  const types = list(f.get('overlast_types'));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum) || !/^\d{2}:\d{2}$/.test(begin) || (eind && !/^\d{2}:\d{2}$/.test(eind))) return json({ error: 'Ongeldige datum of tijd' }, 400);
  if (!CODES.includes(code) || !DIRS.includes(dir) || !(bft >= 0 && bft <= 12) || !types.length) return json({ error: 'Ongeldige invoer' }, 400);

  let fotoUrl = null;
  const foto = f.get('foto');
  if (foto && typeof foto === 'object' && foto.size > 0) {
    const ext = IMG[foto.type];
    if (!ext || foto.size > 5 * 1024 * 1024) return json({ error: 'Foto moet JPG/PNG/WEBP/HEIC en max 5 MB zijn' }, 400);
    const key = `${crypto.randomUUID()}.${ext}`;
    await env.BUCKET.put(key, foto.stream(), { httpMetadata: { contentType: foto.type } });
    fotoUrl = `/api/foto/${key}`;
  }
  const r = await env.DB.prepare(
    `INSERT INTO meldingen (datum,begintijd,eindtijd,land,locatie_postcode,straatnaam,stookwijzer_code,windrichting,windkracht,overlast_types,klachten,opmerking,foto_url)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(datum, begin, eind || null, s('land', 2).toUpperCase() || 'NL', s('locatie_postcode', 60), s('straatnaam', 100), code, dir, bft,
    JSON.stringify(types), JSON.stringify(list(f.get('klachten'))), s('opmerking', 1000), fotoUrl).run();
  return json({ ok: true, id: r.meta.last_row_id }, 201);
}
