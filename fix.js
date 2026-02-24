const fs = require('fs');
let s = fs.readFileSync('src/app/rate-my-listing/page.tsx', 'utf8');

const old = '      setSubmissionId(docRef.id);\n      setShowPayment(true);';

const neu = '      setSubmissionId(docRef.id);\n      if ((creditBalance ?? 0) > 0) {\n        await handleViewResults();\n      } else {\n        setShowPayment(true);\n      }';

if (!s.includes(old)) {
  console.log('PATTERN NOT FOUND');
  process.exit(1);
}

s = s.replace(old, neu);
fs.writeFileSync('src/app/rate-my-listing/page.tsx', s);
console.log('✓ UPDATED');
