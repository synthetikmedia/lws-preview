import * as cheerio from 'cheerio';
import * as path from 'path';
import * as fs from 'fs';
import { Downloader, DownloadedAsset } from './downloader';
import {
  normalizeUrl,
  shouldSkipUrl,
  detectAssetType,
  relativeAssetPath,
  urlToFilePath,
  isSameDomain,
} from './utils';
import axios from 'axios';

export class Rewriter {
  private downloader: Downloader;
  private outputBase: string;
  private domain: string;
  private rootUrl: string;

  constructor(downloader: Downloader, outputBase: string, domain: string, rootUrl: string) {
    this.downloader = downloader;
    this.outputBase = outputBase;
    this.domain = domain;
    this.rootUrl = rootUrl;
  }

  /**
   * Rewrite all URLs in HTML to local relative paths
   * Also downloads any assets not yet captured by Playwright interception
   */
  async rewriteHtml(html: string, pageUrl: string, pageFilePath: string): Promise<string> {
    const $ = cheerio.load(html, { decodeEntities: false });

    // Collect all asset URLs to download
    const assetUrls: Array<{ url: string; element: cheerio.Element; attr: string }> = [];

    // img src, srcset
    $('img[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !shouldSkipUrl(src)) {
        const abs = normalizeUrl(src, pageUrl);
        if (abs) assetUrls.push({ url: abs, element: el, attr: 'src' });
      }
    });

    $('img[srcset]').each((_, el) => {
      const srcset = $(el).attr('srcset') || '';
      const rewritten = this.processSrcset(srcset, pageUrl, pageFilePath);
      if (rewritten !== srcset) {
        $(el).attr('srcset', rewritten);
      }
    });

    // link[rel=stylesheet] href
    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !shouldSkipUrl(href)) {
        const abs = normalizeUrl(href, pageUrl);
        if (abs) assetUrls.push({ url: abs, element: el, attr: 'href' });
      }
    });

    // link[rel=icon/apple-touch-icon] href
    $('link[rel~="icon"], link[rel="apple-touch-icon"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !shouldSkipUrl(href)) {
        const abs = normalizeUrl(href, pageUrl);
        if (abs) assetUrls.push({ url: abs, element: el, attr: 'href' });
      }
    });

    // script src
    $('script[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !shouldSkipUrl(src)) {
        const abs = normalizeUrl(src, pageUrl);
        if (abs) assetUrls.push({ url: abs, element: el, attr: 'src' });
      }
    });

    // source src (video/audio/picture)
    $('source[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !shouldSkipUrl(src)) {
        const abs = normalizeUrl(src, pageUrl);
        if (abs) assetUrls.push({ url: abs, element: el, attr: 'src' });
      }
    });

    $('source[srcset]').each((_, el) => {
      const srcset = $(el).attr('srcset') || '';
      const rewritten = this.processSrcset(srcset, pageUrl, pageFilePath);
      if (rewritten !== srcset) $(el).attr('srcset', rewritten);
    });

    // video poster
    $('video[poster]').each((_, el) => {
      const poster = $(el).attr('poster');
      if (poster && !shouldSkipUrl(poster)) {
        const abs = normalizeUrl(poster, pageUrl);
        if (abs) assetUrls.push({ url: abs, element: el, attr: 'poster' });
      }
    });

    // video src
    $('video[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !shouldSkipUrl(src)) {
        const abs = normalizeUrl(src, pageUrl);
        if (abs) assetUrls.push({ url: abs, element: el, attr: 'src' });
      }
    });

    // audio src
    $('audio[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !shouldSkipUrl(src)) {
        const abs = normalizeUrl(src, pageUrl);
        if (abs) assetUrls.push({ url: abs, element: el, attr: 'src' });
      }
    });

    // meta og:image
    $('meta[property="og:image"], meta[name="twitter:image"]').each((_, el) => {
      const content = $(el).attr('content');
      if (content && !shouldSkipUrl(content)) {
        const abs = normalizeUrl(content, pageUrl);
        if (abs) assetUrls.push({ url: abs, element: el, attr: 'content' });
      }
    });

    // Download all collected assets and rewrite
    for (const { url, element, attr } of assetUrls) {
      const asset = await this.ensureAsset(url);
      if (asset) {
        const relPath = relativeAssetPath(pageFilePath, asset.localPath);
        $(element).attr(attr, relPath);
      }
    }

    // Rewrite internal page links (href on <a> tags)
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href || shouldSkipUrl(href)) return;

      const abs = normalizeUrl(href, pageUrl);
      if (!abs) return;

      if (isSameDomain(abs, this.rootUrl)) {
        // Rewrite to local file path
        const targetFile = urlToFilePath(abs, this.outputBase);
        const relPath = relativeAssetPath(pageFilePath, targetFile);
        $(el).attr('href', relPath);
      }
    });

    // Process inline style attributes (background-image: url(...))
    $('[style]').each((_, el) => {
      const style = $(el).attr('style') || '';
      // We'll process these asynchronously after
    });

    // Process <style> tags - rewrite url() references
    const stylePromises: Promise<void>[] = [];
    $('style').each((_, el) => {
      const css = $(el).children().first().text() || $(el).html() || '';
      stylePromises.push(
        this.rewriteCssContent(css, pageUrl, pageFilePath).then((rewritten) => {
          $(el).html(rewritten);
        })
      );
    });
    await Promise.all(stylePromises);

    // Rewrite inline style attributes
    const inlineStylePromises: Promise<void>[] = [];
    $('[style]').each((_, el) => {
      const style = $(el).attr('style') || '';
      if (style.includes('url(')) {
        inlineStylePromises.push(
          this.rewriteCssContent(style, pageUrl, pageFilePath).then((rewritten) => {
            $(el).attr('style', rewritten);
          })
        );
      }
    });
    await Promise.all(inlineStylePromises);

    return $.html();
  }

  /**
   * Rewrite url() references inside CSS content
   * Also downloads the referenced assets
   */
  async rewriteCssContent(css: string, baseUrl: string, fromFilePath: string): Promise<string> {
    // Match url('...'), url("..."), url(...)
    const urlRe = /url\(\s*(['"]?)([^)'"]+)\1\s*\)/gi;

    const replacements: Array<{ original: string; replacement: string }> = [];

    let match;
    while ((match = urlRe.exec(css)) !== null) {
      const fullMatch = match[0];
      const quote = match[1];
      const rawUrl = match[2].trim();

      if (shouldSkipUrl(rawUrl)) continue;

      const abs = normalizeUrl(rawUrl, baseUrl);
      if (!abs) continue;

      const asset = await this.ensureAsset(abs);
      if (asset) {
        const relPath = relativeAssetPath(fromFilePath, asset.localPath);
        replacements.push({ original: fullMatch, replacement: `url(${quote}${relPath}${quote})` });
      }
    }

    let result = css;
    for (const { original, replacement } of replacements) {
      result = result.split(original).join(replacement);
    }

    // Also rewrite @import url() and @import "..."
    result = await this.rewriteCssImports(result, baseUrl, fromFilePath);

    return result;
  }

  /**
   * Post-process a downloaded CSS file on disk: rewrite all its url() references
   */
  async processCssFile(cssFilePath: string, originalCssUrl: string): Promise<void> {
    try {
      let css = fs.readFileSync(cssFilePath, 'utf-8');
      const rewritten = await this.rewriteCssContent(css, originalCssUrl, cssFilePath);
      fs.writeFileSync(cssFilePath, rewritten, 'utf-8');
    } catch {
      // Non-fatal
    }
  }

  private async rewriteCssImports(css: string, baseUrl: string, fromFilePath: string): Promise<string> {
    // @import "url" or @import url("url")
    const importRe = /@import\s+(['"])([^'"]+)\1/gi;
    const replacements: Array<{ original: string; replacement: string }> = [];

    let match;
    while ((match = importRe.exec(css)) !== null) {
      const fullMatch = match[0];
      const quote = match[1];
      const rawUrl = match[2].trim();

      if (shouldSkipUrl(rawUrl)) continue;

      const abs = normalizeUrl(rawUrl, baseUrl);
      if (!abs) continue;

      const asset = await this.ensureAsset(abs);
      if (asset) {
        const relPath = relativeAssetPath(fromFilePath, asset.localPath);
        replacements.push({ original: fullMatch, replacement: `@import ${quote}${relPath}${quote}` });
      }
    }

    let result = css;
    for (const { original, replacement } of replacements) {
      result = result.split(original).join(replacement);
    }

    return result;
  }

  private processSrcset(srcset: string, pageUrl: string, pageFilePath: string): string {
    // srcset = "url1 1x, url2 2x" or "url1 100w, url2 200w"
    const parts = srcset.split(',');
    const rewritten = parts.map((part) => {
      const trimmed = part.trim();
      const spaceIdx = trimmed.search(/\s+/);
      let rawUrl = spaceIdx > -1 ? trimmed.slice(0, spaceIdx) : trimmed;
      const descriptor = spaceIdx > -1 ? trimmed.slice(spaceIdx) : '';

      if (shouldSkipUrl(rawUrl)) return part;

      const abs = normalizeUrl(rawUrl, pageUrl);
      if (!abs) return part;

      // Try to get already-downloaded asset
      const asset = this.downloader.getAsset(abs);
      if (asset) {
        const relPath = relativeAssetPath(pageFilePath, asset.localPath);
        return `${relPath}${descriptor}`;
      }

      return part;
    });

    return rewritten.join(', ');
  }

  /**
   * Ensure an asset is downloaded. First checks downloader cache, then downloads.
   */
  private async ensureAsset(url: string): Promise<DownloadedAsset | null> {
    // Check if already captured by interceptor
    const existing = this.downloader.getAsset(url);
    if (existing) return existing;

    // Try downloading
    return this.downloader.download(url);
  }
}
