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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rewriter = void 0;
const cheerio = __importStar(require("cheerio"));
const fs = __importStar(require("fs"));
const utils_1 = require("./utils");
class Rewriter {
    constructor(downloader, outputBase, domain, rootUrl) {
        this.downloader = downloader;
        this.outputBase = outputBase;
        this.domain = domain;
        this.rootUrl = rootUrl;
    }
    /**
     * Rewrite all URLs in HTML to local relative paths
     * Also downloads any assets not yet captured by Playwright interception
     */
    async rewriteHtml(html, pageUrl, pageFilePath) {
        const $ = cheerio.load(html, { decodeEntities: false });
        // Collect all asset URLs to download
        const assetUrls = [];
        // img src, srcset
        $('img[src]').each((_, el) => {
            const src = $(el).attr('src');
            if (src && !(0, utils_1.shouldSkipUrl)(src)) {
                const abs = (0, utils_1.normalizeUrl)(src, pageUrl);
                if (abs)
                    assetUrls.push({ url: abs, element: el, attr: 'src' });
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
            if (href && !(0, utils_1.shouldSkipUrl)(href)) {
                const abs = (0, utils_1.normalizeUrl)(href, pageUrl);
                if (abs)
                    assetUrls.push({ url: abs, element: el, attr: 'href' });
            }
        });
        // link[rel=icon/apple-touch-icon] href
        $('link[rel~="icon"], link[rel="apple-touch-icon"]').each((_, el) => {
            const href = $(el).attr('href');
            if (href && !(0, utils_1.shouldSkipUrl)(href)) {
                const abs = (0, utils_1.normalizeUrl)(href, pageUrl);
                if (abs)
                    assetUrls.push({ url: abs, element: el, attr: 'href' });
            }
        });
        // script src
        $('script[src]').each((_, el) => {
            const src = $(el).attr('src');
            if (src && !(0, utils_1.shouldSkipUrl)(src)) {
                const abs = (0, utils_1.normalizeUrl)(src, pageUrl);
                if (abs)
                    assetUrls.push({ url: abs, element: el, attr: 'src' });
            }
        });
        // source src (video/audio/picture)
        $('source[src]').each((_, el) => {
            const src = $(el).attr('src');
            if (src && !(0, utils_1.shouldSkipUrl)(src)) {
                const abs = (0, utils_1.normalizeUrl)(src, pageUrl);
                if (abs)
                    assetUrls.push({ url: abs, element: el, attr: 'src' });
            }
        });
        $('source[srcset]').each((_, el) => {
            const srcset = $(el).attr('srcset') || '';
            const rewritten = this.processSrcset(srcset, pageUrl, pageFilePath);
            if (rewritten !== srcset)
                $(el).attr('srcset', rewritten);
        });
        // video poster
        $('video[poster]').each((_, el) => {
            const poster = $(el).attr('poster');
            if (poster && !(0, utils_1.shouldSkipUrl)(poster)) {
                const abs = (0, utils_1.normalizeUrl)(poster, pageUrl);
                if (abs)
                    assetUrls.push({ url: abs, element: el, attr: 'poster' });
            }
        });
        // video src
        $('video[src]').each((_, el) => {
            const src = $(el).attr('src');
            if (src && !(0, utils_1.shouldSkipUrl)(src)) {
                const abs = (0, utils_1.normalizeUrl)(src, pageUrl);
                if (abs)
                    assetUrls.push({ url: abs, element: el, attr: 'src' });
            }
        });
        // audio src
        $('audio[src]').each((_, el) => {
            const src = $(el).attr('src');
            if (src && !(0, utils_1.shouldSkipUrl)(src)) {
                const abs = (0, utils_1.normalizeUrl)(src, pageUrl);
                if (abs)
                    assetUrls.push({ url: abs, element: el, attr: 'src' });
            }
        });
        // meta og:image
        $('meta[property="og:image"], meta[name="twitter:image"]').each((_, el) => {
            const content = $(el).attr('content');
            if (content && !(0, utils_1.shouldSkipUrl)(content)) {
                const abs = (0, utils_1.normalizeUrl)(content, pageUrl);
                if (abs)
                    assetUrls.push({ url: abs, element: el, attr: 'content' });
            }
        });
        // Download all collected assets and rewrite
        for (const { url, element, attr } of assetUrls) {
            const asset = await this.ensureAsset(url);
            if (asset) {
                const relPath = (0, utils_1.relativeAssetPath)(pageFilePath, asset.localPath);
                $(element).attr(attr, relPath);
            }
        }
        // Rewrite internal page links (href on <a> tags)
        $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            if (!href || (0, utils_1.shouldSkipUrl)(href))
                return;
            const abs = (0, utils_1.normalizeUrl)(href, pageUrl);
            if (!abs)
                return;
            if ((0, utils_1.isSameDomain)(abs, this.rootUrl)) {
                // Rewrite to local file path
                const targetFile = (0, utils_1.urlToFilePath)(abs, this.outputBase);
                const relPath = (0, utils_1.relativeAssetPath)(pageFilePath, targetFile);
                $(el).attr('href', relPath);
            }
        });
        // Process inline style attributes (background-image: url(...))
        $('[style]').each((_, el) => {
            const style = $(el).attr('style') || '';
            // We'll process these asynchronously after
        });
        // Process <style> tags - rewrite url() references
        const stylePromises = [];
        $('style').each((_, el) => {
            const css = $(el).children().first().text() || $(el).html() || '';
            stylePromises.push(this.rewriteCssContent(css, pageUrl, pageFilePath).then((rewritten) => {
                $(el).html(rewritten);
            }));
        });
        await Promise.all(stylePromises);
        // Rewrite inline style attributes
        const inlineStylePromises = [];
        $('[style]').each((_, el) => {
            const style = $(el).attr('style') || '';
            if (style.includes('url(')) {
                inlineStylePromises.push(this.rewriteCssContent(style, pageUrl, pageFilePath).then((rewritten) => {
                    $(el).attr('style', rewritten);
                }));
            }
        });
        await Promise.all(inlineStylePromises);
        return $.html();
    }
    /**
     * Rewrite url() references inside CSS content
     * Also downloads the referenced assets
     */
    async rewriteCssContent(css, baseUrl, fromFilePath) {
        // Match url('...'), url("..."), url(...)
        const urlRe = /url\(\s*(['"]?)([^)'"]+)\1\s*\)/gi;
        const replacements = [];
        let match;
        while ((match = urlRe.exec(css)) !== null) {
            const fullMatch = match[0];
            const quote = match[1];
            const rawUrl = match[2].trim();
            if ((0, utils_1.shouldSkipUrl)(rawUrl))
                continue;
            const abs = (0, utils_1.normalizeUrl)(rawUrl, baseUrl);
            if (!abs)
                continue;
            const asset = await this.ensureAsset(abs);
            if (asset) {
                const relPath = (0, utils_1.relativeAssetPath)(fromFilePath, asset.localPath);
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
    async processCssFile(cssFilePath, originalCssUrl) {
        try {
            let css = fs.readFileSync(cssFilePath, 'utf-8');
            const rewritten = await this.rewriteCssContent(css, originalCssUrl, cssFilePath);
            fs.writeFileSync(cssFilePath, rewritten, 'utf-8');
        }
        catch {
            // Non-fatal
        }
    }
    async rewriteCssImports(css, baseUrl, fromFilePath) {
        // @import "url" or @import url("url")
        const importRe = /@import\s+(['"])([^'"]+)\1/gi;
        const replacements = [];
        let match;
        while ((match = importRe.exec(css)) !== null) {
            const fullMatch = match[0];
            const quote = match[1];
            const rawUrl = match[2].trim();
            if ((0, utils_1.shouldSkipUrl)(rawUrl))
                continue;
            const abs = (0, utils_1.normalizeUrl)(rawUrl, baseUrl);
            if (!abs)
                continue;
            const asset = await this.ensureAsset(abs);
            if (asset) {
                const relPath = (0, utils_1.relativeAssetPath)(fromFilePath, asset.localPath);
                replacements.push({ original: fullMatch, replacement: `@import ${quote}${relPath}${quote}` });
            }
        }
        let result = css;
        for (const { original, replacement } of replacements) {
            result = result.split(original).join(replacement);
        }
        return result;
    }
    processSrcset(srcset, pageUrl, pageFilePath) {
        // srcset = "url1 1x, url2 2x" or "url1 100w, url2 200w"
        const parts = srcset.split(',');
        const rewritten = parts.map((part) => {
            const trimmed = part.trim();
            const spaceIdx = trimmed.search(/\s+/);
            let rawUrl = spaceIdx > -1 ? trimmed.slice(0, spaceIdx) : trimmed;
            const descriptor = spaceIdx > -1 ? trimmed.slice(spaceIdx) : '';
            if ((0, utils_1.shouldSkipUrl)(rawUrl))
                return part;
            const abs = (0, utils_1.normalizeUrl)(rawUrl, pageUrl);
            if (!abs)
                return part;
            // Try to get already-downloaded asset
            const asset = this.downloader.getAsset(abs);
            if (asset) {
                const relPath = (0, utils_1.relativeAssetPath)(pageFilePath, asset.localPath);
                return `${relPath}${descriptor}`;
            }
            return part;
        });
        return rewritten.join(', ');
    }
    /**
     * Ensure an asset is downloaded. First checks downloader cache, then downloads.
     */
    async ensureAsset(url) {
        // Check if already captured by interceptor
        const existing = this.downloader.getAsset(url);
        if (existing)
            return existing;
        // Try downloading
        return this.downloader.download(url);
    }
}
exports.Rewriter = Rewriter;
//# sourceMappingURL=rewriter.js.map