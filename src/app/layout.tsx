import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import FeedbackButton from "@/components/feedback-button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GetReadyToPost - AI-Powered Real Estate Listing Analysis",
  description: "Get instant AI-powered analysis and professional rewrites for your real estate listings. MLS-compliant, Fair Housing safe, SEO-optimized.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
        <FeedbackButton />
      </body>
    </html>
  );
}
