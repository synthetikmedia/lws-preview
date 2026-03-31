"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crawler = void 0;
const axios_1 = __importDefault(require("axios"));
const xml2js = __importStar(require("xml2js"));
const utils_1 = require("./utils");
class Crawler {
    constructor(rootUrl) {
        this.visited = new Set();
        this.queue = [];
        this.rootUrl = rootUrl;
        this.domain = new URL(rootUrl).hostname;
    }
    /**
     * Discover all pages starting from rootUrl
     * First tries sitemap.xml, then falls back to recursive link following
     */
    async discoverPages() {
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
        }
        else {
            console.log(`  ℹ️  No sitemap found, will discover via link crawling`);
        }
        return this.queue.slice();
    }
    /**
     * Add a URL to crawl queue if it's valid and not yet visited
     */
    addUrl(rawUrl, base) {
        if ((0, utils_1.shouldSkipUrl)(rawUrl))
            return false;
        const normalized = (0, utils_1.normalizeUrl)(rawUrl, base || this.rootUrl);
        if (!normalized)
            return false;
        // Only same domain
        if (!(0, utils_1.isSameDomain)(normalized, this.rootUrl))
            return false;
        const canonical = (0, utils_1.canonicalUrl)(normalized);
        if (this.visited.has(canonical) || this.queue.some(u => (0, utils_1.canonicalUrl)(u) === canonical)) {
            return false;
        }
        this.queue.push(normalized);
        return true;
    }
    /**
     * Mark a URL as visited
     */
    markVisited(pageUrl) {
        this.visited.add((0, utils_1.canonicalUrl)(pageUrl));
    }
    /**
     * Get next URL to process
     */
    next() {
        // Find first unvisited
        for (let i = 0; i < this.queue.length; i++) {
            const u = this.queue[i];
            if (!this.visited.has((0, utils_1.canonicalUrl)(u))) {
                return u;
            }
        }
        return null;
    }
    /**
     * Check if there are more URLs to process
     */
    hasMore() {
        return this.next() !== null;
    }
    /**
     * Extract internal links from rendered HTML
     */
    extractLinks(html, pageUrl) {
        const links = [];
        // Match href attributes
        const hrefRe = /href=["']([^"']+)["']/gi;
        let match;
        while ((match = hrefRe.exec(html)) !== null) {
            const href = match[1].trim();
            if (!href || (0, utils_1.shouldSkipUrl)(href))
                continue;
            const normalized = (0, utils_1.normalizeUrl)(href, pageUrl);
            if (normalized && (0, utils_1.isSameDomain)(normalized, this.rootUrl)) {
                // Only include HTML pages (no file extensions or .html)
                const parsed = new URL(normalized);
                const pathname = parsed.pathname;
                const ext = pathname.split('.').pop()?.toLowerCase();
                const skipExts = ['css', 'js', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
                    'ico', 'woff', 'woff2', 'ttf', 'otf', 'eot', 'pdf', 'zip',
                    'mp4', 'mp3', 'avi', 'mov', 'xml', 'json', 'txt', 'csv'];
                if (ext && skipExts.includes(ext))
                    continue;
                links.push(normalized);
            }
        }
        return [...new Set(links)];
    }
    getStats() {
        return {
            queued: this.queue.length,
            visited: this.visited.size,
            remaining: this.queue.filter(u => !this.visited.has((0, utils_1.canonicalUrl)(u))).length,
        };
    }
    /**
     * Try to fetch and parse sitemap.xml (and sitemap index)
     */
    async fetchSitemap() {
        const urls = [];
        const attempted = new Set();
        const tryFetch = async (sitemapUrl) => {
            if (attempted.has(sitemapUrl))
                return;
            attempted.add(sitemapUrl);
            try {
                const response = await axios_1.default.get(sitemapUrl, {
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; SiteClone/1.0)',
                        'Accept': 'application/xml,text/xml,*/*',
                    },
                    validateStatus: (s) => s < 400,
                });
                if (response.status !== 200)
                    return;
                const xml = response.data;
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
                            const normalized = (0, utils_1.normalizeUrl)(loc, this.rootUrl);
                            if (normalized && (0, utils_1.isSameDomain)(normalized, this.rootUrl)) {
                                urls.push(normalized);
                            }
                        }
                    }
                }
            }
            catch {
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
            const robotsResp = await axios_1.default.get(robotsUrl, {
                timeout: 10000,
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SiteClone/1.0)' },
                validateStatus: (s) => s < 400,
            });
            if (robotsResp.status === 200) {
                const robotsText = robotsResp.data;
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
        }
        catch {
            // ignore
        }
        for (const candidate of candidates) {
            await tryFetch(candidate);
        }
        return [...new Set(urls)];
    }
}
exports.Crawler = Crawler;
//# sourceMappingURL=crawler.js.map