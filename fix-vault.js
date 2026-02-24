const fs = require('fs');
const vault = fs.readFileSync('src/app/vault/page.tsx', 'utf8');

// Add Storage import if missing
let updated = vault;
if (!updated.includes('firebase/storage')) {
  updated = updated.replace(
    "import { db, storage } from '@/lib/firebase';",
    "import { db, storage } from '@/lib/firebase';\nimport { ref, deleteObject } from 'firebase/storage';"
  );
}

// Replace handleDelete function (lines 75-89)
const lines = updated.split('\n');
const newLines = [];
let skipped = false;
for (let i = 0; i < lines.length; i++) {
  if (i >= 74 && i <= 88 && !skipped) {
    newLines.push('  const handleDelete = async (listingId: string, address: string, listing: Listing) => {');
    newLines.push('    if (!confirm(`Are you sure you want to delete the listing for ${address}? This cannot be undone.`)) {');
    newLines.push('      console.log(`[DELETE CANCELLED] User cancelled delete for listing: ${listingId}`);');
    newLines.push('      return;');
    newLines.push('    }');
    newLines.push('');
    newLines.push('    setDeleting(listingId);');
    newLines.push('    console.log(`[DELETE START] Deleting listing: ${listingId} (${address})`);');
    newLines.push('');
    newLines.push('    try {');
    newLines.push('      if (listing.photos && listing.photos.length > 0) {');
    newLines.push('        console.log(`[DELETE PHOTOS] Found ${listing.photos.length} photos to delete`);');
    newLines.push('        for (const photo of listing.photos as any[]) {');
    newLines.push('          try {');
    newLines.push('            const storagePath = photo.storagePath;');
    newLines.push('            if (!storagePath) {');
    newLines.push('              console.warn(`[DELETE PHOTO SKIP] Missing storagePath`);');
    newLines.push('              continue;');
    newLines.push('            }');
    newLines.push('            await deleteObject(ref(storage, storagePath));');
    newLines.push('            console.log(`[DELETE PHOTO SUCCESS] Deleted: ${storagePath}`);');
    newLines.push('          } catch (photoErr: any) {');
    newLines.push('            console.warn(`[DELETE PHOTO FAILED] ${photoErr?.message || photoErr}`);');
    newLines.push('          }');
    newLines.push('        }');
    newLines.push('      }');
    newLines.push('');
    newLines.push('      console.log(`[DELETE FIRESTORE] Deleting listings/${listingId}`);');
    newLines.push('      await deleteDoc(doc(db, "listings", listingId));');
    newLines.push('      console.log(`[DELETE SUCCESS] Listing deleted: ${listingId}`);');
    newLines.push('');
    newLines.push('      setListings(listings.filter((l) => l.id !== listingId));');
    newLines.push('    } catch (err: any) {');
    newLines.push('      console.error(`[DELETE ERROR] ${err?.message || err}`);');
    newLines.push('      alert("Failed to delete listing: " + (err?.message || err));');
    newLines.push('    } finally {');
    newLines.push('      setDeleting(null);');
    newLines.push('    }');
    newLines.push('  };');
    skipped = true;
  } else if (!(i >= 74 && i <= 88)) {
    newLines.push(lines[i]);
  }
}

const final = newLines.join('\n').replace(
  /handleDelete$listing\.id, listing\.address$/g,
  'handleDelete(listing.id, listing.address, listing)'
);

fs.writeFileSync('src/app/vault/page.tsx', final);
console.log('✅ vault/page.tsx updated');
