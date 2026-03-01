const fs = require('fs');
let c = fs.readFileSync('src/app/workspace/page.tsx', 'utf8');

// 1. Add CSVImport import
c = c.replace(
  "import Tab1PropertyBasics from './tabs/tab1';",
  "import Tab1PropertyBasics from './tabs/tab1';\nimport CSVImport from './tabs/csv-import';"
);

// 2. Add handleCSVImport function before the tabs array
c = c.replace(
  '  const tabs = [',
  `  const handleCSVImport = (imported: any) => {
    setAddress(imported.address);
    setPropertyData((prev: any) => ({ ...prev, ...imported.propertyData }));
  };

  const tabs = [`
);

// 3. Add CSVImport component before Tab1 rendering
c = c.replace(
  '{activeTab === 1 && <Tab1PropertyBasics',
  '{activeTab === 1 && <><CSVImport onImport={handleCSVImport} /><Tab1PropertyBasics'
);

// Close the fragment after Tab1
c = c.replace(
  '<Tab1PropertyBasics data={propertyData} setData={setPropertyData} onNext={() => setActiveTab(2)} address={address} />}',
  '<Tab1PropertyBasics data={propertyData} setData={setPropertyData} onNext={() => setActiveTab(2)} address={address} /></>}'
);

fs.writeFileSync('src/app/workspace/page.tsx', c);
console.log('import:', c.includes('csv-import'));
console.log('handleCSVImport:', c.includes('handleCSVImport'));
console.log('CSVImport component:', c.includes('<CSVImport'));
console.log('fragment close:', c.includes('</>}'));
