const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'output', 'www.lightwavesolar.com');
const PORT = 3000;

const mime = {
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  ico: 'image/x-icon',
  webp: 'image/webp',
  pdf: 'application/pdf',
};

const CSS_INJECT = `<style>
/* Hide nav buttons embedded inside each cloned slide item */
.owl-item .owl-nav { display: none !important; }
/* Fix logo stretching */
.logo-image, .logo-image-phone { object-fit: contain !important; width: auto !important; }
/* Clip carousel overflow so only active slide shows */
.owl-stage-outer { overflow: hidden !important; }
/* Fix droppics gallery - 5x5 grid */
div.droppicsgallery div.droppicspictures {
  display: flex !important;
  flex-wrap: wrap !important;
}
div.droppicsgallery div.droppicspictures div.wimg {
  width: 252px !important;
  height: 252px !important;
  overflow: hidden !important;
  display: inline-block !important;
  vertical-align: top !important;
  margin: 3px !important;
}
div.droppicsgallery div.droppicspictures div.wimg a {
  display: block !important;
  width: 252px !important;
  height: 252px !important;
}
div.droppicsgallery div.droppicspictures div.wimg img,
div.droppicsgallery div.droppicspictures div.wimg img.img {
  width: 252px !important;
  height: 252px !important;
  max-width: none !important;
  object-fit: cover !important;
  display: block !important;
  margin: 0 !important;
  margin-top: 0 !important;
}
/* Hero PASSION gold accent */
.mk-slideshow-title {
  color: white !important;
}
/* Target the last line "PASSION." — use a JS injection below */
/* Hero text size boost */
.mk-slideshow-title {
  font-size: 80px !important;
  line-height: 1.1 !important;
}
.mk-slideshow-subtitle {
  font-size: 28px !important;
  line-height: 1.6 !important;
}
@media (max-width: 991px) {
  .mk-slideshow-title { font-size: 52px !important; }
  .mk-slideshow-subtitle { font-size: 22px !important; }
}
@media (max-width: 575px) {
  .mk-slideshow-title { font-size: 38px !important; }
  .mk-slideshow-subtitle { font-size: 18px !important; }
}
/* Reset baked-in translate so active slide is visible, hide cloned slides */
.owl-stage { transform: none !important; width: auto !important; display: flex !important; }
.owl-item { flex-shrink: 0; }
.owl-item.cloned { display: none !important; }
.owl-item:not(.active) { display: none !important; }
.owl-item.active { display: block !important; width: 100% !important; }
</style>`;

// Returns a clean canonical path from the raw URL path
function getPagePath(urlPath) {
  let p = urlPath.split('?')[0]; // strip query string
  p = p.replace(/index\.html$/, ''); // replace trailing index.html with empty
  if (!p.startsWith('/')) p = '/' + p;
  return p;
}

// LocalBusiness JSON-LD (injected on all pages)
const LOCAL_BUSINESS_SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SolarEnergyEquipmentSupplier",
  "name": "LightWave Solar",
  "url": "https://www.lightwavesolar.com",
  "logo": "https://www.lightwavesolar.com/assets/images/lightwave-only-logo-4df5271b.png",
  "foundingDate": "2006",
  "description": "LightWave Solar has been helping people meet their energy goals since 2006, providing custom solar designs and installations across the Tennessee Valley and Southeast region.",
  "numberOfEmployees": {"@type": "QuantitativeValue", "value": 70},
  "areaServed": ["Tennessee", "Nashville", "Knoxville", "Chattanooga", "Memphis"],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "3026 Owen Drive, Suite 104",
    "addressLocality": "Nashville",
    "addressRegion": "TN",
    "postalCode": "37013",
    "addressCountry": "US"
  },
  "telephone": "+16156414050",
  "email": "info@lightwavesolar.com",
  "hasCredential": "NABCEP Certified Solar PV Professional",
  "sameAs": [
    "https://www.facebook.com/LightWaveSolar/",
    "https://www.linkedin.com/company/lightwave-solar-electric/",
    "https://instagram.com/lightwavesolar",
    "https://x.com/lightwavesolar",
    "https://www.youtube.com/LightWaveSolar"
  ]
}, null, 2);

