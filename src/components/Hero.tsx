import { useState, useEffect, ChangeEvent, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDownRight, Upload, RotateCcw } from 'lucide-react';

const DEFAULT_HERO_BG = './hero_bg.png';
const FALLBACK_DARK_BG = './hero_bg.png';

export default function Hero() {
  const [imgSrc, setImgSrc] = useState<string>(DEFAULT_HERO_BG);
  const [isCustom, setIsCustom] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Clear any old legacy cache and load custom background if explicitly set
  useEffect(() => {
    localStorage.removeItem('hero_custom_bg'); // Purge previous test cache
    const saved = localStorage.getItem('hero_custom_bg_v2');
    if (saved) {
      setImgSrc(saved);
      setIsCustom(true);
    }
  }, []);

  const handleImageError = () => {
    if (imgSrc === DEFAULT_HERO_BG) {
      // Fallback to high-res dark fluid art if relative local asset path fails
      setImgSrc(FALLBACK_DARK_BG);
    } else if (imgSrc !== FALLBACK_DARK_BG) {
      setImgSrc(FALLBACK_DARK_BG);
    }
  };

  const processImageFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImgSrc(base64String);
        setIsCustom(true);
        try {
          localStorage.setItem('hero_custom_bg_v2', base64String);
        } catch (err) {
          console.warn('Storage limit exceeded, custom image shown in session only.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleResetImage = () => {
    localStorage.removeItem('hero_custom_bg_v2');
    setImgSrc(DEFAULT_HERO_BG);
    setIsCustom(false);
  };

  return (
    <section 
      id="hero" 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-screen relative flex flex-col justify-end pb-24 pt-40 px-6 lg:px-16 overflow-hidden bg-[#050505]"
    >
      
      {/* Background Image: cinematic, full-bleed, full screen container */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden pointer-events-none">
        {imgSrc ? (
          <>
            <img 
              src={imgSrc}
              onError={handleImageError}
              className="w-full h-full object-cover object-[center_35%] lg:object-center transition-transform duration-[3000ms] ease-out scale-[1.01] opacity-90"
              alt="Dark Cinematic Workspace Base"
              referrerPolicy="no-referrer"
            />
            {/* Ambient vignette and dark contrast overlays to maintain luxury dark aesthetic */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/50 via-transparent to-[#050505]/50 pointer-events-none" />
          </>
        ) : null}
      </div>

      {/* Drag and Drop Minimalist Overlay Indicator */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-md pointer-events-none"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="border-2 border-dashed border-amber-500/50 rounded-2xl p-12 max-w-md w-full text-center space-y-6 bg-[#080808]"
            >
              <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                <Upload size={28} className="animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="font-sans text-lg font-bold tracking-tight text-white uppercase">
                  Drop Your Reference Image
                </h3>
                <p className="font-sans text-[11px] text-zinc-400 leading-relaxed uppercase tracking-widest">
                  Release to apply as your instant hero background
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating elegant content over the background */}
      <div className="max-w-[1440px] mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
        
        {/* Left Aligned Content aligned to negative space */}
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
              <span>Creative Exhibition Lab</span>
            </motion.div>
            
            <h1 className="text-display text-[clamp(4.5rem,12vw,12rem)] font-light tracking-[-0.06em] leading-[0.75] uppercase text-white select-none">
              DESIGN
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
              Enter Exhibition
              <ArrowDownRight size={14} className="group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-300" />
            </button>
          </motion.div>
        </motion.div>

        {/* Right Corner: Small minimalist stats/details & custom background upload panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="lg:col-span-4 flex flex-col items-start lg:items-end gap-5 text-right font-mono text-[10px] text-zinc-300 uppercase tracking-widest"
        >
          {/* Custom image upload button styled elegantly in the layout */}
          <div className="flex flex-col items-start lg:items-end space-y-2">
            <span className="text-zinc-500 text-[8px] tracking-widest">HERO EXHIBIT BACKGROUND</span>
            
            <div className="flex flex-wrap items-center gap-2">
              {isCustom && (
                <button 
                  onClick={handleResetImage}
                  className="group flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-sm px-2.5 py-1 text-[8px] font-medium tracking-wider transition-all duration-300 cursor-pointer"
                  title="Restore default background image"
                >
                  <RotateCcw size={10} />
                  RESET
                </button>
              )}
              
              <label className="group flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white rounded-sm px-2.5 py-1 text-[8px] font-bold tracking-wider transition-all duration-300 cursor-pointer border border-white/5">
                <Upload size={10} className="text-zinc-400 group-hover:scale-110 transition-transform" />
                UPLOAD YOUR IMAGE
                <input 
                  type="file" 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </label>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
