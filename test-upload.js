// Test the upload API with a real CSV file
const fs = require('fs');
const path = require('path');

async function testUpload(filePath) {
  const formData = new FormData();
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer]);
  formData.append('file', blob, path.basename(filePath));
  formData.append('type', 'all');

  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    const json = await res.json();
    
    if (json.error) {
      console.error('ERROR:', json.error);
      return;
    }
    
    console.log('Status:', res.status);
    console.log('fileName:', json.fileName);
    console.log('Clients:', JSON.stringify(json.data.clients));
    console.log('Leads count:', json.data.leads.length);
    console.log('Ads count:', json.data.ads.length);
    
    // Check a sample lead
    if (json.data.leads.length > 0) {
      const sample = json.data.leads[0];
      console.log('\nSample lead:');
      console.log('  client:', sample.client);
      console.log('  name:', sample.name);
      console.log('  created_date:', sample.created_date);
      console.log('  has_appointment:', sample.has_appointment);
      console.log('  crm_movement:', sample.crm_movement);
      console.log('  active_recent:', sample.active_recent);
      console.log('  has_attribution:', sample.has_attribution);
      console.log('  workflow_detected:', sample.workflow_detected);
      console.log('  ad_name_norm:', sample.ad_name_norm);
      console.log('  adset_norm:', sample.adset_norm);
      console.log('  ad:', sample.ad);
      console.log('  status:', sample.status);
    }
  } catch(e) {
    console.error('Fetch error:', e.message);
  }
}

testUpload('John Mayo.csv');
