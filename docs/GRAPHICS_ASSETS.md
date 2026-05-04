# QuestHub — Required Graphics Assets

> Fantasy RPG-themed GitHub client. Dark theme (#111111), gold accents (#d4a940), pixel font (Press Start 2P).
> Currently has **zero image assets** — all visuals are CSS-only flat colors and Unicode symbols.

## Color Reference

| Token            | Hex       |
|------------------|-----------|
| Surface          | `#111111` |
| Surface Raised   | `#1c1c1c` |
| Surface Overlay  | `#252525` |
| Panel            | `#2c2518` |
| Panel Light      | `#3a3020` |
| Accent (green)   | `#4ade80` |
| Accent Gold      | `#d4a940` |
| Accent Gold Dim  | `#8b7230` |
| Accent Red       | `#ef4444` |
| Accent Blue      | `#3b82f6` |
| Accent Purple    | `#a855f7` |
| Text Primary     | `#e5e5e5` |
| Text Secondary   | `#b0b0b0` |
| Text Muted       | `#666666` |
| Border Subtle    | `#333333` |

---

## 1. Branding

| Asset | Description | Size | Used In |
|-------|-------------|------|---------|
| `logo.svg` | Pixelated RPG diamond/shield emblem. Replaces the Unicode `◆` glyph. Gold (#d4a940) on transparent. Should read as an 8-bit quest marker or guild crest. | 48×48 (SVG, scalable) | Top bar, home page hero |
| `logo-wide.svg` | Horizontal lockup: logo mark + "QUEST FOR CODE" text treatment. | 200×32 (SVG) | Top bar header |
| `favicon.ico` | Small version of the logo mark for browser tab. | 32×32 + 16×16 | `<head>` favicon |
| `favicon.svg` | SVG favicon for modern browsers. | 32×32 (SVG) | `<head>` favicon |
| `apple-touch-icon.png` | iOS home screen icon. Gold emblem on dark (#111111) background. | 180×180 | `<head>` meta |
| `og-image.png` | Social sharing card. Dark background, logo, "Quest for Code" title, tagline "A fantasy RPG-themed GitHub client." | 1200×630 | `<meta property="og:image">` |

---

## 2. Page Backgrounds

| Asset | Description | Size | Used In |
|-------|-------------|------|---------|
| `bg-parchment.webp` | Subtle dark parchment/vellum texture. Very low opacity aged paper grain over #111111. Must tile seamlessly. Think old dungeon map paper, barely visible. | 512×512 (tileable) | `<body>` background, repeating |
| `bg-hero-vignette.webp` | Radial dark vignette with faint RPG motifs (compass roses, runes, map lines). Centered soft glow in gold tones. | 1920×1080 | Home page (`/`) full-page background |
| `bg-login.webp` | Dark dungeon gate or guild hall entrance, heavily darkened and blurred. Atmospheric. | 1920×1080 | Login page (`/login`) background |
| `bg-404.webp` | Abandoned ruins or foggy wasteland scene, very dark and desaturated. "Lost adventurer" mood. | 1920×1080 | Not Found page (`404`) |

---

## 3. Panel / Section Textures

| Asset | Description | Size | Used In |
|-------|-------------|------|---------|
| `panel-texture.webp` | Subtle dark leather or worn wood texture for ornate-bordered panels. Low contrast, tiling. Replaces flat `#1c1c1c`. | 256×256 (tileable) | `RpgPanel` default variant |
| `panel-parchment.webp` | Warm parchment/scroll paper texture with slight aged staining. Replaces flat `#2c2518`. | 512×512 (tileable) | `RpgPanel` parchment variant, `ReadmeTome` |
| `panel-dark.webp` | Stone or obsidian surface texture. Very subtle, just enough to add depth. Replaces flat `#111111`. | 256×256 (tileable) | `RpgPanel` dark variant, `CommitTerminal` |

---

## 4. Decorative / UI Elements

| Asset | Description | Size | Used In |
|-------|-------------|------|---------|
| `border-corner.svg` | Ornate gold corner flourish for `.ornate-border` panels. Celtic/fantasy knotwork or scroll corner piece. Applied to all four corners via CSS rotation. | 32×32 (SVG) | All `ornate-border` panels |
| `divider-ornate.svg` | Horizontal decorative rule. Gold filigree line with center diamond motif. | 320×16 (SVG) | Between sections on home page, panel headers |
| `scroll-top.svg` | Rolled scroll edge for top of README tome. Gives appearance of unfurled scroll. | 100% width × 24px (SVG) | `ReadmeTome` top edge |
| `scroll-bottom.svg` | Rolled scroll edge for bottom of README tome. | 100% width × 24px (SVG) | `ReadmeTome` bottom edge |

---

## 5. Hero / Splash Illustrations

| Asset | Description | Size | Used In |
|-------|-------------|------|---------|
| `hero-emblem.webp` | Large ornate guild crest or quest marker. Centered decorative emblem. Replaces the small `◆` Unicode. Gold with subtle glow, transparent background. | 240×240 | Home page hero section |
| `guild-banner.webp` | Decorative banner/pennant illustration for the "Join the Guild" sign-in CTA. Medieval guild recruitment poster feel. | 400×200 | Home page sign-in card |
| `empty-state-chest.webp` | Closed or empty treasure chest. Pixel art or painterly RPG style. For "no results" states. | 200×200 | Dashboard empty state, issue list empty, README missing |

---

## 6. Sidebar / RPG Status Art

| Asset | Description | Size | Used In |
|-------|-------------|------|---------|
| `avatar-frame.svg` | Ornate gold filigree frame overlay for user avatar images. Wraps around GitHub profile pictures. | 64×64 (SVG) | `InventorySidebar`, `TopBar`, `Dashboard` user avatar |
| `stat-bar-frame.svg` | Decorative frame for HP/MP/EXP bars. Metallic bar ends with rivets or fantasy styling. | 100% width × 16px (SVG) | `StatBar` component |

---

## 7. Contribution Map (Terrain Tiles)

| Asset | Description | Size | Used In |
|-------|-------------|------|---------|
| `terrain-sprite.png` | Sprite sheet with 6 terrain tile variants matching existing CSS classes: wasteland (#1a1a1a, empty), dirt (#3d2e1a, low), grass (#2d5a1e, medium), forest (#1a7a2e, high), mountain (#4a8a3a, very high), shrine (#6aee5a, max + glow). Pixel art, 8×8px per tile. | 48×8 (sprite sheet) | `ContributionMap` cells |

---

## 8. File Type Icons

| Asset | Description | Size | Used In |
|-------|-------------|------|---------|
| `file-icons.svg` | SVG icon set for file types. Replaces Unicode emoji (📁📄). Fantasy-themed variants: folder → chest/pouch, file → scroll, code file → enchanted scroll, markdown → book, config → gear/rune, image → painting. Approximately 12 icons. | 16×16 each (SVG sprite) | `FileScroll` file listing |

---

## 9. Footer / Chrome

| Asset | Description | Size | Used In |
|-------|-------------|------|---------|
| `scanline-overlay.png` | Very subtle CRT/terminal scanline overlay. Horizontal lines at ~50% opacity, tiling vertically. Sells the "terminal" aesthetic. | 4×4 (tileable) | `CommitTerminal` overlay |
| `footer-pattern.svg` | Repeating decorative pattern for repo dashboard footer bar. Subtle geometric or runic border pattern. | tileable × 8px (SVG) | Repo page footer |

---

## Priority Tiers

### Tier 1 — Ship Blockers

1. `favicon.svg` / `favicon.ico` — no favicon currently exists
2. `og-image.png` — social sharing is broken without this
3. `hero-emblem.webp` — home page centerpiece is a raw Unicode character
4. `bg-parchment.webp` — body background is completely flat

### Tier 2 — High Impact Polish

5. `panel-parchment.webp` — README panel needs scroll/parchment texture
6. `border-corner.svg` — ornate borders need actual ornament
7. `logo.svg` + `logo-wide.svg` — branding
8. `bg-hero-vignette.webp` — home page atmosphere
9. `file-icons.svg` — file listing uses raw emoji

### Tier 3 — Immersion / Nice to Have

10. `terrain-sprite.png` — contribution map tiles
11. `panel-texture.webp` / `panel-dark.webp` — panel depth
12. `scroll-top.svg` / `scroll-bottom.svg` — README scroll edges
13. `scanline-overlay.png` — terminal effect
14. `avatar-frame.svg` — user avatar decoration
15. `stat-bar-frame.svg` — RPG bar chrome
16. `guild-banner.webp` — sign-in card illustration
17. `empty-state-chest.webp` — empty state illustration
18. `bg-login.webp` / `bg-404.webp` — page-specific backgrounds
19. `divider-ornate.svg` — section dividers
20. `footer-pattern.svg` — footer decoration
21. `logo-wide.svg` — top bar wordmark
22. `apple-touch-icon.png` — iOS icon

**Total: ~22 assets**
