# ACBC Studio

A static, dependency-free port of **acbc-studio.com**, 
One page, three files, no build step, no framework,

```
index.html      the whole page
styles.css      design tokens + layout, 4 breakpoints
script.js       slider + accordion (~120 lines, no libraries)
assets/
  fonts/        3 self-hosted faces
  images/       19 files
```

## Running it

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. That's it — there is nothing to install or compile.

(Open `index.html` directly and it mostly works, but a server is better: the fonts
need proper MIME types.)

## Editing

Text lives in `index.html`. Edit it and reload.

Colours and type live as custom properties at the top of `styles.css`:

```css
--carbon: #1a3031;   --cotton: #fef9f2;   --linen:  #fff6ea;
--beige:  #ede0ce;   --urban-olive: #bfc499;  ...
--font-display: "Aesthet Nova"   /* headings */
--font-label:   "Acumin Pro"     /* section eyebrows */
--font-body:    "Adelle Sans"    /* body copy */
```

Sections in `index.html` are commented and in page order: hero, about, process,
testimonials, ways we work, capacities, founder, newsletter, footer.

## What is still external

Nothing renders from a third party except the **newsletter form**, which is a Ghost
embed pointing at `everyday-justice.ghost.io`. It appears twice (site header and the
newsletter block). Signups continue to go to Ghost exactly as before — there is no
backend to host, and no form handler to replace.

The two call-to-action buttons link out to the Zoom scheduler, as before.

## How it compares to the Webflow build

| | Webflow | here |
|---|---|---|
| JavaScript | jQuery 3.5.1 + 4 Webflow runtime chunks (~280 KB) | 5 KB, no libraries |
| CSS | 116 KB shared stylesheet (~900 unused rules) | 21 KB |
| Fonts | 3 self-hosted faces **+** all weights & italics of Montserrat and Open Sans via `webfont.js` — neither of which this page uses | 3 faces, 374 KB |
| Images | 13 MB | 2.7 MB |
| Requests | ~12 before first paint | 5 |

Whole page is now **3.0 MB**, about **1.0 MB** for the initial view.

## Fidelity

The port was verified by rendering the live site and this build at the same widths
and diffing them pixel by pixel. At **1440, 991, 767 and below-479** every section
boundary lands on the identical pixel row, with mean per-row colour difference
between 0.46 and 1.3 out of 255 (i.e. font antialiasing and JPEG noise).

One deliberate difference remains, between **480 and 767px** — see below.

### Deliberate deviations

1. **Capacities grid, 480–767px.** The original sizes its two columns `1fr 1fr`,
   but its source images are enormous (one is 6000px wide), and their intrinsic
   width blows one column out to 213px/259px — overflowing the grid by ~20px and
   pushing the right-hand card past the page padding. This build uses
   `minmax(0, 1fr)`, so the columns stay equal and nothing overflows. Text therefore
   wraps slightly differently in that range and the section is ~36px shorter.
   To match the original exactly you would have to ship the multi-megabyte images
   *and* reinstate the overflow.

2. **The accordion opens on every screen size.** In Webflow the three "Ways we work"
   toggles were bound to the desktop breakpoint only (`mediaQueries: ["main"]`),
   while the CSS keeps the panels at `height: 0`. On tablet and phone the panels
   could therefore never be opened — that copy was unreachable on mobile. Here they
   work at every width.

3. **The accordion animates to measured height, not fixed pixels.** The original
   animated to hard-coded values (308px, 180px) that clip the text as soon as copy
   or viewport changes. This measures content and then releases to `auto`.

4. **Images recompressed.** PNGs that were fully opaque became JPEGs; the founder
   portrait (a cutout whose soft edges covered 0.1% of pixels) was composited onto
   its own solid olive background; the decorative ellipses were downscaled. 13 MB →
   2.7 MB with no visible change. Originals are untouched on the Webflow CDN.
   *Note:* because the founder photo is now composited onto `--urban-olive`,
   changing that section's background colour would need a new export.

5. **Duplicate `id="About"`** appeared on two different sections (invalid HTML).
   They are now `id="about"` and `id="founder"`.

6. **Dropped:** the Google Fonts loader (Montserrat and Open Sans were downloaded in
   full and never used on this page), a stray `@font-face` pointing at a Monotype
   licence `.html` file, and the empty Webflow `<form>` wrapper around the Ghost
   embed along with its never-shown success/error messages.

### Quirks kept on purpose

- The third accordion item has no top or bottom border. The original's
  `border: 1px #000` omits a border *style*, so it computes to none.
- The section eyebrows are 10px taller than their content needs; Webflow's clearfix
  pseudo-elements trapped the heading's bottom margin. Reproduced with
  `display: flow-root`.
- The process intro column carries 32px of extra padding, which in the original came
  from two zero-height clearfix pseudo-elements each picking up the column gap.

### Known content issue, not fixed

The button in "Ways we work" reads **"Scedule a Call"** (missing `h`). It is spelled
that way on the live site, so it was carried over verbatim rather than silently
changed. It is on line 268 of `index.html`.

## Deploying

Any static host. Drag the folder onto Netlify, or:

```sh
npx vercel deploy            # or
rsync -av --delete ./ user@host:/var/www/acbc/
```

No build command, no output directory, no environment variables.

When you point the domain here, remember to cancel the Webflow site — nothing in
this repo loads from Webflow's CDN any more.

## Fonts

Aesthet Nova, Acumin Pro and Adelle Sans are commercial faces, self-hosted here
exactly as Webflow was already serving them publicly. Licensing is unchanged from
the current arrangement, but worth confirming web-font licences cover self-hosting.

They are `.otf` because this machine has no `fonttools`. Converting them to WOFF2
would cut ~374 KB to roughly 120 KB:

```sh
pip install fonttools brotli
for f in assets/fonts/*.otf; do pyftsubset "$f" --flavor=woff2 --output-file="${f%.otf}.woff2" \
  --unicodes="U+0000-00FF,U+2010-205E"; done
# then update the three @font-face src: url(...) format("woff2") in styles.css
```
