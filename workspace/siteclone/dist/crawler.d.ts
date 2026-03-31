export declare class Crawler {
    private visited;
    private queue;
    private rootUrl;
    private domain;
    constructor(rootUrl: string);
    /**
     * Discover all pages starting from rootUrl
     * First tries sitemap.xml, then falls back to recursive link following
     */
    discoverPages(): Promise<string[]>;
    /**
     * Add a URL to crawl queue if it's valid and not yet visited
     */
    addUrl(rawUrl: string, base?: string): boolean;
    /**
     * Mark a URL as visited
     */
    markVisited(pageUrl: string): void;
    /**
     * Get next URL to process
     */
    next(): string | null;
    /**
     * Check if there are more URLs to process
     */
    hasMore(): boolean;
    /**
     * Extract internal links from rendered HTML
     */
    extractLinks(html: string, pageUrl: string): string[];
    getStats(): {
        queued: number;
        visited: number;
        remaining: number;
    };
    /**
     * Try to fetch and parse sitemap.xml (and sitemap index)
     */
    private fetchSitemap;
}
//# sourceMappingURL=crawler.d.ts.map