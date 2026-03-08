# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static, single-page scrollytelling fan website for the anime *Jujutsu Kaisen*. No build system, no package manager, no framework — just three files served directly in a browser.

## Running the Site

Open `index.html` directly in a browser:
```
start index.html          # Windows
open index.html           # macOS
```

For development with live reload, use any static server (e.g. VS Code Live Server extension, or `npx serve .`). There are no build, lint, or test commands.

## File Structure

| File | Role |
|---|---|
| `index.html` | Full page structure — all 7 sections, all content, image URLs |
| `style.css` | All styling — design tokens (CSS vars), section styles, animations (keyframes) |
| `script.js` | All interactivity — GSAP animations, canvas particle systems, cursor, scroll triggers |

## Architecture

### Sections (in scroll order)
1. **Hero** — full-screen canvas particle system + mouse-parallax layers
2. **Lore** — animated cards + orbital diagram (`#lore`, canvas: `#loreCanvas`)
3. **Characters** — 5 character blocks with real artwork images from `static.wikia.nocookie.net`
4. **Techniques** — CSS 3D flip cards (`#techniques`, canvas: `#techCanvas`)
5. **Curses** — curse grade hierarchy with parallax ambient silhouettes
6. **Moments** — 3 cinematic panels with scene images + character portrait images
7. **Ending** — constellation canvas + quote (`#endingCanvas`)

### JavaScript modules (all IIFEs in `script.js`)
Each feature is a self-contained IIFE numbered 1–14:
- **1** `initCursor` — custom cursor + trail via GSAP
- **2** `initNav` — scroll-state nav + smooth-scroll links
- **3** `initHeroCanvas` — `Particle` and `WaveLine` classes, mouse-repulsion particle system
- **4** `initHeroParallax` — mouse-driven multi-layer depth parallax
- **5** `initLoreCanvas` — floating `Orb` objects
- **6** `initTechCanvas` — animated grid lines
- **7** `initEndingCanvas` — `Pt` constellation with connection web
- **8** `initScrollAnimations` — all GSAP ScrollTrigger scroll-driven entrance animations
- **9** `initRipple` — click ripple DOM effect
- **10** `initGlitch` — hero title decode/glitch effect on load
- **11** `initSukunaEffect` — red screen flash on Sukuna section enter
- **12** section label glow pulse (inline, no function wrapper)
- **13** `initPageLoad` — branded loader overlay
- **14** resize handler

### CSS design tokens (`:root`)
Key custom properties: `--clr-purple`, `--clr-blue`, `--clr-red`, `--glow-purple`, `--glow-blue`, `--font-display` (Cinzel), `--font-jp` (Noto Sans JP), `--font-body` (Inter), `--ease-out-expo`.

### External dependencies (CDN, no local copies)
- **GSAP 3.12.5** — `gsap.min.js`, `ScrollTrigger.min.js`, `ScrollToPlugin.min.js` from cdnjs
- **Google Fonts** — Cinzel, Inter, Noto Sans JP
- **Character images** — `static.wikia.nocookie.net/jujutsu-kaisen/` (Fandom wiki CDN, served as WebP)

### Character image URLs pattern
```
https://static.wikia.nocookie.net/jujutsu-kaisen/images/{hash}/{Filename}.png/revision/latest?cb={timestamp}
```
Images are hotlinked directly; no local copies are stored.

### Key CSS conventions
- All scroll-animated elements start visible (GSAP sets initial states at runtime via `gsap.from()`/`gsap.set()`).
- Character-specific colours are applied via modifier classes: `.yuji-energy`, `.gojo-aura`, `.sukuna-stat`, etc.
- The `::after` pseudo-element on `.char-portrait` creates the bottom vignette fade.
- `will-change: transform, opacity` is applied to heavily animated elements.
