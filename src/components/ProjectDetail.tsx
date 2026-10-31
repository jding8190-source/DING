import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  Loader2, 
  Play, 
  ExternalLink, 
  Film, 
  Image as ImageIcon,
  Scroll,
  Layers,
  Sparkles
} from 'lucide-react';
import { projects as staticProjects } from '../constants';
import { useEffect, useState, useMemo } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Project } from '../types';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchProject() {
      // First check Firebase for live saved project
      try {
        if (id) {
          const docRef = doc(db, 'projects', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProject({ id: docSnap.id, ...(docSnap.data() as any) });
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching project from Firestore:', error);
      }

      // Fallback to static initial projects
      const staticProj = staticProjects.find(p => p.id === id);
      if (staticProj) {
        setProject(staticProj as any);
      }
      setLoading(false);
    }
    fetchProject();
  }, [id]);

  // Video embed helper
  const renderVideoPlayer = (url: string, type?: string) => {
    if (!url) return null;

    // Detect if direct video file (.mp4, .webm, .mov, or data URL / direct URL)
    const isDirectVideo = type === 'direct' || 
      url.match(/\.(mp4|webm|mov|ogg)($|\?)/i) || 
      url.startsWith('data:video');

    if (isDirectVideo) {
      return (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
          <video 
            src={url}
            controls
            playsInline
            className="w-full h-full object-contain"
            poster={project?.imageUrl}
          >
            您的浏览器不支持 HTML5 视频播放。
          </video>
        </div>
      );
    }

    // Bilibili video embed
    if (url.includes('bilibili.com') || type === 'bilibili') {
      let bvid = '';
      const bvidMatch = url.match(/BV[a-zA-Z0-9]+/i);
      if (bvidMatch) bvid = bvidMatch[0];
      const src = bvid 
        ? `//player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0`
        : url;

      return (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
          <iframe 
            src={src}
            className="w-full h-full border-0"
            allowFullScreen
          />
        </div>
      );
    }

    // YouTube video embed
    if (url.includes('youtube.com') || url.includes('youtu.be') || type === 'youtube') {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
      }
      const embedSrc = videoId ? `https://www.youtube.com/embed/${videoId}` : url;

      return (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
          <iframe 
            src={embedSrc}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // Generic iframe fallback
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
        <iframe 
          src={url}
          className="w-full h-full border-0"
          allowFullScreen
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808] text-white">
        <Loader2 className="animate-spin text-zinc-500" size={32} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] text-white">
        <h2 className="text-2xl mb-8">未找到该作品内容</h2>
        <Link to="/" className="text-zinc-500 hover:text-white transition-colors underline font-mono text-sm">
          回到首页
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#080808] min-h-screen pb-40 text-zinc-100"
    >
      {/* Top Floating Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#080808]/85 backdrop-blur-xl px-6 py-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
              <ArrowLeft size={14} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-zinc-400 group-hover:text-white transition-colors">
              BACK TO HOME
            </span>
          </Link>
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
             <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-zinc-300 font-bold truncate max-w-[200px] sm:max-w-xs">
               {project.title}
             </span>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="pt-52 px-6 mb-28 text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-6"
          >
            <div className="w-12 h-[1px] bg-zinc-800"></div>
            <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-amber-400/90 font-medium">
               {project.category} · {project.year}
            </span>
            <div className="w-12 h-[1px] bg-zinc-800"></div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2.5rem,7vw,6.5rem)] font-sans font-bold text-white leading-[1.05] tracking-[-0.03em]"
          >
            {project.title}
          </motion.h1>
          
          {project.description && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <p className="text-lg md:text-xl font-light text-zinc-400 leading-relaxed font-sans">
                 {project.description}
              </p>
            </motion.div>
          )}

          {/* External Links Buttons */}
          {((project.externalLinks && project.externalLinks.length > 0) || project.embedUrl) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-3 pt-4"
            >
              {(project.externalLinks || []).map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white text-white hover:text-black px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border border-white/10 shadow-lg"
                >
                  <ExternalLink size={13} /> {link.label || '访问链接'}
                </a>
              ))}
              {project.embedUrl && (
                <a
                  href={project.embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-amber-500/20 hover:bg-amber-400 text-amber-300 hover:text-black border border-amber-500/30 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300"
                >
                  <Sparkles size={13} /> 原型体验 (Prototype)
                </a>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Main Cover Banner */}
      <section className="px-6 mb-32 lg:px-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto relative aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-zinc-950 rounded-2xl border border-white/10 shadow-[0_60px_100px_rgba(0,0,0,0.8)]"
        >
          {project.imageUrl && (
            <img 
              src={project.imageUrl} 
              className="w-full h-full object-cover" 
              alt={project.title}
              referrerPolicy="no-referrer"
            />
          )}
        </motion.div>
      </section>

      {/* Info Meta Grid */}
      <section className="px-6 py-16 mb-32 border-y border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Client / 客户', value: project.client || 'Direct Commission' },
            { label: 'Role / 担任角色', value: project.role || 'Design Lead' },
            { label: 'Year / 创作年份', value: project.year || '2024' },
            { label: 'Category / 目录分类', value: project.category || 'Portfolio' }
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold">{item.label}</h4>
              <p className="text-white text-sm font-medium tracking-wide">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Flow */}
      <div className="max-w-6xl mx-auto px-6 space-y-36">
        
        {/* Overview / Case Study Background */}
        {(project.overview || project.description) && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4">
              <header className="flex items-center gap-4">
                <div className="w-8 h-[1px] bg-amber-500"></div>
                <h3 className="text-xs uppercase tracking-[0.4em] text-zinc-400 font-bold">CASE OVERVIEW</h3>
              </header>
            </div>
            <div className="md:col-span-8 text-base md:text-lg font-light text-zinc-300 leading-[1.8] whitespace-pre-line font-sans">
              {project.overview || project.description}
            </div>
          </section>
        )}

        {/* Dedicated Video Player Window */}
        {project.videoUrl && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Film size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">视频动态窗口 (Video Presentation)</h3>
                  <p className="text-xs text-zinc-500">支持直接播放或自适应流媒体</p>
                </div>
              </div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-white/5">
                {project.videoType || 'HD Video'}
              </span>
            </div>
            {renderVideoPlayer(project.videoUrl, project.videoType)}
          </section>
        )}

        {/* Multiple Images Gallery */}
        {project.images && project.images.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 text-white rounded-lg">
                <ImageIcon size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  精选作品图集 ({project.images.length})
                </h3>
                <p className="text-xs text-zinc-500">高清设计特写与视觉界面 (支持 JPG, PNG, GIF, WebP)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {project.images.map((img, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="group rounded-2xl overflow-hidden bg-zinc-950 border border-white/5 shadow-2xl relative"
                >
                  <img 
                    src={img} 
                    alt={`${project.title} detail ${i + 1}`} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-zinc-400">
                    0{i + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Long Scroll Case Studies (长图展示) */}
        {project.longImages && project.longImages.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Scroll size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">长图完整案例流程 (Continuous Scroll)</h3>
                <p className="text-xs text-zinc-500">完整长卷视觉展示，纵向浏览全部细节</p>
              </div>
            </div>

            <div className="space-y-12">
              {project.longImages.map((longImg, i) => (
                <div 
                  key={i} 
                  className="rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 shadow-[0_40px_100px_rgba(0,0,0,0.9)] max-w-4xl mx-auto"
                >
                  <img 
                    src={longImg} 
                    alt={`${project.title} Long Scroll ${i + 1}`}
                    loading="lazy"
                    className="w-full h-auto object-contain block"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Interactive Prototype Embed (If available) */}
        {project.embedUrl && (
          <section className="space-y-8 py-12 border-t border-white/5">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-sans font-bold text-white uppercase tracking-wider">交互原型演示</h3>
              <p className="text-zinc-500 text-xs">可直接在下方窗口中点击体验交互流程</p>
            </div>
            <div className="aspect-[16/10] bg-zinc-950 w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <iframe 
                style={{ border: 'none' }} 
                width="100%" 
                height="100%" 
                src={project.embedUrl} 
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Process Steps (If present) */}
        {project.process && project.process.length > 0 && (
          <section className="space-y-24 border-t border-white/5 pt-24">
            <header className="flex flex-col items-center text-center">
              <div className="w-[1px] h-16 bg-zinc-800 mb-8"></div>
              <h3 className="text-xs font-mono font-bold text-white tracking-[0.4em] uppercase">DEVELOPMENT PROCESS</h3>
            </header>
            <div className="space-y-32">
              {project.process.map((step: any, i: number) => (
                <div key={i} className="space-y-8">
                  <div className="flex items-baseline gap-6">
                    <span className="text-4xl font-mono text-zinc-700">0{i + 1}</span>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">{step.title}</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                  {step.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/5 shadow-xl aspect-video bg-zinc-950">
                      <img src={step.imageUrl} loading="lazy" className="w-full h-full object-cover" alt={step.title} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Back and Next */}
        <section className="pt-24 border-t border-white/5 text-center flex flex-col items-center gap-6">
          <Link 
            to="/"
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl hover:scale-105"
          >
            <ArrowLeft size={14} /> 返回全部作品展览
          </Link>
        </section>

      </div>
    </motion.div>
  );
}
