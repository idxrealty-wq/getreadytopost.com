const fs = require('fs');
let c = fs.readFileSync('src/app/rate-my-listing/page.tsx', 'utf8');

// Add useUser import
if (!c.includes('useUser')) {
  c = c.replace(
    "import { db } from '@/lib/firebase';",
    "import { db } from '@/lib/firebase';\nimport { useUser } from '@/contexts/UserContext';"
  );
}

// Add useUser hook
if (!c.includes('const { user }')) {
  c = c.replace(
    "  const router = useRouter();",
    "  const router = useRouter();\n  const { user } = useUser();"
  );
}

// Simple string replace on just the one line
c = c.replace(
  '      setShowPayment(true);',
  `      // Check if user has credits
      if (user?.uid) {
        try {
          const creditRes = await fetch('/api/credits/balance?userId=' + user.uid);
          const creditData = await creditRes.json();
          if (creditData.balance > 0) {
            await fetch('/api/credits/deduct', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.uid, submissionId: docRef.id }),
            });
            await fetch('/api/submissions/run-analysis', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ submissionId: docRef.id }),
            });
            router.push('/results?id=' + docRef.id);
            return;
          }
        } catch(e) { console.error('Credit check failed', e); }
      }
      setShowPayment(true);`
);

fs.writeFileSync('src/app/rate-my-listing/page.tsx', c);
console.log('useUser:', c.includes('useUser'));
console.log('credits/balance:', c.includes('credits/balance'));
