const fs = require('fs');

let content = fs.readFileSync('public/legacy/trd-logic.js', 'utf-8');

// FIX: Initialize DATA.benchmarks at the start of applyDateRange
const old = 'function applyDateRange(){\r\n  const filtered=rawFilteredLeads();\r\n  DATA.clients=buildClientMetrics(filtered);';
const replacement = 'function applyDateRange(){\r\n  const filtered=rawFilteredLeads();\r\n  if(!DATA.benchmarks) DATA.benchmarks={total_clients:0,total_leads:0,total_appointments:0,avg_appointment_rate:0,top_appointment_rate:0,avg_movement_rate:0,avg_activity_rate:0,avg_attribution_quality:0,healthy_clients:0,risk_clients:0,critical_clients:0,agency_health_score:0,agency_category:"Emerging",engine_agency_health_score:0,engine_agency_category:"Emerging",agency_stage_matrix:[]};\r\n  DATA.clients=buildClientMetrics(filtered);';

if (content.includes(old)) {
  content = content.replace(old, replacement);
  console.log('FIX applied: DATA.benchmarks initialization');
} else {
  console.log('ERROR: Could not find applyDateRange target');
}

fs.writeFileSync('public/legacy/trd-logic.js', content, 'utf-8');
