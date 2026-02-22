import Image from 'next/image';

export const metadata = {
  title: 'Our Deals - GetReadyToPost',
  description: 'Affordable pricing for real estate listing analysis and rewrites.',
};

export default function OurDealsPage() {
  const offers = [
    {
      id: 1,
      name: 'Single Rewrite',
      price: '$19.99',
      image: '/offers/single-rewrite-19.99.png',
      link: 'https://square.link/u/22tY4Rla',
      description: 'Test drive professional copy. One listing, instant results. See what better looks like.',
    },
    {
      id: 2,
      name: '5 Listing Rewrite Pack',
      price: '$85',
      image: '/offers/5-pack-rewrite.png',
      link: 'https://square.link/u/15NaVu0p',
      description: 'Upgrade your whole portfolio. Five rewrites at $17 each. Save $17.95 vs. single pricing.',
    },
    {
      id: 3,
      name: 'Agent Vault Pro - Monthly',
      price: '$99',
      image: '/offers/agent-vault-pro-monthly.png',
      link: 'https://square.link/u/PUNuh53u',
      description: 'Try the full workspace risk-free. One month to grade, rewrite, and organize every listing.',
    },
    {
      id: 4,
      name: 'Agent Vault Pro - 6 Months',
      price: '$495',
      image: '/offers/agent-vault-pro-6-month.png',
      link: 'https://square.link/u/8nf73LLz',
      description: 'Serious agents go 6 months. Save $99 vs. monthly. Build a vault of polished listings.',
    },
    {
      id: 5,
      name: 'Agent Vault Pro - Annual',
      price: '$899',
      image: '/offers/agent-vault-pro-annual.png',
      link: 'https://square.link/u/lgsIomQl',
      description: 'The best value. Full year of workspace access. That\'s $75/month. Professional copy, every listing.',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Deals</h1>
          <p className="text-xl text-gray-300">Choose the plan that works for you</p>
        </div>

        {/* Card Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:border-[#c9a227]/50 transition flex flex-col"
            >
              {/* Image Container */}
              <div className="relative w-full h-64 bg-white/5 border-b border-white/10">
                <Image
                  src={offer.image}
                  alt={offer.name}
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>

              {/* Content Container */}
              <div className="flex flex-col flex-grow p-6">
                <h3 className="text-white font-bold text-lg mb-2">{offer.name}</h3>
                <p className="text-gray-400 text-sm mb-6 flex-grow">{offer.description}</p>
                
                <div className="space-y-4">
                  <p className="text-[#c9a227] font-bold text-3xl text-center">{offer.price}</p>
                  <a
                    href={offer.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] py-3 rounded-lg font-bold text-center transition shadow-lg"
                  >
                    Buy Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
