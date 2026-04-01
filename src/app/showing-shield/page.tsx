import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Showing Shield | Silent Safety Protection for Real Estate Agents",
  description:
    "A discreet safety system for real estate agents. Silent panic alerts, live geocoded location sharing, instant evidence backup, and office notification workflows for brokerages that protect their people.",
  openGraph: {
    title: "Showing Shield | Silent Safety Protection for Real Estate Agents",
    description:
      "Silent panic alerts, live geocoded location sharing, instant evidence backup, and brokerage office notification workflows.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Showing Shield | Silent Safety Protection for Real Estate Agents",
    description:
      "A discreet safety system for agents who show property alone.",
  },
};

const coreFeatures = [
  {
    title: "Silent Panic Trigger",
    description:
      "Send a normal-looking text that does not alert the threat while the emergency workflow starts quietly in the background.",
    icon: "🚨",
  },
  {
    title: "Live Geocoded Location",
    description:
      "Convert live GPS into a readable address, nearest road, and map link so brokers, on-call agents, and emergency contacts know where the agent is fast.",
    icon: "📍",
  },
  {
    title: "Instant Evidence Backup",
    description:
      "Photos and evidence upload immediately to secure storage, helping preserve critical information even if the phone is taken.",
    icon: "📸",
  },
  {
    title: "Office Notification Portal",
    description:
      "Turn the brokerage office into a real-time alert hub so managers, brokers, and rotating on-call agents can respond quickly.",
    icon: "☎️",
  },
  {
    title: "Safety Check-In Timer",
    description:
      "Set a showing timer before the appointment. If the agent does not confirm they are safe, the alert sequence begins automatically.",
    icon: "⏱️",
  },
  {
    title: "On-Call Brokerage Coverage",
    description:
      "Brokerages can assign agents or managers to monitor alerts during selected hours, creating a real safety response workflow.",
    icon: "🛡️",
  },
];

const brokerBenefits = [
  "Recruit with more than commission splits",
  "Show agents your brokerage protects them in the field",
  "Create a real office safety workflow",
  "Strengthen retention with a serious agent-first benefit",
  "Position your firm as modern, protective, and proactive",
];

const useCases = [
  "Solo buyer showings",
  "Vacant homes",
  "Open houses",
  "Remote land listings",
  "New construction model tours",
  "After-hours appointments",
];

