# SiteClone 🕷️

Clone any website into fully self-contained local static HTML — every page, every asset, all fonts, images, CSS, and JS downloaded locally. No hotlinking, no external dependencies.

## Features

- **Full page rendering** via Playwright (Chromium, headless) — JavaScript-rendered content included
- **Sitemap discovery** — reads `sitemap.xml` and `sitemap_index.xml` first, then follows internal links
- **Network interception** — captures every asset in-flight (images, fonts, CSS, JS, SVGs, videos)
- **Lazy-load triggering** — scrolls each page before capture to force lazy-loaded content
- **Screenshot capture** — full-page PNG per page saved to `screenshots/original/`
- **URL rewriting** — all absolute and CDN URLs rewritten to local relative paths
- **CSS post-processing** — `url()` references inside CSS files and `<style>` tags rewritten
- **Asset deduplication** — same URL is never downloaded twice
- **Graceful error handling** — one failed page doesn't abort the whole job
- **Summary report** — pages cloned, assets downloaded by type, errors

## Installation

```bash
cd siteclone
npm install

# Install Playwright browsers (first time only)
npx playwright install chromium
```

## Usage

```bash
# Using ts-node (development)
npx ts-node src/clone.ts https://example.com

# Or build first and run compiled JS
npm run build
node dist/clone.js https://example.com

# With options
node dist/clone.js https://example.com --output=./clones --max-pages=50

# Help
node dist/clone.js --help
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `--output=<dir>` | `./output` | Directory to write output files |
| `--max-pages=<n>` | `1000` | Max pages to crawl |

## Output Structure

```
output/
  example.com/
    index.html            ← rewritten HTML, all URLs local
    about/
      index.html
    contact/
      index.html
    assets/
      images/             ← all images (jpg, png, webp, svg, etc.)
      fonts/              ← all web fonts (woff, woff2, ttf, etc.)
      css/                ← all stylesheets
      js/                 ← all scripts
      other/              ← videos, docs, etc.
    screenshots/
      original/
        index.png         ← full-page screenshot
        about.png
        contact.png
```

## Source Files

| File | Purpose |
|------|---------|
| `src/clone.ts` | Main entrypoint, CLI args, orchestration loop |
| `src/crawler.ts` | Page discovery via sitemap + recursive link following |
| `src/renderer.ts` | Playwright rendering, network interception, screenshots |
| `src/downloader.ts` | Asset downloading, deduplication, file writing |
| `src/rewriter.ts` | HTML and CSS URL rewriting |
| `src/utils.ts` | URL helpers, slug generation, path utilities |

## Known Limitations

1. **Single-process crawl** — pages are processed sequentially (not parallel) for stability. For large sites, this is slower but avoids rate limiting and race conditions.

2. **SPA apps with client-side routing** — some SPAs using hash-based routing (`/#/about`) may not expose all routes via sitemap or link tags. You can supplement with `--max-pages` being generous and letting link discovery find them.

3. **Auth-gated content** — pages requiring login are not accessible. Consider logging in manually and exporting cookies if needed (feature not yet built).

4. **Infinite scroll** — pages that load content only via infinite scroll (no pagination) will only capture what's visible after a single scroll pass.

5. **Canvas / WebGL** — canvas-rendered content won't be captured in static HTML (screenshots will show it though).

6. **Dynamic CDN URLs** — some CDNs serve assets with expiring signed URLs; those will break if accessed later.

7. **Very large sites** — use `--max-pages` to limit crawl depth. Without it, large sites may take a long time.

8. **CSS-in-JS libraries** — runtime styles injected by styled-components, Emotion, etc. are captured via Playwright's post-render DOM serialization, but class names may be dynamic.

## Examples

```bash
# Clone a simple blog
node dist/clone.js https://example-blog.com

# Clone with output in a custom folder, limit to 25 pages
node dist/clone.js https://small-site.com --output=./sites --max-pages=25

# Development mode (no build step)
npx ts-node src/clone.ts https://example.com
```
