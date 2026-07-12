const fs = require('fs');

let content = fs.readFileSync('public/legacy/trd-logic.js', 'utf-8');

// Replace specific encoding artifacts
content = content.replace(/â€”/g, '—');
content = content.replace(/â€“/g, '–');
content = content.replace(/â€œ/g, '"');
content = content.replace(/â€\x9D/g, '"');
content = content.replace(/â€˜/g, "'");
content = content.replace(/â€™/g, "'");
content = content.replace(/Ã¡/g, 'á');
content = content.replace(/Ã©/g, 'é');
content = content.replace(/Ã­/g, 'í');
content = content.replace(/Ã³/g, 'ó');
content = content.replace(/Ãº/g, 'ú');
content = content.replace(/Ã±/g, 'ñ');
content = content.replace(/Ã\x81/g, 'Á');
content = content.replace(/Ã\x89/g, 'É');
content = content.replace(/Ã\x8D/g, 'Í');
content = content.replace(/Ã\x93/g, 'Ó');
content = content.replace(/Ã\x9A/g, 'Ú');
content = content.replace(/Ã\x91/g, 'Ñ');

// Replace Unicode Replacement Character (U+FFFD)
content = content.replace(/\uFFFD/g, '—');

// Specific replacements to fix double bad characters like `?"`
content = content.replace(/—"/g, '"');
content = content.replace(/'—'/g, "'-'");

fs.writeFileSync('public/legacy/trd-logic.js', content, 'utf-8');
console.log('Fixed encoding safely.');
