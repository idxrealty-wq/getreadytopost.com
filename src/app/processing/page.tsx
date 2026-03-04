import { Suspense } from "react";
import ProcessingClient from "./ProcessingClient";

export default function ProcessingPage() {
  return (
    <Suspense fallback={<div className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a] flex items-center justify-center"><p className="text-white">Loading...</p></div>}>
      <ProcessingClient />
    </Suspense>
  );
}
