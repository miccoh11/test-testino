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

      const text = await response.text();
      
      if (!text) {
        throw new Error("Il server ha restituito una risposta vuota. TikTok potrebbe aver bloccato temporaneamente la richiesta da questo server.");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Errore parsing JSON:", text);
        throw new Error("Risposta del server non valida. Riprova tra qualche istante.");
      }

      if (!response.ok) {
        throw new Error(data.error || 'Si è verificato un errore durante l\'elaborazione.');
      }

      setVideoInfo(data);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!videoInfo) return;
    // Create a temporary link to trigger download
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
          <h1 className="text-xl font-semibold tracking-tight">test-testino</h1>
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

        {/* Results Area */}
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

          {videoInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-xl border border-black/5 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {/* Video Preview */}
                <div className="md:w-2/5 relative aspect-[9/16] bg-neutral-900">
                  <img 
                    src={videoInfo.cover} 
                    alt="Video cover" 
                    className="w-full h-full object-cover opacity-80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                      <Download className="text-white w-8 h-8" />
                    </div>
                  </div>
                </div>

                {/* Info & Actions */}
                <div className="md:w-3/5 p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <img 
                        src={videoInfo.avatar} 
                        alt={videoInfo.author} 
                        className="w-12 h-12 rounded-full border border-black/5"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h3 className="font-bold text-lg leading-tight">@{videoInfo.author}</h3>
                        <p className="text-neutral-500 text-sm">Creatore di contenuti</p>
                      </div>
                    </div>
                    
                    <p className="text-neutral-600 mb-8 line-clamp-3 italic">
                      "{videoInfo.title}"
                    </p>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Video pronto per il download
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                        Formato: MP4 (HD)
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                        Senza Watermark: Sì
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleDownload}
                      className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                    >
                      <Download className="w-5 h-5" />
                      Scarica Video (No Watermark)
                    </button>
                    <a
                      href={videoInfo.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-neutral-100 text-neutral-600 py-4 rounded-2xl font-bold hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Apri nel Browser
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Grid */}
        {!videoInfo && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24">
            <div className="p-6 bg-white rounded-2xl border border-black/5">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                <Download className="text-indigo-600 w-5 h-5" />
              </div>
              <h4 className="font-bold mb-2">Download Illimitati</h4>
              <p className="text-sm text-neutral-500">Scarica quanti video vuoi senza alcuna restrizione.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-black/5">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="text-emerald-600 w-5 h-5" />
              </div>
              <h4 className="font-bold mb-2">No Watermark</h4>
              <p className="text-sm text-neutral-500">Rimuoviamo automaticamente il logo TikTok dai tuoi video.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-black/5">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-4">
                <AlertCircle className="text-amber-600 w-5 h-5" />
              </div>
              <h4 className="font-bold mb-2">Alta Qualità</h4>
              <p className="text-sm text-neutral-500">I video vengono scaricati nella massima risoluzione disponibile.</p>
            </div>
          </div>
        )}

        {/* How It Works Section */}
        <section id="how-it-works" className="mt-32 pt-16 border-t border-black/5">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold tracking-tight mb-4">Come Funziona</h3>
            <p className="text-neutral-500">Segui questi semplici passaggi per scaricare i tuoi video preferiti.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-xl">1</div>
              <h4 className="font-bold mb-3 text-lg">Copia il Link</h4>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Apri TikTok, trova il video che desideri e clicca su "Condividi", poi seleziona "Copia link".
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-xl">2</div>
              <h4 className="font-bold mb-3 text-lg">Incolla qui</h4>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Torna su questo tool e incolla il link nella barra di ricerca in alto, quindi clicca su "Scarica".
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-xl">3</div>
              <h4 className="font-bold mb-3 text-lg">Salva il Video</h4>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Attendi l'anteprima e clicca sul pulsante di download per salvare il video senza filigrana.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-black/5 text-center text-neutral-400 text-sm">
        <p>© 2026 test-testino</p>
      </footer>
    </div>
  );
}
