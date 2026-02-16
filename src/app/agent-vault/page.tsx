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

  const handleSubmit = async () => {
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
        // Redirect to results page
        router.push(`/results?id=${data.submissionId}`);
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
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition ${
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
            onClick={handleSubmit}
            disabled={!file || !email || uploading}
            className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Processing...' : '🔥 Analyze My Listing - $19.99'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Secure payment via Square. Results appear instantly.
          </p>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-white/70 hover:text-white font-semibold">← Back to Home</Link>
        </div>

      </div>
    </main>
  );
}
