import React, { useState, useRef } from 'react';
import { X, Upload, Eye, EyeOff, Sparkles, Film, Image as ImageIcon, Check } from 'lucide-react';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMedia: (payload: {
    mediaType: 'image' | 'video';
    mediaUrl: string;
    caption?: string;
    sensitive: boolean;
  }) => void;
}

const PRESET_TEASERS = [
  {
    id: 't1',
    title: 'Neon Bedroom',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1507034589631-9433cc6bc453?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 't2',
    title: 'City Lights',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 't3',
    title: 'Silhouette Aura',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 't4',
    title: 'Cocktail Glow',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
  },
];

export const MediaModal: React.FC<MediaModalProps> = ({ isOpen, onClose, onSendMedia }) => {
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [sensitive, setSensitive] = useState(true); // Default true per safety spec
  const [activeTab, setActiveTab] = useState<'upload' | 'presets'>('upload');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else {
      setMediaType('image');
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setSelectedFileUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = () => {
    if (!selectedFileUrl) return;

    onSendMedia({
      mediaType,
      mediaUrl: selectedFileUrl,
      caption: caption.trim() || undefined,
      sensitive,
    });

    // Reset and close
    setSelectedFileUrl(null);
    setCaption('');
    setSensitive(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#110826] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(255,42,133,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Send Ephemeral Media
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-5 pt-3 flex gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-pink-600/30 text-pink-300 border border-pink-500/40'
                : 'bg-white/[0.03] text-slate-400 border border-white/5 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Device Upload
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                : 'bg-white/[0.03] text-slate-400 border border-white/5 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Mystery Teasers
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === 'upload' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedFileUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/15 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-pink-500/50 hover:bg-pink-500/5 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center text-slate-400 group-hover:text-pink-400 group-hover:scale-105 transition-all mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white mb-1">
                    Tap to browse image or short video
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Supports JPG, PNG, WEBP, MP4, MOV (Auto-blurred for safety)
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 aspect-video flex items-center justify-center">
                    {mediaType === 'video' ? (
                      <video
                        src={selectedFileUrl}
                        controls
                        className="max-h-52 w-full object-contain"
                      />
                    ) : (
                      <img
                        src={selectedFileUrl}
                        alt="Preview"
                        className="max-h-52 w-full object-contain"
                      />
                    )}
                    <button
                      onClick={() => setSelectedFileUrl(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">
                Pick a quick atmosphere snapshot to break the ice:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_TEASERS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedFileUrl(t.url);
                      setMediaType(t.type);
                    }}
                    className={`relative rounded-xl overflow-hidden border aspect-video transition-all cursor-pointer ${
                      selectedFileUrl === t.url
                        ? 'border-pink-500 ring-2 ring-pink-500/40 shadow-lg'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <img
                      src={t.url}
                      alt={t.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                      <span className="text-[11px] font-semibold text-white">
                        {t.title}
                      </span>
                    </div>
                    {selectedFileUrl === t.url && (
                      <div className="absolute top-1.5 right-1.5 bg-pink-600 text-white p-1 rounded-full">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Caption Input */}
          <div>
            <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1.5">
              Whisper Caption (Optional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Rate my late-night view..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Safety Filter Toggle */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
                {sensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Safety Tap-to-Reveal
                </p>
                <p className="text-[10px] text-slate-400">
                  Sends media heavily blurred with tap-to-reveal overlay
                </p>
              </div>
            </div>
            <button
              onClick={() => setSensitive(!sensitive)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                sensitive ? 'bg-pink-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  sensitive ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0c051a] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!selectedFileUrl}
            onClick={handleSend}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              selectedFileUrl
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-[0_0_15px_rgba(255,42,133,0.4)] cursor-pointer hover:brightness-110 active:scale-[0.98]'
                : 'bg-white/5 text-slate-500 cursor-not-allowed'
            }`}
          >
            Send Anonymously
          </button>
        </div>
      </div>
    </div>
  );
};
