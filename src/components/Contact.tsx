import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-60 px-6 bg-[#080808] relative overflow-hidden flex items-center min-h-[80screen]">
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
            <p className="text-body max-w-md">
              如果您有有趣的项目或合作想法，欢迎随时联系。我一直在寻找能够挑战传统并重塑交互的机会。
            </p>
          </div>

          <div className="space-y-20">
            <motion.a 
              href="mailto:jding8190@gmail.com"
              whileHover={{ x: 10 }}
              className="group block space-y-4"
            >
              <span className="text-meta opacity-40">Email me at</span>
              <div className="flex items-center gap-6">
                <span className="text-display text-[clamp(1.5rem,3vw,3.5rem)] group-hover:text-zinc-400 transition-colors">
                  jding8190@gmail.com
                </span>
                <ArrowUpRight size={32} className="text-white group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
              </div>
            </motion.a>

            <div className="grid grid-cols-2 gap-12 pt-12 border-t border-white/[0.03]">
              <div className="space-y-6">
                <span className="text-meta opacity-40">Social</span>
                <div className="flex flex-col gap-3">
                  {['LinkedIn', 'Instagram', 'Dribbble'].map((social) => (
                    <a key={social} href="#" className="text-label hover:text-white transition-colors">{social}</a>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <span className="text-meta opacity-40">Location</span>
                <p className="text-label">Shanghai / Global <br /> <span className="opacity-40">Available for remote work</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
