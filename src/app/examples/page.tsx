import Link from 'next/link';

type Grade = { label: string; score: string };

function GradeRow({ grades }: { grades: Grade[] }) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {grades.map((g) => (
        <span
          key={g.label}
          className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white px-3 py-1 rounded-full text-sm"
        >
          <span className="opacity-80">{g.label}:</span>
          <span className="font-bold text-[#c9a227]">{g.score}</span>
        </span>
      ))}
    </div>
  );
}

function ExampleBlock({
  tag, before, after, gradesBefore, gradesAfter,
}: {
  tag: string; before: string; after: string; gradesBefore: Grade[]; gradesAfter: Grade[];
}) {
  return (
    <section className="py-14 bg-transparent">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-6">
          <span className="bg-[#c9a227]/10 text-[#c9a227] px-3 py-1 rounded-full text-sm font-semibold">{tag}</span>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-6 border bg-red-50 border-red-200">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-4 inline-block">BEFORE</span>
            <p className="text-gray-800 leading-relaxed">{before}</p>
            <div className="mt-5">
              <p className="text-sm font-semibold text-gray-700">Typical issues:</p>
              <ul className="text-sm text-gray-700 list-disc pl-5 mt-2 space-y-1">
                <li>Generic adjectives with no proof</li>
                <li>No buyer story or lifestyle framing</li>
                <li>Weak CTA and no urgency based on facts</li>
              </ul>
            </div>
          </div>
          <div className="rounded-2xl p-6 border bg-green-50 border-green-200">
            <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded mb-4 inline-block">AFTER</span>
            <p className="text-gray-800 leading-relaxed">{after}</p>
            <div className="mt-5">
              <p className="text-sm font-semibold text-gray-700">What improved:</p>
              <ul className="text-sm text-gray-700 list-disc pl-5 mt-2 space-y-1">
                <li>Clear layout and concrete features</li>
                <li>MLS-safe, Fair Housing-aware language</li>
                <li>Buyer-focused CTA that drives showings</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] p-6 border border-white/10">
          <p className="text-white font-bold text-lg">6-Category Grade Snapshot</p>
          <p className="text-gray-200 text-sm mt-1">This is the kind of breakdown GetReadyToPost generates so you know exactly what to fix.</p>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <p className="text-white/80 text-sm font-semibold">Before</p>
              <GradeRow grades={gradesBefore} />
            </div>
            <div>
              <p className="text-white/80 text-sm font-semibold">After</p>
              <GradeRow grades={gradesAfter} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default function ExamplesPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] text-white py-16 pt-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Real Before & After Examples</h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            See exactly how better listing copy earns more clicks, more saves, and more showings - without risking MLS or Fair Housing compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link href="/rate-my-listing" className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-8 py-4 rounded-lg font-semibold text-lg transition shadow-lg">
              Rate My Listing
            </Link>
            <Link href="/how-it-works" className="inline-block border-2 border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227]/10 px-8 py-4 rounded-lg font-semibold text-lg transition">
              See How It Works
            </Link>
          </div>
          <p className="text-gray-200 mt-6">Full rewrite + report: <span className="font-bold text-[#c9a227]">$19.99</span> (one-time)</p>
        </div>
      </section>
      <section className="py-14 bg-[#faf8f5]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl font-bold text-[#1a2b4a] mb-3">Why Listing Copy Matters (Watch This)</h2>
              <p className="text-gray-700 text-lg">Photos get the click. Words get the showing. This quick walkthrough explains why most listings get ignored - and what to do instead.</p>
              <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
                <p className="font-semibold text-gray-900">What you will learn:</p>
                <ul className="list-disc pl-5 mt-3 space-y-2 text-gray-700">
                  <li>Why generic copy does not convert</li>
                  <li>How to hit the MLS-friendly sweet spot (about 140-160 words)</li>
                  <li>How GetReadyToPost grades and rewrites in seconds</li>
                </ul>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-black">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/q1gCe2-nE_o?rel=0"
                  title="Why Listing Copy Matters - GetReadyToPost"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <ExampleBlock
        tag="Residential Lakefront"
        before="Beautiful lakefront home in a great neighborhood. 3 bedroom 2 bath with open floor plan and lots of updates. Big backyard and amazing views. Must see, won't last!"
        after="Enjoy lakefront living in this 3-bedroom, 2-bath home with a comfortable layout and water views that make everyday life feel like a getaway. The open living and dining areas create an easy flow for relaxing or hosting, while the backyard offers space to unwind and take in the scenery. Convenient to shopping and dining. Schedule your showing today."
        gradesBefore={[
          { label: "Title", score: "C-" },
          { label: "Description", score: "D" },
          { label: "Photos", score: "B" },
          { label: "Keywords", score: "D+" },
          { label: "Compliance", score: "B-" },
          { label: "Impact", score: "D" },
        ]}
        gradesAfter={[
          { label: "Title", score: "B+" },
          { label: "Description", score: "A-" },
          { label: "Photos", score: "B" },
          { label: "Keywords", score: "A-" },
          { label: "Compliance", score: "A" },
          { label: "Impact", score: "A-" },
        ]}
      />
      <div className="bg-[#faf8f5]">
        <ExampleBlock
          tag="Starter Home / First-Time Buyer"
          before="Cute house with new floors and paint. Great location close to everything. Nice yard and updated kitchen. Come see it today!"
          after="Move-in ready and easy to love, this home offers updated flooring, fresh interior paint, and a layout that makes everyday living simple. The kitchen provides practical workspace and storage, and the yard gives you room to relax, garden, or entertain. Convenient to shopping, dining, and commuter routes. Schedule your showing and see how well this one fits."
          gradesBefore={[
            { label: "Title", score: "C" },
            { label: "Description", score: "D+" },
            { label: "Photos", score: "B-" },
            { label: "Keywords", score: "D" },
            { label: "Compliance", score: "B" },
            { label: "Impact", score: "D+" },
          ]}
          gradesAfter={[
            { label: "Title", score: "B" },
            { label: "Description", score: "A-" },
            { label: "Photos", score: "B-" },
            { label: "Keywords", score: "A-" },
            { label: "Compliance", score: "A" },
            { label: "Impact", score: "A-" },
          ]}
        />
      </div>
      <ExampleBlock
        tag="Condo / Low-Maintenance Living"
        before="Great condo with amenities. Close to downtown. Spacious and bright. Perfect for anyone. Won't last!"
        after="Enjoy low-maintenance living in this bright condo with a functional layout and comfortable living space. Community amenities add convenience to your routine, and the location keeps you close to dining, shopping, and everyday essentials. Buyer to verify HOA rules, fees, and any rental restrictions. Schedule your showing today."
        gradesBefore={[
          { label: "Title", score: "C-" },
          { label: "Description", score: "D" },
          { label: "Photos", score: "B-" },
          { label: "Keywords", score: "D" },
          { label: "Compliance", score: "C+" },
          { label: "Impact", score: "D" },
        ]}
        gradesAfter={[
          { label: "Title", score: "B" },
          { label: "Description", score: "A-" },
          { label: "Photos", score: "B-" },
          { label: "Keywords", score: "A-" },
          { label: "Compliance", score: "A" },
          { label: "Impact", score: "A-" },
        ]}
      />
      <div className="bg-[#faf8f5]">
        <ExampleBlock
          tag="Vacant Land"
          before="Nice lot near the lake. Good location. Build your dream home. Close to town. Bring offers."
          after="Bring your plans and vision to this vacant homesite near the lake, offering an opportunity to build in a setting that supports everyday living and weekend escape. Convenient to local shopping and dining. Buyer to verify zoning, utilities, setbacks, and building requirements."
          gradesBefore={[
            { label: "Title", score: "C" },
            { label: "Description", score: "D+" },
            { label: "Photos", score: "C+" },
            { label: "Keywords", score: "D" },
            { label: "Compliance", score: "B" },
            { label: "Impact", score: "D" },
          ]}
          gradesAfter={[
            { label: "Title", score: "B+" },
            { label: "Description", score: "A-" },
            { label: "Photos", score: "C+" },
            { label: "Keywords", score: "A-" },
            { label: "Compliance", score: "A" },
            { label: "Impact", score: "A-" },
          ]}
        />
      </div>
      <section className="py-16 bg-[#1a2b4a] text-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-4">MLS + Fair Housing Safe</h2>
              <p className="text-gray-200 text-lg">
                GetReadyToPost is built for real estate. We avoid protected-class language, keep descriptions MLS-friendly, and focus on property facts and buyer psychology.
              </p>
              <p className="text-gray-200 mt-4">
                You will get a clean rewrite plus a breakdown of what to fix - so you can improve the listing without guessing.
              </p>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl p-8">
              <p className="text-xl font-bold">Ready to run yours?</p>
              <p className="text-gray-200 mt-2">
                Instant grade + rewrite + report for <span className="font-bold text-[#c9a227]">$19.99</span>.
              </p>
              <div className="mt-6">
                <Link
                  href="/rate-my-listing"
                  className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-8 py-4 rounded-lg font-semibold text-lg transition shadow-lg"
                >
                  Rate My Listing
                </Link>
              </div>
              <p className="text-gray-300 text-sm mt-4">
                No subscription. One-time payment. Results in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
