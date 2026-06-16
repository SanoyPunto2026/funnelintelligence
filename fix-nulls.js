const fs = require('fs');

let content = fs.readFileSync('public/legacy/trd-logic.js', 'utf-8');
let fixes = 0;

// FIX 1: selectedClient init - crashes when DATA.clients is empty at load
const old1 = `let selectedClient = (DATA && DATA.clients && DATA.clients.length > 0) ? [...DATA.clients].sort((a,b)=>b.score-a.score)[0].client : "";`;
const new1 = `let selectedClient = "";`;
if (content.includes(old1)) { content = content.replace(old1, new1); fixes++; console.log('FIX 1: selectedClient init'); }

// FIX 2: cBy - protect against empty clients
const old2 = `const cBy = n => DATA.clients.find(c=>c.client===n) || DATA.clients[0];`;
const new2 = `const cBy = n => (DATA.clients||[]).find(c=>c.client===n) || (DATA.clients||[])[0] || {client:'',leads:0,appointments:0,moved:0,active:0,attributed:0,stagnant:0,workflow:0,used_button:0,waiting:0,discarded_inferred:0,custom_data:0,appointment_rate:0,movement_rate:0,crm_activity:0,attribution_quality:0,meta_results:0,spend:0,avg_cpl:0,ads_count:0,score:0,category:'Emerging',main_problem:'Sin datos',appointment_score:0,movement_score:0,activity_score:0,attribution_score:0,acquisition_score:0,currency:'USD',engine_score:0,engine_category:'Emerging',engine_bottleneck:'appointment',engine_strength:'appointment'};`;
if (content.includes(old2)) { content = content.replace(old2, new2); fixes++; console.log('FIX 2: cBy null protection'); }

// FIX 3: fiBy - protect against empty funnel_intelligence 
const old3 = `const fiBy = n => DATA.funnel_intelligence.find(f=>f.client===n) || DATA.funnel_intelligence[0];`;
if (content.includes(old3)) {
  content = content.replace(old3, `const fiBy = n => (DATA.funnel_intelligence||[]).find(f=>f.client===n) || (DATA.funnel_intelligence||[])[0] || {client:'',stages:[],health_matrix:[],leakages:[],biggest_leak:{from:'',to:'',lost:0,leak_rate:0},bottleneck:{stage:'N/A',value:0,benchmark:0,score:0},benchmark_appointments:0,opportunity_appointments:0,economics:[],note_crm_exceeds_meta:false};`);
  fixes++; console.log('FIX 3: fiBy null protection');
}

// FIX 4: pfBy - protect against empty progression_funnels
const old4 = `const pfBy = n => DATA.progression_funnels.find(f=>f.client===n) || DATA.progression_funnels[0];`;
if (content.includes(old4)) {
  content = content.replace(old4, `const pfBy = n => (DATA.progression_funnels||[]).find(f=>f.client===n) || (DATA.progression_funnels||[])[0] || {client:'',stages:[],biggest_drop:null,mode:'',note:'',missing_fields:[]};`);
  fixes++; console.log('FIX 4: pfBy null protection');
}

// FIX 5: biggest_leak can be undefined if leakages is empty
// In buildFunnelIntelligence: biggest_leak:leakages.slice().sort(...)[0]
content = content.replace(
  /biggest_leak:leakages\.slice\(\)\.sort\(\(a,b\)=>b\.lost-a\.lost\)\[0\]/g,
  `biggest_leak:leakages.slice().sort((a,b)=>b.lost-a.lost)[0]||{from:'N/A',to:'N/A',lost:0,leak_rate:0}`
);
fixes++; console.log('FIX 5: biggest_leak null protection');

// FIX 6: renderOps uses best.client without null check
content = content.replace(
  /function renderOps\(\)\{const best=\[\.\.\.DATA\.clients\]\.sort/,
  `function renderOps(){if(!DATA.clients||!DATA.clients.length)return;const best=[...DATA.clients].sort`
);
fixes++; console.log('FIX 6: renderOps null check');

// FIX 7: renderAlerts may crash
content = content.replace(
  /function renderAlerts\(\)\{/,
  `function renderAlerts(){if(!DATA.clients||!DATA.clients.length)return;`
);
fixes++; console.log('FIX 7: renderAlerts null check');

// FIX 8: renderRisks may crash
content = content.replace(
  /function renderRisks\(\)\{/,
  `function renderRisks(){if(!DATA.clients||!DATA.clients.length)return;`
);
fixes++; console.log('FIX 8: renderRisks null check');

// FIX 9: renderClient - selectedClient might be empty
content = content.replace(
  /function renderClient\(\)\{const c=cBy\(selectedClient\)/,
  `function renderClient(){if(!selectedClient&&DATA.clients&&DATA.clients.length)selectedClient=DATA.clients[0].client;const c=cBy(selectedClient)`
);
fixes++; console.log('FIX 9: renderClient selectedClient init');

fs.writeFileSync('public/legacy/trd-logic.js', content, 'utf-8');
console.log(`\nTotal fixes applied: ${fixes}`);
