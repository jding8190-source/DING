import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export const staticExperiences = [
  {
    company: 'Global Creative Studio',
    role: 'Lead Product Designer',
    period: '2021 — Present',
    description: '负责核心产品的视觉系统构建与交互策略定义，主导了多个国际级数字化转型项目，提升用户参与度达 40% 以上。'
  },
  {
    company: 'Innovation Lab',
    role: 'Senior UI/UX Designer',
    period: '2018 — 2021',
    description: '专注于前沿实验性交互设计，在移动端体验与品牌数字化表达领域进行了深入探索，获得多项国际设计奖项。'
  },
  {
    company: 'Art & Tech Collective',
    role: 'Visual Designer',
    period: '2015 — 2018',
    description: '通过跨媒体的设计语言，为科技品牌提供极具叙事感的视觉解决方案，探索艺术与科技的交汇点。'
  }
];

export default function Experience() {
  const [experiences, setExperiences] = useState<any[]>(staticExperiences);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = query(collection(db, 'experiences'));
      unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          if (!querySnapshot.empty) {
            const fetchedExp = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setExperiences(fetchedExp);
          } else {
            setExperiences(staticExperiences);
          }
        },
        (error) => {
          console.warn('Realtime experiences listener info:', error);
          setExperiences(staticExperiences);
        }
      );
    } catch (err) {
      console.warn('Could not connect experiences listener:', err);
      setExperiences(staticExperiences);
    }
    return () => unsubscribe();
  }, []);

  return (
    <section id="experience" className="py-40 px-6 bg-[#080808] border-t border-white/[0.04] relative overflow-hidden">
      {/* Soft Ambient Refraction */}
      <div className="absolute top-[20%] right-[-15%] w-[50vw] h-[50vw] bg-amber-500/[0.02] blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-4">
            <div className="sticky top-40 space-y-4">
              <div className="apple-glass-capsule glass-rim-top px-3.5 py-1.5 rounded-full border border-white/15 inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                <span>Work History & Experience</span>
              </div>
              <h2 className="text-display text-4xl font-light text-white leading-tight">
                职业履历与经历 <br />
                <span className="text-zinc-600 font-serif italic text-2xl font-normal">curated milestones.</span>
              </h2>
            </div>
          </div>
          
          <div className="lg:col-span-8 space-y-8">
            {experiences.map((exp, index) => (
              <motion.div 
                key={exp.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="apple-glass-card apple-glass-interactive glass-rim-top p-7 sm:p-9 rounded-[2.2rem] border border-white/10 hover:border-white/25 shadow-xl transition-all duration-500 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h3 className="text-display text-2xl font-light tracking-tight text-white group-hover:text-amber-200/90 transition-colors">
                    {exp.role}
                  </h3>
                  <span className="apple-glass-capsule text-amber-300 border border-amber-400/30 px-3.5 py-1 rounded-full text-xs font-mono tracking-wider bg-amber-500/10 shadow-sm shrink-0 self-start sm:self-auto">
                    {exp.period}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-subheading text-sm font-semibold tracking-wide text-zinc-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>@{exp.company}</span>
                  </h4>
                  <p className="text-zinc-400 leading-relaxed font-light text-sm">
                    {exp.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
