import { chromium, Browser, BrowserContext, Page, Route } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { Downloader } from './downloader';
import { sleep, urlToScreenshotPath } from './utils';

export interface RenderedPage {
  url: string;
  html: string;
  screenshotPath: string;
  interceptedAssets: Map<string, { body: Buffer; mimeType: string }>;
  links: string[];
  error?: string;
}

export class Renderer {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private outputBase: string;
  private downloader: Downloader;

  constructor(outputBase: string, downloader: Downloader) {
    this.outputBase = outputBase;
    this.downloader = downloader;
  }

  async init(): Promise<void> {
    console.log('  🌐 Launching Chromium...');
    this.browser = await chromium.launch({
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
    await this.context.route('**/*', async (route: Route) => {
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
          } catch {
            // body read can fail for some response types
          }
        }

        await route.fulfill({ response: response as any });
      } catch (err: any) {
        // Network errors - just abort cleanly
        try {
          await route.abort();
        } catch {
          // ignore
        }
      }
    });
  }

  async renderPage(pageUrl: string, domain: string): Promise<RenderedPage> {
    if (!this.context) throw new Error('Renderer not initialized');

    const page = await this.context.newPage();
    const screenshotPath = urlToScreenshotPath(pageUrl, this.outputBase);

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
      await sleep(1000);

      // Wait for network to settle again after scroll
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

      // Get the fully rendered HTML (including runtime-injected styles)
      const html = await page.evaluate(() => {
        // Serialize all computed styles from style tags (including injected ones)
        return document.documentElement.outerHTML;
      });

      // Extract links
      const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        return anchors.map(a => (a as HTMLAnchorElement).href).filter(Boolean);
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
    } catch (err: any) {
      console.error(`    ❌ Failed: ${err.message}`);
      return {
        url: pageUrl,
        html: '',
        screenshotPath,
        interceptedAssets: new Map(),
        links: [],
        error: err.message || String(err),
      };
    } finally {
      await page.close();
    }
  }

  async close(): Promise<void> {
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
  private async scrollPage(page: Page): Promise<void> {
    try {
      await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
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
    } catch {
      // Scroll errors are non-fatal
    }
  }

  private async ensureDir(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
