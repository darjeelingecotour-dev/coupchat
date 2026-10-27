import React, { useState } from 'react';
import {
  ChevronDown,
  Shield,
  Zap,
  Lock,
  EyeOff,
  Flame,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

interface SeoSectionsProps {
  onStartChat: () => void;
}

export const SeoSections: React.FC<SeoSectionsProps> = ({ onStartChat }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Can I talk with Indian strangers in Hindi and regional languages on Coupchat?',
      a: 'Yes! Coupchat features dedicated Hindi chat lounges as well as Punjabi, Bengali, Marathi, Telugu, Kannada, and Bhojpuri regional rooms. You can also match 1-on-1 with Indian strangers across the world instantly without creating an account.',
    },
    {
      q: 'How does Coupchat compare to SubiChat.in?',
      a: 'Coupchat is the high-performance modern alternative to SubiChat. While traditional Indian stranger chat sites like SubiChat require guest registrations or logins and feature cluttered interfaces, Coupchat requires zero signup, operates 100% in ephemeral RAM with zero stored chat histories, and offers built-in tap-to-reveal blurred media protection.',
    },
    {
      q: 'Is Coupchat really 100% anonymous and free?',
      a: 'Yes. Coupchat never requires an account, email, phone number, or social login. You are assigned a random pseudonymous identifier (e.g., Velvet Panther) on each connection. No personal details or cookies are ever stored.',
    },
    {
      q: 'What happens to messages, images, and video clips after the chat?',
      a: 'They are completely incinerated. Coupchat has zero persistent database storage. The millisecond either participant clicks NEXT, leaves the lounge, or closes their browser, all session text, images, and clips are instantly purged from volatile server memory.',
    },
    {
      q: 'How does the Sensitive Media Tap-to-Reveal filter work?',
      a: 'Whenever someone uploads an image or video clip, Coupchat automatically renders it with a heavy Gaussian blur and a "Sensitive Media" overlay. The recipient must intentionally tap the overlay to view it, preventing unwanted surprises.',
    },
    {
      q: 'What are the rules for Indian stranger chat rooms?',
      a: 'Respect all participants, never share personal financial or contact info (such as UPI, phone numbers, or passwords), avoid spamming or advertisements, and keep conversations consensual. Violations result in an immediate automatic ban.',
    },
  ];

  const regionalRooms = [
    { name: '🇮🇳 Hindi Chat Rooms', desc: 'Desi gupshup, Bollywood & late-night talks', tag: 'Hindi' },
    { name: '🪘 Punjabi Chat Rooms', desc: 'Bhangra beats, Punjab diyan gallan & fun', tag: 'Punjabi' },
    { name: '☕ Bangla Chat Rooms', desc: 'Kolkata adda, poetry, cinema & music', tag: 'Bengali' },
    { name: '☕ Marathi Chat Rooms', desc: 'Marathi katta, Mumbai/Pune night owls', tag: 'Marathi' },
    { name: '🌴 Telugu Chat Rooms', desc: 'Tollywood, casual banter & tech talks', tag: 'Telugu' },
    { name: '🌴 Kannada Chat Rooms', desc: 'Bengaluru vibes, chill music & conversations', tag: 'Kannada' },
    { name: '🎉 Bhojpuri Chat Rooms', desc: 'Desi entertainment, jokes & energetic banter', tag: 'Bhojpuri' },
    { name: '🌐 English Chat Rooms', desc: 'Global discussions, gaming & deep talks', tag: 'English' },
  ];

  return (
    <div className="w-full space-y-20 py-12 border-t border-white/[0.06] bg-transparent">
      
      {/* SECTION 1: Indian Stranger Chat & Regional Language Lounges (SEO Pillar) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider">
            <span>🇮🇳 Indian Stranger Chat &amp; Hindi Lounges</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Connect With Indian Strangers in Your Native Language
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Looking for authentic <strong>Indian chat talk with strangers</strong>? Coupchat offers real-time stranger chat rooms across Indian languages, from late-night Hindi gupshup to regional cultural lounges.
          </p>
        </div>

        {/* Regional Rooms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {regionalRooms.map((room, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-rose-500/40 hover:bg-rose-500/[0.04] transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                  {room.name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                  {room.tag}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                {room.desc}
              </p>
              <button
                onClick={onStartChat}
                className="text-xs font-bold text-rose-400 group-hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Join Lounge</span>
                <span>&rarr;</span>
              </button>
            </div>
          ))}
        </div>
      </section>
      


      {/* SECTION 3: Safety & Community Etiquette */}
      <section id="safety" className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold tracking-wider uppercase text-pink-400">
              Safety First
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              A Playful Lounge Built on Strict Boundaries
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Coupchat is designed for adults looking to connect freely without compromising their security or peace of mind.
            </p>
            <ul className="space-y-3 pt-2 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <span><strong>Never share real personal info:</strong> Keep your real full name, location, social handles, and financial details private.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <span><strong>Zero tolerance for non-consensual content:</strong> Inappropriate harassment results in an instant IP ban.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <span><strong>Strictly 18+:</strong> Coupchat is exclusively for adults of legal age. Minors are strictly prohibited.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-3xl bg-[#0e071f] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Safe Flirting Tips</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Keep the conversation fun and playful. If a stranger makes you uncomfortable for any reason, tap the <strong>NEXT</strong> button immediately. There are tens of thousands of other fascinating people waiting.
            </p>
            <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-200">
              💡 <strong>Pro Tip:</strong> Use the mystery presets or send funny GIFs first to break the ice smoothly.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: SEO FAQ Accordion */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-wider uppercase text-pink-400">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-1 mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-400">
            Everything you need to know about Coupchat&apos;s privacy, matching, and safety protocols.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/5 bg-[#0f0722]/90 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-white hover:text-pink-300 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-pink-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Card */}
        <div className="mt-14 p-8 rounded-3xl bg-gradient-to-r from-pink-900/30 via-[#16082b] to-violet-900/30 border border-pink-500/20 text-center space-y-4">
          <h3 className="text-2xl font-black text-white">
            Ready to ignite an anonymous connection?
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Step into the Coupchat late-night lounge right now. No sign-up, no strings attached.
          </p>
          <button
            onClick={onStartChat}
            className="px-7 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 font-extrabold text-white text-xs sm:text-sm shadow-[0_0_20px_rgba(255,42,133,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            START CHATTING NOW
          </button>
        </div>
      </section>

    </div>
  );
};
