const fs = require('fs');
const file = 'src/app/workspace/tabs/tab4.tsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Add per-doc meta state for access code, price, party
const oldDocMeta = `  const [docMeta, setDocMeta] = useState<Record<string, { isPaid: boolean; price: string; party: string; paymentMethod: string }>>(() => {
    const defaults: Record<string, any> = {};
    DOCUMENT_SLOTS.forEach((d) => {
      defaults[d.id] = { isPaid: true, price: "", party: "Buyer", paymentMethod: "Already Paid" };
    });
    return defaults;
  });`;

const newDocMeta = `  const [docMeta, setDocMeta] = useState<Record<string, { isPaid: boolean; price: string; party: string; accessCode: string }>>(() => {
    const defaults: Record<string, any> = {};
    DOCUMENT_SLOTS.forEach((d) => {
      defaults[d.id] = { isPaid: true, price: "", party: "Buyer", accessCode: "" };
    });
    return defaults;
  });`;

c = c.replace(oldDocMeta, newDocMeta);

// 2. Update handleFileUpload to include price, party, accessCode, isPaid
const oldDocMetaObj = `        const docMeta = {
          docId,
          label: DOCUMENT_SLOTS.find((d) => d.id === docId)?.label || docId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          downloadURL,
          storagePath,
          uploadedAt: new Date().toISOString(),
          required: DOCUMENT_SLOTS.find((d) => d.id === docId)?.required || false,
        };`;

const newDocMetaObj = `        const meta = docMeta[docId] || { isPaid: true, price: "", party: "Buyer", accessCode: "" };
        const docMetaObj = {
          docId,
          label: DOCUMENT_SLOTS.find((d) => d.id === docId)?.label || docId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          downloadURL,
          storagePath,
          uploadedAt: new Date().toISOString(),
          required: DOCUMENT_SLOTS.find((d) => d.id === docId)?.required || false,
          isPaid: meta.price ? false : true,
          price: meta.price || "",
          party: meta.party || "Buyer",
          accessCode: meta.accessCode || "",
        };`;

c = c.replace(oldDocMetaObj, newDocMetaObj);

// 3. Fix the arrayUnion and setExistingDocuments calls to use docMetaObj
c = c.replace(
  `          documents: arrayUnion(docMeta),
        });
        if (setExistingDocuments) {
          setExistingDocuments((prev: any[]) => [...prev, docMeta]);`,
  `          documents: arrayUnion(docMetaObj),
        });
        if (setExistingDocuments) {
          setExistingDocuments((prev: any[]) => [...prev, docMetaObj]);`
);

// 4. Remove global access code input block
const oldGlobalCode = `        <div className="mb-6 bg-white/5 rounded-xl p-4 border border-white/20">
          <label className="block text-sm font-semibold text-gray-300 mb-2">🔒 Document Access Code (optional)</label>
          <p className="text-xs text-gray-400 mb-2">Set a password to protect documents on the public share page. Leave blank for no protection.</p>
          <input type="text" value={documentAccessCode} onChange={(e) => setDocumentAccessCode(e.target.value)} placeholder="Enter access code..." className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black" />
        </div>`;

c = c.replace(oldGlobalCode, '');

// 5. Add inline fields after file input in each doc slot
const oldFileInput = `              <input
                type="file"
                onChange={(e) =>
                  handleFileUpload(docSlot.id, e.target.files?.[0] || null)
                }
                disabled={uploads[docSlot.id]?.uploading}
                className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#c9a227] file:text-white hover:file:bg-[#b8911f] file:cursor-pointer disabled:opacity-50"
              />`;

const newFileInput = `              <input
                type="file"
                onChange={(e) =>
                  handleFileUpload(docSlot.id, e.target.files?.[0] || null)
                }
                disabled={uploads[docSlot.id]?.uploading}
                className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#c9a227] file:text-white hover:file:bg-[#b8911f] file:cursor-pointer disabled:opacity-50"
              />
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">💰 Price to Unlock ($)</label>
                  <input type="number" min="0" placeholder="0 = free" value={docMeta[docSlot.id]?.price || ""} onChange={(e) => setDocMeta((prev) => ({ ...prev, [docSlot.id]: { ...prev[docSlot.id], price: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">👤 Responsible Party</label>
                  <select value={docMeta[docSlot.id]?.party || "Buyer"} onChange={(e) => setDocMeta((prev) => ({ ...prev, [docSlot.id]: { ...prev[docSlot.id], party: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black text-sm">
                    <option>Buyer</option>
                    <option>Seller</option>
                    <option>Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">🔒 Access Code</label>
                  <input type="text" placeholder="Optional code" value={docMeta[docSlot.id]?.accessCode || ""} onChange={(e) => setDocMeta((prev) => ({ ...prev, [docSlot.id]: { ...prev[docSlot.id], accessCode: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#c9a227] focus:outline-none text-black text-sm" />
                </div>
              </div>`;

c = c.replace(oldFileInput, newFileInput);

fs.writeFileSync(file, c, 'utf8');
console.log('SUCCESS');
