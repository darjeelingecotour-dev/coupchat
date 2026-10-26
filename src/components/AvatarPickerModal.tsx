import React, { useState } from 'react';
import { X, Check, Camera, Sparkles, Image as ImageIcon } from 'lucide-react';
import { AVATAR_PRESETS } from '../types';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSelectAvatar: (avatarUrl: string) => void;
  currentAlias?: string;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSelectAvatar,
  currentAlias = 'You',
}) => {
  const [customUrl, setCustomUrl] = useState('');
  const [selected, setSelected] = useState(currentAvatar);

  if (!isOpen) return null;

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onSelectAvatar(customUrl.trim());
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onSelectAvatar(reader.result);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#110724] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-pink-500/20 text-pink-400">
              <Camera className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-white">Choose Your Profile Picture</h3>
              <p className="text-[11px] text-slate-400">Visible to all entered users in chat and lounges</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Avatar Preview */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="relative">
            <img
              src={selected}
              alt="Avatar Preview"
              className="w-14 h-14 rounded-full object-cover ring-2 ring-pink-500 shadow-md"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#110724]" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">{currentAlias}</span>
            <span className="text-[11px] text-emerald-400 font-medium">● Real User Status: Online</span>
          </div>
        </div>

        {/* Preset Avatars Grid */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Aesthetic Profile Avatars
          </span>
          <div className="grid grid-cols-4 gap-3">
            {AVATAR_PRESETS.map((avatar) => {
              const isChosen = selected === avatar.url;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => {
                    setSelected(avatar.url);
                    onSelectAvatar(avatar.url);
                  }}
                  className={`relative p-1 rounded-2xl transition-all cursor-pointer group flex flex-col items-center gap-1 ${
                    isChosen
                      ? 'bg-pink-600/30 ring-2 ring-pink-500 shadow-[0_0_15px_rgba(255,42,133,0.4)]'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.name}
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-white/20 group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[9px] text-slate-400 truncate max-w-full text-center">
                    {avatar.name}
                  </span>
                  {isChosen && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px]">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Upload or URL */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            Or Upload / Enter Photo URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://... photo link"
              className="flex-1 bg-white/[0.04] border border-white/15 focus:border-pink-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={handleApplyCustom}
              disabled={!customUrl.trim()}
              className="px-3.5 py-2 rounded-xl bg-pink-600 disabled:opacity-40 text-white text-xs font-bold hover:brightness-110 cursor-pointer"
            >
              Apply
            </button>
          </div>

          <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-white/20 hover:border-pink-500/50 text-xs text-slate-300 hover:text-white cursor-pointer transition-colors">
            <ImageIcon className="w-4 h-4 text-pink-400" />
            <span>Upload photo from your device</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-xs shadow-md cursor-pointer hover:brightness-110"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