// Residential FAQ JSON-LD
const RESIDENTIAL_FAQ_SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does a solar electric system work?",
      "acceptedAnswer": {"@type": "Answer", "text": "Solar panels convert sunlight into DC electricity, which an inverter converts to AC power for your home or business. Excess energy can be stored in batteries or sent back to the grid."}
    },
    {
      "@type": "Question",
      "name": "How much does residential solar cost in Tennessee?",
      "acceptedAnswer": {"@type": "Answer", "text": "The cost of a residential solar system varies based on system size, roof type, and energy needs. LightWave Solar provides custom quotes after a free consultation. Federal tax credits of up to 30% are currently available."}
    },
    {
      "@type": "Question",
      "name": "How much solar and how many batteries do I need?",
      "acceptedAnswer": {"@type": "Answer", "text": "System sizing depends on your energy usage, roof orientation, and goals. LightWave Solar's experts design custom systems after reviewing your utility bills and home energy needs."}
    },
    {
      "@type": "Question",
      "name": "Will my solar system work on cloudy days?",
      "acceptedAnswer": {"@type": "Answer", "text": "Yes, solar panels still generate electricity on cloudy days, though at reduced output. Battery storage systems like the Tesla Powerwall can store energy for use when sunlight is limited."}
    },
    {
      "@type": "Question",
      "name": "When there is a grid outage, will my whole home be backed up?",
      "acceptedAnswer": {"@type": "Answer", "text": "With a battery storage system paired with solar, you can power your home during grid outages. The amount of backup depends on battery capacity and your energy consumption."}
    },
    {
      "@type": "Question",
      "name": "Can a solar system increase the value of my home?",
      "acceptedAnswer": {"@type": "Answer", "text": "Yes. Studies show that solar installations can increase home value. In Tennessee, solar-equipped homes often sell faster and at higher prices than comparable non-solar homes."}
    },
    {
      "@type": "Question",
      "name": "What financing options are available for solar in Tennessee?",
      "acceptedAnswer": {"@type": "Answer", "text": "LightWave Solar offers multiple financing options including solar loans, leases, and cash purchases. The federal Investment Tax Credit (ITC) currently allows homeowners to deduct 30% of installation costs."}
    }
  ]
}, null, 2);

// Commercial FAQ JSON-LD
const COMMERCIAL_FAQ_SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How can solar benefit my business in Tennessee?",
      "acceptedAnswer": {"@type": "Answer", "text": "Commercial solar reduces electricity costs, protects against utility rate increases, generates federal tax credits (30% ITC), and qualifies for accelerated depreciation (MACRS). Most commercial systems achieve payback in 5-8 years."}
    },
    {
      "@type": "Question",
      "name": "What size solar system does my business need?",
      "acceptedAnswer": {"@type": "Answer", "text": "Commercial system size depends on energy consumption, available roof or ground space, and financial goals. LightWave Solar designs systems from small rooftop arrays to multi-megawatt utility-scale installations."}
    },
    {
      "@type": "Question",
      "name": "What incentives are available for commercial solar in Tennessee?",
      "acceptedAnswer": {"@type": "Answer", "text": "Commercial solar in Tennessee qualifies for the 30% federal Investment Tax Credit (ITC), MACRS accelerated depreciation, and USDA REAP grants for rural businesses and agricultural producers."}
    },
    {
      "@type": "Question",
      "name": "Does LightWave Solar offer solar operations and maintenance services?",
      "acceptedAnswer": {"@type": "Answer", "text": "Yes. LightWave Solar offers comprehensive Solar O&M services including performance monitoring, preventive maintenance, cleaning, inverter service, and emergency repair for commercial and utility-scale systems."}
    }
  ]
}, null, 2);

function buildArticleSchema(headline) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "publisher": {
      "@type": "Organization",
      "name": "LightWave Solar",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.lightwavesolar.com/assets/images/lightwave-only-logo-4df5271b.png"
      }
    },
    "author": {
      "@type": "Organization",
      "name": "LightWave Solar"
    }
  }, null, 2);
}

