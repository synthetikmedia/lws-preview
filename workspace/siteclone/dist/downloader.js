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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Downloader = void 0;
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const utils_1 = require("./utils");
class Downloader {
    constructor(outputBase, domain) {
        this.downloaded = new Map(); // url -> asset info
        this.errors = [];
        this.outputBase = outputBase;
        this.domain = domain;
    }
    /**
     * Register an asset that was already intercepted by Playwright (body already in memory)
     */
    registerIntercepted(url, body, mimeType) {
        const canonical = this.canonicalize(url);
        if (this.downloaded.has(canonical)) {
            return this.downloaded.get(canonical);
        }
        const localPath = (0, utils_1.assetUrlToPath)(url, this.outputBase, this.domain, mimeType);
        const type = (0, utils_1.detectAssetType)(url, mimeType);
        this.ensureDir(localPath);
        fs.writeFileSync(localPath, body);
        const asset = {
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
    async download(url, mimeTypeHint) {
        const canonical = this.canonicalize(url);
        if (this.downloaded.has(canonical)) {
            return this.downloaded.get(canonical);
        }
        try {
            const response = await axios_1.default.get(url, {
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
                maxRedirects: 5,
            });
            const body = Buffer.from(response.data);
            const mimeType = mimeTypeHint || response.headers['content-type'] || undefined;
            const localPath = (0, utils_1.assetUrlToPath)(url, this.outputBase, this.domain, mimeType);
            const type = (0, utils_1.detectAssetType)(url, mimeType);
            this.ensureDir(localPath);
            fs.writeFileSync(localPath, body);
            const asset = {
                originalUrl: url,
                localPath,
                type,
                size: body.length,
            };
            this.downloaded.set(canonical, asset);
            return asset;
        }
        catch (err) {
            this.errors.push({ url, error: err.message || String(err) });
            return null;
        }
    }
    /**
     * Get a previously downloaded asset by URL
     */
    getAsset(url) {
        return this.downloaded.get(this.canonicalize(url));
    }
    /**
     * Check if URL has already been downloaded
     */
    has(url) {
        return this.downloaded.has(this.canonicalize(url));
    }
    getAllAssets() {
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
            totalSize: (0, utils_1.formatBytes)(totalSize),
            byType,
            errors: this.errors.length,
        };
    }
    canonicalize(url) {
        try {
            const parsed = new URL(url);
            parsed.hash = '';
            return parsed.href;
        }
        catch {
            return url;
        }
    }
    ensureDir(filePath) {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
}
exports.Downloader = Downloader;
//# sourceMappingURL=downloader.js.map