const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('./src/data/serviceAccount.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const filePath = path.join(__dirname, 'src/data/SearchResultsExport.csv');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

const header = lines[1].split('$').map(h => h.trim());
const dataLines = lines.slice(2);

console.log('Total rows to process:', dataLines.length);

function getField(row, headers, name) {
  const idx = headers.indexOf(name);
  return idx >= 0 ? (row[idx] || '').trim() : '';
}

async function run() {
  let updated = 0;
  let skipped = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    if (!line.trim()) continue;

    const row = line.split('$');
    const parcelId = getField(row, header, 'Parcel ID');
    const address = getField(row, header, 'Property Address');
    const city = getField(row, header, 'Property City');
    if (!parcelId || !address) { skipped++; continue; }

    const docId = parcelId.replace(/[^a-zA-Z0-9]/g, '');
    const docRef = db.collection('parcels_orange').doc(docId);

    batch.set(docRef, {
      parcel_id: parcelId,
      address: address,
      city: city,
      zip: getField(row, header, 'Property Zip'),
      county: 'Orange',
      year_built: '',
      sqft: getField(row, header, 'Heated Area'),
      beds: getField(row, header, 'Bedrooms'),
      baths: getField(row, header, 'Bathrooms'),
      just_value: getField(row, header, 'Just Value'),
      sale_price: '',
      sale_year: '',
      land_sqft: '',
      dor_uc: getField(row, header, 'DOR Code'),
      search_key: (address + ' ' + city).toLowerCase().trim(),
      property_type: getField(row, header, 'DOR Code Description'),
      zoning: getField(row, header, 'Zoning Code(s)'),
      homestead: getField(row, header, 'Homestead?'),
      acres: getField(row, header, 'Acres (+/-)'),
      taxable_value: getField(row, header, 'Taxable Value'),
      assessed_value: getField(row, header, 'Assessed Value'),
      land_value: getField(row, header, 'Land Value'),
      building_value: getField(row, header, 'Building Value'),
      feature_value: getField(row, header, 'Feature Value'),
      owner_name: getField(row, header, 'Owner Name(s)'),
      taxing_jurisdiction: getField(row, header, 'Taxing Jurisdiction'),
      property_link: getField(row, header, 'Link'),
    }, { merge: true });

    batchCount++;
    updated++;

    if (batchCount === 400) {
      await batch.commit();
      console.log('Updated ' + updated + ' records...');
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log('Done! Updated:', updated, 'Skipped:', skipped);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
