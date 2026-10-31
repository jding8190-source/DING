import React, { useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from '../lib/firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, Plus, Trash2, Edit2, Save, X, Database, CheckCircle2 } from 'lucide-react';
import { projects as initialProjects } from '../constants';

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'experiences'>('projects');
  
  const [projects, setProjects] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Check if user is admin
        // For simplicity, we check if email is the one from metadata or if they exist in admins collection
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists() || user.email === 'jding8190@gmail.com') {
          setIsAdmin(true);
          fetchData();
        } else {
          setIsAdmin(false);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      const projectsSnap = await getDocs(query(collection(db, 'projects'), orderBy('year', 'desc')));
      setProjects(projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      const expSnap = await getDocs(query(collection(db, 'experiences')));
      setExperiences(expSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleDelete = async (coll: string, id: string) => {
    if (!window.confirm('确定要删除吗？')) return;
    try {
      await deleteDoc(doc(db, coll, id));
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${coll}/${id}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    try {
      if (editingItem) {
        await updateDoc(doc(db, activeTab, editingItem.id), {
          ...data,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, activeTab), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setEditingItem(null);
      setIsAdding(false);
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, activeTab);
    }
  };

  const seedDatabase = async () => {
    if (!window.confirm('这将把当前硬编码的作品数据上传到 Firebase。继续？')) return;
    try {
      for (const p of initialProjects) {
        await addDoc(collection(db, 'projects'), {
          ...p,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      alert('数据初始化成功！');
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'projects');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-white">Loading...</div>;

  if (!user || !isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#080808] p-6 text-center">
        <h1 className="text-4xl font-bold text-white mb-8">Admin Portal</h1>
        {!user ? (
          <button 
            onClick={handleLogin}
            className="flex items-center gap-4 bg-white text-black px-8 py-4 rounded-full font-bold"
          >
            <LogIn size={20} /> Login with Google
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-zinc-400">Welcome, {user.email}. You do not have admin access.</p>
            <button onClick={handleLogout} className="text-white underline">Logout</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white p-6 lg:p-12">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-20">
        <div>
          <h1 className="text-3xl font-bold">Studio CMS</h1>
          <p className="text-zinc-500 text-sm mt-2">{user.email}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={seedDatabase}
            className="flex items-center gap-2 bg-zinc-900 border border-white/5 px-4 py-2 rounded-lg text-xs hover:bg-zinc-800"
          >
            <Database size={14} /> Sync Initial Data
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="flex gap-8 border-b border-white/5 mb-12">
          {['projects', 'experiences'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${
                activeTab === tab ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold capitalize">{activeTab} Management</h2>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full text-xs font-bold"
          >
            <Plus size={16} /> Add New
          </button>
        </div>

        {/* List Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'projects' ? projects : experiences).map((item) => (
            <div key={item.id} className="bg-zinc-950 border border-white/5 p-6 rounded-lg group relative">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg">{item.title || item.role}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setEditingItem(item)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(activeTab, item.id)} className="p-2 hover:bg-red-500/20 text-red-500 rounded-full transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-zinc-500 line-clamp-2 mb-4">{item.description}</p>
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
                {item.category || item.company} • {item.year || item.period}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Editor Modal */}
      <AnimatePresence>
        {(isAdding || editingItem) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-white/10 w-full max-w-2xl rounded-xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">{editingItem ? 'Edit' : 'Add'} {activeTab}</h3>
                <button onClick={() => { setEditingItem(null); setIsAdding(false); }} className="text-zinc-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {activeTab === 'projects' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Title</label>
                        <input name="title" defaultValue={editingItem?.title} required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white/20" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Year</label>
                        <input name="year" defaultValue={editingItem?.year} required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white/20" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Category</label>
                        <select name="category" defaultValue={editingItem?.category} required className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white/20">
                          <option value="项目应用">项目应用</option>
                          <option value="品牌视觉">品牌视觉</option>
                          <option value="运营设计">运营设计</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Image URL</label>
                        <input name="imageUrl" defaultValue={editingItem?.imageUrl} required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white/20" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Description</label>
                      <textarea name="description" defaultValue={editingItem?.description} required rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white/20" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Role</label>
                        <input name="role" defaultValue={editingItem?.role} required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white/20" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Period</label>
                        <input name="period" defaultValue={editingItem?.period} required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white/20" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Company</label>
                      <input name="company" defaultValue={editingItem?.company} required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white/20" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Description</label>
                      <textarea name="description" defaultValue={editingItem?.description} required rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white/20" />
                    </div>
                  </>
                )}

                <button type="submit" className="w-full bg-white text-black py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors">
                  <Save size={18} /> Save Changes
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
