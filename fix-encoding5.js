const fs = require('fs');

let content = fs.readFileSync('public/legacy/trd-logic.js', 'utf-8');

// The specific ones reported in screenshots
content = content.replace(/Â·/g, '·');
content = content.replace(/â†’/g, '→');

// The broken accents represented as U+FFFD () in node
content = content.replace(/cuntos/g, 'cuántos');
content = content.replace(/qu/g, 'qué');
content = content.replace(/perdi/g, 'perdió');
content = content.replace(/dnde/g, 'dónde');
content = content.replace(/Pregntame/g, 'Pregúntame');
content = content.replace(/estn/g, 'están');
content = content.replace(/automticamente/g, 'automáticamente');
content = content.replace(/ms/g, 'más');
content = content.replace(/dbil/g, 'débil');
content = content.replace(/Qu/g, '¿Qué');
content = content.replace(/evala/g, 'evalúa');
content = content.replace(/crticas/g, 'críticas');
content = content.replace(/integracin/g, 'integración');
content = content.replace(/atribucin/g, 'atribución');
content = content.replace(/est/g, 'está');
content = content.replace(/creacin/g, 'creación');
content = content.replace(/decisin/g, 'decisión');
content = content.replace(/Conversin/g, 'Conversión');
content = content.replace(/"/g, '—"');
content = content.replace(/'/g, '→');
content = content.replace(/ '/g, '· ');
content = content.replace(/  /g, ' · ');

// Final sweep for any remaining replacement characters ()
content = content.replace(//g, '·');

fs.writeFileSync('public/legacy/trd-logic.js', content, 'utf-8');
console.log('Fixed Spanish accents and symbols completely.');
