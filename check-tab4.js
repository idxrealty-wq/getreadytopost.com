const fs = require('fs');
const c = fs.readFileSync('src/app/workspace/tabs/tab4.tsx', 'utf8');
const i = c.indexOf('type="file"');
console.log(JSON.stringify(c.substring(i - 50, i + 400)));