export default function ShowingShieldPage() {
  return (
    <div className="pt-20 bg-[#08152b] min-h-screen text-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#08152b] via-[#10213d] to-[#1a2b4a] py-24">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&h=1000&fit=crop"
            alt="Real estate showing safety concept"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="max-w-4xl">
            <p className="text-[#c9a227] font-semibold uppercase tracking-[0.24em] text-xs mb-5">
              Agent Safety Platform
            </p>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              If a Showing Goes Bad,
              <span className="block text-[#c9a227]">Your Phone Should Protect You.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed mb-8">
              Silent emergency alerts. Live geocoded location sharing. Instant evidence backup.
              Built for real estate agents who meet strangers behind closed doors.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a
                href="mailto:idxrealty@gmail.com?subject=Showing%20Shield%20Interest"
                className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition"
              >
                Join the Interest List
              </a>
              <a
                href="mailto:idxrealty@gmail.com?subject=Showing%20Shield%20Brokerage%20Demo"
                className="inline-flex items-center justify-center border-2 border-white/20 hover:border-white/50 text-white px-8 py-4 rounded-xl font-bold text-lg transition"
              >
                Request Brokerage Info
              </a>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 max-w-4xl">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-3xl font-bold text-[#c9a227]">Silent</p>
                <p className="text-sm text-gray-300 mt-2">
                  Trigger help without visibly escalating in front of the threat.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-3xl font-bold text-[#c9a227]">Fast</p>
                <p className="text-sm text-gray-300 mt-2">
                  Turn live coordinates into a usable address and map link immediately.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-3xl font-bold text-[#c9a227]">Real</p>
                <p className="text-sm text-gray-300 mt-2">
                  A serious safety system for agents and brokerages, not a gimmick.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-red-700 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-lg md:text-xl font-semibold">
            Real estate agents should not have to choose between staying calm and getting help.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white text-[#1a2b4a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-4xl mb-12">
            <p className="text-[#c9a227] font-semibold uppercase tracking-[0.2em] text-xs mb-3">
              Why This Matters
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Safety should be built into the showing process.
            </h2>
            <p className="text-lg text-gray-700 leading-8">
              Agents work in vacant homes, isolated properties, open houses, model units, and unfamiliar
              neighborhoods. When something feels wrong, there may be no time for a visible call, no nearby
              coworker, and no margin for hesitation. Showing Shield is built to help trigger support discreetly,
              preserve evidence instantly, and give brokerages a real system they can stand behind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-200 bg-[#faf8f5] p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-700 text-sm leading-7">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#10213d]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-[#c9a227] font-semibold uppercase tracking-[0.2em] text-xs mb-3">
                Brokerage Advantage
              </p>
              <h2 className="text-4xl font-bold mb-6">
                A safety system that doubles as a recruiting tool.
              </h2>
              <p className="text-lg text-gray-300 leading-8 mb-6">
                Most brokerages recruit with splits, leads, and training. Very few can say:
                <span className="text-white font-semibold"> we protect our agents in the field.</span>
              </p>
              <p className="text-lg text-gray-300 leading-8 mb-8">
                Showing Shield gives brokerages a serious, visible differentiator they can use in recruiting,
                retention, onboarding, and office culture.
              </p>

              <div className="space-y-3">
                {brokerBenefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <span className="text-[#c9a227] font-bold mt-0.5">✓</span>
                    <span className="text-gray-200">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#c9a227]/30 bg-white/5 p-8">
              <p className="text-[#c9a227] font-semibold uppercase tracking-wide text-sm mb-3">
                Office Workflow
              </p>
              <h3 className="text-2xl font-bold mb-6">How the alert chain works</h3>

              <div className="space-y-4">
                <WorkflowStep
                  number="1"
                  title="Agent triggers silent alert"
                  description="A normal-looking text or missed safety check-in starts the emergency workflow."
                />
                <WorkflowStep
                  number="2"
                  title="Location is geocoded instantly"
                  description="Live GPS is translated into a readable address, nearest road, and map link."
                />
                <WorkflowStep
                  number="3"
                  title="Office portal receives notification"
                  description="Broker, manager, or on-call agent gets the alert with time, location, and status."
                />
                <WorkflowStep
                  number="4"
                  title="Response begins immediately"
                  description="Office staff, emergency contacts, and escalation paths activate without delay."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#faf8f5] text-[#1a2b4a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[#c9a227] font-semibold uppercase tracking-[0.2em] text-xs mb-3">
              Built For Real Situations
            </p>
            <h2 className="text-4xl font-bold mb-4">Where Showing Shield matters most</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              This is designed for the moments agents know can feel wrong fast.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {useCases.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm"
              >
                <p className="text-lg font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-[#1a2b4a] to-[#2d4a7c]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-[#c9a227] font-semibold uppercase tracking-[0.2em] text-xs mb-3">
            The Promise
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            If an agent feels unsafe, help should be easier to trigger than fear.
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-8">
            Showing Shield is built around one mission: discreet alerts, usable location data,
            preserved evidence, and faster response when every second matters.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:idxrealty@gmail.com?subject=Showing%20Shield%20Interest"
              className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition"
            >
              Join the Interest List
            </a>
            <a
              href="mailto:idxrealty@gmail.com?subject=Showing%20Shield%20Share"
              className="inline-flex items-center justify-center bg-[#c9a227] hover:bg-[#e8c547] text-[#1a2b4a] px-8 py-4 rounded-xl font-bold text-lg transition"
            >
              Share This Idea
            </a>
          </div>

          <p className="text-gray-400 text-sm mt-8">
            Showing Shield • Protect agents • Strengthen trust • Lead with safety
          </p>
        </div>
      </section>

      <section className="py-10 bg-[#08152b]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Link href="/pricing" className="text-[#c9a227] hover:text-white font-semibold transition">
            Back to GetReadyToPost →
          </Link>
        </div>
      </section>
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="w-10 h-10 rounded-full bg-[#c9a227] text-[#1a2b4a] font-bold flex items-center justify-center flex-shrink-0">
        {number}
      </div>
      <div>
        <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
        <p className="text-sm text-gray-300 leading-6">{description}</p>
      </div>
    </div>
  );
}
