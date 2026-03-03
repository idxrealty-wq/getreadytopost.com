'use client';
import { checkMissingInfo } from "./missing-info-checker";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { useUser } from '@/contexts/UserContext';
import { collection, addDoc } from 'firebase/firestore';
import AddressAutosuggest from '@/components/AddressAutosuggest';

const gradingCategories = [
  { icon: '🎣', title: 'Hook', description: 'Does your opening line stop a buyer mid-scroll? The first sentence is everything.', color: 'bg-blue-500/20 border-blue-400/40' },
  { icon: '🏠', title: 'Features', description: 'Are your key property details highlighted in a way that excites — not just informs?', color: 'bg-green-500/20 border-green-400/40' },
  { icon: '🌅', title: 'Lifestyle', description: 'Does your description paint a picture of what it feels like to actually live there?', color: 'bg-purple-500/20 border-purple-400/40' },
  { icon: '⚖️', title: 'Compliance', description: 'Is your language Fair Housing compliant and MLS-safe? One wrong word can cost you.', color: 'bg-red-500/20 border-red-400/40' },
  { icon: '📖', title: 'Flow', description: 'Is it easy to read? Short sentences, active voice, no walls of text.', color: 'bg-amber-500/20 border-amber-400/40' },
  { icon: '📣', title: 'Call to Action', description: 'Does it drive the buyer to schedule a showing — or just describe a house?', color: 'bg-pink-500/20 border-pink-400/40' },
];

const formatDollar = (val: string) => {
  const v = val.replace(/[^0-9.]/g, '');
  return v ? '$' + Number(v).toLocaleString() : '';
};

export default function RateMyListingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [email, setEmail] = useState('');
  const [listing, setListing] = useState('');
  const [missingInfo, setMissingInfo] = useState<{ missingFields: string[]; percentToA: number; suggestions: string[] }>({ missingFields: [], percentToA: 0, suggestions: [] });
  const [showPayment, setShowPayment] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('FL');
  const [zip, setZip] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [sqft, setSqft] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [price, setPrice] = useState('');
  const [hoa, setHoa] = useState('');
  const [hoaAmount, setHoaAmount] = useState('');
  const [parcelLoaded, setParcelLoaded] = useState(false);

  const wordCount = listing.trim().split(/\s+/).filter(w => w).length;

  const rerunChecker = (text: string, overrides?: any) => {
    setMissingInfo(checkMissingInfo(text, {
      beds: overrides?.beds ?? beds,
      baths: overrides?.baths ?? baths,
      sqft: overrides?.sqft ?? sqft,
      yearBuilt: overrides?.yearBuilt ?? yearBuilt,
      price: overrides?.price ?? price,
      hoa: overrides?.hoa ?? hoa,
      hoaAmount: overrides?.hoaAmount ?? hoaAmount,
    }));
  };

  const handleParcelSelect = (parcel: any) => {
    if (parcel.address) setAddress(parcel.address + ', ' + parcel.city + ', FL ' + parcel.zip);
    if (parcel.city) setCity(parcel.city);
    if (parcel.zip) setZip(parcel.zip);
    if (parcel.beds) setBeds(parcel.beds);
    if (parcel.baths) setBaths(parcel.baths);
    if (parcel.sqft) setSqft(parcel.sqft);
    if (parcel.year_built) setYearBuilt(parcel.year_built);
    setState('FL');
    setParcelLoaded(true);
    rerunChecker(listing, {
      beds: parcel.beds || beds,
      baths: parcel.baths || baths,
      sqft: parcel.sqft || sqft,
      yearBuilt: parcel.year_built || yearBuilt,
    });
  };

  const saveToLocalStorage = () => {
    const propertyData = {
      address, city, state, zip,
      beds, baths, sqft, yearBuilt, price, hoa, hoaAmount, email,
      fullAddress: `${address}, ${city}, ${state} ${zip}`.trim(),
    };
    localStorage.setItem('grtp_property', JSON.stringify(propertyData));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      saveToLocalStorage();
      const propertyDetails = {
        address, city, state, zip,
        beds: beds ? parseInt(beds) : null,
        baths: baths ? parseFloat(baths) : null,
        sqft: sqft ? parseInt(sqft) : null,
        yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
        price: price ? price : null,
        hoa: hoa || null,
        hoaAmount: hoaAmount ? hoaAmount : null,
      };
      const docRef = await addDoc(collection(db, 'submissions'), {
        email, listingText: listing, wordCount, propertyDetails,
        status: 'pending_payment', createdAt: new Date().toISOString(),
      });
      setSubmissionId(docRef.id);
      if (user?.uid) {
        try {
          const creditRes = await fetch('/api/credits/balance?userId=' + user.uid);
          const creditData = await creditRes.json();
          if (creditData.balance > 0) {
            await fetch('/api/credits/deduct', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.uid, submissionId: docRef.id }),
            });
            await fetch('/api/submissions/run-analysis', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ submissionId: docRef.id }),
            });
            router.push(`/results?id=${docRef.id}`);
            return;
          }
        } catch(e) { console.error('Credit check failed', e); }
      }
      setShowPayment(true);
    } catch (error) {
      alert('Error saving submission. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = () => { window.open('https://square.link/u/22tY4Rla', '_blank'); };
  const handleViewResults = () => { router.push(`/results?id=${submissionId}`); };
            {listing.length > 20 && (
              <div className={`rounded-xl p-4 border ${missingInfo.percentToA >= 90 ? 'bg-green-500/10 border-green-400/30' : missingInfo.percentToA >= 70 ? 'bg-yellow-500/10 border-yellow-400/30' : 'bg-red-500/10 border-red-400/30'}`}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-white font-bold">A-Grade Readiness</h4>
                  <span className={`text-2xl font-bold ${missingInfo.percentToA >= 90 ? 'text-green-400' : missingInfo.percentToA >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>{missingInfo.percentToA}%</span>
                </div>
                {missingInfo.missingFields.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Missing details that usually block an A:</p>
                    <ul className="list-disc list-inside text-gray-300 text-sm">
                      {missingInfo.missingFields.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                    <p className="text-gray-500 text-xs mt-2">Tip: add these now, or we&apos;ll try to enhance what we can from the address.</p>
                  </div>
                )}
                {missingInfo.missingFields.length === 0 && <p className="text-green-400 text-sm">All key details found — great shot at an A!</p>}
              </div>
            )}

            {!showPayment ? (
              <button onClick={handleSubmit} disabled={loading || !email || !listing} className="w-full bg-gradient-to-r from-[#c9a227] to-amber-600 text-white font-bold py-4 rounded-xl text-lg hover:shadow-lg hover:shadow-[#c9a227]/30 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Submitting...' : 'Analyze My Listing — $19.99'}
              </button>
            ) : (
              <div className="bg-white/10 rounded-xl p-6 text-center space-y-4">
                <p className="text-white font-semibold">Step 1: Complete Payment</p>
                <button onClick={handlePaymentClick} className="bg-gradient-to-r from-[#c9a227] to-amber-600 text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg transition">Pay $19.99 via Square</button>
                <p className="text-gray-400 text-sm">Step 2: After payment, click below to view your report</p>
                <button onClick={handleViewResults} className="bg-white/20 text-white font-semibold py-3 px-8 rounded-xl hover:bg-white/30 transition">View My Results</button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
