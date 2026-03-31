import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { assetUrlToPath, assetUrlToFilename, detectAssetType, formatBytes } from './utils';

export interface DownloadedAsset {
  originalUrl: string;
  localPath: string;
  type: 'images' | 'fonts' | 'css' | 'js' | 'other';
  size: number;
}

export class Downloader {
  private downloaded = new Map<string, DownloadedAsset>(); // url -> asset info
  private outputBase: string;
  private domain: string;
  private errors: Array<{ url: string; error: string }> = [];

  constructor(outputBase: string, domain: string) {
    this.outputBase = outputBase;
    this.domain = domain;
  }

  /**
   * Register an asset that was already intercepted by Playwright (body already in memory)
   */
  registerIntercepted(url: string, body: Buffer, mimeType?: string): DownloadedAsset {
    const canonical = this.canonicalize(url);

    if (this.downloaded.has(canonical)) {
      return this.downloaded.get(canonical)!;
    }

    const localPath = assetUrlToPath(url, this.outputBase, this.domain, mimeType);
    const type = detectAssetType(url, mimeType);

    this.ensureDir(localPath);
    fs.writeFileSync(localPath, body);

    const asset: DownloadedAsset = {
      originalUrl: url,
      localPath,
      type,
      size: body.length,
    };

    this.downloaded.set(canonical, asset);
    return asset;
  }

  /**
   * Download an asset from URL if not already downloaded
   */
  async download(url: string, mimeTypeHint?: string): Promise<DownloadedAsset | null> {
    const canonical = this.canonicalize(url);

    if (this.downloaded.has(canonical)) {
      return this.downloaded.get(canonical)!;
    }

    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        maxRedirects: 5,
      });

      const body = Buffer.from(response.data);
      const mimeType = mimeTypeHint || response.headers['content-type'] || undefined;
      const localPath = assetUrlToPath(url, this.outputBase, this.domain, mimeType);
      const type = detectAssetType(url, mimeType);

      this.ensureDir(localPath);
      fs.writeFileSync(localPath, body);

      const asset: DownloadedAsset = {
        originalUrl: url,
        localPath,
        type,
        size: body.length,
      };

      this.downloaded.set(canonical, asset);
      return asset;
    } catch (err: any) {
      this.errors.push({ url, error: err.message || String(err) });
      return null;
    }
  }

  /**
   * Get a previously downloaded asset by URL
   */
  getAsset(url: string): DownloadedAsset | undefined {
    return this.downloaded.get(this.canonicalize(url));
  }

  /**
   * Check if URL has already been downloaded
   */
  has(url: string): boolean {
    return this.downloaded.has(this.canonicalize(url));
  }

  getAllAssets(): DownloadedAsset[] {
    return Array.from(this.downloaded.values());
  }

  getErrors() {
    return this.errors;
  }

  getSummary() {
    const assets = this.getAllAssets();
    const totalSize = assets.reduce((sum, a) => sum + a.size, 0);
    const byType = {
      images: assets.filter(a => a.type === 'images').length,
      fonts: assets.filter(a => a.type === 'fonts').length,
      css: assets.filter(a => a.type === 'css').length,
      js: assets.filter(a => a.type === 'js').length,
      other: assets.filter(a => a.type === 'other').length,
    };

    return {
      total: assets.length,
      totalSize: formatBytes(totalSize),
      byType,
      errors: this.errors.length,
    };
  }

  private canonicalize(url: string): string {
    try {
      const parsed = new URL(url);
      parsed.hash = '';
      return parsed.href;
    } catch {
      return url;
    }
  }

  private ensureDir(filePath: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
