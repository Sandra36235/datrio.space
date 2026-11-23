# Datrio maximalista — Fase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The home page becomes a scroll-driven film over the existing salon: new palette and type, an animated awning intro, chapters 0–4 (intro, café, música, biblioteca + setup, Puyol) with the 3D camera moving per chapter, and an "Explorar a mi aire" button that returns today's free interaction.

**Architecture:** A pure module `tour-math.js` holds chapter data math (which chapter, interpolated camera shot) and is unit-tested in Node. `tour.js` drives the page: scroll progress, story cards, intro awning and falling objects, free-mode toggle. `universe.js` gains a small camera API (`setShot`, `setTourMode`, `setNight`) that `tour.js` calls; its render loop already eases toward targets. `maximal.css` carries the new palette, type and motifs for the home page.

**Tech Stack:** Vanilla ES modules, Three.js (vendor), CSS; no new libraries; Node for `scripts/check-*.mjs`.

**Spec:** `docs/superpowers/specs/2026-11-23-datrio-maximalista-design.md`

## Global Constraints

- Palette tokens exactly: `--cherry:#8E1825; --columbia:#C8D9EC; --butter:#FFEDAD; --chocolate:#3D2722; --paper:#FFF8EE`. No cream gradients.
- Titles: Bricolage Grotesque 800 uppercase; signature: Fraunces italic; body: DM Sans.
- Never touch the pet paintings (`petPortrait`, `applySalonArt` paintings, `art/pet-paintings-v1.png`, their frames) and never remove salon details.
- Puyol chapter is serene: no stickers or falling objects while it is on screen.
- `prefers-reduced-motion: reduce` → no falling objects, awning already open, camera jumps (no easing).
- No horizontal scroll at 375px width.
- `node scripts/check-living-room.mjs` keeps passing; bump `?v=` strings to `pastel-11` for every changed module and `maximal.css?v=1`.
- No new external libraries or downloads.

## Review Focus

1. Phone touch-scrolling over the 3D canvas during the tour must scroll the page, not rotate the room → Task 3 sets canvas `pointer-events:none` in tour mode; Task 5 checks it at 375px.
2. Arriving from an interior page with `#salon` or `#estudio` → `#salon` starts the tour at chapter 1, `#estudio` enters free mode in the studio → Task 2 `chapterForHash` test + Task 5 check.
3. Resizing / rotating the phone mid-tour keeps the current chapter and shot → Task 4 recomputes on `resize`.
4. Free mode then scrolling: the camera stays where the visitor left it until "Volver al recorrido" → Task 4 + Task 5 check.
5. Reduced motion: page fully usable, cards readable, no awning/falling animation → Task 5 check with emulation.

---

### Task 1: Palette, type and motifs (`maximal.css`)

**Files:**
- Create: `maximal.css`
- Modify: `index.html` (load `maximal.css?v=1` last; add Bricolage Grotesque 800 to the Google Fonts link; `theme-color` → `#8E1825`)

**Interfaces:**
- Produces CSS classes used by Tasks 3–4: `.film`, `.film-stage` (sticky full-viewport stage), `.chapter` (one per chapter, `min-height:100vh`), `.story-card` (+ `.is-on` when active, `.serene` for Puyol), `.awning` (+ `.open`), `.faller`, `.marquee`, `.sticker`, `.free-toggle`, `.scribble`.
- Utility look: `.stripes` (repeating cherry/columbia 56px bands), `.checks`, `.festoon` (scalloped bottom edge via radial-gradient mask).

- [ ] **Step 1:** Write `maximal.css` with the tokens from Global Constraints on `:root`, `body{background:var(--cherry);color:var(--paper)}` on the home page, the topbar/nav/buttons recolored (butter pills with chocolate text, selected = columbia), and the classes above. Story cards: chocolate text on butter or columbia blocks, flat, `border-radius:28px`, sticker slot top-right. `.awning` covers the viewport with `.stripes` and `transform:translateY(-100%)` when `.open` (transition 1.4s `cubic-bezier(.7,0,.2,1)`). `.faller` keyframes `fall` (translateY 0→110vh, rotate to `var(--r)`), `.marquee` keyframes `mq` (translateX 0→-50%), `.sticker` keyframes `spin` 9s linear. Everything animated is disabled under `prefers-reduced-motion`.
- [ ] **Step 2:** Load it in `index.html` after `salon-theme.css`; open `http://localhost:4175/` and confirm the header, buttons and background use the new palette with no console errors.
- [ ] **Step 3: Commit** `git commit -m "Add the maximal palette, type and motifs for the home page"`

---

### Task 2: Tour math (`tour-math.js`) with Node tests

**Files:**
- Create: `tour-math.js`, `scripts/check-tour.mjs`

