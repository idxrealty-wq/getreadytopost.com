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
      description: 'One listing analysis & rewrite',
    },
    {
      id: 2,
      name: '5 Listing Rewrite Pack',
      price: '$85',
      image: '/offers/5-pack-rewrite.png',
      link: 'https://square.link/u/15NaVu0p',
      description: 'Five listing rewrites',
    },
    {
      id: 3,
      name: 'Agent Vault Pro - Monthly',
      price: '$99',
      image: '/offers/agent-vault-monthly.png',
      link: 'https://square.link/u/PUNuh53u',
      description: 'Monthly workspace access',
    },
    {
      id: 4,
      name: 'Agent Vault Pro - 6 Months',
      price: '$495',
      image: '/offers/agent-vault-6months.png',
      link: 'https://square.link/u/8nf73LLz',
      description: 'Six months of workspace access',
    },
    {
      id: 5,
      name: 'Agent Vault Pro - Annual',
      price: '$899',
      image: '/offers/agent-vault-annual.png',
      link: 'https://square.link/u/lgsIomQl',
      description: 'Full year of workspace access',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c] pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Deals</h1>
          <p className="text-xl text-gray-300">Choose the plan that works for you</p>
        </div>

        {/* Table Layout */}
        <div className="overflow-x-auto bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="px-6 py-4 text-left text-white font-bold">Offer</th>
                <th className="px-6 py-4 text-center text-white font-bold">Thumbnail</th>
                <th className="px-6 py-4 text-center text-white font-bold">Price</th>
                <th className="px-6 py-4 text-center text-white font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id} className="border-b border-white/10 hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-semibold text-lg">{offer.name}</p>
                      <p className="text-gray-400 text-sm">{offer.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <Image
                        src={offer.image}
                        alt={offer.name}
                        width={120}
                        height={120}
                        className="rounded-lg object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="text-[#c9a227] font-bold text-2xl">{offer.price}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <a
                      href={offer.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-[#c9a227] hover:bg-[#e8c547] text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                      Buy Now
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
