const fs = require('fs');
try {
  const code = fs.readFileSync('public/legacy/trd-logic.js', 'utf8');
  // Mock DOM
  global.window = {};
  global.document = {
    querySelectorAll: () => [],
    getElementById: () => ({ classList: { remove: ()=>{}, add: ()=>{} }, textContent: '' }),
    body: { classList: { toggle: ()=>{} } }
  };
  global.localStorage = { getItem: () => null, setItem: () => {} };
  
  eval(code);
  console.log("Script executed successfully");
} catch (e) {
  console.error("Error executing script:", e);
}
