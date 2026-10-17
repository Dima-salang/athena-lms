# UI changelog — "Cobalt Kiosk" (retro-futurist neobrutalist)

Branch: **`feat/ui-neobrutalist`** (branched from `feat/ui-refresh`).
This is an **alternate visual direction**, not a rewrite. Same components, same copy, same
routes, same APIs, same tests — only the design layer changed.

Compare with:

```sh
git checkout feat/ui-refresh        # "Pine + warm stone + gold" (refined / institutional)
git checkout feat/ui-neobrutalist   # "Cobalt Kiosk" (retro-futurist neobrutalist)
```

---

## 1. The direction

**Cobalt Kiosk** — the look of a 1980s public terminal that a modern product team rebuilt with
taste: bone graph-paper surfaces, one loud cobalt, electric lime for the moments that matter,
and near-ink borders on everything. Bold graphic, but every choice is there to carry meaning,
so it stays readable for a teacher at 7am and a student on a phone.

| Ingredient | Decision |
|---|---|
| Surfaces | Bone paper (`#F4F0E4`-ish) with a faint graph-paper grid on `body` |
| Ink | Near-black borders, 2px, on every surface and control |
| Depth | **Hard** offset shadows — no blur, no soft glow |
| Corners | Square (radius 0). Pills and avatars stay round |
| Colour | Cobalt primary; electric lime for highlight/selection; orange + green + red for status only |
| Type | Archivo Black (display) · Archivo (body) · Space Mono (machine labels) |
| Motion | 120ms press: hover lifts 1px + shadow grows, click snaps down 2px |

Dark mode inverts to an ink terminal: light warm hairlines, and the offset shadows **glow
cobalt** instead of darkening, so elevation still reads on a near-black page.

---

## 2. Tokens (`src/app/globals.css`)

