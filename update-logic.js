const fs = require('fs');

let content = fs.readFileSync('public/legacy/trd-logic.js', 'utf8');

// The regex matches everything from 'const RAW_DATE_DATA = {' to '};' right before 'let selectedClient'
// We will replace the start of the file up to 'let selectedClient ='
const replacement = `let DATA = window.DATA || {};

let RAW_DATE_DATA = {
  client_configs: [],
  raw_leads: [],
  raw_ads: [],
  available_start: "2026-05-01",
  available_end: "2026-06-01"
};

window.updateData = function(newData) { 
  if (!newData) return;
  DATA = newData;
  
  if (newData.clients || newData.leads || newData.ads) {
    RAW_DATE_DATA = {
      client_configs: newData.clients || [],
      raw_leads: newData.leads || [],
      raw_ads: newData.ads || []
    };
    
    // Calculate dynamic dates from leads
    let dates = RAW_DATE_DATA.raw_leads.map(l => l.created_date).filter(Boolean).sort();
    if (dates.length > 0) {
      RAW_DATE_DATA.available_start = dates[0];
      RAW_DATE_DATA.available_end = dates[dates.length - 1];
    }
  }

  PERIOD_META.available_start = RAW_DATE_DATA.available_start;
  PERIOD_META.available_end = RAW_DATE_DATA.available_end;
  
  dateRange.start = RAW_DATE_DATA.available_start;
  dateRange.end = RAW_DATE_DATA.available_end;
  saveDateRange();

  renderAll(); 
};

let selectedClient =`;

content = content.replace(/let DATA = window\.DATA \|\| \{\};\r?\nwindow\.updateData = function\(newData\) \{ DATA = newData; renderAll\(\); \};\r?\n\r?\nconst RAW_DATE_DATA = \{[\s\S]*?\};\r?\nlet selectedClient =/, replacement);

// Replace "const PERIOD_META" with "let PERIOD_META" to make it mutable
content = content.replace(/const PERIOD_META = /g, 'let PERIOD_META = ');

fs.writeFileSync('public/legacy/trd-logic.js', content, 'utf8');
console.log('trd-logic.js patched successfully!');
