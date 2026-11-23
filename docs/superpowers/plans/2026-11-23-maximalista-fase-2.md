# Datrio maximalista — Fase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** A short studio intro (portal + three stops + "Recorrer el estudio") and the maximal look for everything below the 3D stage on the home page.

**Architecture:** `tour-math.js` gains `STUDIO_CHAPTERS`, `STUDIO_MS` and a `total` parameter on `introProgress`; `tour.js` generalises `play()` to take a sequence (room, chapters, duration, captions, end label). The sections below the stage are restyled in `maximal.css` only (markup unchanged except a closing block).

**Tech Stack:** Vanilla JS/CSS, Three.js, Node checks.

**Spec:** `docs/superpowers/specs/2026-11-23-datrio-maximalista-design.md` (see "Cambio de rumbo").

## Global Constraints

- Same palette, fonts and reduced-motion rules as phase 1.
- Intros are skippable at any time, play once per visit (`sessionStorage` keys `datrio-intro-seen`, `datrio-studio-seen`), and never play for `#salon`/`#estudio` arrivals or reduced motion.
- `node scripts/check-tour.mjs` and `node scripts/check-living-room.mjs` pass; module versions → `pastel-14`.

## Review Focus

1. Clicking "Lo que hago" while the salon intro is running → salon intro stops, studio intro plays (once).
2. Clicking a world card while scrolled down → page scrolls back to the stage so the visitor sees the room change.
3. Studio intro then "Mi universo" → salon in free mode, no salon intro replay.

---

### Task 1: Studio intro

**Files:** Modify `tour-math.js`, `scripts/check-tour.mjs`, `tour.js`, `index.html`.

**Interfaces:**
- `export const STUDIO_CHAPTERS` — ids `estudio, tablero, pizarra, diplomas`; shots: estudio `{angle:.72,elevation:.64,zoom:1,focus:[0,1.6,0]}`, tablero focus `[1.2,1.9,-.3]` zoom `2.2`, pizarra focus `[2.7,2.5,-3.9]` zoom `2.1`, diplomas focus `[-.6,3.05,-3.9]` zoom `2.4`; all `night:0`.
- `export const STUDIO_MS=10000`; `introProgress(ms,total=INTRO_MS)`.
- Captions (studio): "01 · El tablero" / "Datos que *cuentan algo.*" / "Tableros en Power BI que responden preguntas de verdad."; "02 · La pizarra" / "Datos → *decisiones.*" / "Y casi siempre, una pregunta nueva."; "03 · Lo que me forma" / "Ingeniería, MBA *y diplomados.*" / "Todo en la Universidad Privada Boliviana." End button "Recorrer el estudio →".

- [ ] Tests first: `STUDIO_CHAPTERS.map(c=>c.id)` deep-equals the ids; `STUDIO_MS` in [8000,12000]; `introProgress(STUDIO_MS/2,STUDIO_MS)≈.5`; `shotAt(1,STUDIO_CHAPTERS).focus` equals the diplomas focus. Run → RED.
- [ ] Implement in `tour-math.js` → GREEN.
- [ ] `tour.js`: `play(seq)` where `seq={room,chapters,ms,captions:Element,label,key}`; the portal = awning drops then lifts (500ms each) while `chooseRoom` switches room; studio captions live in a second `.captions[data-room="estudio"]` block; the end button text comes from `seq.label`.
- [ ] Commit.

### Task 2: Maximal sections below the stage

**Files:** Modify `maximal.css`, `index.html` (closing block before `<footer>`), `tour.js` (scroll to stage on room buttons).

- [ ] World cards: chunky blocks (cherry / columbia / butter backgrounds), 3px chocolate border, 8px offset shadow, Bricolage titles with Fraunces italic accent; illustrations keep popping out; selected card shows a butter "Estás aquí" pill.
- [ ] Explore shortcuts: sticker chips (butter, chocolate border, slight alternating tilt, straighten on hover).
- [ ] Closing block: chocolate band with a big "¿HABLAMOS?" + italic "*sin formalidades.*", a mailto pill and the marquee; footer text in butter on chocolate.
- [ ] Room buttons scroll the stage into view (`film.scrollIntoView({behavior: reduced?'auto':'smooth'})`).
- [ ] Browser: 1280 and 375 widths, no horizontal scroll, no console errors; both Node checks pass. Commit.
