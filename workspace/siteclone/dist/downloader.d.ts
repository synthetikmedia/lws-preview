export interface DownloadedAsset {
    originalUrl: string;
    localPath: string;
    type: 'images' | 'fonts' | 'css' | 'js' | 'other';
    size: number;
}
export declare class Downloader {
    private downloaded;
    private outputBase;
    private domain;
    private errors;
    constructor(outputBase: string, domain: string);
    /**
     * Register an asset that was already intercepted by Playwright (body already in memory)
     */
    registerIntercepted(url: string, body: Buffer, mimeType?: string): DownloadedAsset;
    /**
     * Download an asset from URL if not already downloaded
     */
    download(url: string, mimeTypeHint?: string): Promise<DownloadedAsset | null>;
    /**
     * Get a previously downloaded asset by URL
     */
    getAsset(url: string): DownloadedAsset | undefined;
    /**
     * Check if URL has already been downloaded
     */
    has(url: string): boolean;
    getAllAssets(): DownloadedAsset[];
    getErrors(): {
        url: string;
        error: string;
    }[];
    getSummary(): {
        total: number;
        totalSize: string;
        byType: {
            images: number;
            fonts: number;
            css: number;
            js: number;
            other: number;
        };
        errors: number;
    };
    private canonicalize;
    private ensureDir;
}
//# sourceMappingURL=downloader.d.ts.map