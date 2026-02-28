const fs = require('fs');
const file = 'src/app/workspace/tabs/tab4.tsx';
let c = fs.readFileSync(file, 'utf8');

const oldInput = `<input type="text" placeholder="Optional code" value={docMeta[docSlot.id]?.accessCode || ""} onChange={(e) => setDocMeta((prev) => ({ ...prev, [docSlot.id]: { ...prev[docSlot.id], accessCode: e.target.value } }))} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black text-sm" />`;

const newInput = `<input type={docMeta[docSlot.id]?.codeSaved ? "password" : "text"} placeholder="Optional code" value={docMeta[docSlot.id]?.accessCode || ""} onChange={(e) => setDocMeta((prev) => ({ ...prev, [docSlot.id]: { ...prev[docSlot.id], accessCode: e.target.value, codeSaved: false } }))} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black text-sm" />`;

const oldSaveBtn = `alert('Saved!');`;

const newSaveBtn = `alert('Saved!');
                          setDocMeta((prev) => ({ ...prev, [docSlot.id]: { ...prev[docSlot.id], codeSaved: true } }));`;

if (c.includes(oldInput) && c.includes(oldSaveBtn)) {
  c = c.replace(oldInput, newInput);
  c = c.replace(oldSaveBtn, newSaveBtn);
  fs.writeFileSync(file, c, 'utf8');
  console.log('SUCCESS');
} else {
  console.log('MATCH FAILED - input:', c.includes(oldInput), 'btn:', c.includes(oldSaveBtn));
}
