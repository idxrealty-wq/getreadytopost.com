
import Image from 'next/image';

import Link from 'next/link';

export const metadata = {

  title: 'Pricing | GetReadyToPost',

  description:

    'Simple pricing for listing analysis, professional rewrites, and Agent Vault Pro plans. Home sellers, FSBO, and agents.',

  openGraph: {

    title: 'Pricing | GetReadyToPost',

    description:

      'Simple pricing for listing analysis, professional rewrites, and Agent Vault Pro plans. Home sellers, FSBO, and agents.',

    url: 'https://getreadytopost.com/pricing',

    type: 'website',

  },

  twitter: {

    card: 'summary_large_image',

    title: 'Pricing | GetReadyToPost',

    description:

      'Simple pricing for listing analysis, professional rewrites, and Agent Vault Pro plans. Home sellers, FSBO, and agents.',

  },

};

export default function PricingPage() {

  const offers = [

    {

      id: 1,

      name: 'Single Rewrite',

      price: '$19.99',

      image: '/offers/single-rewrite-19.99.png',

      link: 'https://square.link/u/22tY4Rla',

      description:

        'Perfect for home sellers and FSBO listings. One listing, instant grade + rewrite + recommendations.',

      badge: 'MOST POPULAR',

    },

    {

      id: 2,

      name: '5 Listing Rewrite Pack',

      price: '$85',

      image: '/offers/5-pack-rewrite.png',

      link: 'https://square.link/u/15NaVu0p',

      description:

        'Best for agents with multiple active listings. Five rewrites at $17 each. Save $17.95 vs. single pricing.',

      badge: 'BEST VALUE',

    },

    {

      id: 3,

      name: 'Agent Vault Pro - Monthly',

      price: '$99',

      image: '/offers/agent-vault-pro-monthly.png',

      link: 'https://square.link/u/PUNuh53u',

      description:

        'Full workspace access. Grade, rewrite, and organize listings. Cancel anytime.',

      badge: null,

    },

    {

      id: 4,

      name: 'Agent Vault Pro - 6 Months',

      price: '$495',

      image: '/offers/agent-vault-pro-6-month.png',

      link: 'https://square.link/u/8nf73LLz',

      description:

        'Save $99 vs. monthly. Build a vault of polished listings and repeatable templates.',

      badge: null,

    },

    {

      id: 5,

      name: 'Agent Vault Pro - Annual',

      price: '$899',

      image: '/offers/agent-vault-pro-annual.png',

      link: 'https://square.link/u/lgsIomQl',

      description:

        "Best long-term value. That's $75/month for full workspace access all year.",

      badge: null,

    },

  ];

  return (

    <main className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] pt-32 pb-16">

      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-10">

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">

            Pricing

          </h1>

          <p className="text-xl text-gray-300">

            One-time rewrites or full Agent Vault Pro access — choose what fits.

          </p>

        </div>

        {/* Audience callouts with links */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">

          <Link href="/home-sellers">

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition cursor-pointer">

              <h2 className="text-2xl font-bold text-white mb-3">Home Sellers</h2>

              <p className="text-gray-300">

                Want to know if your listing is helping or hurting you? The{' '}

                <span className="font-bold text-[#c9a227]">$19.99 Single Rewrite</span>{' '}

                gives you an instant grade + a clean, MLS-ready rewrite.

              </p>

              <p className="text-[#c9a227] font-semibold mt-4">Learn more →</p>

            </div>

          </Link>

          <Link href="/fsbo">

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 hover:border-[#c9a227]/50 transition cursor-pointer">

              <h2 className="text-2xl font-bold text-white mb-3">FSBO</h2>

              <p className="text-gray-300">

                Selling on your own? Use the{' '}

                <span className="font-bold text-[#c9a227]">$19.99 Single Rewrite</span>{' '}

                to tighten your description, avoid risky language, and get more showings.

              </p>

              <p className="text-[#c9a227] font-semibold mt-4">Learn more →</p>

            </div>

          </Link>

        </div>

        {/* Offers grid */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

          {offers.map((offer) => (

            <div

              key={offer.id}

              className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:border-[#c9a227]/50 transition flex flex-col"

            >

              <div className="relative w-full h-64 bg-white/5 border-b border-white/10">

                <Image

                  src={offer.image}

                  alt={offer.name}

                  fill

                  className="object-contain p-4"

                  priority

                />

                {offer.badge && (

                  <div className="absolute top-3 left-3 bg-[#c9a227] text-[#1a2b4a] text-xs font-extrabold px-3 py-1 rounded-full shadow">

                    {offer.badge}

                  </div>

                )}

              </div>

              <div className="flex flex-col flex-grow p-6">

                <h3 className="text-white font-bold text-lg mb-2">{offer.name}</h3>

                <p className="text-gray-300 text-sm mb-6 flex-grow">

                  {offer.description}

                </p>

                <div className="space-y-4">

                  <p className="text-[#c9a227] font-bold text-3xl text-center">

                    {offer.price}

                  </p>

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

        {/* Note */}

        <div className="max-w-3xl mx-auto mt-12 text-center">

          <p className="text-gray-300">

            All rewrites are designed to be MLS-friendly and Fair Housing aware.

            Need broker/team pricing? Use the Contact Broker page.

          </p>

        </div>

      </div>

    </main>

  );

}

