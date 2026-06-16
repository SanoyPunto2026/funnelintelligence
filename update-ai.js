const fs = require('fs');

let content = fs.readFileSync('public/legacy/trd-logic.js', 'utf8');

// The original line:
// function askAI(){const q=document.getElementById('askInput').value.trim();if(!q)return;document.getElementById('chat').innerHTML+=`<div class="msg user">${q}</div><div class="msg"><strong>TRD AI:</strong> ${answerAI(q)}</div>`;document.getElementById('askInput').value=''}
// We replace the entire function

const newAskAI = `async function askAI() {
  const inputEl = document.getElementById('askInput');
  const q = inputEl.value.trim();
  if (!q) return;
  
  const chatEl = document.getElementById('chat');
  chatEl.innerHTML += \`<div class="msg user">\${q}</div><div class="msg" id="loading-ai"><strong>TRD AI:</strong> <em>Pensando...</em></div>\`;
  inputEl.value = '';
  
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: q, context: DATA })
    });
    const data = await res.json();
    document.getElementById('loading-ai').remove();
    chatEl.innerHTML += \`<div class="msg"><strong>TRD AI:</strong> \${data.reply || data.error || 'Error en la respuesta.'}</div>\`;
  } catch(e) {
    document.getElementById('loading-ai').remove();
    chatEl.innerHTML += \`<div class="msg"><strong>TRD AI:</strong> <em>Error de conexin con Gemini.</em></div>\`;
  }
}
function answerAI(q){ return ""; }`; // keep answerAI empty so references don't break if any exist

content = content.replace(/function askAI\(\)\{.*?\}/, newAskAI);

fs.writeFileSync('public/legacy/trd-logic.js', content, 'utf8');
console.log('AI logic patched!');
