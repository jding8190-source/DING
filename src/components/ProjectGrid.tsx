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

const categories = ['全部', '项目应用', '品牌视觉', '运营设计'];

export default function ProjectGrid() {
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
        <header className="mb-20 flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-zinc-900 pb-10">
          <div className="max-w-2xl">
            <div className="mb-3.5 inline-flex items-center gap-2 bg-zinc-900/60 border border-white/5 px-3 py-1 rounded-full backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">Exhibition Hall / iOS 18 Design</span>
            </div>
            <h2 className="text-display text-[clamp(2.5rem,5.2vw,4.8rem)] font-bold text-white tracking-[-0.03em] leading-[1.05] uppercase">
              作品展示展销空间 <br />
              <span className="text-zinc-600 lowercase font-serif italic tracking-wide font-normal">crafted premium layouts.</span>
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* iOS Styled Segmented Control (Pill-shaped slider) */}
            <div className="relative flex bg-zinc-950 p-1 rounded-2xl border border-white/5 backdrop-blur-xl">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setActiveIndex(0);
                  }}
                  className="relative z-10 px-5 py-2.5 font-sans text-[11px] font-bold tracking-wider uppercase transition-all duration-300"
                >
                  {activeCategory === cat && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-white rounded-xl shadow-[0_8px_20px_rgba(255,255,255,0.15)] z-0"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 transition-colors duration-300 ${activeCategory === cat ? 'text-black' : 'text-zinc-500 hover:text-zinc-300'}`}>
                    {cat}
                  </span>
                </button>
              ))}
            </div>

            {/* iOS System Gacha Cycle */}
            <button
              onClick={handleRandomDraw}
              disabled={isDrawing || filteredProjects.length <= 1}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-zinc-900/80 hover:bg-white text-zinc-400 hover:text-black border border-white/5 hover:border-white text-[11px] font-mono tracking-wider uppercase transition-all duration-300 disabled:opacity-40 font-bold active:scale-95 shadow-md"
            >
              <Shuffle size={12} className={isDrawing ? 'animate-spin' : ''} />
              <span>随机抽选</span>
            </button>
          </div>
        </header>

        {loading ? (
          <div className="py-40 flex justify-center items-center">
            <Loader2 className="animate-spin text-zinc-700" size={36} />
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
                <div className="relative group overflow-hidden bg-zinc-950 rounded-[2.5rem] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.65)] backdrop-blur-md">
                  
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
                      <span className="bg-black/40 border border-white/10 backdrop-blur-lg px-4 py-1.5 rounded-full text-[9px] font-bold tracking-widest text-white uppercase shadow-md">
                        {activeProject.category}
                      </span>
                      <span className="bg-white/15 border border-white/5 backdrop-blur-lg px-4 py-1.5 rounded-full text-[9px] font-bold tracking-widest text-amber-400 uppercase shadow-md flex items-center gap-1.5">
                        <Sparkles size={10} className="animate-spin text-amber-400" />
                        iOS SPECIAL
                      </span>
                    </div>

                    {/* Left corner: iOS App Store launch shadow details */}
                    <div className="absolute bottom-6 left-6 right-6 z-20">
                      <div className="bg-black/30 md:bg-white/[0.06] border border-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-[1.8rem] text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
                        
                        <div className="space-y-1 max-w-md">
                          <span className="text-[10px] font-mono tracking-widest text-[#98989D]/90 uppercase font-semibold">FEATURED PROJECT</span>
                          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white line-clamp-2">
                            {activeProject.title}
                          </h3>
                          <p className="text-xs text-[#E5E5EA]/70 line-clamp-1 font-light">
                            {activeProject.description}
                          </p>
                        </div>

                        {/* IOS Styled CTA Button (App Store "GET / OPEN" design) */}
                        <Link 
                          to={`/project/${activeProject.id}`}
                          className="group bg-white text-black hover:bg-zinc-100 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 self-stretch md:self-auto text-center shrink-0 shadow-lg active:scale-95"
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

                {/* Dashboard Card B: Elegant Spec sheet (Metadata display) */}
                <div className="bg-zinc-950 p-6 sm:p-8 rounded-[2.2rem] border border-white/5 backdrop-blur-md shadow-2xl flex flex-col justify-between gap-6 min-h-[290px]">
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Eye size={14} />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">INFO MODULE / 作品明细卡</span>
                    </div>
                    
                    {/* Grid Specs */}
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-900">
                      
                      <div className="space-y-1 bg-zinc-900/30 p-2.5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-1 text-zinc-500">
                          <Layers size={10} />
                          <span className="text-[8px] font-mono uppercase tracking-wider">类别</span>
                        </div>
                        <span className="text-white text-xs font-semibold block">{activeProject.category}</span>
                      </div>

                      <div className="space-y-1 bg-zinc-900/30 p-2.5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-1 text-zinc-500">
                          <Calendar size={10} />
                          <span className="text-[8px] font-mono uppercase tracking-wider">年份</span>
                        </div>
                        <span className="text-white text-xs font-semibold block">{activeProject.year || '2024'}</span>
                      </div>

                      <div className="space-y-1 bg-zinc-900/30 p-2.5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-1 text-zinc-500">
                          <Briefcase size={10} />
                          <span className="text-[8px] font-mono uppercase tracking-wider">客户</span>
                        </div>
                        <span className="text-white text-xs font-semibold block truncate">{activeProject.client || '创意设计'}</span>
                      </div>

                      <div className="space-y-1 bg-zinc-900/30 p-2.5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-1 text-zinc-500">
                          <User size={10} />
                          <span className="text-[8px] font-mono uppercase tracking-wider">角色</span>
                        </div>
                        <span className="text-white text-xs font-semibold block truncate">{activeProject.role || '主导设计'}</span>
                      </div>

                    </div>

                    {/* Summary text */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">概念大纲</span>
                      <p className="text-xs text-zinc-400 font-light leading-relaxed line-clamp-3">
                        {activeProject.overview || activeProject.description}
                      </p>
                    </div>

                  </div>

                  {/* Extra specs footer */}
                  <div className="flex justify-between items-center text-[10px] text-zinc-600 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Monitor size={11} className="text-zinc-500" />
                      DISPLAY PORT 0{activeIndex + 1}
                    </span>
                    <span>© DESIGNED FOR RETRINA</span>
                  </div>

                </div>

              </div>
              
            </div>

            {/* 2. Apple App Library - Project Grid Cards Shelf (黑胶淘碟架升级：iOS卡品陈列桌) */}
            <div className="space-y-8 pt-6">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Layers className="text-blue-400" size={13} />
                  </div>
                  <h4 className="text-sm font-bold tracking-wide text-zinc-200">
                    分类作品库 / App Library ({filteredProjects.length} Projects)
                  </h4>
                </div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  iOS CARDS PREVIEW
                </div>
              </div>
              
              {/* iOS Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
                {filteredProjects.map((project, idx) => {
                  const isCurrent = idx === activeIndex;

                  return (
                    <motion.div
                      key={project.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`group cursor-pointer rounded-[2rem] bg-zinc-950 border transition-all duration-500 relative flex flex-col p-4 ${
                        isCurrent 
                          ? 'border-white/25 bg-zinc-900/60 shadow-[0_15px_30px_rgba(0,0,0,0.5)]' 
                          : 'border-white/5 hover:border-white/15'
                      }`}
                      style={{ originY: 1 }}
                      whileHover={{ y: -6 }}
                    >
                      
                      {/* True Project Cover Image wrapper */}
                      <div className="aspect-[4/3] w-full rounded-2xl bg-zinc-900 relative overflow-hidden flex items-end shadow-lg border border-white/[0.05]">
                        {project.imageUrl ? (
                          <img 
                            src={project.imageUrl} 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                            alt={project.title}
                            referrerPolicy="no-referrer"
                          />
                        ) : null}
                        
                        {/* Shimmer sweeps on hover */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] pointer-events-none" />

                        {/* Top-right floating tag */}
                        <div className="absolute top-2.5 right-2.5 z-10">
                          <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white font-sans font-semibold text-[8px] px-2.5 py-1 rounded-full uppercase tracking-wider block">
                            {project.category}
                          </span>
                        </div>

                        {/* Interactive dark overlay to retain card visual legibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-85 group-hover:opacity-60 transition-opacity" />

                        {/* Capsule indicator details bottom-left inside image */}
                        <div className="p-4 absolute bottom-0 left-0 right-0 z-10 flex justify-between items-end">
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-mono text-zinc-500 tracking-widest block uppercase font-semibold">PROJECT RELEASE</span>
                            <span className="text-xs font-semibold text-white tracking-tight leading-none block truncate max-w-[150px]">
                              {project.title.split(':')[0]}
                            </span>
                          </div>
                          
                          <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-lg border border-white/10 flex items-center justify-center shrink-0">
                            <ArrowUpRight size={12} className="text-white group-hover:rotate-45 transition-transform" />
                          </div>
                        </div>

                      </div>

                      {/* Card Bottom Description details (Apple design layout) */}
                      <div className="pt-4 flex items-center justify-between text-[11px] font-sans px-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono ${isCurrent ? 'text-white' : 'text-zinc-600'}`}>0{idx + 1}</span>
                          <span className="text-zinc-400 font-medium truncate max-w-[150px] leading-tight">
                            {project.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-600 block shrink-0">{project.year}</span>
                      </div>

                      {/* Active indicator dot */}
                      {isCurrent && (
                        <div className="absolute top-3 left-3 w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse border border-[#050505]" />
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
            className="group flex items-center gap-3.5 bg-zinc-950/80 hover:bg-white text-zinc-500 hover:text-black border border-white/5 hover:border-white px-8 py-4 rounded-full transition-all duration-300 text-[10px] font-mono tracking-widest uppercase shadow-md active:scale-95"
          >
            <span>EXPLORE FULL ALBUM ARCHIVE / 全作品归档索引</span>
            <ArrowUpRight size={13} className="text-zinc-500 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
