import axios from 'axios';
import * as xml2js from 'xml2js';
import { normalizeUrl, isSameDomain, shouldSkipUrl, canonicalUrl } from './utils';

export class Crawler {
  private visited = new Set<string>();
  private queue: string[] = [];
  private rootUrl: string;
  private domain: string;

  constructor(rootUrl: string) {
    this.rootUrl = rootUrl;
    this.domain = new URL(rootUrl).hostname;
  }

  /**
   * Discover all pages starting from rootUrl
   * First tries sitemap.xml, then falls back to recursive link following
   */
  async discoverPages(): Promise<string[]> {
    console.log(`\n🔍 Discovering pages for ${this.rootUrl}...`);

    // Seed the queue
    this.addUrl(this.rootUrl);

    // Try to get sitemap URLs
    const sitemapUrls = await this.fetchSitemap();
    if (sitemapUrls.length > 0) {
      console.log(`  📋 Found ${sitemapUrls.length} URLs from sitemap`);
      for (const u of sitemapUrls) {
        this.addUrl(u);
      }
    } else {
      console.log(`  ℹ️  No sitemap found, will discover via link crawling`);
    }

    return this.queue.slice();
  }

  /**
   * Add a URL to crawl queue if it's valid and not yet visited
   */
  addUrl(rawUrl: string, base?: string): boolean {
    if (shouldSkipUrl(rawUrl)) return false;

    const normalized = normalizeUrl(rawUrl, base || this.rootUrl);
    if (!normalized) return false;

    // Only same domain
    if (!isSameDomain(normalized, this.rootUrl)) return false;

    const canonical = canonicalUrl(normalized);

    if (this.visited.has(canonical) || this.queue.some(u => canonicalUrl(u) === canonical)) {
      return false;
    }

    this.queue.push(normalized);
    return true;
  }

  /**
   * Mark a URL as visited
   */
  markVisited(pageUrl: string): void {
    this.visited.add(canonicalUrl(pageUrl));
  }

  /**
   * Get next URL to process
   */
  next(): string | null {
    // Find first unvisited
    for (let i = 0; i < this.queue.length; i++) {
      const u = this.queue[i];
      if (!this.visited.has(canonicalUrl(u))) {
        return u;
      }
    }
    return null;
  }

  /**
   * Check if there are more URLs to process
   */
  hasMore(): boolean {
    return this.next() !== null;
  }

  /**
   * Extract internal links from rendered HTML
   */
  extractLinks(html: string, pageUrl: string): string[] {
    const links: string[] = [];

    // Match href attributes
    const hrefRe = /href=["']([^"']+)["']/gi;
    let match;
    while ((match = hrefRe.exec(html)) !== null) {
      const href = match[1].trim();
      if (!href || shouldSkipUrl(href)) continue;

      const normalized = normalizeUrl(href, pageUrl);
      if (normalized && isSameDomain(normalized, this.rootUrl)) {
        // Only include HTML pages (no file extensions or .html)
        const parsed = new URL(normalized);
        const pathname = parsed.pathname;
        const ext = pathname.split('.').pop()?.toLowerCase();
        const skipExts = ['css', 'js', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
          'ico', 'woff', 'woff2', 'ttf', 'otf', 'eot', 'pdf', 'zip',
          'mp4', 'mp3', 'avi', 'mov', 'xml', 'json', 'txt', 'csv'];
        if (ext && skipExts.includes(ext)) continue;

        links.push(normalized);
      }
    }

    return [...new Set(links)];
  }

  getStats() {
    return {
      queued: this.queue.length,
      visited: this.visited.size,
      remaining: this.queue.filter(u => !this.visited.has(canonicalUrl(u))).length,
    };
  }

  /**
   * Try to fetch and parse sitemap.xml (and sitemap index)
   */
  private async fetchSitemap(): Promise<string[]> {
    const urls: string[] = [];
    const attempted = new Set<string>();

    const tryFetch = async (sitemapUrl: string): Promise<void> => {
      if (attempted.has(sitemapUrl)) return;
      attempted.add(sitemapUrl);

      try {
        const response = await axios.get(sitemapUrl, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SiteClone/1.0)',
            'Accept': 'application/xml,text/xml,*/*',
          },
          validateStatus: (s) => s < 400,
        });

        if (response.status !== 200) return;

        const xml = response.data as string;
        const parsed = await xml2js.parseStringPromise(xml, { explicitArray: false });

        // Sitemap index
        if (parsed.sitemapindex) {
          const sitemaps = parsed.sitemapindex.sitemap;
          const list = Array.isArray(sitemaps) ? sitemaps : [sitemaps];
          for (const s of list) {
            const loc = s?.loc;
            if (loc && typeof loc === 'string') {
              await tryFetch(loc);
            }
          }
        }

        // Regular sitemap
        if (parsed.urlset) {
          const urlEntries = parsed.urlset.url;
          const list = Array.isArray(urlEntries) ? urlEntries : [urlEntries];
          for (const entry of list) {
            const loc = entry?.loc;
            if (loc && typeof loc === 'string') {
              const normalized = normalizeUrl(loc, this.rootUrl);
              if (normalized && isSameDomain(normalized, this.rootUrl)) {
                urls.push(normalized);
              }
            }
          }
        }
      } catch {
        // Silently ignore sitemap fetch failures
      }
    };

    // Try common sitemap locations
    const base = this.rootUrl.replace(/\/$/, '');
    const candidates = [
      `${base}/sitemap.xml`,
      `${base}/sitemap_index.xml`,
      `${base}/sitemap/sitemap.xml`,
    ];

    // Also try robots.txt to find sitemap
    try {
      const robotsUrl = `${base}/robots.txt`;
      const robotsResp = await axios.get(robotsUrl, {
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SiteClone/1.0)' },
        validateStatus: (s) => s < 400,
      });

      if (robotsResp.status === 200) {
        const robotsText = robotsResp.data as string;
        const sitemapMatches = robotsText.match(/^Sitemap:\s*(.+)$/gim);
        if (sitemapMatches) {
          for (const line of sitemapMatches) {
            const u = line.replace(/^Sitemap:\s*/i, '').trim();
            if (u && !candidates.includes(u)) {
              candidates.push(u);
            }
          }
        }
      }
    } catch {
      // ignore
    }

    for (const candidate of candidates) {
      await tryFetch(candidate);
    }

    return [...new Set(urls)];
  }
}
