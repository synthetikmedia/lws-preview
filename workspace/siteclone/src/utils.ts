import * as path from 'path';
import * as crypto from 'crypto';
import * as url from 'url';

/**
 * Normalize a URL: resolve protocol-relative, handle trailing slashes
 */
export function normalizeUrl(inputUrl: string, baseUrl: string): string | null {
  try {
    // Handle protocol-relative URLs
    if (inputUrl.startsWith('//')) {
      const base = new URL(baseUrl);
      inputUrl = `${base.protocol}${inputUrl}`;
    }

    const resolved = new URL(inputUrl, baseUrl);

    // Strip hash
    resolved.hash = '';

    // Normalize trailing slash for paths (not root)
    let href = resolved.href;

    return href;
  } catch {
    return null;
  }
}

/**
 * Check if a URL belongs to the same domain (including subdomains treated as same)
 */
export function isSameDomain(urlStr: string, rootUrl: string): boolean {
  try {
    const target = new URL(urlStr);
    const root = new URL(rootUrl);
    return target.hostname === root.hostname;
  } catch {
    return false;
  }
}

/**
 * Generate a filesystem-safe slug from a URL path
 * e.g. /about/team/ => about/team
 * e.g. / => index
 */
export function urlToSlug(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    let pathname = parsed.pathname;

    // Remove leading slash
    pathname = pathname.replace(/^\//, '');

    // Remove trailing slash
    pathname = pathname.replace(/\/$/, '');

    if (!pathname) return 'index';

    // Replace remaining slashes and special chars
    return pathname;
  } catch {
    return 'index';
  }
}

/**
 * Get the output HTML file path for a given URL
 * e.g. https://example.com/ => output/example.com/index.html
 * e.g. https://example.com/about/ => output/example.com/about/index.html
 * e.g. https://example.com/page.html => output/example.com/page.html
 */
export function urlToFilePath(urlStr: string, outputBase: string): string {
  try {
    const parsed = new URL(urlStr);
    let pathname = parsed.pathname;

    // Remove leading slash
    pathname = pathname.replace(/^\//, '');

    // If empty or trailing slash, it's a directory index
    if (!pathname || pathname.endsWith('/')) {
      pathname = pathname + 'index.html';
    } else if (!path.extname(pathname)) {
      // No extension - treat as directory/index
      pathname = pathname + '/index.html';
    }

    return path.join(outputBase, parsed.hostname, pathname);
  } catch {
    return path.join(outputBase, 'unknown', 'index.html');
  }
}

/**
 * Get the screenshot path for a URL
 */
export function urlToScreenshotPath(urlStr: string, outputBase: string): string {
  try {
    const parsed = new URL(urlStr);
    let pathname = parsed.pathname;
    pathname = pathname.replace(/^\//, '').replace(/\/$/, '');
    if (!pathname) pathname = 'index';
    // Flatten path for screenshot name: about/team => about-team
    const slug = pathname.replace(/\//g, '-').replace(/[^a-z0-9\-_.]/gi, '_');
    return path.join(outputBase, parsed.hostname, 'screenshots', 'original', `${slug}.png`);
  } catch {
    return path.join(outputBase, 'unknown', 'screenshots', 'original', 'index.png');
  }
}

/**
 * Detect asset type from URL or mime type
 */
export function detectAssetType(assetUrl: string, mimeType?: string): 'images' | 'fonts' | 'css' | 'js' | 'other' {
  const ext = path.extname(new URL(assetUrl).pathname).toLowerCase().replace('.', '');

  if (mimeType) {
    if (mimeType.includes('image/')) return 'images';
    if (mimeType.includes('font/') || mimeType.includes('application/font') || mimeType.includes('application/x-font')) return 'fonts';
    if (mimeType.includes('text/css')) return 'css';
    if (mimeType.includes('javascript') || mimeType.includes('application/js')) return 'js';
  }

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp', 'tiff', 'avif'];
  const fontExts = ['woff', 'woff2', 'ttf', 'otf', 'eot'];
  const cssExts = ['css'];
  const jsExts = ['js', 'mjs', 'cjs'];

  if (imageExts.includes(ext)) return 'images';
  if (fontExts.includes(ext)) return 'fonts';
  if (cssExts.includes(ext)) return 'css';
  if (jsExts.includes(ext)) return 'js';

  return 'other';
}

/**
 * Generate a unique filename for an asset URL
 * Preserves original filename but adds hash prefix to avoid collisions
 */
export function assetUrlToFilename(assetUrl: string): string {
  try {
    const parsed = new URL(assetUrl);
    const basename = path.basename(parsed.pathname) || 'asset';
    const hash = crypto.createHash('md5').update(assetUrl).digest('hex').slice(0, 8);

    // Ensure we have an extension
    const ext = path.extname(basename);
    if (!ext) {
      return `${hash}-${basename}`;
    }
    const name = path.basename(basename, ext);
    return `${name}-${hash}${ext}`;
  } catch {
    const hash = crypto.createHash('md5').update(assetUrl).digest('hex').slice(0, 8);
    return `asset-${hash}`;
  }
}

/**
 * Get asset output path
 */
export function assetUrlToPath(assetUrl: string, outputBase: string, domain: string, mimeType?: string): string {
  const type = detectAssetType(assetUrl, mimeType);
  const filename = assetUrlToFilename(assetUrl);
  return path.join(outputBase, domain, 'assets', type, filename);
}

/**
 * Compute relative path from one file to another
 */
export function relativeAssetPath(fromFile: string, toFile: string): string {
  const fromDir = path.dirname(fromFile);
  let rel = path.relative(fromDir, toFile);
  // Normalize to forward slashes
  rel = rel.replace(/\\/g, '/');
  return rel;
}

/**
 * Extract domain from URL
 */
export function getDomain(urlStr: string): string {
  try {
    return new URL(urlStr).hostname;
  } catch {
    return 'unknown';
  }
}

/**
 * Check if a URL should be skipped (data URIs, mailto, tel, javascript, etc.)
 */
export function shouldSkipUrl(urlStr: string): boolean {
  if (!urlStr) return true;
  const lower = urlStr.toLowerCase().trim();
  return (
    lower.startsWith('data:') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:') ||
    lower.startsWith('javascript:') ||
    lower.startsWith('blob:') ||
    lower.startsWith('#') ||
    lower === ''
  );
}

/**
 * Sleep for N milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format bytes into human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * Sanitize a URL for use as a map key (normalized, no hash)
 */
export function canonicalUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    parsed.hash = '';
    // Normalize trailing slash: always add for root, keep for dirs
    return parsed.href;
  } catch {
    return urlStr;
  }
}
