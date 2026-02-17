"use client";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-[#1a2b4a]">
          GetReadyToPost
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
            Home
          </Link>
          <Link href="/ai-advantage" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
            Why Our AI
          </Link>
          <Link href="/workspace" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
            Agent Workspace
          </Link>
          <Link href="/faq" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
            FAQ
          </Link>
          <Link
            href="/workspace"
            className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-2 rounded-lg font-bold transition"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-700 text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="flex flex-col p-6 gap-4">
            <Link href="/" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
              Home
            </Link>
            <Link href="/ai-advantage" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
              Why Our AI
            </Link>
            <Link href="/workspace" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
              Agent Workspace
            </Link>
            <Link href="/faq" className="text-gray-700 hover:text-[#c9a227] font-medium transition">
              FAQ
            </Link>
            <Link
              href="/workspace"
              className="bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-2 rounded-lg font-bold transition text-center"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
