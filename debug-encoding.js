const fs = require('fs');

let content = fs.readFileSync('public/legacy/trd-logic.js', 'utf-8');

// Fix remaining Ã-based mojibake patterns
// Ãš = Ú (but here it's "Últimos" -> the Ú got corrupted)
// Find the actual byte patterns present in the file

// Look at the raw bytes around line 183
const lines = content.split('\n');
for (const idx of [182, 183, 516, 697]) {
  if (lines[idx]) {
    const problematic = [];
    for (let i = 0; i < lines[idx].length; i++) {
      const code = lines[idx].charCodeAt(i);
      if (code > 127) {
        problematic.push({ pos: i, char: lines[idx][i], code: code, hex: '0x' + code.toString(16) });
      }
    }
    console.log(`Line ${idx + 1} non-ASCII chars:`, JSON.stringify(problematic));
  }
}
