import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Header from '@/components/Header';
import { UserProvider } from '@/contexts/UserContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'GetReadyToPost - AI-Powered Real Estate Listing Analysis',
  description: 'Get instant AI-powered analysis and professional rewrites for your real estate listings. MLS-compliant, Fair Housing safe, SEO-optimized.',
  metadataBase: new URL('https://getreadytopost.com'),
  openGraph: {
    title: 'GetReadyToPost - AI-Powered Real Estate Listing Analysis',
    description: 'Get instant AI-powered analysis and professional rewrites for your real estate listings. MLS-compliant, Fair Housing safe, SEO-optimized.',
    url: 'https://getreadytopost.com',
    siteName: 'GetReadyToPost',
    images: [
      {
        url: 'https://getreadytopost.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GetReadyToPost - Real Estate Listing Analysis',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GetReadyToPost - AI-Powered Real Estate Listing Analysis',
    description: 'Get instant AI-powered analysis and professional rewrites for your real estate listings. MLS-compliant, Fair Housing safe, SEO-optimized.',
    images: ['https://getreadytopost.com/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://getreadytopost.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'GetReadyToPost',
              url: 'https://getreadytopost.com',
              logo: 'https://getreadytopost.com/logo.png',
              description: 'AI-powered real estate listing analysis and professional rewrites',
              sameAs: [
                'https://facebook.com/getreadytopost',
                'https://twitter.com/getreadytopost',
                'https://linkedin.com/company/getreadytopost',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Service',
              name: 'Real Estate Listing Analysis',
              description: 'AI-powered analysis and professional rewrites for real estate listings',
              provider: {
                '@type': 'Organization',
                name: 'GetReadyToPost',
              },
              areaServed: 'US',
              availableLanguage: 'en',
            }),
          }}
        />
      </head>
      <body>
        <UserProvider>
          <Header />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
