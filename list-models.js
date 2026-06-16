const fs = require('fs');

async function listModels() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const match = envContent.match(/GEMINI_API_KEY=(.*)/);
  if (!match) {
    console.error("No API key found in .env.local");
    return;
  }
  const apiKey = match[1].trim();
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  if (data.models) {
    console.log(JSON.stringify(data.models.map(m => m.name), null, 2));
  } else {
    console.error(data);
  }
}

listModels();
