const fs = require('fs');

const htmlPath = 'FUNNEL INTELILLEGENCE TRD.html';
if (!fs.existsSync(htmlPath)) {
    console.error('No se encontró ' + htmlPath);
    process.exit(1);
}

const content = fs.readFileSync(htmlPath, 'utf8');

// Extract CSS
const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
    fs.mkdirSync('src/app', { recursive: true });
    fs.writeFileSync('src/app/globals.css', styleMatch[1].trim());
    console.log('CSS extraído a src/app/globals.css');
}

// Extract JS
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
    let js = scriptMatch[1].trim();
    // Replace const DATA = { ... } with a reference to window.DATA to allow dynamic updates
    js = js.replace(/const DATA = \{[\s\S]*?\};\n+/, 'let DATA = window.DATA || {};\nwindow.updateData = function(newData) { DATA = newData; renderAll(); };\n\n');
    
    // Also export the functions globally so Next.js can call them if needed
    // or we just run it. The legacy JS already attaches functions globally in the browser context
    
    fs.mkdirSync('src/legacy', { recursive: true });
    fs.writeFileSync('src/legacy/trd-logic.js', js);
    console.log('JS extraído a src/legacy/trd-logic.js');
}

// Extract HTML Body
const bodyMatch = content.match(/<body>([\s\S]*?)<script>/);
if (bodyMatch) {
    fs.writeFileSync('src/legacy/body.html', bodyMatch[1].trim());
    console.log('HTML extraído a src/legacy/body.html');
}

// Create db.json if not exists
if (!fs.existsSync('data/db.json') && fs.existsSync('db.json')) {
    fs.mkdirSync('data', { recursive: true });
    fs.renameSync('db.json', 'data/db.json');
    console.log('db.json movido a data/db.json');
}
