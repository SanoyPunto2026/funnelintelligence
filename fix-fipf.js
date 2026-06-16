const fs = require('fs');

let content = fs.readFileSync('public/legacy/trd-logic.js', 'utf-8');
let fixes = 0;

// FIX fiBy
const old1 = `const fiBy = n => DATA.funnel_intelligence.find(f=>f.client===n);`;
const new1 = `const fiBy = n => { const arr = DATA.funnel_intelligence||[]; return arr.find(f=>f.client===n) || {client:n,stages:[],health_matrix:[],leakages:[],biggest_leak:{from:'N/A',to:'N/A',lost:0,leak_rate:0},bottleneck:{stage:'N/A',value:0,benchmark:0,score:0},benchmark_appointments:0,opportunity_appointments:0,economics:[],note_crm_exceeds_meta:false}; };`;
if (content.includes(old1)) { content = content.replace(old1, new1); fixes++; console.log('FIX: fiBy'); }

// FIX pfBy
const old2 = `const pfBy = n => DATA.progression_funnels.find(f=>f.client===n);`;
const new2 = `const pfBy = n => { const arr = DATA.progression_funnels||[]; return arr.find(f=>f.client===n) || {client:n,stages:[],biggest_drop:null,mode:'',note:'',missing_fields:[]}; };`;
if (content.includes(old2)) { content = content.replace(old2, new2); fixes++; console.log('FIX: pfBy'); }

fs.writeFileSync('public/legacy/trd-logic.js', content, 'utf-8');
console.log(`Fixes applied: ${fixes}`);