function injectHTML(html, urlPath) {
  const canonicalPath = getPagePath(urlPath);
  const isHomepage = (canonicalPath === '/' || canonicalPath === '');
  const isResidentialFAQ = urlPath.includes('/residential/faqs/');
  const isCommercialFAQ = urlPath.includes('/commercial/faqs/');
  const isNewsArticle = urlPath.includes('/news-events/') && !urlPath.replace(/\/news-events\/?/, '').match(/^(index\.html)?$/);

  // ── HEAD INJECTIONS ──────────────────────────────────────────────────────────

  let headInjects = '';

  // 1. Canonical tag
  headInjects += `<link rel="canonical" href="https://www.lightwavesolar.com${canonicalPath}">\n`;

  // 4. og:image — only if not already present
  if (!html.includes('property="og:image"') && !html.includes("property='og:image'")) {
    headInjects += `<meta property="og:image" content="https://www.lightwavesolar.com/assets/images/LightWave-Residential-Customers-Were-Going-Solar-126a8aa0.jpg">\n`;
    headInjects += `<meta property="og:image:width" content="1200">\n`;
    headInjects += `<meta property="og:image:height" content="630">\n`;
  }

  // 5. LocalBusiness JSON-LD (all pages)
  headInjects += `<script type="application/ld+json">\n${LOCAL_BUSINESS_SCHEMA}\n</script>\n`;

  // 6. Residential FAQ JSON-LD
  if (isResidentialFAQ) {
    headInjects += `<script type="application/ld+json">\n${RESIDENTIAL_FAQ_SCHEMA}\n</script>\n`;
  }

  // 7. Commercial FAQ JSON-LD
  if (isCommercialFAQ) {
    headInjects += `<script type="application/ld+json">\n${COMMERCIAL_FAQ_SCHEMA}\n</script>\n`;
  }

  // 8. Article JSON-LD for news/blog pages
  if (isNewsArticle) {
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const headline = titleMatch ? titleMatch[1].trim() : 'LightWave Solar News';
    headInjects += `<script type="application/ld+json">\n${buildArticleSchema(headline)}\n</script>\n`;
  }

  // CSS inject (existing)
  headInjects += CSS_INJECT + '\n';

  // Inject everything before </head>
  html = html.replace('</head>', headInjects + '</head>');

  // 3. Homepage meta description replacement
  if (isHomepage) {
    html = html.replace(
      /(<meta\s+name=["']description["']\s+content=["'])[^"']*["']/i,
      '$1LightWave Solar has installed 1,400+ solar systems across Tennessee since 2006. Custom residential &amp; commercial solar + battery storage. Free consultation."'
    );
  }

  // ── BODY INJECTIONS ──────────────────────────────────────────────────────────

  // 2. Homepage hidden H1
  if (isHomepage) {
    html = html.replace(
      /<body([^>]*)>/i,
      `<body$1>\n<h1 style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;">LightWave Solar — Solar Energy Installation &amp; Battery Storage in Tennessee</h1>`
    );
  }

  // ── PERFORMANCE OPTIMIZATIONS ────────────────────────────────────────────────

  // 9. loading="lazy" on images after first </section>
  const firstSectionEnd = html.indexOf('</section>');
  if (firstSectionEnd !== -1) {
    const before = html.slice(0, firstSectionEnd + '</section>'.length);
    let after = html.slice(firstSectionEnd + '</section>'.length);
    // Add loading="lazy" to img tags that don't already have it
    after = after.replace(/<img (?![^>]*loading=)/gi, '<img loading="lazy" ');
    html = before + after;
  }

  // 12. Gold "PASSION." in hero title
  html = html.replace('</body>', `<script>
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.mk-slideshow-title').forEach(function(el) {
    el.innerHTML = el.innerHTML.replace(/PASSION\./g, '<span style="color:#f9a01b;">PASSION.</span>');
  });
});
</script></body>`);

  // 11. Auto-inject droppicsAutobrowse images on load + enforce 5-col grid
  if (html.includes('droppicsAutobrowse')) {
    html = html.replace('</body>', `<script>
document.addEventListener('DOMContentLoaded', function() {
  if (typeof droppicsAutobrowse === 'undefined') return;
  Object.keys(droppicsAutobrowse).forEach(function(id) {
    var gallery = document.getElementById('droppicsgallery' + id);
    if (!gallery) return;
    var pictures = gallery.querySelector('.droppicspictures');
    if (!pictures) return;
    var clr = pictures.querySelector('.clr');
    droppicsAutobrowse[id].forEach(function(html) {
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      var item = tmp.firstElementChild;
      if (item) {
        if (clr) pictures.insertBefore(item, clr);
        else pictures.appendChild(item);
      }
    });
  });
});
</script></body>`);
  }

  // 10. defer on jQuery and core scripts (only if not already deferred)
  html = html.replace(/<script src="(assets\/js\/jquery\.min-)/g, '<script defer src="$1');
  html = html.replace(/<script src="(assets\/js\/core\.min-)/g, '<script defer src="$1');
  html = html.replace(/<script src="(assets\/js\/jquery-noconflict\.min-)/g, '<script defer src="$1');

  return html;
}

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  if (urlPath.endsWith('/')) urlPath += 'index.html';

  let filePath = path.join(ROOT, urlPath);

  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    filePath = path.join(ROOT, urlPath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    // Proxy missing resources (AJAX, images, etc.) from live site
    const fullRawUrl = req.url; // preserve query string for AJAX calls
    const liveUrl = 'https://www.lightwavesolar.com' + fullRawUrl;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://www.lightwavesolar.com/',
      }
    };

    const doProxy = (body) => {
      const parsed = new URL(liveUrl);
      const reqOptions = {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: req.method,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://www.lightwavesolar.com/',
          'Content-Type': req.headers['content-type'] || 'application/x-www-form-urlencoded',
          ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
        }
      };
      const proxyReq = https.request(reqOptions, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, {
          'Content-Type': proxyRes.headers['content-type'] || 'application/octet-stream',
          'Access-Control-Allow-Origin': '*',
        });
        proxyRes.pipe(res);
      });
      proxyReq.on('error', () => {
        res.writeHead(502);
        res.end('Proxy error');
      });
      if (body) proxyReq.write(body);
      proxyReq.end();
    };

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => doProxy(body));
    } else {
      doProxy(null);
    }
    return;
  }

  const ext = path.extname(filePath).slice(1).toLowerCase();
  const contentType = mime[ext] || 'application/octet-stream';

  res.setHeader('Content-Type', contentType);
  res.writeHead(200);

  if (ext === 'html') {
    let html = fs.readFileSync(filePath, 'utf-8');
    html = injectHTML(html, req.url);
    res.end(html);
  } else {
    fs.createReadStream(filePath).pipe(res);
  }

}).listen(PORT, () => {
  console.log(`LightWave Solar clone running at http://localhost:${PORT}`);
});
