const fs = require('fs');
const file = 'src/app/workspace/tabs/tab4.tsx';
let c = fs.readFileSync(file, 'utf8');

// Find and remove the global access code block
const marker = 'Document Access Code';
const idx = c.indexOf(marker);
if (idx === -1) {
  console.log('NOT FOUND');
  process.exit();
}

// Find the containing div - go backwards to find <div className="mb-6
let start = c.lastIndexOf('<div className="mb-6', idx);
// Find the closing </div> after the input
let end = c.indexOf('</div>', idx);
end = c.indexOf('>', end) + 1;

const block = c.substring(start, end);
console.log('REMOVING:', block.substring(0, 80) + '...');

c = c.replace(block, '');
fs.writeFileSync(file, c, 'utf8');
console.log('SUCCESS - global code removed');
