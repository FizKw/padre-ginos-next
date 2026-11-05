# Padre Gino's — Production React

Repo latihan React per hari. Setiap hari adalah project npm mandiri.

## Struktur

- `day-1/` — Next.js App Router, React 19, TypeScript, Tailwind CSS 4, SQLite.
- `day-2/` — kosong; titik mulai diambil dari hasil `day-1/`.

## Menjalankan

```bash
cd day-1
npm ci
npm run dev          # http://localhost:3000
```

Perintah lain dijalankan dari dalam folder hari:

```bash
npm run typecheck
npm run lint
npx vitest run
npm run build
npm run db:reset     # restore data/pizza.sqlite dari seed (hentikan dev dulu)
```