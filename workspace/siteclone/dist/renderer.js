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
exports.Renderer = void 0;
const playwright_1 = require("playwright");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const utils_1 = require("./utils");
class Renderer {
    constructor(outputBase, downloader) {
        this.browser = null;
        this.context = null;
        this.outputBase = outputBase;
        this.downloader = downloader;
    }
    async init() {
        console.log('  🌐 Launching Chromium...');
        this.browser = await playwright_1.chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
            ],
        });
        this.context = await this.browser.newContext({
            viewport: { width: 1440, height: 900 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            ignoreHTTPSErrors: true,
        });
        // Intercept all network requests
        await this.context.route('**/*', async (route) => {
            const request = route.request();
            try {
                const response = await route.fetch();
                const url = request.url();
                // Capture asset bodies for non-HTML resources
                const headers = response.headers();
                const contentType = headers['content-type'] || '';
                const isAsset = !contentType.includes('text/html');
                if (isAsset) {
                    try {
                        const body = await response.body();
                        if (body && body.length > 0) {
                            this.downloader.registerIntercepted(url, body, contentType.split(';')[0].trim());
                        }
                    }
                    catch {
                        // body read can fail for some response types
                    }
                }
                await route.fulfill({ response: response });
            }
            catch (err) {
                // Network errors - just abort cleanly
                try {
                    await route.abort();
                }
                catch {
                    // ignore
                }
            }
        });
    }
    async renderPage(pageUrl, domain) {
        if (!this.context)
            throw new Error('Renderer not initialized');
        const page = await this.context.newPage();
        const screenshotPath = (0, utils_1.urlToScreenshotPath)(pageUrl, this.outputBase);
        try {
            console.log(`  📄 Rendering: ${pageUrl}`);
            // Navigate and wait for network to settle
            await page.goto(pageUrl, {
                waitUntil: 'networkidle',
                timeout: 60000,
            });
            // Scroll to trigger lazy-loaded content
            await this.scrollPage(page);
            // Wait a bit more for any lazy-load triggered fetches
            await (0, utils_1.sleep)(1000);
            // Wait for network to settle again after scroll
            await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => { });
            // Get the fully rendered HTML (including runtime-injected styles)
            const html = await page.evaluate(() => {
                // Serialize all computed styles from style tags (including injected ones)
                return document.documentElement.outerHTML;
            });
            // Extract links
            const links = await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('a[href]'));
                return anchors.map(a => a.href).filter(Boolean);
            });
            // Take screenshot
            await this.ensureDir(screenshotPath);
            await page.screenshot({
                path: screenshotPath,
                fullPage: true,
            });
            console.log(`    ✅ Rendered (screenshot saved)`);
            return {
                url: pageUrl,
                html,
                screenshotPath,
                interceptedAssets: new Map(),
                links,
            };
        }
        catch (err) {
            console.error(`    ❌ Failed: ${err.message}`);
            return {
                url: pageUrl,
                html: '',
                screenshotPath,
                interceptedAssets: new Map(),
                links: [],
                error: err.message || String(err),
            };
        }
        finally {
            await page.close();
        }
    }
    async close() {
        if (this.context) {
            await this.context.close();
            this.context = null;
        }
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
    /**
     * Scroll page to trigger lazy-loaded images and content
     */
    async scrollPage(page) {
        try {
            await page.evaluate(async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    const distance = 300;
                    const timer = setInterval(() => {
                        const scrollHeight = document.documentElement.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        if (totalHeight >= scrollHeight) {
                            clearInterval(timer);
                            // Scroll back to top
                            window.scrollTo(0, 0);
                            resolve();
                        }
                    }, 100);
                    // Safety timeout
                    setTimeout(() => {
                        clearInterval(timer);
                        window.scrollTo(0, 0);
                        resolve();
                    }, 10000);
                });
            });
        }
        catch {
            // Scroll errors are non-fatal
        }
    }
    async ensureDir(filePath) {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
}
exports.Renderer = Renderer;
//# sourceMappingURL=renderer.js.map