**Interfaces:**
- Produces:
  - `export const CHAPTERS` — array of `{id, shot:{angle, elevation, zoom, focus:[x,y,z]}, night}` for ids `intro, cafe, musica, biblioteca, puyol` in that order. Starting values (builder tunes visually in Task 5): intro `{angle:.72,elevation:.64,zoom:1,focus:[0,1.6,0]}, night:1`; cafe focus `[-6.3,1.4,-2.5]`, zoom `2.1`; musica focus `[3.5,1.2,-4.8]`, zoom `2.1`; biblioteca focus `[-3.9,2,-4.7]`, zoom `1.8`; puyol focus `[5.8,.5,2.5]`, zoom `2.3`; all non-intro `night:0`.
  - `chapterAt(progress:number, count:number) -> {index:number, t:number}` — `progress` in [0,1] over the whole film; clamps; `t` in [0,1] within the chapter.
  - `shotAt(progress:number, chapters=CHAPTERS) -> {angle, elevation, zoom, focus:[x,y,z], night}` — eases from chapter `i` to `i+1` only during the last 35% of chapter `i` (smoothstep), otherwise holds chapter `i`'s shot.
  - `chapterForHash(hash:string) -> {mode:'tour'|'free', room:'salon'|'estudio', index:number}` — `'#salon'` → tour, salon, 1; `'#estudio'` → free, estudio, 0; anything else → tour, salon, 0.

- [ ] **Step 1: Write the failing tests** in `scripts/check-tour.mjs` (plain `node:assert`):
  - `chapterAt(0,5)` → `{index:0,t:0}`; `chapterAt(1,5)` → `{index:4,t:1}`; `chapterAt(-2,5).index===0`; `chapterAt(0.5,5)` → `{index:2,t:.5}`.
  - `shotAt(0.1).zoom === CHAPTERS[0].shot.zoom` (holding); `shotAt(0.2 - 1e-9)` focus within 1e-6 of `CHAPTERS[1].shot.focus` (end of chapter 0 blends fully into 1); a mid-blend value lies strictly between the two zooms.
  - `shotAt(1).focus` equals the Puyol focus; `shotAt(0).night===1`; `shotAt(0.4).night===0`.
  - `chapterForHash('#salon')` deep-equals `{mode:'tour',room:'salon',index:1}`; `('#estudio')` → `{mode:'free',room:'estudio',index:0}`; `('')` → `{mode:'tour',room:'salon',index:0}`.
  - Print `Tour math checks passed.`
- [ ] **Step 2:** Run `node scripts/check-tour.mjs` → fails (module missing).
- [ ] **Step 3:** Implement `tour-math.js` with the signatures above (angles interpolate linearly; focus per component; night linear).
- [ ] **Step 4:** Run `node scripts/check-tour.mjs` → `Tour math checks passed.`
- [ ] **Step 5: Commit** `git commit -m "Add tour chapter math with tests"`

---

### Task 3: Camera API in `universe.js`

**Files:**
- Modify: `universe.js` (render loop, new exported functions), `index.html` (module version)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces (exported from `universe.js`):
  - `setShot(shot:{angle,elevation,zoom,focus:[x,y,z]})` — sets `targetAngle/targetElevation/targetZoom` and a new `targetFocus` that the render loop eases toward (replacing the walker-follow focus while touring); `lookAt` uses the focus y.
  - `setTourMode(on:boolean)` — on: hides `#pins`, `.view-controls`, `.walk-hud`; adds `body.touring` (CSS sets the canvas `pointer-events:none`); disables drag/zoom handlers; `walker?.enabled(false)`. Off: restores everything, clears `targetFocus` (back to walker follow), calls `resetView()`.
  - `setNight(t:number)` — 0 = today's lighting, 1 = night: lerps `renderer.toneMappingExposure` 1.02→0.42, hemisphere sky color toward `#2a2350`, and a warm `PointLight` added in `setup()` near the salon lamps from intensity 0→2.2.
  - `chooseRoom(name)` stays as is but is exported.

- [ ] **Step 1:** Implement the three functions and the `targetFocus` easing in `render` (same `factor` as angle/zoom; reduced motion snaps). Bump module versions to `pastel-11`.
- [ ] **Step 2:** Run `node scripts/check-living-room.mjs` → still `All four interactive stations are reachable and restore their props.`
- [ ] **Step 3:** In the browser console: `const u=await import('/universe.js?v=pastel-11')` is not needed — instead temporarily verify through Task 4; here only confirm the page loads with no console errors and free interaction is unchanged.
- [ ] **Step 4: Commit** `git commit -m "Expose a camera API for the scroll tour"`

---

### Task 4: The film (`tour.js` + `index.html` structure)

**Files:**
- Create: `tour.js`
- Modify: `index.html` (structure), `universe.js` (import and start the tour after `setup()`)

**Interfaces:**
- Consumes: `CHAPTERS, chapterAt, shotAt, chapterForHash` (Task 2); `setShot, setTourMode, setNight, chooseRoom` (Task 3); CSS classes (Task 1).
- Produces: `export function startTour()` called once by `universe.js` after setup.

