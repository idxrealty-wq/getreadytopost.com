const fs = require('fs');
const file = 'src/app/workspace/tabs/tab4.tsx';
let c = fs.readFileSync(file, 'utf8');

const oldGrid = `<div className="mt-3 grid grid-cols-3 gap-3">`;
const newGrid = `<div className="mt-3 grid grid-cols-2 gap-3">`;

if (c.includes(oldGrid)) {
  c = c.replace(oldGrid, newGrid);
  fs.writeFileSync(file, c, 'utf8');
  console.log('SUCCESS');
} else {
  console.log('MATCH FAILED');
}
