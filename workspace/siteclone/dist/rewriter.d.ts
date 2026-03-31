import { Downloader } from './downloader';
export declare class Rewriter {
    private downloader;
    private outputBase;
    private domain;
    private rootUrl;
    constructor(downloader: Downloader, outputBase: string, domain: string, rootUrl: string);
    /**
     * Rewrite all URLs in HTML to local relative paths
     * Also downloads any assets not yet captured by Playwright interception
     */
    rewriteHtml(html: string, pageUrl: string, pageFilePath: string): Promise<string>;
    /**
     * Rewrite url() references inside CSS content
     * Also downloads the referenced assets
     */
    rewriteCssContent(css: string, baseUrl: string, fromFilePath: string): Promise<string>;
    /**
     * Post-process a downloaded CSS file on disk: rewrite all its url() references
     */
    processCssFile(cssFilePath: string, originalCssUrl: string): Promise<void>;
    private rewriteCssImports;
    private processSrcset;
    /**
     * Ensure an asset is downloaded. First checks downloader cache, then downloads.
     */
    private ensureAsset;
}
//# sourceMappingURL=rewriter.d.ts.map