import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  MessageSquare,
  ExternalLink,
  Globe,
  HelpCircle,
  ShieldCheck,
  Heart,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { PersonalizationData } from '../types';
import { buildOpenGraphShareUrl } from '../utils/urlHelper';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  personalization: PersonalizationData;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  personalization,
}) => {
  const [copied, setCopied] = useState(false);
  const [showDeploymentHelp, setShowDeploymentHelp] = useState(false);
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [urlMode, setUrlMode] = useState<'current' | 'custom' | 'pre'>('current');
  const [messageLanguage, setMessageLanguage] = useState<'id' | 'en'>('id');

  if (!isOpen) return null;

  // Resolve base URL based on selected mode
  const getPublicBase = (): string => {
    if (urlMode === 'custom' && customBaseUrl.trim()) {
      return customBaseUrl.trim().replace(/\/+$/, '');
    }

    if (typeof window !== 'undefined') {
      const origin = window.location.origin;

      if (urlMode === 'pre') {
        if (origin.includes('-dev-')) {
          return origin.replace('-dev-', '-pre-').replace(/\/+$/, '');
        }
        const envShared = import.meta.env.VITE_SHARED_APP_URL;
        if (envShared && typeof envShared === 'string' && envShared.startsWith('http')) {
          return envShared.replace(/\/+$/, '');
        }
      }

      // Default: Use active current origin
      return origin.replace(/\/+$/, '');
    }

    return 'https://ais-dev-jzy7p24ikxnktzsdbokmja-627077760365.asia-east1.run.app';
  };

  const currentBase = getPublicBase();
  // Open Graph-friendly URL structure with dedicated /share proxy route
  const shareUrl = buildOpenGraphShareUrl(currentBase, personalization);

  // Dynamic Open Graph image preview URL
  const ogPreviewImageUrl = `${currentBase}/api/og-image?to=${encodeURIComponent(
    personalization.recipient || ''
  )}&from=${encodeURIComponent(
    personalization.sender || ''
  )}&msg=${encodeURIComponent(personalization.customMessage || '')}`;

  const buildShareText = (): string => {
    if (messageLanguage === 'id') {
      let greeting = 'Ada animasi cinta retro OLED khusus untukmu ❤️';
      if (personalization.recipient) {
        greeting = `Untuk ${personalization.recipient} ❤️ Ada animasi cinta retro OLED spesial yang dibuatkan khusus untukmu!`;
      }
      if (personalization.sender) {
        greeting += ` (Dari: ${personalization.sender})`;
      }
      if (personalization.customMessage) {
        greeting += `\n\n"${personalization.customMessage}"`;
      }
      // Ensure the URL is separated cleanly with newlines for WhatsApp link parsing
      return `${greeting}\n\nBuka langsung di sini:\n${shareUrl}\n`;
    } else {
      let greeting = 'Someone made this little OLED love animation for you ❤️';
      if (personalization.recipient) {
        greeting = `For ${personalization.recipient} ❤️ A special retro OLED love story was crafted just for you!`;
      }
      if (personalization.sender) {
        greeting += ` (From: ${personalization.sender})`;
      }
      if (personalization.customMessage) {
        greeting += `\n\n"${personalization.customMessage}"`;
      }
      return `${greeting}\n\nOpen it here:\n${shareUrl}\n`;
    }
  };

  const shareText = buildShareText();
  // Standard WhatsApp send endpoint
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: personalization.recipient
            ? `Pesan Cinta untuk ${personalization.recipient} ❤️`
            : 'OLED Love Animation',
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // Cancelled
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-3xl p-5 sm:p-6 shadow-2xl text-neutral-100 font-sans my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Share ke WhatsApp (Open Graph Friendly)</h2>
              <p className="text-xs text-neutral-400">
                URL landing page dengan preview card meta tag & auto-start
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4">
          {/* Open Graph Preview Card (How it appears in WhatsApp) */}
          <div className="rounded-2xl bg-neutral-950 border border-cyan-500/30 overflow-hidden shadow-lg">
            <div className="px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
              <span className="flex items-center gap-1.5 font-medium text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Live Open Graph Card Preview:
              </span>
              <span className="font-mono text-[10px] text-neutral-500">/share route</span>
            </div>
            <div className="p-3 flex gap-3 items-center">
              <div className="w-20 h-20 rounded-xl bg-black border border-cyan-500/40 shrink-0 overflow-hidden flex items-center justify-center relative">
                <img
                  src={ogPreviewImageUrl}
                  alt="Open Graph preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to static SVG if API not rendered yet
                    (e.target as HTMLImageElement).src = '/og-card.svg';
                  }}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-xs font-semibold text-white truncate">
                  {personalization.recipient
                    ? `Spesial Untuk ${personalization.recipient} ❤️`
                    : 'Kisah Cinta Retro OLED ❤️'}
                </div>
                <div className="text-[11px] text-neutral-300 line-clamp-2 leading-relaxed">
                  {personalization.customMessage ||
                    'Animasi pixel art monokrom retro 12 babak dengan lagu & efek romantis.'}
                </div>
                <div className="text-[10px] text-cyan-400 font-mono truncate">
                  {new URL(shareUrl).host}
                </div>
              </div>
            </div>
          </div>

          {/* URL Origin Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="text-neutral-300 font-medium flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                Target Alamat Host (URL):
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-800/80 rounded-xl border border-neutral-700 text-xs">
              <button
                type="button"
                onClick={() => setUrlMode('current')}
                className={`py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer text-center truncate ${
                  urlMode === 'current'
                    ? 'bg-cyan-500 text-black shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                URL Aplikasi Ini
              </button>
              <button
                type="button"
                onClick={() => setUrlMode('custom')}
                className={`py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer text-center truncate ${
                  urlMode === 'custom'
                    ? 'bg-cyan-500 text-black shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Custom Domain (Vercel)
              </button>
            </div>

            {urlMode === 'custom' && (
              <div className="mt-2 animate-in fade-in duration-150">
                <input
                  type="text"
                  placeholder="https://cinta-kamu.vercel.app"
                  value={customBaseUrl}
                  onChange={(e) => setCustomBaseUrl(e.target.value)}
                  className="w-full px-3.5 py-1.5 rounded-xl bg-neutral-800 border border-cyan-500/50 text-xs font-mono text-cyan-200 focus:outline-none mb-1"
                />
                <span className="text-[10px] text-neutral-400">
                  Masukkan domain website kamu (misal Vercel, Netlify, atau domain sendiri).
                </span>
              </div>
            )}
          </div>

          {/* Language Toggle for WhatsApp greeting */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium">Bahasa Pesan:</span>
            <div className="inline-flex rounded-xl bg-neutral-800 p-0.5 border border-neutral-700">
              <button
                type="button"
                onClick={() => setMessageLanguage('id')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  messageLanguage === 'id'
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                🇮🇩 Indonesia
              </button>
              <button
                type="button"
                onClick={() => setMessageLanguage('en')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  messageLanguage === 'en'
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          {/* Share Preview Card */}
          <div className="p-3.5 rounded-2xl bg-neutral-800/80 border border-neutral-700 text-xs space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Preview Pesan WhatsApp:</span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 font-mono text-[11px] text-neutral-200 whitespace-pre-wrap select-all max-h-24 overflow-y-auto">
              {shareText}
            </div>
          </div>

          {/* Share Link Field */}
          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1.5">
              Link Open Graph Siap Dibagikan:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs font-mono text-cyan-300 truncate focus:outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Salin
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Direct WhatsApp link */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm shadow-lg shadow-emerald-950/40 transition-transform active:scale-95 cursor-pointer text-center"
            >
              <MessageSquare className="w-4 h-4 fill-black" />
              <span>Buka & Kirim WhatsApp</span>
            </a>

            {/* Test Link Button */}
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-cyan-300 font-semibold text-sm border border-neutral-700 transition-colors cursor-pointer text-center"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Test Buka Link</span>
            </a>
          </div>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-xs border border-neutral-700/80 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Menu Bagikan Bawaan HP (Instagram, Telegram, dll)</span>
            </button>
          )}

          {/* Educational Note */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowDeploymentHelp(!showDeploymentHelp)}
              className="text-xs text-neutral-400 hover:text-cyan-400 inline-flex items-center gap-1 underline transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showDeploymentHelp
                ? 'Tutup info'
                : 'Info: Mengapa link Open Graph /share ini tidak error?'}
            </button>

            {showDeploymentHelp && (
              <div className="mt-3 p-3.5 rounded-2xl bg-neutral-800/60 border border-neutral-700/80 text-left text-xs text-neutral-300 space-y-2 animate-in fade-in duration-150">
                <p>
                  <strong>1. Open Graph Meta Injection:</strong> Server Express secara otomatis mendeteksi parameter nama penerima dan pengirim lalu menyuntikkan tag <code className="text-cyan-300 font-mono">og:title</code>, <code className="text-cyan-300 font-mono">og:description</code>, dan <code className="text-cyan-300 font-mono">og:image</code> dinamis ke dalam halaman web saat WhatsApp membaca tautan.
                </p>
                <p>
                  <strong>2. Script Bootstrap Anti-Hilang:</strong> Data nama dan pesan juga disematkan langsung di dalam template HTML (<code className="text-emerald-300 font-mono">__INITIAL_LOVE_DATA__</code>), sehingga jika browser HP penerima memotong query string di URL, animasi tetap dapat membaca pesan cinta dengan sempurna.
                </p>
                <p>
                  <strong>3. Dedicated Landing Route (/share):</strong> Rute proxy <code className="text-amber-300 font-mono">/share</code> dirancang khusus agar bebas dari pemotongan karakter emoji oleh parser WhatsApp.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
