import { motion, AnimatePresence } from 'motion/react';
import { projects as staticProjects } from '../constants';
import { 
  ArrowUpRight, 
  Loader2, 
  Layers, 
  Sliders, 
  Eye, 
  Sparkles, 
  Compass, 
  Calendar, 
  Briefcase, 
  User,
  Shuffle,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore';

import { useSiteSettings } from '../lib/settings';

export default function ProjectGrid() {
  const { settings } = useSiteSettings();
  const categories = useMemo(() => {
    const list = settings.categories && settings.categories.length > 0 
      ? settings.categories 
      : ['全部', '项目应用', '品牌视觉', '运营设计'];
    return list.includes('全部') ? list : ['全部', ...list];
  }, [settings.categories]);

  const [activeCategory, setActiveCategory] = useState('全部');
  const [projects, setProjects] = useState<any[]>(staticProjects);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // iOS-style Interactive Custom Controls
  const [imageScale, setImageScale] = useState(1.05); // Controls cover image scale (1.0 to 1.25)
  const [maskOpacity, setMaskOpacity] = useState(0.4); // Controls dark vignette opacity (0.1 to 0.8)
  const [autoplay, setAutoplay] = useState(false); // Play status
  const [isDrawing, setIsDrawing] = useState(false);

  // Real-time synchronization with Firestore
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    try {
      const q = query(collection(db, 'projects'), orderBy('year', 'desc'));
      unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          if (!querySnapshot.empty) {
            const fetchedProjects = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setProjects(fetchedProjects);
          } else {
            setProjects(staticProjects);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error listening to projects:', error);
          setProjects(staticProjects);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Firestore snapshot setup error:', err);
      setProjects(staticProjects);
      setLoading(false);
    }
    return () => unsubscribe();
  }, []);

  const filteredProjects = useMemo(() => {
    return activeCategory === '全部' 
      ? projects 
      : projects.filter(p => p.category === activeCategory);
  }, [projects, activeCategory]);

  const filteredLength = filteredProjects.length;

  // Handle auto reset activeIndex if categories change
  useEffect(() => {
    if (activeIndex >= filteredLength) {
      setActiveIndex(0);
    }
  }, [filteredLength, activeIndex]);

  // Autoplay handler (simulated iOS slideshow engine)
  useEffect(() => {
    let interval: any;
    if (autoplay && filteredLength > 1 && !isDrawing) {
      interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % filteredLength);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [autoplay, filteredLength, isDrawing]);

  // Trigger smooth random gacha draw
  const handleRandomDraw = () => {
    if (isDrawing || filteredProjects.length <= 1) return;
    setIsDrawing(true);
    let count = 0;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        let next = prev;
        while (next === prev && filteredProjects.length > 1) {
          next = Math.floor(Math.random() * filteredProjects.length);
        }
        return next;
      });
      count++;
      if (count >= 6) {
        clearInterval(interval);
        setIsDrawing(false);
      }
    }, 120);
  };

  const activeProject = filteredProjects[activeIndex] || filteredProjects[0] || projects[0];

  return (
    <section id="work" className="py-32 px-6 bg-[#050505] min-h-screen relative overflow-hidden">
      
      {/* iOS Fluid Ambient Backdrops */}
      <div className="absolute top-[10%] left-[-10%] w-[60vw] h-[60vw] bg-sky-500/[0.02] blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-10%] w-[55vw] h-[55vw] bg-violet-600/[0.03] blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[20%] w-[50vw] h-[50vw] bg-amber-500/[0.02] blur-[130px] rounded-full pointer-events-none z-0" />

      <div className="max-w-[1440px] mx-auto w-full relative z-10 px-4 md:px-10 lg:px-14">
        
        {/* Header Section */}
        <header className="mb-20 flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-white/[0.06] pb-10">
          <div className="max-w-2xl">
            <div className="mb-3.5 inline-flex items-center gap-2 apple-glass-capsule glass-rim-top px-3.5 py-1 rounded-full border border-white/15">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-300 font-semibold">Exhibition Hall / Liquid Glass</span>
            </div>
            <h2 className="text-display text-[clamp(2.5rem,5.2vw,4.8rem)] font-bold text-white tracking-[-0.03em] leading-[1.05] uppercase">
              作品展示展销空间 <br />
              <span className="text-zinc-500 lowercase font-serif italic tracking-wide font-normal">crafted fluid glassmorphism.</span>
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Apple Styled Segmented Control (Liquid Glass capsule slider) */}
            <div className="relative flex apple-glass-capsule glass-rim-top p-1.5 rounded-full border border-white/20 shadow-[0_16px_36px_rgba(0,0,0,0.5)]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setActiveIndex(0);
                  }}
                  className="relative z-10 px-5 py-2 font-sans text-[11px] font-bold tracking-wider uppercase transition-all duration-300"
                >
                  {activeCategory === cat && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-gradient-to-b from-white to-zinc-200 rounded-full shadow-[0_4px_16px_rgba(255,255,255,0.35)] z-0"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 transition-colors duration-300 ${activeCategory === cat ? 'text-black' : 'text-zinc-400 hover:text-white'}`}>
                    {cat}
                  </span>
                </button>
              ))}
            </div>

            {/* Apple Liquid Glass Gacha Cycle Button */}
            <button
              onClick={handleRandomDraw}
              disabled={isDrawing || filteredProjects.length <= 1}
              className="apple-glass-capsule apple-glass-interactive glass-rim-top flex items-center gap-2.5 px-6 py-2.5 rounded-full text-zinc-300 hover:text-white border border-white/20 hover:border-white/40 text-[11px] font-mono tracking-wider uppercase transition-all duration-300 disabled:opacity-40 font-bold active:scale-95 shadow-lg"
            >
              <Shuffle size={12} className={isDrawing ? 'animate-spin' : ''} />
              <span>随机抽选</span>
            </button>
          </div>
        </header>

        {loading ? (
          <div className="py-40 flex justify-center items-center">
            <Loader2 className="animate-spin text-zinc-600" size={36} />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-24 text-center">
            <span className="text-body block text-zinc-500 font-light">在该分类下暂未上传作品项目。</span>
          </div>
        ) : (
          <div className="space-y-24">
            
            {/* 1. Primary iOS Showcase Dashboard: Bento Board Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* [Today Story Widget Card] - Aspect ratio 4:5 - Columns 1-7 */}
              <div className="xl:col-span-7">
                <div className="apple-glass-card glass-rim-top relative group overflow-hidden rounded-[2.5rem] border border-white/20 shadow-[0_35px_80px_rgba(0,0,0,0.75)]">
                  
                  {/* Aspect Ratio Box (forces responsive layout scaling) */}
                  <div className="relative aspect-[4/5] sm:aspect-[4/3] xl:aspect-[1.1] w-full overflow-hidden">
                    
                    {/* Cover Image inside iOS Squircle Frame */}
                    {activeProject.imageUrl ? (
                      <motion.img 
                        key={activeProject.id}
                        initial={{ scale: imageScale + 0.05, opacity: 0.85 }}
                        animate={{ scale: imageScale, opacity: 1 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        src={activeProject.imageUrl} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform"
                        alt={activeProject.title}
                        referrerPolicy="no-referrer"
                      />
                    ) : null}

                    {/* Gradient & Light dark overlay vignette (Adjusted live by Slider!) */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-300 pointer-events-none z-10"
                      style={{ opacity: maskOpacity + 0.2 }}
                    />
                    <div 
                      className="absolute inset-0 bg-black/35 pointer-events-none z-10"
                      style={{ opacity: maskOpacity }}
                    />

                    {/* Glass Bevel Highlight overlay */}
                    <div className="absolute inset-0 border border-white/10 rounded-[2.5rem] pointer-events-none z-20" />

                    {/* Apple Today App Style Float Badge */}
                    <div className="absolute top-6 left-6 z-20 flex gap-2">
                      <span className="apple-glass-capsule glass-rim-top border border-white/20 px-4 py-1.5 rounded-full text-[9px] font-bold tracking-widest text-white uppercase shadow-lg">
                        {activeProject.category}
                      </span>
                      <span className="apple-glass-capsule border border-amber-400/30 px-4 py-1.5 rounded-full text-[9px] font-bold tracking-widest text-amber-300 uppercase shadow-lg flex items-center gap-1.5 bg-amber-500/10">
                        <Sparkles size={10} className="animate-spin text-amber-400" />
                        LIQUID GLASS
                      </span>
                    </div>

                    {/* Left corner: Apple Liquid Glass info card */}
                    <div className="absolute bottom-6 left-6 right-6 z-20">
                      <div className="apple-glass-capsule glass-rim-top p-6 sm:p-7 rounded-[2rem] text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl border border-white/25">
                        
                        <div className="space-y-1.5 max-w-md">
                          <span className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            FEATURED EXHIBIT
                          </span>
                          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white line-clamp-2">
                            {activeProject.title}
                          </h3>
                          <p className="text-xs text-zinc-300 line-clamp-1 font-light">
                            {activeProject.description}
                          </p>
                        </div>

                        {/* IOS Styled CTA Button (App Store "GET / OPEN" design) */}
                        <Link 
                          to={`/project/${activeProject.id}`}
                          className="group bg-white text-black hover:bg-neutral-100 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 self-stretch md:self-auto text-center shrink-0 shadow-[0_4px_20px_rgba(255,255,255,0.25)] active:scale-95"
                        >
                          <span>探索详情</span>
                          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* [Control Center Bento Widget Column] - Columns 8-12 */}
              <div className="xl:col-span-5 flex flex-col gap-6">

                {/* Dashboard Card B: Elegant Spec sheet (Apple Liquid Glass Metadata display) */}
                <div className="apple-glass-card glass-rim-top p-6 sm:p-8 rounded-[2.5rem] border border-white/15 shadow-2xl flex flex-col justify-between gap-6 min-h-[290px]">
                  
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Eye size={14} className="text-blue-400" />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-zinc-300">INFO MODULE / 作品明细卡</span>
                    </div>
                    
                    {/* Grid Specs with Apple liquid frosted tiles */}
                    <div className="grid grid-cols-2 gap-3.5 pb-4 border-b border-white/[0.08]">
                      
                      <div className="space-y-1 apple-glass p-3 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <Layers size={11} className="text-blue-400" />
                          <span className="text-[9px] font-mono uppercase tracking-wider">类别</span>
                        </div>
                        <span className="text-white text-xs font-semibold block">{activeProject.category}</span>
                      </div>

                      <div className="space-y-1 apple-glass p-3 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <Calendar size={11} className="text-emerald-400" />
                          <span className="text-[9px] font-mono uppercase tracking-wider">年份</span>
                        </div>
                        <span className="text-white text-xs font-semibold block">{activeProject.year || '2024'}</span>
                      </div>

                      <div className="space-y-1 apple-glass p-3 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <Briefcase size={11} className="text-amber-400" />
                          <span className="text-[9px] font-mono uppercase tracking-wider">客户</span>
                        </div>
                        <span className="text-white text-xs font-semibold block truncate">{activeProject.client || '创意设计'}</span>
                      </div>

                      <div className="space-y-1 apple-glass p-3 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <User size={11} className="text-purple-400" />
                          <span className="text-[9px] font-mono uppercase tracking-wider">角色</span>
                        </div>
                        <span className="text-white text-xs font-semibold block truncate">{activeProject.role || '主导设计'}</span>
                      </div>

                    </div>

                    {/* Summary text */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 block font-semibold">概念大纲</span>
                      <p className="text-xs text-zinc-300 font-light leading-relaxed line-clamp-3">
                        {activeProject.overview || activeProject.description}
                      </p>
                    </div>

                  </div>

                  {/* Extra specs footer */}
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono pt-2 border-t border-white/[0.05]">
                    <span className="flex items-center gap-1.5">
                      <Monitor size={12} className="text-zinc-400" />
                      DISPLAY PORT 0{activeIndex + 1}
                    </span>
                    <span>© DESIGNED FOR RETINA</span>
                  </div>

                </div>

              </div>
              
            </div>

            {/* 2. Apple App Library - Project Grid Cards Shelf (Apple Liquid Glass Cards Grid) */}
            <div className="space-y-8 pt-6">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl apple-glass flex items-center justify-center border border-blue-400/30">
                    <Layers className="text-blue-400" size={13} />
                  </div>
                  <h4 className="text-sm font-bold tracking-wide text-zinc-200">
                    分类作品库 / App Library ({filteredProjects.length} Projects)
                  </h4>
                </div>
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest apple-glass-capsule px-3 py-1 rounded-full border border-white/10">
                  LIQUID GLASS CARDS
                </div>
              </div>
              
              {/* Apple Liquid Glass Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
                {filteredProjects.map((project, idx) => {
                  const isCurrent = idx === activeIndex;

                  return (
                    <motion.div
                      key={project.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`apple-glass-card apple-glass-interactive glass-rim-top group cursor-pointer rounded-[2.2rem] transition-all duration-500 relative flex flex-col p-4.5 ${
                        isCurrent 
                          ? 'border-white/35 bg-white/[0.08] shadow-[0_20px_45px_rgba(0,0,0,0.7)] ring-1 ring-blue-400/40' 
                          : 'border-white/10 hover:border-white/25 hover:bg-white/[0.04]'
                      }`}
                      style={{ originY: 1 }}
                      whileHover={{ y: -6 }}
                    >
                      
                      {/* True Project Cover Image wrapper */}
                      <div className="aspect-[4/3] w-full rounded-2xl bg-zinc-900 relative overflow-hidden flex items-end shadow-lg border border-white/[0.08]">
                        {project.imageUrl ? (
                          <img 
                            src={project.imageUrl} 
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                            alt={project.title}
                            referrerPolicy="no-referrer"
                          />
                        ) : null}
                        
                        {/* Shimmer sweeps on hover */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] pointer-events-none" />

                        {/* Top-right floating tag */}
                        <div className="absolute top-2.5 right-2.5 z-10">
                          <span className="apple-glass-capsule border border-white/20 text-white font-sans font-semibold text-[8px] px-2.5 py-1 rounded-full uppercase tracking-wider block shadow-md">
                            {project.category}
                          </span>
                        </div>

                        {/* Interactive dark overlay to retain card visual legibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-85 group-hover:opacity-60 transition-opacity" />

                        {/* Capsule indicator details bottom-left inside image */}
                        <div className="p-4 absolute bottom-0 left-0 right-0 z-10 flex justify-between items-end">
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-mono text-zinc-400 tracking-widest block uppercase font-semibold">PROJECT RELEASE</span>
                            <span className="text-xs font-semibold text-white tracking-tight leading-none block truncate max-w-[150px]">
                              {project.title.split(':')[0]}
                            </span>
                          </div>
                          
                          <div className="w-7 h-7 rounded-full apple-glass-button flex items-center justify-center shrink-0">
                            <ArrowUpRight size={12} className="text-white group-hover:rotate-45 transition-transform" />
                          </div>
                        </div>

                      </div>

                      {/* Card Bottom Description details (Apple design layout) */}
                      <div className="pt-4 flex items-center justify-between text-[11px] font-sans px-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono ${isCurrent ? 'text-blue-400 font-bold' : 'text-zinc-500'}`}>0{idx + 1}</span>
                          <span className="text-zinc-300 font-medium truncate max-w-[150px] leading-tight">
                            {project.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 block shrink-0">{project.year}</span>
                      </div>

                      {/* Active indicator dot */}
                      {isCurrent && (
                        <div className="absolute top-3 left-3 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.9)] animate-pulse border border-[#050505]" />
                      )}

                    </motion.div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* View Full Catalog Link Button */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-28 flex justify-center"
        >
          <Link 
            to="/archive" 
            className="apple-glass-capsule apple-glass-interactive glass-rim-top group flex items-center gap-3.5 px-8 py-4 rounded-full text-zinc-300 hover:text-white border border-white/20 hover:border-white/40 transition-all duration-300 text-[10px] font-mono tracking-widest uppercase shadow-xl active:scale-95"
          >
            <span>EXPLORE FULL ALBUM ARCHIVE / 全作品归档索引</span>
            <ArrowUpRight size={13} className="text-zinc-300 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
