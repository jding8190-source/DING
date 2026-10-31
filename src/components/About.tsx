import { motion } from 'motion/react';

export default function About() {
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
            <p className="text-body max-w-xl">
              设计不仅是视觉的堆砌，而是一种理性的秩序。我专注于在数字留白中探寻功能与情感的最佳平衡，让每一个像素都拥有其存在的必然性。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-10">
              <span className="text-meta border-b border-white/10 pb-4 block">Expertise</span>
              <ul className="space-y-4">
                {['Visual Systems', 'Digital Strategy', 'Interaction Design', 'Product Architecture'].map((item) => (
                  <li key={item} className="text-label text-white">{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-10">
              <span className="text-meta border-b border-white/10 pb-4 block">Experience</span>
              <div className="space-y-6">
                <div className="space-y-1">
                  <h4 className="text-subheading font-semibold text-white text-[14px]">Lead Product Designer</h4>
                  <p className="text-meta text-[10px] text-zinc-500 tracking-wider uppercase">Global Creative Studio · 2021 — 2024</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-subheading font-semibold text-white text-[14px]">Senior UI/UX Designer</h4>
                  <p className="text-meta text-[10px] text-zinc-500 tracking-wider uppercase">Innovation Lab · 2018 — 2021</p>
                </div>
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
