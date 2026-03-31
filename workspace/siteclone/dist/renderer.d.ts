import { Downloader } from './downloader';
export interface RenderedPage {
    url: string;
    html: string;
    screenshotPath: string;
    interceptedAssets: Map<string, {
        body: Buffer;
        mimeType: string;
    }>;
    links: string[];
    error?: string;
}
export declare class Renderer {
    private browser;
    private context;
    private outputBase;
    private downloader;
    constructor(outputBase: string, downloader: Downloader);
    init(): Promise<void>;
    renderPage(pageUrl: string, domain: string): Promise<RenderedPage>;
    close(): Promise<void>;
    /**
     * Scroll page to trigger lazy-loaded images and content
     */
    private scrollPage;
    private ensureDir;
}
//# sourceMappingURL=renderer.d.ts.map