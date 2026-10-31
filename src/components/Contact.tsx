import { motion } from 'motion/react';
import { ArrowUpRight, Mail, MessageCircle, MapPin } from 'lucide-react';
import { useSiteSettings } from '../lib/settings';

export default function Contact() {
  const { settings } = useSiteSettings();
  const email = settings.contactEmail || 'jding8190@gmail.com';

  return (
    <section id="contact" className="py-60 px-6 bg-[#080808] relative overflow-hidden flex items-center min-h-[80vh]">
      <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div>
              <span className="text-meta">Contact</span>
            </div>
            <h2 className="text-display text-[clamp(2.5rem,6vw,6.5rem)]">
              创造更有价值的 <br />
              <span className="text-zinc-600">数字体验.</span>
            </h2>
            <p className="text-body max-w-md text-zinc-400">
              如果您有有趣的项目或合作想法，欢迎随时联系。我一直在寻找能够挑战传统并重塑交互的机会。
            </p>
          </div>

          <div className="space-y-16">
            <motion.a 
              href={`mailto:${email}`}
              whileHover={{ x: 10 }}
              className="group block space-y-4"
            >
              <span className="text-meta opacity-40">Email me at</span>
              <div className="flex items-center gap-6">
                <span className="text-display text-[clamp(1.2rem,2.5vw,3rem)] text-white group-hover:text-amber-400 transition-colors break-all">
                  {email}
                </span>
                <ArrowUpRight size={28} className="text-white group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform shrink-0" />
              </div>
            </motion.a>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-10 border-t border-white/[0.04]">
              {settings.contactWechat && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 flex items-center gap-1.5">
                    <MessageCircle size={12} /> WeChat 微信
                  </span>
                  <p className="text-sm text-zinc-200 font-mono">{settings.contactWechat}</p>
                </div>
              )}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 flex items-center gap-1.5">
                  <MapPin size={12} /> Location 所在地
                </span>
                <p className="text-sm text-zinc-200 font-sans">
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
