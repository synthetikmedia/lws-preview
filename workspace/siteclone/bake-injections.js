const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'output', 'www.lightwavesolar.com');
const SENTINEL = '<!-- devin-injected -->';

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
.mk-slideshow-title { color: white !important; font-size: 80px !important; line-height: 1.1 !important; }
.mk-slideshow-subtitle { font-size: 28px !important; line-height: 1.6 !important; }
@media (max-width: 991px) {
  .mk-slideshow-title { font-size: 52px !important; }
  .mk-slideshow-subtitle { font-size: 22px !important; }
}
@media (max-width: 575px) {
  .mk-slideshow-title { font-size: 38px !important; }
  .mk-slideshow-subtitle { font-size: 18px !important; }
}
.owl-stage { transform: none !important; width: auto !important; display: flex !important; }
.owl-item { flex-shrink: 0; }
.owl-item.cloned { display: none !important; }
.owl-item:not(.active) { display: none !important; }
.owl-item.active { display: block !important; width: 100% !important; }
</style>`;

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
  "sameAs": [
    "https://www.facebook.com/LightWaveSolar/",
    "https://www.linkedin.com/company/lightwave-solar-electric/",
    "https://instagram.com/lightwavesolar",
    "https://x.com/lightwavesolar",
    "https://www.youtube.com/LightWaveSolar"
  ]
}, null, 2);

const RESIDENTIAL_FAQ_SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "How does a solar electric system work?", "acceptedAnswer": {"@type": "Answer", "text": "Solar panels convert sunlight into DC electricity, which an inverter converts to AC power for your home or business."} },
    { "@type": "Question", "name": "How much does residential solar cost in Tennessee?", "acceptedAnswer": {"@type": "Answer", "text": "Cost varies based on system size, roof type, and energy needs. Federal tax credits of up to 30% are currently available."} },
    { "@type": "Question", "name": "Will my solar system work on cloudy days?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, solar panels still generate electricity on cloudy days, though at reduced output."} }
  ]
}, null, 2);

const COMMERCIAL_FAQ_SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "How can solar benefit my business in Tennessee?", "acceptedAnswer": {"@type": "Answer", "text": "Commercial solar reduces electricity costs and qualifies for the 30% federal ITC and MACRS depreciation."} },
    { "@type": "Question", "name": "What incentives are available for commercial solar in Tennessee?", "acceptedAnswer": {"@type": "Answer", "text": "The 30% federal ITC, MACRS accelerated depreciation, and USDA REAP grants for rural businesses."} }
  ]
}, null, 2);

function buildArticleSchema(headline) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "publisher": { "@type": "Organization", "name": "LightWave Solar", "logo": { "@type": "ImageObject", "url": "https://www.lightwavesolar.com/assets/images/lightwave-only-logo-4df5271b.png" } },
    "author": { "@type": "Organization", "name": "LightWave Solar" }
  }, null, 2);
}

function getCanonicalPath(filePath) {
  let rel = filePath.replace(ROOT, '').replace(/\\/g, '/');
  rel = rel.replace(/index\.html$/, '');
  if (!rel.startsWith('/')) rel = '/' + rel;
  return rel;
}

function bakeFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf-8');
  if (html.includes(SENTINEL)) return false; // already injected

  const canonicalPath = getCanonicalPath(filePath);
  const isHomepage = canonicalPath === '/' || canonicalPath === '';
  const isResidentialFAQ = filePath.includes('residential\\faqs') || filePath.includes('residential/faqs');
  const isCommercialFAQ = filePath.includes('commercial\\faqs') || filePath.includes('commercial/faqs');
  const isNewsArticle = (filePath.includes('news-events\\') || filePath.includes('news-events/')) &&
    !filePath.replace(/news-events[/\\]/, '').match(/^(index\.html)?$/);

  let headInjects = SENTINEL + '\n';
  headInjects += `<link rel="canonical" href="https://www.lightwavesolar.com${canonicalPath}">\n`;

  if (!html.includes('og:image')) {
    headInjects += `<meta property="og:image" content="https://www.lightwavesolar.com/assets/images/LightWave-Residential-Customers-Were-Going-Solar-126a8aa0.jpg">\n`;
    headInjects += `<meta property="og:image:width" content="1200">\n`;
    headInjects += `<meta property="og:image:height" content="630">\n`;
  }

  headInjects += `<script type="application/ld+json">\n${LOCAL_BUSINESS_SCHEMA}\n</script>\n`;
  if (isResidentialFAQ) headInjects += `<script type="application/ld+json">\n${RESIDENTIAL_FAQ_SCHEMA}\n</script>\n`;
  if (isCommercialFAQ) headInjects += `<script type="application/ld+json">\n${COMMERCIAL_FAQ_SCHEMA}\n</script>\n`;

  if (isNewsArticle) {
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const headline = titleMatch ? titleMatch[1].trim() : 'LightWave Solar News';
    headInjects += `<script type="application/ld+json">\n${buildArticleSchema(headline)}\n</script>\n`;
  }

  headInjects += CSS_INJECT + '\n';
  html = html.replace('</head>', headInjects + '</head>');

  // Homepage: hidden H1 + meta description
  if (isHomepage) {
    html = html.replace(/<body([^>]*)>/i, `<body$1>\n<h1 style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;">LightWave Solar — Solar Energy Installation &amp; Battery Storage in Tennessee</h1>`);
    html = html.replace(/(<meta\s+name=["']description["']\s+content=["'])[^"']*["']/i, '$1LightWave Solar has installed 1,400+ solar systems across Tennessee since 2006. Custom residential &amp; commercial solar + battery storage. Free consultation."');
  }

  // Lazy load images after first section
  const firstSectionEnd = html.indexOf('</section>');
  if (firstSectionEnd !== -1) {
    const before = html.slice(0, firstSectionEnd + '</section>'.length);
    let after = html.slice(firstSectionEnd + '</section>'.length);
    after = after.replace(/<img (?![^>]*loading=)/gi, '<img loading="lazy" ');
    html = before + after;
  }

  // PASSION gold
  html = html.replace('</body>', `<script>
document.addEventListener('DOMContentLoaded',function(){
  document.querySelectorAll('.mk-slideshow-title').forEach(function(el){
    el.innerHTML=el.innerHTML.replace(/PASSION\\./g,'<span style="color:#f9a01b;">PASSION.</span>');
  });
});
</script></body>`);

  // Droppics autobrowse
  if (html.includes('droppicsAutobrowse')) {
    html = html.replace('</body>', `<script>
document.addEventListener('DOMContentLoaded',function(){
  if(typeof droppicsAutobrowse==='undefined')return;
  Object.keys(droppicsAutobrowse).forEach(function(id){
    var gallery=document.getElementById('droppicsgallery'+id);
    if(!gallery)return;
    var pictures=gallery.querySelector('.droppicspictures');
    if(!pictures)return;
    var clr=pictures.querySelector('.clr');
    droppicsAutobrowse[id].forEach(function(h){
      var tmp=document.createElement('div');tmp.innerHTML=h;
      var item=tmp.firstElementChild;
      if(item){if(clr)pictures.insertBefore(item,clr);else pictures.appendChild(item);}
    });
  });
});
</script></body>`);
  }

  // Defer jQuery/core scripts
  html = html.replace(/<script src="(assets\/js\/jquery\.min-)/g, '<script defer src="$1');
  html = html.replace(/<script src="(assets\/js\/core\.min-)/g, '<script defer src="$1');
  html = html.replace(/<script src="(assets\/js\/jquery-noconflict\.min-)/g, '<script defer src="$1');

  fs.writeFileSync(filePath, html, 'utf-8');
  return true;
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let count = 0;
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += walkDir(full);
    } else if (entry.name.endsWith('.html')) {
      const baked = bakeFile(full);
      if (baked) count++;
    }
  }
  return count;
}

console.log('Baking injections into static HTML...');
const total = walkDir(ROOT);
console.log(`Done. Baked ${total} files.`);
