/**
 * Normalize a URL: resolve protocol-relative, handle trailing slashes
 */
export declare function normalizeUrl(inputUrl: string, baseUrl: string): string | null;
/**
 * Check if a URL belongs to the same domain (including subdomains treated as same)
 */
export declare function isSameDomain(urlStr: string, rootUrl: string): boolean;
/**
 * Generate a filesystem-safe slug from a URL path
 * e.g. /about/team/ => about/team
 * e.g. / => index
 */
export declare function urlToSlug(urlStr: string): string;
/**
 * Get the output HTML file path for a given URL
 * e.g. https://example.com/ => output/example.com/index.html
 * e.g. https://example.com/about/ => output/example.com/about/index.html
 * e.g. https://example.com/page.html => output/example.com/page.html
 */
export declare function urlToFilePath(urlStr: string, outputBase: string): string;
/**
 * Get the screenshot path for a URL
 */
export declare function urlToScreenshotPath(urlStr: string, outputBase: string): string;
/**
 * Detect asset type from URL or mime type
 */
export declare function detectAssetType(assetUrl: string, mimeType?: string): 'images' | 'fonts' | 'css' | 'js' | 'other';
/**
 * Generate a unique filename for an asset URL
 * Preserves original filename but adds hash prefix to avoid collisions
 */
export declare function assetUrlToFilename(assetUrl: string): string;
/**
 * Get asset output path
 */
export declare function assetUrlToPath(assetUrl: string, outputBase: string, domain: string, mimeType?: string): string;
/**
 * Compute relative path from one file to another
 */
export declare function relativeAssetPath(fromFile: string, toFile: string): string;
/**
 * Extract domain from URL
 */
export declare function getDomain(urlStr: string): string;
/**
 * Check if a URL should be skipped (data URIs, mailto, tel, javascript, etc.)
 */
export declare function shouldSkipUrl(urlStr: string): boolean;
/**
 * Sleep for N milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Format bytes into human-readable string
 */
export declare function formatBytes(bytes: number): string;
/**
 * Sanitize a URL for use as a map key (normalized, no hash)
 */
export declare function canonicalUrl(urlStr: string): string;
//# sourceMappingURL=utils.d.ts.map