Markup (in `index.html`, replacing `<main class="experience">…</main>`; the worldbar, shortcuts and footer stay below the film):
```
<section class="film" id="film">
  <div class="film-stage"> [existing .stage contents: canvas, pins, view-controls, walk-hud, loading]
    <div class="awning stripes"></div>
    <div class="fallers" aria-hidden="true"></div>
    <div class="marquee">datos · café · puyol · música · ideas · …</div>
    <button class="free-toggle">Explorar a mi aire</button>
  </div>
  <article class="chapter" data-chapter="intro"> h1.hero-title "PASA, ESTÁS EN" + <em>mi cabeza.</em> </article>
  <article class="chapter" data-chapter="cafe">  .story-card: kicker "01 · Café & matcha", text "Aquí no hay prisa. Hay agua caliente, una balanza y la paciencia de esperar a que el café diga lo suyo.", link rincon.html?zona=coffee "Entrar al rincón →" </article>
  <article class="chapter" data-chapter="musica"> "02 · Mi música", "Ukelele hace un par de años, el piano en la lista y rock argentino de fondo.", rincon.html?zona=music </article>
  <article class="chapter" data-chapter="biblioteca"> "03 · Biblioteca y setup", "Lo que enseño, lo que construyo y las herramientas con que lo hago.", links biblioteca.html "La biblioteca →" and rincon.html?zona=tech "Mi setup →" </article>
  <article class="chapter" data-chapter="puyol"> .story-card.serene "04 · Mi compañero", "Puyol · 2016 — 2025. Mi cable a tierra durante nueve años.", rincon.html?zona=dog "Conocer a Puyol →" </article>
</section>
```

- [ ] **Step 1:** Restructure `index.html` as above; keep every existing id the scripts use (`universe`, `pins`, `zoom-in`, `zoom-out`, `reset-view`, `room-caption`, `loading`, `webgl-fallback`, `library-transition`, `about`, `gallery-nav`, `object-buttons`, dialogs).
- [ ] **Step 2:** Implement `startTour()` in `tour.js`:
  - progress = scroll position through `#film` (0 at its top, 1 when its last chapter reaches the top); on `scroll` (rAF-throttled) and `resize`: `setShot(shotAt(p))`, `setNight(shotAt(p).night)`, toggle `.is-on` on the story card of `chapterAt(p,5).index`.
  - Intro: on load add `.open` to `.awning` after 600ms; spawn 8 `.faller` SVGs (cups, records, books, Puyol's ball, in palette colors; 4 on width < 720) that loop while chapter 0 is on screen and stop otherwise; none when the Puyol chapter is on or reduced motion is set.
  - `.free-toggle`: switches between tour and free (`setTourMode(false)`, label "Volver al recorrido"); while free, scroll does not call `setShot`.
  - Hash: on load and `hashchange`, `chapterForHash(location.hash)` → tour scrolls to that chapter's top; free + `estudio` → `chooseRoom('estudio')` and free mode. Nav "Mi universo" → tour chapter 1; "Lo que hago" → free studio.
  - Starts in tour mode: `setTourMode(true)`.
- [ ] **Step 3:** In `universe.js`, `import {startTour} from './tour.js?v=pastel-11'` and call it at the end of `setup()` when WebGL works (skip on `fallback()`).
- [ ] **Step 4:** Run `node scripts/check-tour.mjs` and `node scripts/check-living-room.mjs` → both pass.
- [ ] **Step 5: Commit** `git commit -m "Turn the home page into a scroll film over the salon"`

---

### Task 5: Tune and verify in the browser

**Files:**
- Modify: `tour-math.js` (shot values only), `maximal.css` (spacing only)

- [ ] **Step 1:** At 1280×800, scroll through all five chapters; adjust each `CHAPTERS[i].shot` until its subject (coffee bar, record console, bookshelf + setup, Puyol's bed) is centered and readable beside its card. Re-run `node scripts/check-tour.mjs` after editing values (Puyol focus test uses the constant, so it stays green).
- [ ] **Step 2:** Review Focus checks:
  1. 375×812 mobile emulation: swipe over the canvas scrolls the page; no horizontal scroll (`document.documentElement.scrollWidth<=innerWidth`).
  2. Open `/index.html#salon` → lands on chapter 1; `/index.html#estudio` → studio in free mode.
  3. Resize from 1280 to 375 at chapter 2 → still chapter 2's shot.
  4. Click "Explorar a mi aire", scroll → camera does not move; drag rotates; click "Volver al recorrido" → camera returns to the chapter shot.
  5. Emulate `prefers-reduced-motion` → awning already open, no fallers, cards readable.
  Also: Puyol activities still work in free mode (start "Jugar con Puyol" → café), and no console errors.
- [ ] **Step 3:** Run both Node checks → pass.
- [ ] **Step 4: Commit** `git commit -m "Tune the salon tour shots"` — then show Sandra before publishing (push only on her yes).
