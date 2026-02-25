"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';

interface UploadedFile {
  file: File;
  submissionId?: string;
  status: 'pending' | 'uploading' | 'ready' | 'error';
  preview?: string;
  wordCount?: number;
  error?: string;
}

export default function AgentVaultPage() {
  const router = useRouter();
  const { user } = useUser();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [email, setEmail] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState<'upload' | 'payment'>('upload');
  const [creditBalance, setCreditBalance] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      try {
        const res = await fetch(`/api/credits/balance?userId=${user.uid}`);
        const data = await res.json();
        setCreditBalance(data.balance ?? 0);
      } catch {
        setCreditBalance(0);
      }
    })();
  }, [user?.uid]);

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
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).filter(isValidFile);
      addFiles(newFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(isValidFile);
      addFiles(newFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map(file => ({
      file,
      status: 'pending'
    }));
    setFiles(prev => [...prev, ...uploadedFiles]);
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

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAll = async () => {
    if (!email || files.length === 0) return;
    if (!user?.uid) {
      alert('Please sign in first.');
      return;
    }
    if ((creditBalance ?? 0) <= 0) {
      setStep('payment');
      return;
    }

    try {
      const deductRes = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });
      if (!deductRes.ok) {
        const d = await deductRes.json().catch(() => ({}));
        alert(d.error || 'Error deducting credit. Please try again.');
        return;
      }
      const deductData = await deductRes.json().catch(() => ({}));
      setCreditBalance(deductData.newBalance ?? (creditBalance - 1));
    } catch (error) {
      console.error('Deduct error:', error);
      alert('Error processing credit.');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue;
      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f));
      const formData = new FormData();
      formData.append('file', files[i].file);
      formData.append('email', email);
      try {
        const response = await fetch('/api/upload-listing', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (response.ok && data.submissionId) {
          await fetch('/api/submissions/run-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submissionId: data.submissionId }),
          });
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'ready', submissionId: data.submissionId, preview: data.preview, wordCount: data.wordCount } : f));
        } else {
          setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error', error: data.error } : f));
        }
      } catch (error) {
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error', error: 'Upload failed' } : f));
      }
    }
    setStep('payment');
  };

  const handlePaymentClick = () => {
    window.open('https://square.link/u/22tY4Rla', '_blank');
  };

  const readyFiles = files.filter(f => f.status === 'ready');

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-[#1a2b4a] via-[#2d4a7c] to-[#1a2b4a]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <section className="py-8 text-center text-white mb-8">
          <div className="inline-block bg-[#c9a227] text-white text-sm font-bold px-4 py-2 rounded-full mb-4">🏢 Agent Workspace</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Batch Upload Listings</h1>
          <p className="text-gray-300 mb-4">Upload multiple PDFs, Word docs, or text files at once</p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 inline-block">
            <p className="text-4xl font-bold text-[#c9a227] mb-1">$19.99</p>
            <p className="text-sm text-gray-300">Per batch upload</p>
          </div>
          {user && creditBalance > 0 && (
            <div className="mt-4 text-green-300 font-semibold">✨ You have {creditBalance} credit(s) available</div>
          )}
        </section>

        {step === 'payment' ? (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {readyFiles.length > 0 ? `Analyzed ${readyFiles.length} Listing${readyFiles.length !== 1 ? 's' : ''}` : 'Payment Required'}
            </h2>

            {readyFiles.length > 0 && (
              <>
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {readyFiles.map((uploadedFile, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📄</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{uploadedFile.file.name}</p>
                          <p className="text-sm text-gray-500">{uploadedFile.wordCount} words</p>
                        </div>
                        <Link href={`/results?id=${uploadedFile.submissionId}`} className="text-[#c9a227] hover:underline text-sm font-semibold">
                          View →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-green-900 mb-2">✅ All files analyzed!</h3>
                  <p className="text-sm text-green-700">Click "View" next to each listing to see detailed results.</p>
                </div>
              </>
            )}

            {readyFiles.length === 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-blue-900 mb-2">Cost: $19.99</h3>
                <p className="text-sm text-blue-700 mb-4">1 batch upload</p>
                <button onClick={handlePaymentClick} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition mb-3">
                  Pay $19.99 via Square
                </button>
                <p className="text-xs text-blue-600 text-center">After payment, you can upload more files</p>
              </div>
            )}

            <button onClick={() => { setStep('upload'); setFiles([]); }} className="text-gray-500 hover:text-gray-700 text-sm font-semibold">
              ← Upload More Files
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="agent@realestate.com" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#c9a227] focus:outline-none" required />
            </div>

            <div className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition mb-6 ${dragActive ? 'border-[#c9a227] bg-[#c9a227]/5' : 'border-gray-300 bg-gray-50'}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
              <input type="file" id="file-upload" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} multiple />
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Drag & drop multiple files here</h3>
              <p className="text-gray-600 mb-4">or</p>
              <label htmlFor="file-upload" className="inline-block bg-[#c9a227] hover:bg-[#b8911f] text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition">
                Browse Files
              </label>
              <p className="text-xs text-gray-500 mt-4">Supports PDF, Word (.doc, .docx), and Text files • Upload multiple at once</p>
            </div>

            {files.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">{files.length} File{files.length !== 1 ? 's' : ''} Selected</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {files.map((uploadedFile, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-xl">
                          {uploadedFile.status === 'uploading' && '⏳'}
                          {uploadedFile.status === 'ready' && '✅'}
                          {uploadedFile.status === 'error' && '❌'}
                          {uploadedFile.status === 'pending' && '📄'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{uploadedFile.file.name}</p>
                          <p className="text-xs text-gray-500">
                            {uploadedFile.status === 'uploading' && 'Extracting text...'}
                            {uploadedFile.status === 'ready' && `${uploadedFile.wordCount} words`}
                            {uploadedFile.status === 'error' && uploadedFile.error}
                            {uploadedFile.status === 'pending' && `${(uploadedFile.file.size / 1024).toFixed(2)} KB`}
                          </p>
                        </div>
                      </div>
                      {uploadedFile.status === 'pending' && (
                        <button onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700 text-sm font-semibold">
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleUploadAll} disabled={!email || files.length === 0 || files.some(f => f.status === 'uploading')} className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
              {files.some(f => f.status === 'uploading') ? '📤 Processing files...' : `🔥 Upload ${files.length} File${files.length !== 1 ? 's' : ''} & Continue`}
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
