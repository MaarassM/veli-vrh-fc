# Mini admin panel (sponzori + galerija) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Checkbox koraci.

**Goal:** `/admin` ruta s prijavom (Supabase Auth email+lozinka) gdje klub sam uređuje sponzore i galeriju (upload fotki s mobitela).

**Architecture:** SPA ruta `/admin` (izvan navigacije, noindex). Supabase Auth kroz postojeći anon klijent (`src/lib/supabase.ts`). Sponzori sele iz statičnog `sponsors.ts` u tablicu `sponsors` (public read RLS, authenticated write). Galerija koristi postojeće `albums`/`gallery_items` + novi Storage bucket `media` (public read, authenticated write). Admin račun kreiram service-key API-jem.

**Tech:** @supabase/supabase-js (postoji), Supabase Storage, bez novih paketa.

## Global Constraints
- /admin nije u navigaciji, sitemapi, ima `<meta name="robots" content="noindex">`
- RLS: pisanje SAMO `authenticated`; javno ostaje read-only
- Hrvatski UI, postojeći stil (heading-club, orange-500); mobilno prijateljski (upload s mobitela!)
- Commit lokalno; deploy tek uz odobrenje korisnika

### Task 1: Migracija + storage + admin račun
- `supabase/migrations/2026-08-04-admin.sql`: tablica `sponsors(id uuid pk default gen_random_uuid(), name text, logo_url text, url text, sort_order int default 0, created_at)`; RLS public select + authenticated all; authenticated insert/update/delete policies za `albums` i `gallery_items`; storage bucket `media` (public) + storage.objects policies (public read, authenticated write/delete)
- Admin user preko service-key REST-a (`/auth/v1/admin/users`) — email korisnika + generirana lozinka (dati korisniku, promijeni je nakon prve prijave)

### Task 2: /admin ruta + auth ljuska
- `src/pages/AdminPage.tsx`: login forma (email+lozinka, greške na hrvatskom) ↔ panel s tabovima Sponzori/Galerija + Odjava; `supabase.auth.onAuthStateChange` drži sesiju
- Ruta u App.tsx; SEO noindex

### Task 3: Modul Sponzori
- `src/components/admin/SponsorsAdmin.tsx`: lista (naziv, logo, link, redoslijed), dodavanje s uploadom loga u `media/sponsors/`, brisanje, uređivanje sort_order
- `SponsorsStrip` čita iz tablice (anon select, sort_order asc) umjesto `sponsors.ts`; statični file se briše

### Task 4: Modul Galerija
- `src/components/admin/GalleryAdmin.tsx`: odabir/kreiranje albuma; multi-upload fotki u `media/gallery/{album}/` → insert u `gallery_items` (image_url = public URL, date = danas); brisanje fotke (row + storage objekt); update `item_count` na albumu

### Task 5: Verifikacija
- Auth flow testiran API-jem (signInWithPassword skriptom, ne browserom); UI provjera u previewu; build+testovi; commit lokalno; korisnik: pokreće SQL, testira prijavu, odobrava deploy
