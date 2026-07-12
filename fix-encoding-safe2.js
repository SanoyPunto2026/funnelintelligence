const fs = require('fs');

let content = fs.readFileSync('public/legacy/trd-logic.js', 'utf-8');

// The specific ones reported in screenshots
content = content.replace(/Â·/g, '·');
content = content.replace(/â†’/g, '→');

// The broken accents represented as U+FFFD
content = content.replace(/c\uFFFDntos/g, 'cuántos');
content = content.replace(/qu\uFFFD/g, 'qué');
content = content.replace(/perdi\uFFFD/g, 'perdió');
content = content.replace(/d\uFFFDnde/g, 'dónde');
content = content.replace(/Preg\uFFFDntame/g, 'Pregúntame');
content = content.replace(/est\uFFFDn/g, 'están');
content = content.replace(/autom\uFFFDticamente/g, 'automáticamente');
content = content.replace(/m\uFFFDs/g, 'más');
content = content.replace(/d\uFFFDbil/g, 'débil');
content = content.replace(/Qu\uFFFD/g, '¿Qué');
content = content.replace(/eval\uFFFDa/g, 'evalúa');
content = content.replace(/cr\uFFFDticas/g, 'críticas');
content = content.replace(/integraci\uFFFDn/g, 'integración');
content = content.replace(/atribuci\uFFFDn/g, 'atribución');
content = content.replace(/est\uFFFD/g, 'está');
content = content.replace(/creaci\uFFFDn/g, 'creación');
content = content.replace(/decisi\uFFFDn/g, 'decisión');
content = content.replace(/Conversi\uFFFDn/g, 'Conversión');
content = content.replace(/\uFFFD"/g, '—"');
content = content.replace(/\uFFFD'/g, "→'");
content = content.replace(/ \uFFFD/g, ' ·');

// Final sweep for any remaining replacement characters
content = content.replace(/\uFFFD/g, '·');

fs.writeFileSync('public/legacy/trd-logic.js', content, 'utf-8');
console.log('Fixed Spanish accents and symbols safely.');
