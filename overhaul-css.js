const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf8');

// 1. Update variables
css = css.replace('--bg:#070b14', '--bg:#030712');
css = css.replace('--line:#263249', '--line:rgba(255,255,255,0.06)');
css = css.replace('--panel:#0f172a', '--panel:rgba(255,255,255,0.03)');

// 2. Update Body Background
css = css.replace('background:radial-gradient(circle at 10% 0,#182445 0,#070b14 34%,#050711 100%)', 'background:#030712');

// 3. Update Sidebar
css = css.replace('background:rgba(7,11,20,.92)', 'background:rgba(3,7,18,0.7); backdrop-filter: blur(20px)');

// 4. Update Cards
css = css.replace('background:linear-gradient(180deg,rgba(17,24,39,.96),rgba(10,15,27,.96))', 'background:var(--panel);backdrop-filter:blur(16px)');
css = css.replace('padding:20px;box-shadow:0 18px 45px rgba(0,0,0,.22)', 'padding:24px;box-shadow:0 8px 32px rgba(0,0,0,0.3)');

// 5. Update Metrics Typography
css = css.replace('.metric{font-size:38px;font-weight:850;letter-spacing:-1px}', '.metric{font-size:42px;font-weight:800;letter-spacing:-1px;background:linear-gradient(135deg, #ffffff, #94a3b8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1.1;margin-bottom:4px}');

// 6. Update general panels (action, matrix-card, ad-card, etc)
// We look for background:#0b1220 and change to var(--panel)
css = css.replace(/background:#0b1220/g, 'background:var(--panel);backdrop-filter:blur(8px)');
css = css.replace(/background:#111827/g, 'background:rgba(255,255,255,0.04);backdrop-filter:blur(8px)');

// 7. Update Tabs and Inputs
css = css.replace('background:#0d1424', 'background:rgba(0,0,0,0.2)');

fs.writeFileSync('src/app/globals.css', css);
console.log('CSS visually overhauled');
