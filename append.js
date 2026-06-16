const fs = require('fs');
const css = `
.nav button i.ph-fill { display: none; }
.nav button.active i.ph { display: none; }
.nav button.active i.ph-fill { display: inline-block; color: var(--accent); }
.nav button i { font-size: 18px; margin-right: 6px; vertical-align: middle; }
.pill i { margin-right: 5px; }
.learn-toggle i { margin-right: 5px; }
`;
fs.appendFileSync('src/app/globals.css', css);
