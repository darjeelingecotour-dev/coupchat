import React, { useState } from 'react';
import { Palette, X, Check, Image, Sparkles, Sliders, RotateCcw, AlertCircle } from 'lucide-react';
import { ThemeConfig, ThemePresetId, THEME_PRESETS } from '../types';

interface ThemeModalProps {
  currentTheme: ThemeConfig;
  onSelectTheme: (theme: ThemeConfig) => void;
  onClose: () => void;
}

const SAMPLE_WALLPAPERS = [
  {
    name: 'Candlelight & Velvet',
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Midnight Neon City',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Warm Sunset Horizon',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Crimson Silk & Shadows',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&auto=format&fit=crop&q=80',
  },
];

export const ThemeModal: React.FC<ThemeModalProps> = ({
  currentTheme,
  onSelectTheme,
  onClose,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<ThemePresetId>(currentTheme.preset);
  const [customUrl, setCustomUrl] = useState<string>(currentTheme.customImageUrl || '');
  const [opacity, setOpacity] = useState<number>(currentTheme.overlayOpacity ?? 0.75);
  const [blur, setBlur] = useState<number>(currentTheme.overlayBlur ?? 0);
  const [imageError, setImageError] = useState(false);

  const handleApplyPreset = (presetId: ThemePresetId) => {
    setSelectedPreset(presetId);
    if (presetId !== 'custom') {
      const presetData = THEME_PRESETS[presetId];
      const newTheme: ThemeConfig = {
        ...presetData,
        customImageUrl: '',
        overlayOpacity: opacity,
        overlayBlur: blur,
      };
      onSelectTheme(newTheme);
    } else {
      const newTheme: ThemeConfig = {
        preset: 'custom',
        name: 'Custom Wallpaper',
        subtitle: 'Personalized background image with dark overlay',
        bgColor: '#08040d',
        bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(225, 29, 72, 0.2) 0%, rgba(8, 4, 13, 0.95) 75%)',
        accentGradient: 'from-pink-600 via-rose-500 to-amber-500',
        previewColor: '#e11d48',
        customImageUrl: customUrl,
        overlayOpacity: opacity,
        overlayBlur: blur,
      };
      onSelectTheme(newTheme);
    }
  };

  const handleSaveCustom = (urlToUse?: string) => {
    const finalUrl = (urlToUse !== undefined ? urlToUse : customUrl).trim();
    setSelectedPreset('custom');
    const newTheme: ThemeConfig = {
      preset: 'custom',
      name: 'Custom Wallpaper',
      subtitle: 'Personalized background image with dark overlay',
      bgColor: '#08040d',
      bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(225, 29, 72, 0.2) 0%, rgba(8, 4, 13, 0.95) 75%)',
      accentGradient: 'from-rose-600 via-pink-600 to-amber-500',
      previewColor: '#e11d48',
      customImageUrl: finalUrl,
      overlayOpacity: opacity,
      overlayBlur: blur,
    };
    onSelectTheme(newTheme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#12071f] border border-white/10 rounded-3xl max-w-xl w-full p-6 shadow-[0_0_50px_rgba(244,63,94,0.25)] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,42,133,0.4)]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Atmosphere &amp; Theme
              </h3>
              <p className="text-xs text-slate-400">
                Choose a curated late-night mood or set a custom wallpaper
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          
          {/* Preset Palettes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Curated Moods
              </span>
              <span className="text-[11px] text-pink-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Live Atmosphere
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Crimson Velvet (Default Highlight) */}
              {(Object.keys(THEME_PRESETS) as Array<Exclude<ThemePresetId, 'custom'>>).map((key) => {
                const item = THEME_PRESETS[key];
                const isSelected = selectedPreset === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleApplyPreset(key)}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group overflow-hidden ${
                      isSelected
                        ? 'border-pink-500 bg-pink-500/10 shadow-[0_0_20px_rgba(244,63,94,0.3)] ring-1 ring-pink-500'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-5 h-5 rounded-full border border-white/20 shadow-inner shrink-0"
                          style={{ backgroundColor: item.previewColor }}
                        />
                        <span className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                          {item.name}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-white shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {item.subtitle}
                    </p>
                    {key === 'crimson_velvet' && (
                      <div className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                        <span>🔥 Intimate Romance &amp; Late Night</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Wallpaper Section */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-pink-400" />
                Custom Image Wallpaper
              </span>
              {selectedPreset === 'custom' && (
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold">
                  Active
                </span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Enter Wallpaper Image URL (HTTPS)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => {
                      setCustomUrl(e.target.value);
                      setImageError(false);
                    }}
                    placeholder="https://example.com/wallpaper.jpg"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-pink-500"
                  />
                  <button
                    onClick={() => handleSaveCustom()}
                    disabled={!customUrl.trim()}
                    className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-[0_0_12px_rgba(255,42,133,0.3)]"
                  >
                    Apply URL
                  </button>
                </div>
              </div>

              {/* Sample high-res wallpapers */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-2 font-medium">
                  Quick Wallpaper Inspiration:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SAMPLE_WALLPAPERS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCustomUrl(s.url);
                        handleSaveCustom(s.url);
                      }}
                      className="group relative h-16 rounded-xl overflow-hidden border border-white/10 hover:border-pink-500 transition-all cursor-pointer text-left"
                    >
                      <img
                        src={s.url}
                        alt={s.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors flex items-end p-1.5">
                        <span className="text-[10px] text-white font-semibold line-clamp-1">
                          {s.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fine-tuning Sliders (Darkness & Blur) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-pink-400" />
                      Overlay Darkness
                    </span>
                    <span className="font-mono text-pink-400">{Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="0.95"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setOpacity(val);
                      if (selectedPreset === 'custom') {
                        onSelectTheme({
                          ...currentTheme,
                          overlayOpacity: val,
                        });
                      }
                    }}
                    className="w-full accent-pink-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Keeps text legible over bright images</p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                    <span>Backdrop Blur</span>
                    <span className="font-mono text-pink-400">{blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="2"
                    value={blur}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setBlur(val);
                      if (selectedPreset === 'custom') {
                        onSelectTheme({
                          ...currentTheme,
                          overlayBlur: val,
                        });
                      }
                    }}
                    className="w-full accent-pink-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Softens high-contrast patterns</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              handleApplyPreset('crimson_velvet');
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Crimson Velvet</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white text-xs font-bold hover:brightness-110 shadow-[0_0_15px_rgba(255,42,133,0.35)] cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
