const fs = require('fs');

let content = fs.readFileSync('public/legacy/trd-logic.js', 'utf-8');

// FIX: renderAction crashes when there are fewer than 3 clients
// cs[1] is undefined when there's only 1 client
const oldRenderAction = `function renderAction(){const cs=[...DATA.clients].sort((a,b)=>activeScore(a)-activeScore(b)),best=[...DATA.clients].sort((a,b)=>activeScore(b)-activeScore(a))[0],items=[cs[0],cs[1],best];`;
const newRenderAction = `function renderAction(){const cs=[...DATA.clients].sort((a,b)=>activeScore(a)-activeScore(b)),best=[...DATA.clients].sort((a,b)=>activeScore(b)-activeScore(a))[0],items=[cs[0],cs[1],best].filter(Boolean);`;

if (content.includes(oldRenderAction)) {
  content = content.replace(oldRenderAction, newRenderAction);
  console.log('FIX applied: renderAction items filter');
} else {
  console.log('WARNING: Could not find renderAction target');
}

// FIX: renderAgency crashes when agency_stage_matrix is undefined
const oldMatrix = '${b.agency_stage_matrix.map(';
const newMatrix = '${(b.agency_stage_matrix||[]).map(';
let count = 0;
while (content.includes(oldMatrix)) {
  content = content.replace(oldMatrix, newMatrix);
  count++;
}
console.log(`FIX applied: agency_stage_matrix null check (${count} replacements)`);

fs.writeFileSync('public/legacy/trd-logic.js', content, 'utf-8');
console.log('Done!');
