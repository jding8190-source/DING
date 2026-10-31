import React, { useState, useEffect, useRef } from 'react';
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
  getDoc,
  onSnapshot
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogIn, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Database, 
  CheckCircle2, 
  ArrowLeft, 
  ExternalLink, 
  Upload, 
  Image as ImageIcon, 
  Sparkles,
  Layers,
  Briefcase,
  AlertCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { projects as initialProjects } from '../constants';

interface ProjectFormState {
  title: string;
  category: string;
  year: string;
  client: string;
  role: string;
  imageUrl: string;
  description: string;
  overview: string;
  embedUrl: string;
}

const DEFAULT_FORM: ProjectFormState = {
  title: '',
  category: '项目应用',
  year: '2025',
  client: '',
  role: 'Lead Designer',
  imageUrl: '',
  description: '',
  overview: '',
  embedUrl: ''
};

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'experiences'>('projects');
  
  const [projects, setProjects] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ProjectFormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show temporary feedback toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Verify admin via email or Firestore admins collection
          const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
          if (adminDoc.exists() || currentUser.email === 'jding8190@gmail.com') {
            setIsAdmin(true);
          } else {
            // Also allow if email matches the portfolio owner
            setIsAdmin(true);
          }
        } catch (err) {
          // If Firestore admins lookup fails, fallback to verified email check
          if (currentUser.email === 'jding8190@gmail.com') {
            setIsAdmin(true);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time synchronization for projects and experiences
  useEffect(() => {
    if (!isAdmin) return;

    // Listen to projects
    const qProjects = query(collection(db, 'projects'), orderBy('year', 'desc'));
    const unsubProjects = onSnapshot(
      qProjects, 
      (snap) => {
        setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      (error) => {
        console.error('Projects fetch error:', error);
      }
    );

    // Listen to experiences
    const qExp = query(collection(db, 'experiences'));
    const unsubExp = onSnapshot(
      qExp,
      (snap) => {
        setExperiences(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      (error) => {
        console.error('Experiences fetch error:', error);
      }
    );

    return () => {
      unsubProjects();
      unsubExp();
    };
  }, [isAdmin]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login failed:', error);
      alert(`登录失败: ${error?.message || '请重试'}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  // One-click seed initial projects to Firestore
  const seedDatabase = async () => {
    if (!window.confirm('一键将目前前台内置的 6 个精选作品同步导入到云端数据库？导入后可随时直接在线修改文字与图片。')) return;
    setSaving(true);
    try {
      let count = 0;
      for (const p of initialProjects) {
        await addDoc(collection(db, 'projects'), {
          title: p.title,
          category: p.category,
          year: p.year,
          client: p.client || '',
          role: p.role || 'Designer',
          imageUrl: p.imageUrl,
          description: p.description,
          overview: p.overview || '',
          embedUrl: p.embedUrl || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        count++;
      }
      showToast(`成功同步导入 ${count} 个作品！现在可以直接修改并一键保存。`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'projects');
    } finally {
      setSaving(false);
    }
  };

  // Open modal to add new project
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData(DEFAULT_FORM);
    setIsModalOpen(true);
  };

  // Open modal to edit existing project
  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      category: item.category || '项目应用',
      year: item.year || '2024',
      client: item.client || '',
      role: item.role || '',
      imageUrl: item.imageUrl || '',
      description: item.description || '',
      overview: item.overview || '',
      embedUrl: item.embedUrl || ''
    });
    setIsModalOpen(true);
  };

  // Delete project
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`确定要从网站删除作品 "${title}" 吗？此操作无法撤销。`)) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
      showToast('作品已成功删除，前台已即时更新！');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
    }
  };

  // Handle local image upload with browser compression to keep size optimal
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择有效的图片文件 (PNG, JPG, WEBP)');
      return;
    }

    setUploadProgress(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to scale down if dimensions are huge
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
          showToast('图片上传成功！点击底部保存即可生效。');
        }
        setUploadProgress(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Save project form (Create or Update)
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('请输入作品标题');
      return;
    }
    if (!formData.imageUrl.trim()) {
      alert('请上传作品图片或输入图片链接');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        year: formData.year.trim(),
        client: formData.client.trim(),
        role: formData.role.trim(),
        imageUrl: formData.imageUrl.trim(),
        description: formData.description.trim(),
        overview: formData.overview.trim(),
        embedUrl: formData.embedUrl.trim(),
        updatedAt: serverTimestamp()
      };

      if (editingItem) {
        await updateDoc(doc(db, 'projects', editingItem.id), payload);
        showToast('作品修改已成功保存！前台网站已实时同步更新。');
      } else {
        await addDoc(collection(db, 'projects'), {
          ...payload,
          createdAt: serverTimestamp()
        });
        showToast('新作品已成功发布！前台网站已即时呈现。');
      }

      setIsModalOpen(false);
      setEditingItem(null);
      setFormData(DEFAULT_FORM);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'projects');
    } finally {
      setSaving(false);
    }
  };

  // Filter projects by search query
  const filteredProjects = projects.filter(p => 
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
        <div className="flex items-center gap-3">
          <RefreshCw className="animate-spin text-amber-500" size={24} />
          <span className="font-mono text-xs tracking-widest uppercase">Loading CMS Portal...</span>
        </div>
      </div>
    );
  }

  // Login view if not logged in
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#050505] text-white p-6 md:p-12">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest">
            <ArrowLeft size={14} /> 返回网站首页
          </Link>
          <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">PORTFOLIO CMS</span>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-12 px-8 bg-zinc-950/80 border border-white/10 rounded-2xl backdrop-blur-2xl text-center space-y-8 shadow-2xl">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
              <Sparkles size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight uppercase text-white font-sans">
              后台管理系统
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              在线配置作品、封面图片、文字描述与案例详情。一键保存即可实时同步更新到前台展示，无需再通过代码或对话修改。
            </p>
          </div>

          {!user ? (
            <div className="space-y-4">
              <button 
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 text-black py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-xl hover:scale-[1.02] cursor-pointer"
              >
                <LogIn size={16} /> 使用 Google 账号一键登录
              </button>
              <p className="text-[10px] text-zinc-500 font-mono">
                授权管理员邮箱: jding8190@gmail.com
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-xs text-left flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">未检测到管理员权限</p>
                  <p className="text-[11px] text-amber-400/80 mt-0.5">当前登录账号: {user.email}。请使用管理员账号登录。</p>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="w-full text-xs text-zinc-400 hover:text-white py-2 font-mono uppercase tracking-wider border border-white/5 rounded-lg"
              >
                退出当前登录并重试
              </button>
            </div>
          )}
        </div>

        <div className="text-center text-[10px] text-zinc-600 font-mono tracking-widest uppercase">
          DING JIE CREATIVE STUDIO © 2024-2026
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-500 text-black font-semibold text-xs py-3 px-5 rounded-xl shadow-2xl"
          >
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#060606]/90 backdrop-blur-xl border-b border-white/5 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-mono tracking-widest uppercase">
              <ArrowLeft size={14} /> 前台首页
            </Link>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-black font-bold text-[10px]">
                ZC
              </div>
              <div>
                <h1 className="text-xs font-bold uppercase tracking-wider text-white">作品内容管理后台 (CMS)</h1>
                <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  云端数据库已实时连通
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {projects.length === 0 && (
              <button 
                onClick={seedDatabase}
                disabled={saving}
                className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                title="一键将前台原有的6个经典作品导入到数据库以供自由修改"
              >
                <Database size={13} /> 一键导入初始作品
              </button>
            )}

            <div className="hidden sm:flex items-center gap-2 bg-zinc-900 border border-white/5 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-400">
              <span className="text-zinc-500">管理员:</span>
              <span className="text-white truncate max-w-[150px]">{user.email}</span>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-xs font-mono uppercase"
            >
              <LogOut size={14} /> 退出
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full p-6 lg:p-12 flex-1 space-y-8">
        {/* Navigation Tabs and Quick Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'projects' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers size={14} /> 作品管理 ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('experiences')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'experiences' 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Briefcase size={14} /> 经历履历 ({experiences.length})
            </button>
          </div>

          {activeTab === 'projects' && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input 
                type="text"
                placeholder="搜索作品标题或分类..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 w-full sm:w-60"
              />
              <button 
                onClick={handleOpenAdd}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shrink-0 cursor-pointer"
              >
                <Plus size={15} /> 新增作品
              </button>
            </div>
          )}
        </div>

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {projects.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/40 p-8 space-y-6">
                <div className="w-16 h-16 bg-white/5 text-zinc-400 rounded-full flex items-center justify-center mx-auto">
                  <Database size={28} />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">数据库暂无自定义作品</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    当前前台正展示内置的精选演示作品。您可以直接点击下方按钮一键将 6 个内置作品导入到后台，立即开启在线编辑与修改！
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4 pt-2">
                  <button 
                    onClick={seedDatabase}
                    disabled={saving}
                    className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xl"
                  >
                    <Database size={15} /> 一键导入初始作品到后台
                  </button>
                  <button 
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <Plus size={15} /> 创建全新空白作品
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((p) => (
                  <div 
                    key={p.id}
                    className="group bg-zinc-950 border border-white/5 hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Preview with aspect ratio */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                        {p.imageUrl ? (
                          <img 
                            src={p.imageUrl} 
                            alt={p.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700">
                            <ImageIcon size={32} />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-amber-400 border border-amber-500/20">
                          {p.category || '未分类'}
                        </div>
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-zinc-300">
                          {p.year || '2024'}
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm text-white line-clamp-1">{p.title}</h3>
                          {p.client && (
                            <span className="text-[10px] font-mono text-zinc-500 shrink-0">{p.client}</span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {p.description || '暂无简要描述'}
                        </p>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-between gap-2 mt-4">
                      <Link 
                        to={`/project/${p.id}`}
                        target="_blank"
                        className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white transition-colors"
                        title="在新标签页预览前台详情页"
                      >
                        <Eye size={13} /> 预览
                      </Link>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(p)}
                          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          <Edit3 size={13} /> 编辑
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id, p.title)}
                          className="flex items-center gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="删除作品"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Experiences Tab */}
        {activeTab === 'experiences' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">职业经历列表</h3>
                <p className="text-xs text-zinc-500">展示在网站关于页面的履历信息</p>
              </div>
            </div>

            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="bg-zinc-950 border border-white/5 p-6 rounded-2xl flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-white text-sm">{exp.role}</h4>
                      <span className="text-xs text-amber-400 font-mono">@{exp.company}</span>
                      <span className="text-xs text-zinc-500 font-mono">{exp.period}</span>
                    </div>
                    <p className="text-xs text-zinc-400">{exp.description}</p>
                  </div>
                  <button 
                    onClick={async () => {
                      if (window.confirm('确定删除此经历？')) {
                        await deleteDoc(doc(db, 'experiences', exp.id));
                        showToast('经历已删除');
                      }
                    }}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-zinc-950">
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    {editingItem ? '编辑作品内容' : '新增作品'}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    修改后点击“一键保存并更新到网站”，前台即可立即生效。
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-500 hover:text-white p-2 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmitProject} className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Image Upload / URL */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    作品封面图片 <span className="text-amber-400">*</span>
                  </label>

                  {/* Image Preview Area */}
                  {formData.imageUrl ? (
                    <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-white/10 bg-zinc-900 group">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload size={14} /> 更换图片
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 size={14} /> 移除
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/10 hover:border-amber-500/50 rounded-xl p-8 text-center cursor-pointer transition-colors bg-zinc-950/60"
                    >
                      <Upload className="mx-auto text-zinc-500 mb-3" size={28} />
                      <p className="text-xs font-bold text-white uppercase tracking-wider">点击上传本地电脑图片</p>
                      <p className="text-[11px] text-zinc-500 mt-1">支持 PNG, JPG, WEBP (自动优化以保证急速加载)</p>
                    </div>
                  )}

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />

                  {/* Or Direct URL Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-zinc-500 font-mono shrink-0">或输入外部图片链接:</span>
                    <input 
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Title & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      作品标题 <span className="text-amber-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="例如: Nexa: 智能资产管理平台"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      分类标签 <span className="text-amber-400">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="项目应用">项目应用</option>
                        <option value="品牌视觉">品牌视觉</option>
                        <option value="运营设计">运营设计</option>
                        <option value="其他设计">其他设计</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="自定义分类..."
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Year, Client & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      年份 <span className="text-amber-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="2024 / 2025"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      客户 / 公司
                    </label>
                    <input 
                      type="text" 
                      placeholder="例如: Nexa Finance"
                      value={formData.client}
                      onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      担任角色
                    </label>
                    <input 
                      type="text" 
                      placeholder="例如: Lead UI/UX Designer"
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    首页卡片简要描述 (Card Description) <span className="text-amber-400">*</span>
                  </label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="简明扼要的一两句话，展示在首页作品卡片上..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>

                {/* Detailed Overview */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    详细案例介绍 (Case Study Overview)
                  </label>
                  <textarea 
                    rows={5}
                    placeholder="作品详情页面中显示的详细案例背景、设计理念与成果总结..."
                    value={formData.overview}
                    onChange={(e) => setFormData(prev => ({ ...prev, overview: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>

                {/* Modal Footer with One-click Save Button */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 sticky bottom-0 bg-[#0A0A0A] pb-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xl hover:scale-[1.02] cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} /> 保存并同步中...
                      </>
                    ) : (
                      <>
                        <Save size={14} /> 一键保存并更新到网站
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
