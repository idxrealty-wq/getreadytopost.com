'use client';

import { useState } from 'react';
import { Search, MapPin, DollarSign, Home, FileText, Phone } from 'lucide-react';

interface HOAResult {
  subdivisionName: string;
  hoaName: string;
  hoaFees: string;
  hoaAmenities: string[];
  hoaRules: string;
  hoaContactInfo: string;
  numberOfHomes: number;
  address?: string;
}

export default function HOALookupPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<HOAResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<HOAResult | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a subdivision or community name.');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setSelectedResult(null);

    try {
      const response = await fetch('/api/hoa-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch HOA data');
      }

      const data = await response.json();
      setResults(data.results || []);

      if (data.results.length === 0) {
        setError('No HOA communities found. Try a different search.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="relative w-full h-96 bg-cover bg-center flex items-center justify-center overflow-hidden" style={{ backgroundImage: "url('/images/hoa-banner.png')" }}>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl font-bold mb-4">HOA Community Lookup</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Find detailed HOA information for subdivisions and communities across Florida
          </p>
        </div>
      </section>

      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Enter subdivision or community name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 transition"
            >
              <Search size={20} />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {results.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  Found {results.length} Community{results.length !== 1 ? 'ies' : ''}
                </h2>
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedResult(result)}
                      className={`p-4 rounded-lg cursor-pointer transition border-2 ${
                        selectedResult === result
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-blue-400'
                      }`}
                    >
                      <h3 className="font-bold text-gray-800">{result.subdivisionName}</h3>
                      <p className="text-sm text-gray-600">{result.hoaName}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedResult && (
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-blue-600">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                      {selectedResult.subdivisionName}
                    </h2>
                    <p className="text-lg text-blue-600 font-semibold mb-6">
                      {selectedResult.hoaName}
                    </p>

                    <div className="space-y-6">
                      <div className="flex gap-4 items-start">
                        <DollarSign className="text-green-600 flex-shrink-0 mt-1" size={24} />
                        <div>
                          <h3 className="font-bold text-gray-800 mb-1">HOA Fees</h3>
                          <p className="text-gray-700">{selectedResult.hoaFees}</p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start">
                        <Home className="text-orange-600 flex-shrink-0 mt-1" size={24} />
                        <div>
                          <h3 className="font-bold text-gray-800 mb-1">Community Size</h3>
                          <p className="text-gray-700">{selectedResult.numberOfHomes} homes</p>
                        </div>
                      </div>

                      {selectedResult.hoaAmenities.length > 0 && (
                        <div className="flex gap-4 items-start">
                          <Home className="text-purple-600 flex-shrink-0 mt-1" size={24} />
                          <div className="w-full">
                            <h3 className="font-bold text-gray-800 mb-3">Amenities</h3>
                            <div className="grid grid-cols-2 gap-2">
                              {selectedResult.hoaAmenities.map((amenity, idx) => (
                                <div
                                  key={idx}
                                  className="bg-purple-50 px-3 py-2 rounded text-sm text-gray-700"
                                >
                                  ✓ {amenity}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4 items-start">
                        <FileText className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
                        <div>
                          <h3 className="font-bold text-gray-800 mb-1">HOA Rules & Policies</h3>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {selectedResult.hoaRules}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start">
                        <Phone className="text-red-600 flex-shrink-0 mt-1" size={24} />
                        <div>
                          <h3 className="font-bold text-gray-800 mb-1">Contact Information</h3>
                          <p className="text-gray-700 text-sm">{selectedResult.hoaContactInfo}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <a
                        href="/rate-my-listing"
                        className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                      >
                        Optimize Your Listing Description
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && results.length === 0 && !error && (
            <div className="text-center py-12">
              <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-xl text-gray-600">
                Search for a subdivision to view HOA details
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Why Check HOA Details?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-blue-600" size={32} />
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Budget Planning</h3>
              <p className="text-gray-700">
                Understand HOA fees and monthly costs before purchasing
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="text-green-600" size={32} />
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Community Amenities</h3>
              <p className="text-gray-700">
                Discover pools, fitness centers, and other community features
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-purple-600" size={32} />
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Rules & Restrictions</h3>
              <p className="text-gray-700">
                Review community guidelines and property restrictions
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
