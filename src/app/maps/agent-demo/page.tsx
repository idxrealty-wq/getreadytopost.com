// src/app/maps/agent-demo/page.tsx
import type { Metadata } from "next";
import AgentMapShell from "@/components/maps/AgentMapShell";
import { MOCK_AGENT_PROFILE } from "@/lib/maps/mockMapData";

export const metadata: Metadata = {
  title: "Agent Property Map | GetReadyToPost.com",
  description:
    "View active listings, pending sales, and sold properties on an interactive map. Powered by GetReadyToPost.com.",
  robots: { index: false, follow: false },
};

export default function AgentDemoMapPage() {
  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <AgentMapShell profile={MOCK_AGENT_PROFILE} />
    </main>
  );
}
