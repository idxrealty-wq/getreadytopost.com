const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('./src/data/serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const CSV_FILE = path.join(__dirname, 'src/data/NAL58.csv');
const COLLECTION = 'parcels_orange';
const BATCH_SIZE = 400;

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

async function upload() {
  console.log('Reading CSV...');
  const content = fs.readFileSync(CSV_FILE, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  const headers = parseCSVLine(lines[0]);

  console.log('Total rows: ' + (lines.length - 1));
  console.log('Starting upload to Firestore...');

  let uploaded = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = lines.slice(i, i + BATCH_SIZE);

    for (const line of chunk) {
      if (!line.trim()) continue;
      const values = parseCSVLine(line);
      const record = {};
      headers.forEach((h, idx) => { record[h] = values[idx] || ''; });

      if (!record.PHY_ADDR1 || !record.PHY_CITY) { skipped++; continue; }

      const doc = {
        parcel_id: record.PARCEL_ID || '',
        address: record.PHY_ADDR1 || '',
        city: record.PHY_CITY || '',
        zip: record.PHY_ZIPCD || '',
        county: 'Orange',
        year_built: record.ACT_YR_BLT || '',
        sqft: record.TOT_LVG_AREA || '',
        beds: record.NO_BDRMS || '',
        just_value: record.JV || '',
        sale_price: record.SALE_PRC1 || '',
        sale_year: record.SALE_YR1 || '',
        dor_uc: record.DOR_UC || '',
        land_sqft: record.LND_SQFOOT || '', legal_description: record.S_LEGAL || '',
        owner_name: record.OWN_NAME || '',
        homestead: record.EXMPT_01 === '1' ? 'Yes' : 'No',
        search_key: (record.PHY_ADDR1 || '').toLowerCase()
      };

      const docId = (record.PARCEL_ID || '').replace(/[^a-zA-Z0-9]/g, '_');
      if (!docId) { skipped++; continue; }

      const ref = db.collection(COLLECTION).doc(docId);
      batch.set(ref, doc);
      uploaded++;
    }

    await batch.commit();

    if ((i % 10000) < BATCH_SIZE) {
      console.log('Uploaded: ' + uploaded + ' | Skipped: ' + skipped + ' | Progress: ' + Math.round(i/lines.length*100) + '%');
    }
  }

  console.log('\nDONE! Uploaded: ' + uploaded + ' | Skipped: ' + skipped);
  process.exit(0);
}

upload().catch(function(err) { console.error(err); process.exit(1); });
