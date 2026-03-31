#!/usr/bin/env node
// Catch unhandled promise rejections so they surface as real errors instead of silent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 Unhandled promise rejection:', reason);
  if (reason instanceof Error && reason.stack) console.error(reason.stack);
  process.exit(1);
});

import * as path from 'path';
import * as fs from 'fs';
import { Crawler } from './crawler';
import { Renderer } from './renderer';
import { Downloader } from './downloader';
import { Rewriter } from './rewriter';
import { getDomain, urlToFilePath, canonicalUrl, normalizeUrl, isSameDomain } from './utils';

interface CloneOptions {
  url: string;
  outputDir: string;
  maxPages?: number;
  concurrency?: number;
}

interface CloneResult {
  pagesCloned: number;
  pagesErrored: number;
  assetsDownloaded: number;
  assetsByType: Record<string, number>;
  totalAssetSize: string;
  downloadErrors: number;
  errors: Array<{ url: string; error: string }>;
}

async function clone(options: CloneOptions): Promise<CloneResult> {
  const { url: rootUrl, outputDir, maxPages = 1000 } = options;

  const domain = getDomain(rootUrl);
  const domainOutputDir = path.join(outputDir, domain);

  console.log(`\n🕷️  SiteClone`);
  console.log(`   Target: ${rootUrl}`);
  console.log(`   Domain: ${domain}`);
  console.log(`   Output: ${domainOutputDir}`);
  console.log(`   Max pages: ${maxPages}`);

  // Ensure output directory exists
  if (!fs.existsSync(domainOutputDir)) {
    fs.mkdirSync(domainOutputDir, { recursive: true });
  }

  // Initialize components
  const downloader = new Downloader(outputDir, domain);
  const crawler = new Crawler(rootUrl);
  const renderer = new Renderer(outputDir, downloader);
  const rewriter = new Rewriter(downloader, outputDir, domain, rootUrl);

  const errors: Array<{ url: string; error: string }> = [];
  let pagesCloned = 0;
  let pagesErrored = 0;
  // Track CSS files already post-processed to avoid duplicate rewrites
  const processedCssFiles = new Set<string>();

  try {
    // Initialize Playwright
    await renderer.init();

    // Discover initial pages (sitemap + seed URL)
    const initialPages = await crawler.discoverPages();
    console.log(`\n📚 Starting crawl. ${initialPages.length} initial URLs in queue.`);

    // Main crawl loop
    while (crawler.hasMore() && pagesCloned + pagesErrored < maxPages) {
      const pageUrl = crawler.next();
      if (!pageUrl) break;

      crawler.markVisited(pageUrl);

      // Render the page
      const rendered = await renderer.renderPage(pageUrl, domain);

      if (rendered.error || !rendered.html) {
        pagesErrored++;
        if (rendered.error) {
          errors.push({ url: pageUrl, error: rendered.error });
        }
        continue;
      }

      // Extract and queue new internal links
      const extractedLinks = crawler.extractLinks(rendered.html, pageUrl);
      for (const link of extractedLinks) {
        crawler.addUrl(link, pageUrl);
      }

      // Also add links from page.evaluate (rendered DOM links)
      for (const link of rendered.links) {
        if (!link || !isSameDomain(link, rootUrl)) continue;
        const norm = normalizeUrl(link, pageUrl);
        if (norm) crawler.addUrl(norm, pageUrl);
      }

      // Determine output file path for this page
      const pageFilePath = urlToFilePath(pageUrl, outputDir);

      // Rewrite HTML (downloads missing assets, rewrites URLs)
      const rewrittenHtml = await rewriter.rewriteHtml(rendered.html, pageUrl, pageFilePath);

      // Post-process CSS files: rewrite url() references inside downloaded CSS
      // Only process NEW CSS files we haven't seen yet to avoid duplicate rewrites
      const cssAssets = downloader.getAllAssets().filter(a => a.type === 'css');
      for (const cssAsset of cssAssets) {
        if (processedCssFiles.has(cssAsset.localPath)) continue;
        processedCssFiles.add(cssAsset.localPath);
        try {
          await rewriter.processCssFile(cssAsset.localPath, cssAsset.originalUrl);
        } catch (cssErr: any) {
          // Non-fatal: log and continue
          console.warn(`  ⚠️  CSS post-process failed for ${cssAsset.localPath}: ${cssErr.message || cssErr}`);
        }
      }

      // Write HTML file
      const htmlDir = path.dirname(pageFilePath);
      if (!fs.existsSync(htmlDir)) {
        fs.mkdirSync(htmlDir, { recursive: true });
      }
      fs.writeFileSync(pageFilePath, rewrittenHtml, 'utf-8');

      pagesCloned++;

      const stats = crawler.getStats();
      console.log(`  [${pagesCloned}/${stats.queued}] Saved: ${pageFilePath.replace(outputDir, '')}`);
    }
  } finally {
    await renderer.close();
  }

  // Collect asset errors
  const assetErrors = downloader.getErrors();
  for (const e of assetErrors) {
    errors.push(e);
  }

  const summary = downloader.getSummary();

  return {
    pagesCloned,
    pagesErrored,
    assetsDownloaded: summary.total,
    assetsByType: summary.byType,
    totalAssetSize: summary.totalSize,
    downloadErrors: summary.errors,
    errors,
  };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const url = args[0];
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.error('❌ URL must start with http:// or https://');
    process.exit(1);
  }

  // Parse options
  let maxPages = 1000;
  const maxPagesArg = args.find(a => a.startsWith('--max-pages='));
  if (maxPagesArg) {
    maxPages = parseInt(maxPagesArg.split('=')[1], 10) || 1000;
  }

  const outputDir = path.resolve(
    args.find(a => a.startsWith('--output='))?.split('=')[1] || './output'
  );

  console.log(`\n🚀 Starting SiteClone...`);
  const startTime = Date.now();

  try {
    const result = await clone({ url, outputDir, maxPages });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Clone complete in ${elapsed}s`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📄 Pages cloned:     ${result.pagesCloned}`);
    console.log(`❌ Pages errored:    ${result.pagesErrored}`);
    console.log(`📦 Assets saved:     ${result.assetsDownloaded} (${result.totalAssetSize})`);
    console.log(`   🖼️  Images:        ${result.assetsByType.images}`);
    console.log(`   🔤 Fonts:          ${result.assetsByType.fonts}`);
    console.log(`   🎨 CSS:            ${result.assetsByType.css}`);
    console.log(`   ⚙️  JS:             ${result.assetsByType.js}`);
    console.log(`   📁 Other:          ${result.assetsByType.other}`);
    console.log(`⚠️  Asset errors:     ${result.downloadErrors}`);
    console.log(`📂 Output:           ${outputDir}`);

    if (result.errors.length > 0) {
      console.log(`\n⚠️  Errors (${result.errors.length}):`);
      for (const e of result.errors.slice(0, 20)) {
        console.log(`   • ${e.url}: ${e.error}`);
      }
      if (result.errors.length > 20) {
        console.log(`   ... and ${result.errors.length - 20} more`);
      }
    }

    console.log('');
  } catch (err: any) {
    console.error(`\n💥 Fatal error: ${err.message || err}`);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

function printHelp(): void {
  console.log(`
SiteClone - Clone websites into local static HTML

Usage:
  node dist/clone.js <url> [options]
  ts-node src/clone.ts <url> [options]

Arguments:
  url                  The website URL to clone (required)

Options:
  --output=<dir>       Output directory (default: ./output)
  --max-pages=<n>      Maximum pages to crawl (default: 1000)
  --help, -h           Show this help

Examples:
  node dist/clone.js https://example.com
  node dist/clone.js https://example.com --output=./clones --max-pages=50
  ts-node src/clone.ts https://example.com

Output structure:
  output/
    example.com/
      index.html
      about/
        index.html
      assets/
        images/
        fonts/
        css/
        js/
        other/
      screenshots/
        original/
          index.png
          about.png
`);
}

main();
