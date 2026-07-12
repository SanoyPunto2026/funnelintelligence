const fs = require('fs');

let content = fs.readFileSync('public/legacy/trd-logic.js', 'utf-8');

// The string `â€”` is a UTF-8 em-dash rendered as Latin-1. Let's fix common ones.
const encodingMap = {
  'â€”': '—',
  'â€“': '–',
  'â€œ': '"',
  'â€': '"',
  'â€˜': "'",
  'â€™': "'",
  'â€¦': '...',
  'Ã¡': 'á',
  'Ã©': 'é',
  'Ã­': 'í',
  'Ã³': 'ó',
  'Ãº': 'ú',
  'Ã±': 'ñ',
  'Ã ': 'Á',
  'Ã‰': 'É',
  'Ã': 'Í',
  'Ã“': 'Ó',
  'Ãš': 'Ú',
  'Ã‘': 'Ñ',
  '?"': '—', // this might be from previous bad replacement
  '?': '—', 
  '': '—' // Be careful with this, only replacing specific occurrences if needed. Let's replace the one from the grep output.
};

for (const [bad, good] of Object.entries(encodingMap)) {
  if (bad !== '') {
    content = content.split(bad).join(good);
  }
}

// Fix the specific '?"' to '—' or N/A
content = content.replace(/['"]\?['"]/g, '"N/A"');
content = content.replace(/['"]\?"['"]/g, '"N/A"');
content = content.replace(/>\?"</g, '>&mdash;<');
content = content.replace(/>\?</g, '>&mdash;<');
content = content.replace(//g, ''); // Remove any remaining unknown replacement chars just in case

fs.writeFileSync('public/legacy/trd-logic.js', content, 'utf-8');
console.log('Encoding fixed.');
