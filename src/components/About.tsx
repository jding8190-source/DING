import { motion } from 'motion/react';
import { useSiteSettings } from '../lib/settings';

export default function About() {
  const { settings } = useSiteSettings();

  const skills = settings.aboutSkills && settings.aboutSkills.length > 0
    ? settings.aboutSkills
    : ['Visual Systems', 'Digital Strategy', 'Interaction Design', 'Product Architecture', 'Spatial UI'];

  return (
    <section id="about" className="py-40 px-6 bg-[#080808] relative overflow-hidden border-t border-white/[0.03]">
      <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            <div>
              <span className="text-meta">Philosophy</span>
            </div>
            <h2 className="text-display text-[clamp(2.5rem,5vw,5rem)]">
              极致之美来源于 <br />
              <span className="text-zinc-600">秩序的延伸.</span>
            </h2>
            <p className="text-body max-w-xl leading-relaxed text-zinc-400">
              {settings.aboutPhilosophy || '设计不仅是视觉的堆砌，而是一种理性的秩序。我专注于在数字留白中探寻功能与情感的最佳平衡，让每一个像素都拥有其存在的必然性。'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-10">
              <span className="text-meta border-b border-white/10 pb-4 block">Expertise</span>
              <ul className="space-y-4">
                {skills.map((item) => (
                  <li key={item} className="text-label text-white">{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-10">
              <span className="text-meta border-b border-white/10 pb-4 block">About Me</span>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">
                {settings.aboutBio || '聚焦于极简、秩序感与空间深度的跨学科数字体验设计。致力于将尖端科技与高级极简视觉融汇一体。'}
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                  {settings.availableStatus || 'Available — 2024-2026'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-40 aspect-[21/9] bg-zinc-950 rounded-lg overflow-hidden border border-white/5"
        >
          <img 
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover grayscale opacity-20 hover:opacity-40 transition-opacity duration-1000"
            alt="Studio perspective"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>
    </section>
  );
}
