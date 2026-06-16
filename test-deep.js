// Simulate what the browser does: call updateData + renderAll
// We'll mock window/document to catch the exact error

const fs = require('fs');

// Read the upload result
async function test() {
  const formData = new FormData();
  const fileBuffer = fs.readFileSync('John Mayo.csv');
  const blob = new Blob([fileBuffer]);
  formData.append('file', blob, 'John Mayo.csv');
  formData.append('type', 'all');

  const res = await fetch('http://localhost:3000/api/upload', {
    method: 'POST',
    body: formData
  });
  const json = await res.json();
  const data = json.data;
  
  // Now simulate what trd-logic.js does
  // Check: does raw_leads have created_date that matches dateRange?
  console.log('=== DATA STRUCTURE ===');
  console.log('clients:', data.clients.length);
  console.log('leads:', data.leads.length);
  console.log('ads:', data.ads.length);
  
  // Check dates
  const dates = data.leads.map(l => l.created_date).filter(Boolean).sort();
  console.log('\n=== DATE RANGE ===');
  console.log('Earliest:', dates[0]);
  console.log('Latest:', dates[dates.length - 1]);
  
  // Check how many leads have each boolean field true
  console.log('\n=== BOOLEAN FIELD STATS ===');
  const fields = ['has_appointment', 'crm_movement', 'active_recent', 'has_attribution', 'workflow_detected', 'used_button', 'waiting', 'discarded_inferred', 'custom_data_detected'];
  fields.forEach(f => {
    const count = data.leads.filter(l => l[f]).length;
    console.log(`  ${f}: ${count}/${data.leads.length} (${Math.round(count/data.leads.length*100)}%)`);
  });
  
  // Check: does renderAction try to access cs[1].client with only 1 client?
  console.log('\n=== POTENTIAL CRASH POINTS ===');
  console.log('Number of clients:', data.clients.length);
  if (data.clients.length < 3) {
    console.log('WARNING: Less than 3 clients — renderAction may crash accessing cs[1]');
  }
  
  // Check: ads matching
  console.log('\n=== ADS MATCHING ===');
  data.ads.forEach(ad => {
    const matchingLeads = data.leads.filter(l => l.client === ad.client && l.ad_name_norm === ad.ad_name_norm && l.adset_norm === ad.adset_norm);
    console.log(`  Ad: "${ad.ad_name_norm}" / AdSet: "${ad.adset_norm}" -> ${matchingLeads.length} leads`);
  });
}

test().catch(e => console.error(e));
