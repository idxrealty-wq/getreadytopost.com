import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Real Estate Deals & Offers | GetReadyToPost',
  description: 'Exclusive real estate offers and deals. Professional listing analysis and rewrites for home sellers and agents.',
  openGraph: {
    title: 'Real Estate Deals & Offers | GetReadyToPost',
    description: 'Exclusive real estate offers and deals. Professional listing analysis and rewrites for home sellers and agents.',
    url: 'https://getreadytopost.com/our-deals',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Real Estate Deals & Offers | GetReadyToPost',
    description: 'Exclusive real estate offers and deals. Professional listing analysis and rewrites for home sellers and agents.',
  },
  canonical: 'https://getreadytopost.com/our-deals',
};

const offers = [
  {
    id: 1,
    name: 'Single Listing Rewrite',
    description: 'Professional rewrite of one listing description, optimized for buyers and MLS compliance.',
    price: '$19.99',
    image: '/offers/single-rewrite-19.99.png',
    link: 'https://square.link/u/GvKqNZUg',
  },
  {
    id: 2,
    name: '5-Pack Rewrite',
    description: 'Get 5 listing rewrites at a bulk discount. Perfect for agents managing multiple listings.',
    price: '$79.99',
    image: '/offers/5-pack-rewrite.png',
    link: 'https://square.link/u/GvKqNZUg',
  },
  {
    id: 3,
    name: 'Agent Vault Pro - Monthly',
    description: 'Unlimited listing rewrites, analysis, and recommendations. Cancel anytime.',
    price: '$49.99/mo',
    image: '/offers/agent-vault-pro-monthly.png',
    link: 'https://square.link/u/GvKqNZUg',
  },
  {
    id: 4,
    name: 'Agent Vault Pro - 6 Months',
    description: 'Six months of unlimited access at a discounted rate. Best for serious agents.',
    price: '$249.99',
    image: '/offers/agent-vault-pro-6-month.png',
    link: 'https://square.link/u/GvKqNZUg',
  },
  {
    id: 5,
    name: 'Agent Vault Pro - Annual',
    description: 'Full year of unlimited listing rewrites and analysis. Maximum savings.',
    price: '$449.99',
    image: '/offers/agent-vault-pro-annual.png',
    link: 'https://square.link/u/GvKqNZUg',
  },
];

export default function OurDealsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Our Deals
          </h1>
          <p className="text-2xl text-gray-200 mb-8">
            Professional listing analysis and rewrites for every budget
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:border-[#c9a227]/50 transition"
            >
              <div className="relative w-full h-64 bg-gradient-to-br from-[#2d4a7c] to-[#1a2b4a]">
                {offer.image && (
                  <Image
                    src={offer.image}
                    alt={offer.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-3">
                  {offer.name}
                </h3>
                <p className="text-gray-300 mb-6">
                  {offer.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-[#c9a227]">
                    {offer.price}
                  </span>
                  <Link
                    href={offer.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-6 py-2 rounded-lg font-bold transition"
                  >
                    Buy Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
