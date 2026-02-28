const fs = require('fs');
const file = 'src/app/workspace/tabs/tab4.tsx';
let c = fs.readFileSync(file, 'utf8');

const oldType = `useState<Record<string, { isPaid: boolean; price: string; party: string; accessCode: string }>>`;
const newType = `useState<Record<string, { isPaid: boolean; price: string; party: string; accessCode: string; codeSaved?: boolean }>>`;

const oldDefault = `defaults[d.id] = { isPaid: true, price: "", party: "Buyer", accessCode: "" };`;
const newDefault = `defaults[d.id] = { isPaid: true, price: "", party: "Buyer", accessCode: "", codeSaved: false };`;

if (c.includes(oldType) && c.includes(oldDefault)) {
  c = c.replace(oldType, newType);
  c = c.replace(oldDefault, newDefault);
  fs.writeFileSync(file, c, 'utf8');
  console.log('SUCCESS');
} else {
  console.log('MATCH FAILED - type:', c.includes(oldType), 'default:', c.includes(oldDefault));
}
