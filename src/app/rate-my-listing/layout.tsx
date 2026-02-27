import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rate My Listing - GetReadyToPost',
  description: 'Instant feedback + professional rewrite for $19.99.',
  openGraph: {
    title: 'Rate My Listing Now - GetReadyToPost',
    description: 'Instant feedback + professional rewrite for $19.99.',
    url: 'https://getreadytopost.com/rate-my-listing',
    images: [{ url: '/og-rate-my-listing.png', width: 1200, height: 630, alt: 'Rate My Listing' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rate My Listing Now - GetReadyToPost',
    images: ['/og-rate-my-listing.png'],
  },
};

export default function RateMyListingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
