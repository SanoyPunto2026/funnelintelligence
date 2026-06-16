const fs = require('fs');
const file = 'public/legacy/trd-logic.js';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const emojiMap = {
  '🏠': '<i class="ph ph-house"></i>',
  '🩺': '<i class="ph ph-stethoscope"></i>',
  '⚙️': '<i class="ph ph-gear"></i>',
  '⚙': '<i class="ph ph-gear"></i>',
  '👥': '<i class="ph ph-users"></i>',
  '📋': '<i class="ph ph-clipboard-text"></i>',
  '📈': '<i class="ph ph-trend-up"></i>',
  '🎯': '<i class="ph ph-target"></i>',
  '🚨': '<i class="ph ph-warning"></i>',
  '🔔': '<i class="ph ph-bell"></i>',
  '💡': '<i class="ph ph-lightbulb"></i>',
  '🧠': '<i class="ph ph-brain"></i>',
  '📚': '<i class="ph ph-book"></i>',
  '📥': '<i class="ph ph-download-simple"></i>',
  '🎓': '<i class="ph ph-graduation-cap"></i>',
  '📅': '<i class="ph ph-calendar"></i>',
  '💱': '<i class="ph ph-currency-circle-dollar"></i>',
  '⚠': '<i class="ph ph-warning-circle"></i>',
  '🏆': '<i class="ph ph-trophy"></i>',
  '✓': '<i class="ph ph-check"></i>',
  '🔴': '<i class="ph-fill ph-circle" style="color:var(--danger)"></i>',
  '🟠': '<i class="ph-fill ph-circle" style="color:var(--warning)"></i>',
  '🟢': '<i class="ph-fill ph-circle" style="color:var(--success)"></i>',
  '⭐': '<i class="ph-fill ph-star" style="color:#FFB800"></i>',
  '📊': '<i class="ph ph-chart-bar"></i>',
  '🔅': '<i class="ph ph-sun"></i>'
};

for (let i = 0; i < lines.length; i++) {
  // Skip the RAW_DATE_DATA line (usually line 2 or 3, but we can just check if it contains RAW_DATE_DATA)
  if (lines[i].includes('const RAW_DATE_DATA')) continue;

  for (const [emoji, icon] of Object.entries(emojiMap)) {
    // using split and join to replace all instances
    lines[i] = lines[i].split(emoji).join(icon);
  }
}

fs.writeFileSync(file, lines.join('\n'));
console.log('Emojis replaced in trd-logic.js');
