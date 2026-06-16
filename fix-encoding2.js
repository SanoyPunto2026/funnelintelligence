const fs = require('fs');

let content = fs.readFileSync('public/legacy/trd-logic.js', 'utf-8');

// Fix: Ãš (0xC3 + 0x161) should be "Ú" (for "Últimos")
content = content.replace(/\u00c3\u0161/g, 'Ú');

// Fix: Ã— (0xC3 + 0x2014) should be "×" or a dash - looking at context it's a remove button "×"
content = content.replace(/\u00c3\u2014/g, '×');

// Fix remaining "í" that's correct already (0xed) - leave as-is

fs.writeFileSync('public/legacy/trd-logic.js', content, 'utf-8');
console.log('Remaining encoding fixes applied!');

// Verify no more Ã left
const remaining = (content.match(/\u00c3/g) || []).length;
console.log('Remaining Ã characters:', remaining);
