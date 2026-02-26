import React, { useState } from 'react';
import { Download, Link2, Loader2, AlertCircle, CheckCircle2, Github, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoInfo {
  id: string;
  title: string;
  author: string;
  avatar: string;
  cover: string;
  videoUrl: string;
}

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setVideoInfo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!videoInfo) return;
    const link = document.createElement('a');
    link.href = videoInfo.videoUrl;
    link.download = `tiktok_${videoInfo.id}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans selection:bg-black selection:text-white">
      
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <Download className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Test Testino
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-neutral-500">
          <a href="#how-it-works" className="hover:text-black transition-colors">How it works</a>
          <a href="#" className="hover:text-black transition-colors">Privacy</a>
          <a href="https://github.com" className="flex items-center gap-1 hover:text-black transition-colors">
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-12 pb-24">

        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
          >
            TikTok Downloader
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-500 text-lg"
          >
            Scarica video TikTok senza filigrana in alta qualità.
          </motion.p>
        </div>

        {/* Input Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-2 rounded-2xl shadow-sm border border-black/5 mb-12"
        >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <Link2 className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Incolla il link di TikTok qui..."
                className="w-full pl-12 pr-4 py-4 bg-transparent outline-none text-lg"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="bg-black text-white px-8 py-4 rounded-xl font-medium hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Elaborazione...
                </>
              ) : (
                'Scarica'
              )}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 text-red-600"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-black/5 text-center text-neutral-400 text-sm">
        <p>© 2026 Test Testino</p>
      </footer>

    </div>
  );
}