Rewritten in place — the previous "Pine + warm stone + gold" values are on `feat/ui-refresh`.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--background` | `45 38% 93%` | `240 16% 6%` | bone paper / ink |
| `--card` | `48 55% 98%` | `240 13% 10%` | panel |
| `--primary` | `232 88% 50%` | `232 100% 73%` | cobalt action |
| `--accent` | `232 62% 92%` | `232 34% 22%` | hover wash |
| `--lime` *(new)* | `74 96% 45%` | `74 92% 55%` | highlight + text selection |
| `--gold` | `36 96% 48%` | `40 100% 60%` | caution / upcoming (tangerine now) |
| `--success` / `--warning` / `--destructive` | `152 84% 30%` / `28 100% 48%` / `349 92% 46%` | brighter | status only |
| `--border` / `--input` | `240 12% 11%` | `46 22% 76%` | the 2px ink edge |
| `--ring` | `232 88% 50%` | `74 92% 55%` | focus (lime in dark) |
| `--shadow-ink` | `240 12% 11%` | `232 92% 58%` | hard-shadow colour |

**Two levers restyle the whole app from one place**, so no component had to be hunted down:

- `--radius-sm|md|lg|xl: 0px` → every `rounded-md/lg/xl` in the codebase collapses to square.
- `--shadow-xs|sm|md|lg|xl` → mapped to `--elev-1|2|3` (`2px/4px/6px 0 0 hsl(--shadow-ink)`),
  so every existing soft shadow becomes the hard offset.

New/updated utilities: `bg-paper` (dots), `bg-grid`, `bg-scanlines`, `bg-hazard` (diagonal
danger stripes), `nb` (2px edge + offset), `nb-press` (hover lift / click snap), `label-mono`
(mono, uppercase, tracked — **no font-size**, so it never fights `text-xs`/`text-sm`).

`html { font-synthesis-weight: none }` — Archivo Black ships one weight, so `font-semibold`
must silently no-op instead of the browser smearing faux-bold onto headings.

---

## 3. Type (`src/app/fonts.ts`)

| Role | Before | After |
|---|---|---|
| Display | Fraunces (serif) | **Archivo Black** |
| Body | Public Sans | **Archivo** |
| Mono | system stack | **Space Mono** |

Loaded via `next/font` (self-hosted, no layout shift). `--font-display` now resolves to Archivo
Black, and base `h1–h3` get it automatically, plus `letter-spacing: -0.02em`.

Machine labels (badges, table headers, stat labels, field labels, section titles, sidebar
captions) now use `label-mono` + `text-xs` — short words only, so the uppercase mono reads as
instrumentation rather than shouting.

---

## 4. What changed, file by file

**Shell**

- `Navbar` — solid card background (no blur), 2px bottom border, square avatar tile, display-face
  wordmark. Account-name block no longer uses `DropdownMenuLabel` (which is now mono/uppercase).
- `Sidebar` / `MobileNav` — 2px rules, mono "Navigation" caption, bordered square drawer header.
- `BrandMark` — square tile with ink edge + offset.
- `AuthShell` — dots background, bigger offset card, mono footer.

**Primitives (`src/components/ui/`)**

- `button` — 2px ink edge, hard shadow, press feedback; `outline` sits on card.
- `card` — 2px edge, `shadow-md` offset, square.
- `badge` — square mono-uppercase stamp with 2px edge; `athena` role badge is now lime.
- `alert` — 2px edge with a **10px status stripe** on the left; icon keeps the status colour.
- `input` / `textarea` / `select` / `radio-group` — 2px ink edges, square, hover darkens the
  edge, focus = cobalt edge + soft ring.
- `dialog` / `sheet` — 2px edge, `shadow-xl` offset, square "close" key, no zoom-blur.
- `table` — mono uppercase headers on a tinted header row, 2px row rules, cobalt row hover.
- `tabs` — bordered segmented control, active tab is solid cobalt.
- `dropdown-menu` — 2px edge, offset, cobalt focus rows, mono group labels.
- `progress` / `separator` — 2px, square.
- `page-header` — display title + a cobalt **title bar** under it (the same signature mark on
  every screen).
- `stat-card` — square metric tile; icon sits in a solid, ink-edged colour block; whole tile
  presses when it links somewhere.
- `empty-state` — 2px dashed frame, round icon plate.
- `toaster` — square, 2px edge, offset; status colours on the border.
- `confirm-dialog` — destructive confirms get a **hazard-stripe strip** across the top.
- `form-field` — `FormSection` gets a dashed rule + mono title with a cobalt tick; checkbox rows
  are ink-edged and square.

**Feature surfaces**

- `QuestionEditor` — option rows ink-edged and square, correct-answer letter is a bordered key,
  option inputs inherit the card surface.
- `QuestionRenderer` — option rows ink-edged and square; option letters are bordered keys.
- `AnswerReview`, `QuestionPalette` — square, ink-edged.
- `ExamHeader` / teacher `TestEditorBar` — solid sticky bars with 2px bottom rules.
- Student dashboard test cards — 8px cobalt top bar instead of a subtle 4px tint.
- Teacher/student filter panels + table empty states — 2px ink edges.
- Admin pages: replaced the last literal Tailwind colours (`emerald`/`indigo`/`blue`/`amber`,
  `bg-emerald-50`, `rounded`) with tokens so nothing looks half-themed. **Structural** admin
  work is still Phase 4.

---

## 5. Not changed

- URLs, Prisma schema, API routes, grading, transmutation, auth, business logic.
- User-facing copy — the plain-language pass from Phases 1–3 is untouched.
- Component export names and file paths (`QuestionEditor`, `QuestionPalette`, `QuestionRenderer`,
  `StickyTimer` unit tests keep importing the same paths).
- Tests: 109/109 still pass, unchanged.

---

## 6. Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npx vitest run` | 109/109 pass (13 files) |
| `ESLINT_USE_FLAT_CONFIG=false npx next lint --dir src` | clean |
| `npm run build` | green |
| Emitted CSS audit | `.shadow-sm/.md/.xl → var(--elev-N)`, `.rounded-xl{border-radius:0}`, `--elev-*` present in both `:root` and `.dark`, `.nb-press` emits `:hover`/`:active` |
| Literal palette leftovers | none (`bg-black` only in the two modal overlays) |

---

## 7. Notes & trade-offs

- `font-synthesis-weight: none` is deliberate (see §2). Supported in Chrome 97+, Firefox 111+,
  Safari 16.4+.
- Some hand-rolled 1px dividers deeper in feature code stay 1px — on a bone page they read as
  hairlines next to the 2px surfaces, which is intentional hierarchy, not an oversight.
- Body now renders on a graph-paper grid; cards remain opaque so text contrast is unaffected.
- Admin screens are token-clean but still structurally Phase 4 (own headers, no filters pass).
