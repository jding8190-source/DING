import { motion } from 'motion/react';
import { ArrowUpRight, Mail, MessageCircle, MapPin } from 'lucide-react';
import { useSiteSettings } from '../lib/settings';

export default function Contact() {
  const { settings } = useSiteSettings();
  const email = settings.contactEmail || 'jding8190@gmail.com';

  return (
    <section id="contact" className="py-60 px-6 bg-[#080808] relative overflow-hidden flex items-center min-h-[80vh]">
      {/* Soft Ambient Refraction Glow */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] bg-violet-600/[0.04] blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="space-y-8">
            <div className="apple-glass-capsule glass-rim-top px-3.5 py-1.5 rounded-full border border-white/15 inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
              <span>Contact & Collaboration</span>
            </div>
            <h2 className="text-display text-[clamp(2.5rem,5.5vw,5.5rem)] font-light leading-[1.05]">
              创造更有价值的 <br />
              <span className="text-zinc-500 font-serif italic font-normal">数字感官体验.</span>
            </h2>
            <p className="text-body max-w-md text-zinc-400">
              如果您有有趣的项目或合作想法，欢迎随时联系。我一直在寻找能够挑战传统并重塑交互的机会。
            </p>
          </div>

          <div className="apple-glass-card glass-rim-top p-8 sm:p-12 rounded-[2.5rem] border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.7)] space-y-10">
            <motion.a 
              href={`mailto:${email}`}
              className="group block space-y-3 cursor-pointer"
            >
              <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 block font-semibold">
                Direct Communication / 邮件联络
              </span>
              <div className="flex items-center justify-between gap-4">
                <span className="text-display text-[clamp(1.2rem,2.2vw,2.4rem)] text-white group-hover:text-amber-300 transition-colors break-all font-light">
                  {email}
                </span>
                <div className="w-11 h-11 rounded-full apple-glass-button flex items-center justify-center shrink-0 shadow-lg">
                  <ArrowUpRight size={18} className="text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </motion.a>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/10">
              {settings.contactWechat && (
                <div className="apple-glass p-4 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 flex items-center gap-1.5">
                    <MessageCircle size={12} className="text-emerald-400" /> WeChat 微信
                  </span>
                  <p className="text-sm text-zinc-100 font-mono font-medium">{settings.contactWechat}</p>
                </div>
              )}
              <div className="apple-glass p-4 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 flex items-center gap-1.5">
                  <MapPin size={12} className="text-blue-400" /> Location 所在地
                </span>
                <p className="text-sm text-zinc-100 font-sans">
                  {settings.contactLocation || 'Shanghai / Global · Remote Available'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
