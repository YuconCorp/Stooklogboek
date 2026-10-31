# Stooklogboek – live zetten via GitHub + Cloudflare (gratis)

Structuur: `public/index.html` (frontend), `functions/api/meldingen.js` en `functions/api/foto/[[key]].js` (API), `schema.sql` (database), `wrangler.toml` (bindings).

## 1. GitHub
1. Maak op github.com een nieuwe repository (bijv. `stooklogboek`).
2. Upload alle bestanden uit deze map (Add file → Upload files). Behoud de mapstructuur.

## 2. Cloudflare: database en foto-opslag
1. Gratis account op dash.cloudflare.com.
2. **Storage & databases → D1 → Create database**, naam `stooklogboek-db`. Kopieer de **Database ID**.
3. Open de database → **Console**, plak de inhoud van `schema.sql` en voer uit.
4. **R2 → Create bucket**, naam `stooklogboek-fotos`. (R2 vraagt mogelijk om een betaalmethode; de gratis hoeveelheid is ruim voldoende voor dit gebruik, maar controleer de actuele voorwaarden.)
5. Plak de Database ID in `wrangler.toml` (bij `database_id`) en commit die wijziging op GitHub.

## 3. Cloudflare Pages koppelen
1. **Workers & Pages → Create → Pages → Connect to Git** en kies je repository.
2. Build command: leeg laten. Build output directory: `public`.
3. Klik **Save and Deploy**. Je krijgt een adres als `stooklogboek.pages.dev`.
4. Staan de bindings (`DB`, `BUCKET`) niet onder Settings → Bindings? Controleer dan `wrangler.toml` en deploy opnieuw.

## 4. Testen
Open je `.pages.dev`-adres, doe een testmelding met foto en kijk of die in het logboek verschijnt.

## Alternatief via terminal
```
npm i -g wrangler && wrangler login
wrangler d1 create stooklogboek-db        # ID in wrangler.toml zetten
wrangler d1 execute stooklogboek-db --remote --file=schema.sql
wrangler r2 bucket create stooklogboek-fotos
wrangler pages deploy public --project-name=stooklogboek
```

## Let op
- Er is geen moderatie of spamfilter: iedereen kan meldingen plaatsen. Overweeg later Cloudflare Turnstile en/of rate limiting.
- Meldingen en foto's zijn openbaar. Verwerk je persoonsgegevens, regel dan een privacyverklaring (AVG).
- Het stookadvies (geel/oranje/rood) wordt niet automatisch opgehaald; gebruikers kiezen dat zelf.
- Tailwind wordt via CDN geladen; handig om te starten, voor productie is een eigen build netter.
