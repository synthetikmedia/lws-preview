const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'output', 'www.lightwavesolar.com');
const SENTINEL = '<!-- devin-injected -->';

// Everything from SENTINEL up to and including </head> replacement needs to be removed
// Strategy: find SENTINEL and remove from it to the next </style> after CSS block
// Simpler: re-clone from git... or just strip between sentinel and </head> marker

function unbakeFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf-8');
  if (!html.includes(SENTINEL)) return false;

  // Remove everything from SENTINEL to the closing </style> of our injected block
  // Our injection ends with CSS_INJECT + '\n' right before </head>
  // Pattern: SENTINEL ... </style>\n</head>  →  </head>
  html = html.replace(/<!-- devin-injected -->[\s\S]*?<\/style>\n<\/head>/, '</head>');

  // Also remove injected body scripts (PASSION + droppics)
  html = html.replace(/<script>\ndocument\.addEventListener\('DOMContentLoaded',function\(\)\{\s*document\.querySelectorAll\('\.mk-slideshow-title'\)[\s\S]*?<\/script><\/body>/, '</body>');
  html = html.replace(/<script>\ndocument\.addEventListener\('DOMContentLoaded',function\(\)\{\s*if\(typeof droppicsAutobrowse[\s\S]*?<\/script><\/body>/, '</body>');

  fs.writeFileSync(filePath, html, 'utf-8');
  return true;
}

function walkDir(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) count += walkDir(full);
    else if (entry.name.endsWith('.html') && unbakeFile(full)) count++;
  }
  return count;
}

console.log('Unbaking...');
console.log(`Unbaked ${walkDir(ROOT)} files.`);
