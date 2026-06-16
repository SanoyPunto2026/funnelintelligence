const fs = require('fs');

let content = fs.readFileSync('public/legacy/trd-logic.js', 'utf-8');

// ====== FIX 1: updateLearningButton sobrescribe TODOS los .learn-toggle ======
// The issue: it uses textContent (renders HTML as text) and targets ALL .learn-toggle buttons
// Fix: use innerHTML, and skip the upload/clear buttons
const oldFn = `function updateLearningButton(){\r\n  document.querySelectorAll('.learn-toggle').forEach(btn=>{\r\n    btn.textContent = learningMode ? '<i class="ph ph-graduation-cap"></i> Learning Mode: ON' : '<i class="ph ph-graduation-cap"></i> Learning Mode: OFF';\r\n    btn.classList.toggle('active', learningMode);\r\n  });\r\n}`;

const newFn = `function updateLearningButton(){\r\n  document.querySelectorAll('.learn-toggle').forEach(btn=>{\r\n    if(btn.id === 'uploadBtn' || btn.id === 'clearBtn') return;\r\n    if(btn.textContent.includes('Learning') || btn.textContent.includes('graduation')){\r\n      btn.innerHTML = learningMode ? '<i class="ph ph-graduation-cap"></i> Learning Mode: ON' : '<i class="ph ph-graduation-cap"></i> Learning Mode: OFF';\r\n      btn.classList.toggle('active', learningMode);\r\n    }\r\n  });\r\n}`;

if (content.includes(oldFn)) {
  content = content.replace(oldFn, newFn);
  console.log('FIX 1 applied: updateLearningButton');
} else {
  console.log('FIX 1 SKIPPED: could not find exact match');
  // Try a more lenient approach
  content = content.replace(
    /function updateLearningButton\(\)\{[\s\S]*?document\.querySelectorAll\('\.learn-toggle'\)\.forEach\(btn=>\{[\s\S]*?btn\.textContent[\s\S]*?\}\);[\s\S]*?\}/,
    newFn
  );
  console.log('FIX 1 applied via regex');
}

// ====== FIX 2: Fix encoding issues ======
const encodingFixes = [
  [/A\u00c3\u00ban/g, 'Aún'],
  [/bot\u00c3\u00b3n/g, 'botón'],
  [/est\u00c3\u00a1/g, 'está'],
  [/conexin/g, 'conexión'],
  [/cr\u00c3\u00adticas/g, 'críticas'],
  [/d\u00c3\u00ada/g, 'día'],
  [/m\u00c3\u00a1s/g, 'más'],
  [/an\u00c3\u00a1lisis/g, 'análisis'],
  [/n\u00c3\u00bamero/g, 'número'],
  [/conversi\u00c3\u00b3n/g, 'conversión'],
  [/valoriz/g, 'valoriz'], // keep as-is, may be fine
];

// More robust: find any Ã sequences (mojibake from double-encoding)
// Ã¡ -> á, Ã© -> é, Ã­ -> í, Ã³ -> ó, Ãº -> ú, Ã± -> ñ
content = content.replace(/\u00c3\u00a1/g, 'á');
content = content.replace(/\u00c3\u00a9/g, 'é');
content = content.replace(/\u00c3\u00ad/g, 'í');
content = content.replace(/\u00c3\u00b3/g, 'ó');
content = content.replace(/\u00c3\u00ba/g, 'ú');
content = content.replace(/\u00c3\u00b1/g, 'ñ');
content = content.replace(/\u00c3\u0089/g, 'É');
content = content.replace(/\u00c3\u0081/g, 'Á');
content = content.replace(/conexin/g, 'conexión');

console.log('FIX 2 applied: encoding');

// ====== FIX 3: Fix showEmptyState ======
const emptyStateRegex = /function showEmptyState\(\) \{[\s\S]*?\n\}/;
const newEmptyState = `function showEmptyState() {
  document.querySelectorAll('.view').forEach(e => e.classList.add('hidden'));
  const actionView = document.getElementById('view-action');
  if(!actionView) return;
  actionView.classList.remove('hidden');
  actionView.innerHTML = '<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:60vh; text-align:center;">' +
    '<i class="ph ph-folder-open" style="font-size: 64px; color: var(--muted); margin-bottom: 20px;"></i>' +
    '<h2 style="font-size: 24px; margin-bottom: 10px;">A\\u00fan no hay datos</h2>' +
    '<p style="color: var(--muted); max-width: 400px; margin: 0 auto 24px;">Sube tu archivo Excel o CSV para comenzar a visualizar los dashboards.</p>' +
    '<button onclick="document.querySelector(\\'input[type=file]\\').click()" style="background:#3b82f6;color:white;border:none;padding:14px 28px;border-radius:8px;font-size:16px;cursor:pointer;display:flex;align-items:center;gap:8px;font-weight:600;box-shadow:0 4px 12px rgba(59,130,246,0.3);">' +
    '<i class="ph ph-upload-simple" style="font-size:20px;"></i> Cargar CSV / Excel</button></div>';
}`;

if (emptyStateRegex.test(content)) {
  content = content.replace(emptyStateRegex, newEmptyState);
  console.log('FIX 3 applied: showEmptyState');
} else {
  console.log('FIX 3 SKIPPED: could not find showEmptyState');
}

fs.writeFileSync('public/legacy/trd-logic.js', content, 'utf-8');
console.log('All done!');
