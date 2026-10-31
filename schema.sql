CREATE TABLE IF NOT EXISTS meldingen (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  datum TEXT NOT NULL,
  begintijd TEXT NOT NULL,
  eindtijd TEXT,
  land TEXT DEFAULT 'NL',
  locatie_postcode TEXT,
  straatnaam TEXT,
  stookwijzer_code TEXT NOT NULL,
  windrichting TEXT NOT NULL,
  windkracht INTEGER NOT NULL,
  overlast_types TEXT NOT NULL,
  klachten TEXT,
  opmerking TEXT,
  foto_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_meldingen_datum ON meldingen(datum, begintijd);
