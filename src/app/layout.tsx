import type { Metadata } from 'next';
import { ReactNode } from 'react';
import ConditionalHeader from '@/components/ConditionalHeader';
import { UserProvider } from '@/contexts/UserContext';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://getreadytopost.com'),
  title: 'GetReadyToPost - AI-Powered Listing Rewrites',
  description: 'Grade your listing. Get professional, MLS-compliant rewrites in minutes.',
  openGraph: {
    title: 'GetReadyToPost - AI-Powered Listing Rewrites',
    description: 'Grade your listing. Get professional, MLS-compliant rewrites in minutes.',
    url: 'https://getreadytopost.com',
    siteName: 'GetReadyToPost',
    images: [
      {
        url: '/og-home.png',
        width: 1200,
        height: 630,
        alt: 'GetReadyToPost - AI-Powered Listing Rewrites',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GetReadyToPost',
    description: 'Grade your listing. Get professional rewrites in minutes.',
    images: ['/og-home.png'],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
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
            }),
          }}
        />
      </head>
      <body>
        <UserProvider>
          <ConditionalHeader />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
