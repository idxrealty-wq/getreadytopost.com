export default function FAQPage() {
  const faqs = [
    {
      q: "How much does it cost?",
      a: "$19.99 per listing analysis and rewrite. No subscription, no hidden fees. Pay only when you need it."
    },
    {
      q: "What do I get for $19.99?",
      a: "A complete listing analysis with grades in 6 categories (headline, length, emotion, keywords, CTA, professionalism), a professional MLS-ready rewrite (140-160 words), actionable recommendations, and a full report you can save to your Agent Vault."
    },
    {
      q: "Is there a subscription?",
      a: "No. You only pay $19.99 per listing when you need it. No monthly fees, no commitments."
    },
    {
      q: "How does payment work?",
      a: "After you submit your listing, you'll be redirected to a secure Square payment page. Once payment is confirmed, your analysis and rewrite are generated instantly and emailed to you."
    },
    {
      q: "How long does it take?",
      a: "Instant. Submit your listing, pay, and get your A+ rewrite in under 30 seconds."
    },
    {
      q: "Can I save my listings?",
      a: "Yes! After viewing your results, you can save them to your Agent Vault by signing up (free). Access all your past analyses anytime."
    },
    {
      q: "What is the Agent Workspace?",
      a: "A complete pre-listing command center. Enter a property address and get: property basics, customizable neighborhood maps with real data, AI-generated listings, document upload center, pre-listing checklist, and the ability to save everything to your vault."
    },
    {
      q: "Is the AI Fair Housing compliant?",
      a: "Yes. Our AI is specifically trained to avoid Fair Housing violations. It never uses protected class language or subjective neighborhood descriptions."
    },
    {
      q: "What makes your AI different from ChatGPT?",
      a: "Our AI is trained on MLS best practices, NAR compliance, and Fair Housing law. It pulls real neighborhood data (schools, parks, restaurants by name with distances), writes in the optimal 140-160 word range, includes SEO keywords, and uses conversion-focused language. ChatGPT gives generic output with no real estate training."
    },
    {
      q: "Can I upload files?",
      a: "Yes. In the Agent Workspace, you can upload documents (Seller Disclosure, Listing Agreement, etc.) and photos. Everything is organized by property address in your vault."
    },
    {
      q: "Do you offer broker/team pricing?",
      a: "Yes. Contact us for volume pricing and white-label options for brokerages."
    },
    {
      q: "Can I edit the AI-generated listing?",
      a: "Absolutely. The AI gives you a professional starting point. You can copy it and edit as needed before pasting into your MLS."
    },
    {
      q: "What if I'm not satisfied?",
      a: "We stand behind our AI. If you're not happy with your listing rewrite, contact us and we'll make it right."
    }
  ];

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-bold text-white mb-4 text-center">Frequently Asked Questions</h1>
        <p className="text-gray-300 text-xl text-center mb-12">Everything you need to know about GetReadyToPost</p>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-3">{faq.q}</h3>
              <p className="text-gray-300 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-300 mb-4">Still have questions?</p>
          <a href="/contact-broker" className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white px-8 py-3 rounded-xl font-bold transition">Contact Us</a>
        </div>
      </div>
    </main>
  );
}
