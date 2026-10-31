import { motion } from 'motion/react';
import { projects as staticProjects } from '../constants';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import Navigation from './Navigation';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

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
            <Link to="/" className="inline-flex items-center gap-2 group mb-12">
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                <ArrowLeft size={14} />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                Back to home
              </span>
            </Link>
            
            <h1 className="text-[clamp(3.5rem,8vw,6.5rem)] font-sans font-bold text-white tracking-[-0.04em] leading-[0.85] mb-10">
              全作品集 <br />
              <span className="italic font-serif font-light opacity-50 ml-4">Archive Index</span>
            </h1>
            <p className="text-zinc-500 text-sm font-light leading-[1.8] tracking-wide max-w-sm">
              记录了我设计历程中的视觉足迹，从早期的概念探索到最终落地的完整交付。
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-4">
             <div className="font-mono text-[9px] text-zinc-700 uppercase tracking-[0.5em]">Current Projects</div>
             <div className="text-6xl font-sans font-black text-white opacity-5 tracking-tighter tabular-nums">/{projects.length}</div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-px bg-white/[0.03] border border-white/[0.03]">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative bg-[#080808] hover:bg-white/[0.02] transition-all duration-700"
            >
              <Link to={`/project/${project.id}`} className="flex flex-col md:flex-row items-center gap-12 p-8 md:px-12 md:py-16">
                <div className="font-mono text-[9px] text-zinc-800 tabular-nums">0{index + 1}</div>
                
                <div className="w-full md:w-40 aspect-[4/3] overflow-hidden rounded-sm bg-zinc-900 shrink-0">
                  {project.imageUrl ? (
                    <img 
                      src={project.imageUrl} 
                      className="w-full h-full object-cover grayscale opacity-30 brightness-110 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1.5s] ease-out" 
                      alt={project.title}
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                </div>

                <div className="flex-grow">
                   <div className="flex items-center gap-4 mb-4">
                    <span className="font-mono text-[8px] text-zinc-600 uppercase tracking-[0.4em] font-bold">{project.category}</span>
                    <div className="h-[1px] w-8 bg-zinc-900"></div>
                   </div>
                   <h3 className="text-3xl md:text-5xl font-sans font-bold text-zinc-100 group-hover:text-white group-hover:translate-x-2 transition-all duration-700 tracking-tight">
                    {project.title}
                   </h3>
                </div>

                <div className="hidden md:flex flex-col items-end justify-between self-stretch py-2">
                  <div className="text-zinc-700 font-mono text-[9px] tracking-widest">{project.year}</div>
                  <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 hover:rotate-45">
                    <ArrowUpRight size={16} />
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
