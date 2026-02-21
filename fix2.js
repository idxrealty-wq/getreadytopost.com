const fs = require('fs');
const bt = String.fromCharCode(96);
let c = fs.readFileSync('src/app/workspace/page.tsx', 'utf8');
c = c.replace('const draftId = listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)};', 'const draftId = ' + bt + 'listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}' + bt + ';');
c = c.replace('router.replace/workspace?edit=${draftId});', 'router.replace(' + bt + '/workspace?edit=${draftId}' + bt + ');');
fs.writeFileSync('src/app/workspace/page.tsx', c);
console.log('DONE');
