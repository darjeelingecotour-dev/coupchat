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
      q: 'Is Coupchat really 100% anonymous and free?',
      a: 'Yes. Coupchat never requires an account, email, phone number, or social login. You are assigned a random pseudonymous identifier (e.g., Stranger #842) on each connection. No personal details are ever collected.',
    },
    {
      q: 'How does Coupchat compare to Subichat.in?',
      a: 'Coupchat is built as the ultimate modern alternative to Subichat with a dedicated late-night velvet & neon aesthetic, strict RAM-only ephemerality, real-time typing indicators, integrated GIF reactions, and automatic tap-to-reveal safety filters on all photos and video clips.',
    },
    {
      q: 'What happens to messages, images, and video clips after the chat?',
      a: 'They are completely destroyed. Coupchat has zero persistent database storage. The millisecond either participant clicks NEXT, refreshes the tab, or closes the window, the session room is dissolved and all message text, images, and clips are instantly purged from server memory.',
    },
    {
      q: 'How does the Sensitive Media Tap-to-Reveal filter work?',
      a: 'Whenever someone uploads an image or short video clip, Coupchat automatically renders it with a heavy Gaussian blur and a "Sensitive Media" overlay. The recipient must intentionally tap the overlay to view it. This prevents unprompted NSFW exposure.',
    },
    {
      q: 'Can I choose who I want to chat with?',
      a: 'Yes. On the Coupchat match terminal, you can set your gender identity ("I Am A") and your preference ("Seeking: Girls, Guys, or Everyone"), as well as your desired conversation vibe (Late-Night Secrets, Flirting & Sparks, Deep Talks, or Wild Card).',
    },
    {
      q: 'What should I do if a stranger is being abusive or inappropriate?',
      a: 'Click the Flag / Report button at the top of the chat room. The stranger is immediately flagged, the session terminates, and you are automatically routed to a brand-new stranger.',
    },
  ];

  return (
    <div className="w-full space-y-20 py-12 border-t border-white/[0.06] bg-[#07030e]">
      


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
