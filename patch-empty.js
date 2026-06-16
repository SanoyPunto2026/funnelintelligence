const fs = require('fs');
const content = fs.readFileSync('public/legacy/trd-logic.js', 'utf-8');

const replacement = `function showEmptyState() {
  document.querySelectorAll('.view').forEach(e => e.classList.add('hidden'));
  const actionView = document.getElementById('view-action');
  if(actionView) {
    actionView.classList.remove('hidden');
    actionView.innerHTML = \`<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:60vh; text-align:center;">
        <i class="ph ph-folder-open" style="font-size: 64px; color: var(--muted); margin-bottom: 20px;"></i>
        <h2 style="font-size: 24px; margin-bottom: 10px;">Aún no hay datos</h2>
        <p style="color: var(--muted); max-width: 400px; margin: 0 auto 24px;">Sube tu archivo Excel o CSV para comenzar a visualizar los dashboards.</p>
        <button onclick="document.querySelector('input[type=\\\\\\'file\\\\\\']').click()" style="background:#3b82f6;color:white;border:none;padding:14px 28px;border-radius:8px;font-size:16px;cursor:pointer;display:flex;align-items:center;gap:8px;font-weight:600;box-shadow:0 4px 12px rgba(59,130,246,0.3);">
          <i class="ph ph-upload-simple" style="font-size:20px;"></i> Cargar CSV / Excel
        </button>
      </div>\`;
  }
}`;

const regex = /function showEmptyState\(\) \{[\s\S]*?\}\n/m;
const newContent = content.replace(regex, replacement + '\n');
fs.writeFileSync('public/legacy/trd-logic.js', newContent);
console.log('Patched showEmptyState');
