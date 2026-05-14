# Hero Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two-column HeroSection (text left, stats right) with a centered, logo-forward layout over a warm CSS-only abstract background.

**Architecture:** Single file rewrite of `HeroSection.tsx`. The stats panel and standings data are removed entirely. The club logo replaces the stacked text title. Background is three CSS radial-gradient blobs — no image file needed.

**Tech Stack:** React, TypeScript, Tailwind CSS, framer-motion (`motion/react`)

---

### Task 1: Rewrite HeroSection — desktop layout

**Files:**
- Modify: `src/components/home/HeroSection.tsx`

- [ ] **Step 1: Replace the file contents**

Replace the entire file with the following:

```tsx
import { motion } from "motion/react";
import Button from "@/components/ui/Button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ background: "#fff8f3" }}>
      {/* Top gradient bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[5px] z-10"
        style={{ background: "linear-gradient(to right, #f97316, #fb923c, #f97316)" }}
      />
      {/* Left orange accent */}
      <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-orange-500 z-10" />

      {/* Background blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 380, height: 380, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.28) 0%, transparent 65%)",
          top: -130, left: -110,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,146,60,0.22) 0%, transparent 65%)",
          bottom: -90, right: -70,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 220, height: 220, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(253,186,116,0.25) 0%, transparent 65%)",
          top: 10, right: 30,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[540px] py-16 px-6">
        <motion.span
          className="block mb-5 text-orange-500 uppercase tracking-[5px] text-[10px] font-bold"
          style={{ fontFamily: "var(--font-display)" }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          — Pula · Istra —
        </motion.span>

        <motion.img
          src="/images/logo.png"
          alt="NK Veli Vrh"
          className="w-[140px] h-[140px] md:w-[140px] md:h-[140px] object-contain mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />

        <motion.p
          className="text-[14px] text-gray-500 leading-relaxed max-w-[280px] mb-8"
          style={{ fontFamily: "var(--font-display)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Tradicija, zajednica i strast prema nogometu iz srca Istre.
        </motion.p>

        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button href="/about" variant="outline" size="md">
            O Klubu
          </Button>
          <a
            href="/team"
            className="font-semibold text-[13px] text-gray-400 hover:text-orange-500 transition-colors duration-200"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Momčad →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/mihaelmaras/veli-vrh-fc && npm run build
```

Expected: Build succeeds with no TypeScript errors. If there are errors, check the import paths — `Button` is at `@/components/ui/Button` and `motion` is from `motion/react`.

- [ ] **Step 3: Start dev server and verify visually**

```bash
cd /Users/mihaelmaras/veli-vrh-fc && npm run dev
```

Open `http://localhost:5173` and check:
- Hero is centered, no stats panel visible
- Logo appears at ~140px
- Eyebrow text "— Pula · Istra —" shows in orange above logo
- Tagline and buttons are below
- Orange blobs visible in background corners
- Left orange accent strip and top gradient bar still present
- Entrance animations play on load

- [ ] **Step 4: Check mobile layout**

In browser devtools, switch to a mobile viewport (e.g. 390px wide) and verify:
- Layout stays centered and readable
- Logo still visible (Tailwind's responsive classes handle scaling — `w-[140px]` applies at all sizes, reduce to `w-[110px]` on mobile if it feels too large by changing the `className` on the `<motion.img>` to `"w-[110px] h-[110px] md:w-[140px] md:h-[140px] object-contain mb-6"`)

- [ ] **Step 5: Commit**

```bash
cd /Users/mihaelmaras/veli-vrh-fc && git add src/components/home/HeroSection.tsx && git commit -m "feat: redesign HeroSection to centered logo layout with orange blob background"
```
