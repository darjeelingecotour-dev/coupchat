import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { GifItem } from '../types';

interface GifPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (url: string) => void;
}

const DEFAULT_GIFS: GifItem[] = [
  { id: '1', title: 'Wink & Smile', url: 'https://media.giphy.com/media/OpfkuToK5FTYQ/giphy.gif', category: 'flirt' },
  { id: '2', title: 'Late Night Dance', url: 'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif', category: 'party' },
  { id: '3', title: 'Heart Eyes Blush', url: 'https://media.giphy.com/media/26BRv0ThflsDTjDUs/giphy.gif', category: 'flirt' },
  { id: '4', title: 'Mind Blown', url: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif', category: 'funny' },
  { id: '5', title: 'Popcorn Chill', url: 'https://media.giphy.com/media/gl0mkIZOW6Nwc/giphy.gif', category: 'chill' },
  { id: '6', title: 'Cheeky Smirk', url: 'https://media.giphy.com/media/l4pTfx2qLszoacZRS/giphy.gif', category: 'flirt' },
  { id: '7', title: 'Cheers Toast', url: 'https://media.giphy.com/media/GCLlQnV7dXZ2E/giphy.gif', category: 'party' },
  { id: '8', title: 'Shy Wave Hello', url: 'https://media.giphy.com/media/ASd0Ukj0BC5roG5Lmp/giphy.gif', category: 'greetings' },
  { id: '9', title: 'Laughing Out Loud', url: 'https://media.giphy.com/media/3oEjHAUOqG3lSS0f1C/giphy.gif', category: 'funny' },
  { id: '10', title: 'Sending Kisses', url: 'https://media.giphy.com/media/26ufcYAkp8e66vanu/giphy.gif', category: 'flirt' },
  { id: '11', title: 'Excited Bounce', url: 'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif', category: 'party' },
  { id: '12', title: 'Listening Closely', url: 'https://media.giphy.com/media/3oKIPbNb1vWd0btuIE/giphy.gif', category: 'chill' },
];

export const GifPicker: React.FC<GifPickerProps> = ({ isOpen, onClose, onSelectGif }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [gifs, setGifs] = useState<GifItem[]>(DEFAULT_GIFS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchGifs = async () => {
      setLoading(true);
      try {
        const query = searchTerm ? searchTerm : category === 'all' ? 'flirt' : category;
        const res = await fetch(`/api/gifs?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.gifs && data.gifs.length > 0) {
            setGifs(data.gifs);
          } else {
            setGifs(DEFAULT_GIFS);
          }
        }
      } catch {
        // Fallback to local catalog
        const filtered = DEFAULT_GIFS.filter(
          (g) =>
            category === 'all' ||
            g.category === category ||
            g.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setGifs(filtered);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchGifs, 250);
    return () => clearTimeout(timer);
  }, [isOpen, searchTerm, category]);

  if (!isOpen) return null;

  const categories = [
    { key: 'all', label: '⚡ Popular' },
    { key: 'flirt', label: '💋 Flirt' },
    { key: 'party', label: '🎉 Vibe' },
    { key: 'funny', label: '😂 LOL' },
    { key: 'chill', label: '🌙 Chill' },
    { key: 'greetings', label: '👋 Hello' },
  ];

  return (
    <div className="absolute bottom-16 left-2 right-2 sm:left-4 sm:right-4 z-50 bg-[#120826]/95 border border-white/10 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-2xl p-3 flex flex-col max-h-80 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <span className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
          <span className="text-pink-400">GIF</span> REACTIONS
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close GIF Picker"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-2">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search flirty, funny, reaction GIFs..."
          className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 transition-colors"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              setCategory(cat.key);
              setSearchTerm('');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              category === cat.key && !searchTerm
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* GIF Grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-black/20">
        {loading ? (
          <div className="col-span-3 py-10 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
            <span className="text-xs">Finding GIFs...</span>
          </div>
        ) : gifs.length === 0 ? (
          <div className="col-span-3 py-8 text-center text-xs text-slate-400">
            No GIFs found. Try another search.
          </div>
        ) : (
          gifs.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                onSelectGif(g.url);
                onClose();
              }}
              className="relative group rounded-lg overflow-hidden border border-white/5 hover:border-pink-500/50 aspect-video transition-all cursor-pointer bg-slate-900"
            >
              <img
                src={g.url}
                alt={g.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 text-[9px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {g.title}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
