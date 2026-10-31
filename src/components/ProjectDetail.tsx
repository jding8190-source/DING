import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowUpRight, Loader2 } from 'lucide-react';
import { projects as staticProjects } from '../constants';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchProject() {
      // First check static
      const staticProj = staticProjects.find(p => p.id === id);
      if (staticProj) {
        setProject(staticProj);
        setLoading(false);
        return;
      }

      // Then check Firebase
      try {
        if (id) {
          const docRef = doc(db, 'projects', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProject({ id: docSnap.id, ...docSnap.data() });
          }
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [id]);

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
        <h2 className="text-2xl mb-8">未找到该项目</h2>
        <Link to="/" className="text-zinc-500 hover:text-white transition-colors">回到首页</Link>
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
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#080808]/80 backdrop-blur-md px-6 py-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
              <ArrowLeft size={14} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-zinc-500 group-hover:text-white transition-colors">BACK TO HOME</span>
          </Link>
          <div className="flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
             <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-zinc-300 font-bold">{project.title}</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-60 px-6 mb-40 text-center relative overflow-hidden">
        {/* Dynamic Background Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-[18vw] font-sans font-black text-white/[0.01] select-none pointer-events-none uppercase tracking-tighter leading-none">
          {project.id}
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-6 mb-12"
          >
            <div className="w-12 h-[1px] bg-zinc-800"></div>
            <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-zinc-600">
               {project.category} / {project.year}
            </span>
            <div className="w-12 h-[1px] bg-zinc-800"></div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(3rem,10vw,8rem)] font-sans font-black text-white leading-[0.8] tracking-[-0.04em] mb-16"
          >
            {project.title.split(':')[0]}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <p className="text-[clamp(1.1rem,3vw,1.75rem)] font-light text-zinc-400 leading-relaxed italic font-serif">
               {project.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Banner Image */}
      <section className="px-6 mb-40 lg:px-20">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto relative aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-zinc-900 rounded-sm shadow-[0_100px_120px_-40px_rgba(0,0,0,0.6)]"
        >
          {project.imageUrl ? (
            <img 
              src={project.imageUrl} 
              loading="lazy"
              className="w-full h-full object-cover grayscale opacity-80" 
              alt={project.title}
              referrerPolicy="no-referrer"
            />
          ) : null}
        </motion.div>
      </section>

      {/* Info Grid */}
      <section className="px-6 py-24 mb-48 border-y border-white/[0.03]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-24">
          {[
            { label: 'Client', value: project.client },
            { label: 'Role', value: project.role },
            { label: 'Year', value: project.year },
            { label: 'Services', value: project.category }
          ].map((item) => (
            <div key={item.label} className="space-y-4">
              <h4 className="font-mono text-[9px] uppercase tracking-[0.4em] text-zinc-600 font-bold">{item.label}</h4>
              <p className="text-white text-sm font-light tracking-wide">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-5xl mx-auto px-6 space-y-40">
        
        {/* Overview */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          <div className="md:col-span-4 translate-y-1">
            <header className="flex items-center gap-4">
              <div className="w-8 h-[1px] bg-zinc-800"></div>
              <h3 className="text-[10px] uppercase tracking-[0.5em] text-zinc-600 font-bold">Overview</h3>
            </header>
          </div>
          <div className="md:col-span-8 text-[clamp(1rem,2vw,1.25rem)] font-light text-zinc-300 leading-[1.8] tracking-wide">
            {project.overview || project.description}
          </div>
        </section>

        {/* Goals */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          <div className="md:col-span-4 translate-y-1">
            <header className="flex items-center gap-4">
              <div className="w-8 h-[1px] bg-zinc-800"></div>
              <h3 className="text-[10px] uppercase tracking-[0.5em] text-zinc-600 font-bold">Objectives</h3>
            </header>
          </div>
          <div className="md:col-span-8 grid grid-cols-1 gap-6">
            {(project.goals || []).map((goal: string, i: number) => (
              <div key={i} className="flex gap-8 p-10 bg-white/[0.01] border border-white/[0.03] rounded-sm group hover:bg-white/[0.02] transition-all duration-700">
                <span className="text-zinc-800 font-mono text-[9px] pt-1">0{i+1}</span>
                <p className="text-base text-zinc-400 group-hover:text-zinc-200 transition-colors">{goal}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="space-y-40">
          <header className="flex flex-col items-center text-center">
            <div className="w-[1px] h-20 bg-zinc-800 mb-12"></div>
            <h3 className="text-sm font-sans font-bold text-white tracking-[0.5em] uppercase">Development Process</h3>
          </header>
          <div className="space-y-60">
            {(project.process || []).map((step: any, i: number) => (
              <div key={i} className="space-y-16">
                <div className="flex flex-col md:flex-row gap-20 items-baseline">
                  <span className="text-[120px] font-sans font-black text-white/[0.02] leading-none tracking-tighter">0{i+1}</span>
                  <div className="max-w-2xl">
                    <h4 className="text-2xl font-bold text-white mb-6 tracking-tight">{step.title}</h4>
                    <p className="text-zinc-500 leading-[1.8] text-base font-light">{step.description}</p>
                  </div>
                </div>
                {step.imageUrl && (
                  <div className="aspect-video bg-zinc-900 rounded-sm overflow-hidden border border-white/[0.03] shadow-2xl">
                    <img src={step.imageUrl} loading="lazy" className="w-full h-full object-cover grayscale opacity-40 hover:opacity-80 hover:grayscale-0 transition-all duration-1000 ease-out" alt={step.title} referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Prototype Embed (Optional) */}
        {project.embedUrl && (
          <section className="space-y-12 py-20 border-y border-white/5">
            <div className="text-center">
              <h3 className="text-2xl font-display font-light text-white mb-4">INTERACTIVE PROTOTYPE</h3>
              <p className="text-zinc-500 text-sm">Experience the live interaction flows.</p>
            </div>
            <div className="aspect-[16/10] bg-zinc-900 w-full rounded-sm overflow-hidden border border-white/5 shadow-2xl">
              <iframe 
                style={{ border: 'none' }} 
                width="100%" 
                height="100%" 
                src={project.embedUrl} 
                allowFullScreen
              ></iframe>
            </div>
          </section>
        )}

        {/* Outcomes & Learnings */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-20 py-20 bg-zinc-950 p-12 rounded-lg border border-white/5">
          <div className="space-y-8">
            <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">PROJECT OUTCOMES</h3>
            <ul className="space-y-4">
              {(project.outcomes || []).map((outcome: string, i: number) => (
                <li key={i} className="text-lg text-zinc-300 flex items-center gap-4">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-8">
            <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">KEY LEARNINGS</h3>
            <p className="text-lg text-zinc-400 italic leading-relaxed">
              "{project.learnings || 'Simplicity is the ultimate sophistication.'}"
            </p>
          </div>
        </section>

        {/* Next Project CTA */}
        <section className="pt-40 text-center">
          <span className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 block mb-6">NEXT PROJECT</span>
          <Link 
            to={`/project/${staticProjects.indexOf(project) !== -1 ? staticProjects[(staticProjects.indexOf(project) + 1) % staticProjects.length].id : staticProjects[0].id}`}
            className="group inline-block"
          >
            <h2 className="text-4xl md:text-7xl font-display font-light text-zinc-100 group-hover:text-white transition-colors">
              {staticProjects.indexOf(project) !== -1 ? staticProjects[(staticProjects.indexOf(project) + 1) % staticProjects.length].title : staticProjects[0].title}
              <ArrowUpRight size={48} className="inline-block ml-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform opacity-30 group-hover:opacity-100" />
            </h2>
          </Link>
        </section>

      </div>
    </motion.div>
  );
}
