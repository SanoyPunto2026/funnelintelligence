const fs = require('fs');

let content = fs.readFileSync('public/legacy/trd-logic.js', 'utf-8');

// Replace the replacement character 
content = content.replace(/\?"/g, '"N/A"');
content = content.replace(//g, '-');

// Wait, the string in Select-String was `cpa===null?'?"':moneyBase(cpa)` 
// which should be `cpa===null?'—':moneyBase(cpa)` or similar.
// And another was `s.pending?'?"':fmtNum(s.value)`
// I will replace `?'?"'` with `?'-'`
content = content.replace(/\?'-\?"'/g, "?'-'"); // if  became -
content = content.replace(/\?'\?"'/g, "?'-'");

fs.writeFileSync('public/legacy/trd-logic.js', content, 'utf-8');
console.log('Fixed Unicode replacement characters.');
