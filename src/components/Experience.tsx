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
    <section id="experience" className="py-40 px-6 bg-[#080808] border-t border-white/[0.03]">
      <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-4">
            <span className="text-meta sticky top-40 text-amber-400/80">Work History & Experience</span>
            <h2 className="text-display text-3xl font-light text-white mt-4">职业履历与经历</h2>
          </div>
          
          <div className="lg:col-span-8 space-y-24">
            {experiences.map((exp, index) => (
              <motion.div 
                key={exp.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-4">
                  <h3 className="text-display text-2xl font-light tracking-tight text-white">{exp.role}</h3>
                  <span className="font-mono text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                    {exp.period}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-subheading text-base font-medium text-zinc-300">
                    @{exp.company}
                  </h4>
                  <p className="text-body max-w-2xl text-zinc-400 leading-relaxed font-light text-sm">
                    {exp.description}
                  </p>
                </div>
                
                {/* Visual Separator */}
                <div className="mt-12 w-full h-px bg-white/[0.04] origin-left scale-x-100 transition-transform duration-1000" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
