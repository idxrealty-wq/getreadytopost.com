const fs = require('fs');
const file = 'src/app/listing/[id]/share/page.tsx';
let c = fs.readFileSync(file, 'utf8');

const oldMap = `{listing.documents?.map((doc: any, idx: number) => (
                  <a key={idx} href={doc.downloadURL} target="_blank" rel="noopener noreferrer" className="bg-white/15 hover:bg-white/25 rounded-xl p-4 border border-white/30 transition flex flex-col items-center justify-center text-center cursor-pointer">
                    <div className="text-4xl mb-2">📎</div>
                    <p className="text-white font-semibold text-sm line-clamp-2">{doc.label}</p>
                    <p className="text-gray-200 text-xs mt-2">{doc.fileName}</p>
                    {doc.required && <span className="text-red-400 text-xs mt-2">Required</span>}
                    <p className="text-gray-300 text-xs mt-1">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  </a>
                ))}`;

const newMap = `{listing.documents?.map((docItem: any, idx: number) => (
                  docItem.isPaid === false && docItem.price ? (
                    <div key={idx} className="bg-white/15 rounded-xl p-4 border border-yellow-400/40 flex flex-col items-center justify-center text-center">
                      <div className="text-4xl mb-2">🔒</div>
                      <p className="text-white font-semibold text-sm line-clamp-2">{docItem.label}</p>
                      <p className="text-yellow-300 font-bold text-lg mt-2">${'$'}{docItem.price}</p>
                      <p className="text-gray-300 text-xs mt-1">{docItem.party || "Buyer"} responsible</p>
                      <button onClick={() => handlePayForDoc(docItem)} disabled={payingDoc === docItem.docId} className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition disabled:opacity-50 w-full">
                        {payingDoc === docItem.docId ? "Processing..." : "💳 Pay to Unlock"}
                      </button>
                    </div>
                  ) : (
                    <a key={idx} href={docItem.downloadURL} target="_blank" rel="noopener noreferrer" className="bg-white/15 hover:bg-white/25 rounded-xl p-4 border border-white/30 transition flex flex-col items-center justify-center text-center cursor-pointer">
                      <div className="text-4xl mb-2">📎</div>
                      <p className="text-white font-semibold text-sm line-clamp-2">{docItem.label}</p>
                      <p className="text-gray-200 text-xs mt-2">{docItem.fileName}</p>
                      {docItem.required && <span className="text-red-400 text-xs mt-2">Required</span>}
                      <p className="text-gray-300 text-xs mt-1">{new Date(docItem.uploadedAt).toLocaleDateString()}</p>
                    </a>
                  )
                ))}`;

if (c.includes(oldMap)) {
  c = c.replace(oldMap, newMap);
  fs.writeFileSync(file, c, 'utf8');
  console.log('SUCCESS - file updated');
} else {
  console.log('MATCH FAILED - old string not found');
}
