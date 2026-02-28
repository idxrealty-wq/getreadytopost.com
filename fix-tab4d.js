const fs = require('fs');
const file = 'src/app/workspace/tabs/tab4.tsx';
let c = fs.readFileSync(file, 'utf8');

const oldCode = `                <div>\r\n                  <label className="block text-xs text-gray-400 mb-1">🔒 Access Code</label>\r\n                  <input type="text" placeholder="Optional code" value={docMeta[docSlot.id]?.accessCode || ""} onChange={(e) => setDocMeta((prev) => ({ ...prev, [docSlot.id]: { ...prev[docSlot.id], accessCode: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black text-sm" />\r\n                </div>`;

const newCode = `                <div>\r\n                  <label className="block text-xs text-gray-400 mb-1">🔒 Access Code</label>\r\n                  <div className="flex gap-2">\r\n                    <input type="text" placeholder="Optional code" value={docMeta[docSlot.id]?.accessCode || ""} onChange={(e) => setDocMeta((prev) => ({ ...prev, [docSlot.id]: { ...prev[docSlot.id], accessCode: e.target.value } }))} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black text-sm" />\r\n                    <button onClick={async () => {\r\n                      if (!listingId || !uploads[docSlot.id]?.url) return;\r\n                      try {\r\n                        const snap = await getDoc(doc(db, 'listings', listingId));\r\n                        if (snap.exists()) {\r\n                          const updated = (snap.data().documents || []).map((d: any) => d.docId === docSlot.id ? { ...d, accessCode: docMeta[docSlot.id]?.accessCode || '', price: docMeta[docSlot.id]?.price || '', party: docMeta[docSlot.id]?.party || 'Buyer', isPaid: docMeta[docSlot.id]?.price ? false : true } : d);\r\n                          await updateDoc(doc(db, 'listings', listingId), { documents: updated });\r\n                          alert('Saved!');\r\n                        }\r\n                      } catch(e) { alert('Save failed'); }\r\n                    }} className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap">💾 Save</button>\r\n                  </div>\r\n                </div>`;

if (c.includes(oldCode)) {
  c = c.replace(oldCode, newCode);
  fs.writeFileSync(file, c, 'utf8');
  console.log('SUCCESS');
} else {
  console.log('MATCH FAILED');
}
