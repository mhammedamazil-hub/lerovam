# LEROVAM — Official Website

One-page website for **LEROVAM**, an international creative and digital studio.
*“We build brands that move forward.” — Websites, Ads & Creative.*

## Stack

- Pure **HTML / CSS / JavaScript** — no framework, no libraries, no build step.
- No external requests (no webfonts, no CDNs, no trackers). Fast and lightweight.
- Static hosting ready: GitHub Pages, Netlify, Vercel, Cloudflare Pages, or any web server.

## Project structure

```
lerovam/
├── index.html                  # The one-page site
├── 404.html                    # Styled not-found page
├── robots.txt                  # Crawlers + sitemap reference
├── sitemap.xml                 # Single-URL sitemap
├── site.webmanifest            # PWA / install metadata
├── assets/
│   ├── css/styles.css          # Full design system (mobile-first)
│   ├── js/main.js              # Menu, reveals, active nav, mailto form
│   └── img/
│       ├── logo-mark.svg       # LEROVAM mark (vector recreation of official logo)
│       ├── favicon.svg         # SVG favicon
│       ├── favicon-16x16.png / favicon-32x32.png
│       ├── apple-touch-icon.png
│       ├── icon-192.png / icon-512.png
│       └── og-cover.png        # 1200×630 social share image
└── tools/
    └── generate-assets.py      # Regenerates PNG assets from the logo geometry
```

## Run locally

```bash
# from the repo root
python3 -m http.server 8000
# → http://localhost:8000
```

## Before going live

1. **Domain** — search for `https://lerovam.com` and replace with the final
   production domain in: `index.html` (canonical + Open Graph), `robots.txt`,
   `sitemap.xml` (also update `<lastmod>`).
2. **Logo** — `assets/img/logo-mark.svg` is a faithful vector recreation of the
   official mark (white angular “L” + blue slash). If the original master
   artwork file is available, export it as SVG and replace that file, then run
   `python3 tools/generate-assets.py` (requires Pillow) to rebuild the PNGs.
3. **Portfolio** — the four case-study cards in `#work` are honest, clearly
   labelled placeholders. Each has an HTML comment explaining how to publish
   real work. Never add invented clients, results, testimonials or awards.

## Contact form — how it works

The site has **no backend**, so the form does not silently “send” anywhere.
On submit it validates the input and opens the visitor’s own email app with a
pre-addressed enquiry to `lerovam.agency@gmail.com`. This behaviour is stated
next to the form — there is no fake success state.

To make the form submit directly (no email app), connect it to a form backend
(e.g. Formspree, Basin, or a first-party endpoint) and update the note + JS.

## Conventions

- Mobile-first CSS, fluid type with `clamp()`, responsive from 320px up.
- Flat design: near-black `#07090c`, white type, restrained blue `#1b7fff`.
- Motion is subtle and disabled under `prefers-reduced-motion`.
- Keep every claim truthful: no fake stats, testimonials, or guarantees.
