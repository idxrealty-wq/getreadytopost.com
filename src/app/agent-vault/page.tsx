"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AgentVaultPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [preview, setPreview] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [step, setStep] = useState<'upload' | 'payment'>('upload');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const uploadedFile = e.dataTransfer.files[0];
      if (isValidFile(uploadedFile)) {
        setFile(uploadedFile);
      } else {
        alert('Please upload a PDF, Word document, or text file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      if (isValidFile(uploadedFile)) {
        setFile(uploadedFile);
      } else {
        alert('Please upload a PDF, Word document, or text file');
      }
    }
  };

  const isValidFile = (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    return validTypes.includes(file.type);
  };

  const handleUpload = async () => {
    if (!file || !email) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);

    try {
      const response = await fetch('/api/upload-listing', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.submissionId) {
        setSubmissionId(data.submissionId);
        setPreview(data.preview);
        setWordCount(data.wordCount);
        setStep('payment');
      } else {
        alert(data.error || 'Upload failed. Please try again.');
      }
    } catch (error) {
      alert('Upload failed. Please try again.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handlePaymentClick = () => {
    window.open('https://square.link/u/22tY4Rla', '_blank');
  };

  const handleViewResults = () => {
    router.push(`/results?id=${submissionId}`);
  };

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        
        <section className="py-8 text-center text-white mb-8">
          <div className="inline-block bg-[#c9a227] text-white text-sm font-bold px-4 py-2 rounded-full mb-4">🏢 Agent Workspace</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Upload Listing Document</h1>
          <p className="text-gray-300 mb-4">Upload a PDF, Word doc, or text file for instant analysis</p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block">
            <p className="text-4xl font-bold text-[#c9a227] mb-1">$19.99</p>
            <p className="text-sm text-gray-300">Per listing analysis</p>
          </div>
        </section>

        {step === 'payment' ? (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            {/* File Preview */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="font-bold text-gray-800">{file?.name}</p>
                  <p className="text-sm text-gray-500">{wordCount} words extracted</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 italic mt-2">"{preview}"</p>
            </div>

            {/* Payment Steps */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#c9a227] text-white flex items-center justify-center font-bold">1</div>
                  <h3 className="font-bold text-gray-800">Pay $19.99 via Square</h3>
                </div>
                <button 
                  onClick={handlePaymentClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  Open Square Payment
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">2</div>
                  <h3 className="font-bold text-gray-800">View Your Results</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">After completing payment, click below to see your instant analysis</p>
                <button 
                  onClick={handleViewResults}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  ✨ View My Results
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">Results appear instantly after payment is processed (usually 30-60 seconds)</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            
            {/* Email Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Email *</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@realestate.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Report will be sent here</p>
            </div>

            {/* File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition mb-6 ${
                dragActive ? 'border-[#c9a227] bg-[#c9a227]/5' : 'border-gray-300 bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />

              {!file ? (
                <>
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Drag & drop your listing file here
                  </h3>
                  <p className="text-gray-600 mb-4">or</p>
                  <label
                    htmlFor="file-upload"
                    className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition"
                  >
                    Browse Files
                  </label>
                  <p className="text-xs text-gray-500 mt-4">Supports PDF, Word (.doc, .docx), and Text files</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{file.name}</h3>
                  <p className="text-gray-600 mb-4">{(file.size / 1024).toFixed(2)} KB</p>
                  <button
                    onClick={() => setFile(null)}
                    className="text-red-500 hover:text-red-700 font-semibold text-sm"
                  >
                    Remove file
                  </button>
                </>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleUpload}
              disabled={!file || !email || uploading}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? '📤 Extracting text...' : '🔥 Upload & Continue to Payment'}
            </button>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/" className="text-white/70 hover:text-white font-semibold">← Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
