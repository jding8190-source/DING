import { motion } from 'motion/react';
import { projects as staticProjects } from '../constants';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import Navigation from './Navigation';
import { useState, useEffect } from 'react';
import { db, collection, getDocs, query, orderBy } from '../lib/localStore';

export default function Archive() {
  const [projects, setProjects] = useState<any[]>(staticProjects);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const q = query(collection(db, 'projects'), orderBy('year', 'desc'));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const fetchedProjects = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProjects(fetchedProjects);
        }
      } catch (error) {
        console.error('Error fetching projects in archive:', error);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className="bg-[#080808] min-h-screen">
      <Navigation />
      
      <main className="pt-40 pb-24 px-6 max-w-7xl mx-auto">
        <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-2xl">
            <Link to="/" className="inline-flex items-center gap-3 group mb-12">
              <div className="w-8 h-8 rounded-full apple-glass-button flex items-center justify-center transition-all">
                <ArrowLeft size={14} className="text-zinc-300 group-hover:text-white" />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                Back to home
              </span>
            </Link>
            
            <h1 className="text-[clamp(3.5rem,8vw,6.5rem)] font-sans font-bold text-white tracking-[-0.04em] leading-[0.85] mb-10">
              全作品集 <br />
              <span className="italic font-serif font-light opacity-50 ml-4">Archive Index</span>
            </h1>
            <p className="text-zinc-400 text-sm font-light leading-[1.8] tracking-wide max-w-sm">
              记录了我设计历程中的视觉足迹，从早期的概念探索到最终落地的完整交付。
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-3">
             <div className="apple-glass-capsule glass-rim-top px-3 py-1 rounded-full text-[9px] text-zinc-300 uppercase tracking-widest border border-white/10">
               Current Catalog
             </div>
             <div className="text-6xl font-sans font-black text-white/10 tracking-tighter tabular-nums">/{projects.length}</div>
          </div>
        </header>

        <div className="space-y-4">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.6 }}
              viewport={{ once: true }}
              className="apple-glass-card apple-glass-interactive glass-rim-top group relative rounded-3xl border border-white/10 hover:border-white/25 shadow-xl transition-all duration-500"
            >
              <Link to={`/project/${project.id}`} className="flex flex-col md:flex-row items-center gap-8 p-6 md:px-10 md:py-8">
                <div className="font-mono text-[10px] text-zinc-500 tabular-nums font-bold">0{index + 1}</div>
                
                <div className="w-full md:w-36 aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-900 shrink-0 border border-white/10 shadow-md">
                  {project.imageUrl ? (
                    <img 
                      src={project.imageUrl} 
                      className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out" 
                      alt={project.title}
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                </div>

                <div className="flex-grow">
                   <div className="flex items-center gap-3 mb-2">
                    <span className="apple-glass-capsule text-[8px] text-zinc-300 uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-white/15">
                      {project.category}
                    </span>
                   </div>
                   <h3 className="text-2xl md:text-3xl font-sans font-bold text-zinc-100 group-hover:text-white group-hover:translate-x-1.5 transition-all duration-500 tracking-tight">
                    {project.title}
                   </h3>
                </div>

                <div className="hidden md:flex flex-col items-end justify-between self-stretch py-2">
                  <div className="text-zinc-400 font-mono text-[10px] tracking-widest">{project.year}</div>
                  <div className="w-9 h-9 rounded-full apple-glass-button flex items-center justify-center transition-all duration-500 group-hover:rotate-45 shadow-md">
                    <ArrowUpRight size={14} className="text-white" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
