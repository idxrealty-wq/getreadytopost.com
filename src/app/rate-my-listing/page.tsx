"use client";
import RateMyListing from "@/components/RateMyListing";

export default function RateMyListingPage() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <img
          src="https://us.chat-img.sintra.ai/f3b53c23-1962-4de9-bee1-1ab563b224f9/1c6b6e83-767a-4a5f-9cc4-ea33a9ca148a/image.png?w=1200&h=896"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1a2b4a]/80"></div>
      </div>
      
      <div className="relative z-10 pt-20">
        <RateMyListing />
      </div>
    </div>
  );
}
