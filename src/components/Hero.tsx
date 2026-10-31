import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowDownRight } from 'lucide-react';
import { useSiteSettings } from '../lib/settings';

const DEFAULT_HERO_BG = './hero_bg.webp';

export default function Hero() {
  const { settings } = useSiteSettings();
  const [imgSrc, setImgSrc] = useState<string>(
    settings.heroBgUrl === './hero_bg.png' ? DEFAULT_HERO_BG : (settings.heroBgUrl || DEFAULT_HERO_BG)
  );

  useEffect(() => {
    if (settings.heroBgUrl) {
      setImgSrc(settings.heroBgUrl === './hero_bg.png' ? DEFAULT_HERO_BG : settings.heroBgUrl);
    }
  }, [settings.heroBgUrl]);

  const handleImageError = () => {
    setImgSrc('./hero_bg.png');
  };

  return (
    <section 
      id="hero" 
      className="min-h-screen relative flex flex-col justify-end pb-24 pt-40 px-6 lg:px-16 overflow-hidden bg-[#050505]"
    >
      
      {/* Background Image: cinematic, full-bleed, full screen container */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden pointer-events-none">
        {imgSrc && (
          <>
            <img 
              src={imgSrc}
              onError={handleImageError}
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover object-[center_35%] lg:object-center transition-transform duration-[3000ms] ease-out scale-[1.01] opacity-90"
              alt="Dark Cinematic Workspace Base"
              referrerPolicy="no-referrer"
            />
            {/* Ambient vignette and dark contrast overlays to maintain luxury dark aesthetic */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/50 via-transparent to-[#050505]/50 pointer-events-none" />
          </>
        )}
      </div>

      {/* Floating elegant content over the background */}
      <div className="max-w-[1440px] mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
        
        {/* Left Aligned Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-8 space-y-8"
        >
          <div className="space-y-4 -translate-y-[200px]">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center text-zinc-400 font-medium tracking-widest text-xs uppercase"
            >
              <span>{settings.heroTagline || 'Creative Exhibition Lab'}</span>
            </motion.div>
            
            <h1 className="text-display text-[clamp(4.5rem,12vw,12rem)] font-light tracking-[-0.06em] leading-[0.75] uppercase text-white select-none">
              {settings.heroHeadline || 'DESIGN'}
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-6 flex flex-wrap items-center gap-6 -translate-y-[200px]"
          >
            <button 
              onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })}
              className="group flex items-center gap-4 bg-white hover:bg-neutral-200 text-black px-10 py-4.5 rounded-full transition-all duration-300 cursor-pointer text-xs font-semibold tracking-widest uppercase shadow-2xl hover:scale-[1.02]"
            >
              {settings.heroCtaText || 'Enter Exhibition'}
              <ArrowDownRight size={14} className="group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-300" />
            </button>
          </motion.div>
        </motion.div>

        {/* Right Corner: Sleek exhibit curation status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="lg:col-span-4 flex flex-col items-start lg:items-end gap-3 text-right font-mono text-[10px] text-zinc-400 uppercase tracking-widest -translate-y-[200px] lg:-translate-y-[200px]"
        >
          <div className="flex items-center gap-2 text-zinc-400 text-[10px] bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{settings.heroExhibitTag || 'PORTFOLIO CURATION 2024-2026'}</span>
          </div>
          <span className="text-zinc-500 text-[9px] tracking-widest">
            {settings.heroLocation || 'SHANGHAI / TOKYO / REMOTE'}
          </span>
        </motion.div>

      </div>
    </section>
  );
}
