#!/usr/bin/env node
/**
 * LightWave Solar — Location Page Generator
 * Generates city-specific SEO pages from the residential template.
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_ROOT = path.join(__dirname, 'output', 'www.lightwavesolar.com');
const TEMPLATE_PATH = path.join(OUTPUT_ROOT, 'residential', 'solar-for-your-home', 'index.html');

const cities = [
  { name: 'Nashville',     slug: 'nashville',     county: 'Davidson'   },
  { name: 'Knoxville',     slug: 'knoxville',     county: 'Knox'       },
  { name: 'Chattanooga',   slug: 'chattanooga',   county: 'Hamilton'   },
  { name: 'Memphis',       slug: 'memphis',       county: 'Shelby'     },
  { name: 'Murfreesboro',  slug: 'murfreesboro',  county: 'Rutherford' },
  { name: 'Franklin',      slug: 'franklin',      county: 'Williamson' },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function tryReplace(html, pattern, replacement, label) {
  const result = html.replace(pattern, replacement);
  if (result === html) {
    console.warn(`  ⚠  No match for: ${label}`);
  } else {
    console.log(`  ✓  Replaced: ${label}`);
  }
  return result;
}

function buildLocationSection(city, county) {
  return `<section style="background:#f9f9f9;padding:60px 30px;text-align:center;">
  <div style="max-width:900px;margin:0 auto;">
    <h2 style="font-size:36px;font-weight:700;margin-bottom:20px;">Solar Installation in ${city}, Tennessee</h2>
    <p style="font-size:18px;line-height:1.7;color:#444;margin-bottom:30px;">
      LightWave Solar is ${city}'s trusted solar energy partner. Since 2006, we've designed and installed custom solar systems for homeowners and businesses across ${city} and surrounding ${county} County. From rooftop solar and battery storage to EV charging and ground-mount systems — we handle everything from design to permitting to installation.
    </p>
    <div style="display:flex;justify-content:center;gap:40px;flex-wrap:wrap;margin-bottom:30px;">
      <div style="text-align:center;">
        <div style="font-size:48px;font-weight:700;color:#f9a01b;">1,400+</div>
        <div style="font-size:16px;color:#666;">Systems Installed in TN</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:48px;font-weight:700;color:#f9a01b;">20+</div>
        <div style="font-size:16px;color:#666;">Years Serving Tennessee</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:48px;font-weight:700;color:#f9a01b;">9</div>
        <div style="font-size:16px;color:#666;">NABCEP Certifications</div>
      </div>
    </div>
    <a href="/book-a-consultation/index.html" style="background:#f9a01b;color:white;padding:16px 40px;font-size:18px;font-weight:700;text-decoration:none;border-radius:4px;display:inline-block;">Get a Free ${city} Solar Quote</a>
  </div>
</section>`;
}

function buildFaqSchema(city) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `How much does solar installation cost in ${city}, TN?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Solar installation costs in ${city}, Tennessee vary based on system size and home energy needs. Most residential systems range from $15,000-$35,000 before the 30% federal tax credit. LightWave Solar offers free consultations and custom quotes for ${city} homeowners.`
        }
      },
      {
        "@type": "Question",
        "name": `Is solar worth it in ${city}, Tennessee?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes — ${city} receives strong sunlight year-round. Combined with Tennessee's net metering policies and the 30% federal Investment Tax Credit, most ${city} homeowners see payback in 7-10 years and significant lifetime savings.`
        }
      },
      {
        "@type": "Question",
        "name": `Does LightWave Solar install in ${city}, TN?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, LightWave Solar serves ${city} and the surrounding area. We've completed hundreds of installations across Tennessee and are one of the most certified solar installers in the state with 9 NABCEP-certified professionals.`
        }
      }
    ]
  };

  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

// ─── main generator ───────────────────────────────────────────────────────────

function generatePage(templateHtml, city) {
  const { name, slug, county } = city;
  const CITY = name.toUpperCase();
  let html = templateHtml;

  console.log(`\n📍 Generating: ${name} (${slug})`);

  // 1. Title tag
  html = tryReplace(
    html,
    /<title>Residential Solar Energy Systems in TN \| LightWave Solar<\/title>/,
    `<title>Solar Installation in ${name}, TN | LightWave Solar</title>`,
    'Title tag'
  );

  // 2. Meta description (flexible match)
  html = tryReplace(
    html,
    /(<meta\s+name=["']description["']\s+content=["'])[^"']*["']/i,
    `$1LightWave Solar provides expert solar panel installation and battery storage in ${name}, Tennessee. Trusted since 2006 with 1,400+ installs across TN. Get a free consultation."`,
    'Meta description'
  );

  // 3. Hero slideshow title (multi-line, may not exist on residential page)
  html = tryReplace(
    html,
    /(<div class="mk-slideshow-title">)EXPERIENCE\.<br>\s*\nQUALITY\.<br>\s*\nPASSION\.(<\/div>)/g,
    `$1SOLAR IN<br>\n${CITY}, TN.<br>\nDONE RIGHT.$2`,
    'Hero slideshow title (EXPERIENCE/QUALITY/PASSION)'
  );

  // Also handle inline variant (no newlines)
  html = tryReplace(
    html,
    /(<div class="mk-slideshow-title">)EXPERIENCE\.<br>\nQUALITY\.<br>\nPASSION\.(<\/div>)/g,
    `$1SOLAR IN<br>\n${CITY}, TN.<br>\nDONE RIGHT.$2`,
    'Hero slideshow title (inline variant)'
  );

  // 4. Hero subtitle
  html = tryReplace(
    html,
    /(<div class="mk-slideshow-subtitle">)The Trusted Source for Turnkey Solar Solutions since 2006 putting experience, quality, and passion into every project\.(<\/div>)/g,
    `$1LightWave Solar has been serving ${name} homeowners and businesses with custom solar installations since 2006. Get your free consultation today.$2`,
    'Hero subtitle'
  );

  // 5. Page header H1 — "Solar for Your Home" or "Residential Solar"
  // The breadcrumb H1
  html = tryReplace(
    html,
    /(<h1>)(Solar for Your Home|Residential Solar)(<\/h1>)/,
    `$1Solar Panel Installation in ${name}, Tennessee$3`,
    'Page header H1 (breadcrumb)'
  );

  // The article headline H1
  html = tryReplace(
    html,
    /(<h1 itemprop="headline">\s*)Residential Solar(\s*<\/h1>)/,
    `$1Solar Panel Installation in ${name}, Tennessee$2`,
    'Article headline H1'
  );

  // 6. "Tennessee Valley" text (first occurrence only)
  html = tryReplace(
    html,
    /Serving the Tennessee Valley and Southeast region/,
    `Serving ${name} and the greater Tennessee Valley region`,
    '"Tennessee Valley" body text'
  );

  // 7. Hide the page header banner section (has the big "Solar Panel Installation" image)
  html = html.replace(
    /<section id="sp-page-header">/,
    '<section id="sp-page-header" style="display:none;">'
  );

  // Inject location content block right before sp-main-body section
  const mainBodyIdx = html.indexOf('<section id="sp-main-body">');
  if (mainBodyIdx !== -1) {
    html = html.slice(0, mainBodyIdx) + '\n' + buildLocationSection(name, county) + '\n' + html.slice(mainBodyIdx);
    console.log('  ✓  Injected: Location content block (before main body)');
  } else {
    // fallback: after 4th </section>
    let idx = 0;
    for (let i = 0; i < 4; i++) {
      idx = html.indexOf('</section>', idx + 1);
    }
    if (idx !== -1) {
      html = html.slice(0, idx + '</section>'.length) + '\n' + buildLocationSection(name, county) + '\n' + html.slice(idx + '</section>'.length);
      console.log('  ✓  Injected: Location content block (fallback)');
    }
  }

  // 8. Inject FAQPage JSON-LD before </head>
  html = tryReplace(
    html,
    /<\/head>/,
    `${buildFaqSchema(name)}\n</head>`,
    'FAQPage JSON-LD schema'
  );

  return html;
}

// ─── service areas index page ─────────────────────────────────────────────────

function buildServiceAreasIndex(cities) {
  const cityLinks = cities.map(c =>
    `    <li><a href="/service-areas/${c.slug}/index.html" style="color:#f9a01b;font-size:20px;font-weight:600;text-decoration:none;">${c.name}, TN</a><span style="color:#666;"> — ${c.county} County</span></li>`
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Solar Installation Service Areas in Tennessee | LightWave Solar</title>
  <meta name="description" content="LightWave Solar provides expert solar panel installation across Tennessee. Browse our service areas to find solar installation services near you.">
  <link rel="canonical" href="https://www.lightwavesolar.com/service-areas/">
  <style>
    body { font-family: 'Poppins', sans-serif; background: #fff; color: #252525; margin: 0; padding: 0; }
    .container { max-width: 900px; margin: 0 auto; padding: 60px 30px; }
    h1 { font-size: 42px; font-weight: 700; margin-bottom: 10px; }
    .subtitle { font-size: 20px; color: #666; margin-bottom: 40px; }
    ul { list-style: none; padding: 0; margin: 0 0 40px; }
    li { padding: 14px 0; border-bottom: 1px solid #eee; }
    .cta { background: #f9a01b; color: white; padding: 16px 40px; font-size: 18px;
           font-weight: 700; text-decoration: none; border-radius: 4px; display: inline-block; }
    .back { display: inline-block; margin-bottom: 30px; color: #f9a01b; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <a href="/index.html" class="back">← Back to LightWave Solar</a>
    <h1>Solar Installation Service Areas</h1>
    <p class="subtitle">LightWave Solar serves homeowners and businesses across Tennessee. Select your city to learn more.</p>
    <ul>
${cityLinks}
    </ul>
    <a href="/book-a-consultation/index.html" class="cta">Get a Free Solar Consultation</a>
  </div>
</body>
</html>`;
}

// ─── run ──────────────────────────────────────────────────────────────────────

console.log('LightWave Solar — Location Page Generator');
console.log('==========================================');

// Read template
if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error(`❌ Template not found: ${TEMPLATE_PATH}`);
  process.exit(1);
}
const templateHtml = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
console.log(`✓ Template loaded: ${TEMPLATE_PATH}`);

const generated = [];

for (const city of cities) {
  const outDir = path.join(OUTPUT_ROOT, 'service-areas', city.slug);
  const outFile = path.join(outDir, 'index.html');

  // Create output directory
  fs.mkdirSync(outDir, { recursive: true });

  // Generate page
  const html = generatePage(templateHtml, city);

  // Write file
  fs.writeFileSync(outFile, html, 'utf-8');
  console.log(`  📄 Written: ${outFile}`);

  generated.push({
    city: city.name,
    slug: city.slug,
    url: `http://localhost:3000/service-areas/${city.slug}/`,
    file: outFile,
  });
}

// Generate service areas index
const indexDir = path.join(OUTPUT_ROOT, 'service-areas');
const indexFile = path.join(indexDir, 'index.html');
fs.mkdirSync(indexDir, { recursive: true });
fs.writeFileSync(indexFile, buildServiceAreasIndex(cities), 'utf-8');
console.log(`\n  📄 Written: ${indexFile}`);

// Summary
console.log('\n==========================================');
console.log('✅ Generation complete!\n');
console.log('Generated pages:');
for (const p of generated) {
  console.log(`  ${p.city.padEnd(14)} → ${p.url}`);
}
console.log(`  ${'Service Areas'.padEnd(14)} → http://localhost:3000/service-areas/`);
