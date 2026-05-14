# Hero Section Redesign

**Date:** 2026-05-14
**Status:** Approved

## Goal

Redesign the HeroSection to a centered, logo-forward layout. Remove the two-column split (text left, stats right) and replace it with a single centered column over a warm abstract background.

## Layout

- Single centered column, full-width section
- Minimum height ~540px on desktop, consistent with current
- No stats panel on either side
- Both desktop and mobile use the same centered approach

## Background

- Base color: `#fff8f3` (warm white)
- Three CSS `radial-gradient` blobs at low opacity:
  - Large blob (~380px): top-left corner, `rgba(249,115,22,0.28)`
  - Medium blob (~300px): bottom-right corner, `rgba(251,146,60,0.22)`
  - Small blob (~220px): top-right area, `rgba(253,186,116,0.25)`
- Pure CSS, no image file required
- Keep existing top gradient bar and left orange accent strip

## Content (top to bottom, centered)

1. **Eyebrow** — `— Pula · Istra —` in Space Grotesk, 9px, weight 700, letter-spacing 5px, uppercase, `#f97316`
2. **Logo** — `/images/logo.png`, 140px on desktop, 110px on mobile, `object-fit: contain`
3. **Tagline** — existing text in Space Grotesk, 13–14px, weight 400, `rgba(0,0,0,0.45)`, max-width ~260px
4. **Buttons** — outlined orange `O Klubu` (border 2px `#f97316`, border-radius 6px) + ghost text link `Momčad →` in muted gray

## Typography

- Space Grotesk for all text elements (eyebrow, tagline, buttons)
- Already loaded via Google Fonts import in `src/index.css`
- No large display title — the logo replaces it entirely

## Mobile

- Same centered single-column layout
- Logo scales to 110px
- Remove the mobile stat strip (`md:hidden flex border-t` section)
- Padding adjustments as needed

## What gets removed

- Left-column stacked text title (NK / Veli / Vrh)
- Right-column stats rows (position, points, wins, goals)
- Mobile stat strip at the bottom
- `useStandings` hook import and stats data (no longer used in this component)

## Files affected

- `src/components/home/HeroSection.tsx` — full rewrite of JSX, keep existing motion/framer-motion animations
