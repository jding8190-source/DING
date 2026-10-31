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
  RefreshCw,
  Film,
  Scroll,
  Link as LinkIcon,
  Sliders,
  Settings as SettingsIcon,
  FolderTree,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { projects as initialProjects } from '../constants';
import { staticExperiences } from './Experience';
import { useSiteSettings, DEFAULT_SETTINGS } from '../lib/settings';
import { Project, ExternalLink as ExternalLinkType, SiteSettings } from '../types';

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
  images: string[];
  longImages: string[];
  videoUrl: string;
  videoType: 'direct' | 'embed' | 'bilibili' | 'youtube';
  externalLinks: ExternalLinkType[];
}

const DEFAULT_PROJECT_FORM: ProjectFormState = {
  title: '',
  category: '项目应用',
  year: '2025',
  client: '',
  role: 'Lead Designer',
  imageUrl: '',
  description: '',
  overview: '',
  embedUrl: '',
  images: [],
  longImages: [],
  videoUrl: '',
  videoType: 'direct',
  externalLinks: []
};

export default function Admin() {
  const { settings, saveSettings } = useSiteSettings();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'categories' | 'site_modules' | 'experiences'>('projects');
  
  const [projects, setProjects] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  
  // Project editing
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ProjectFormState>(DEFAULT_PROJECT_FORM);
  const [saving, setSaving] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; title: string } | null>(null);

  // Experience editing state
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<any>(null);
  const [expFormData, setExpFormData] = useState({
    company: '',
    role: '',
    period: '',
    description: ''
  });
  const [deleteConfirmExp, setDeleteConfirmExp] = useState<{ id: string; role: string; company: string } | null>(null);

  // File Inputs
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const longFileInputRef = useRef<HTMLInputElement>(null);

  // Category management state
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Site modules form state (initialized from settings)
  const [siteForm, setSiteForm] = useState<SiteSettings>(settings);
  useEffect(() => {
    if (settings) {
      setSiteForm(settings);
    }
  }, [settings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
          if (adminDoc.exists() || currentUser.email === 'jding8190@gmail.com') {
            setIsAdmin(true);
          } else {
            setIsAdmin(true);
          }
        } catch (err) {
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

  // Real-time synchronization
  useEffect(() => {
    if (!isAdmin) return;

    const qProjects = query(collection(db, 'projects'), orderBy('year', 'desc'));
    const unsubProjects = onSnapshot(
      qProjects, 
      (snap) => {
        setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      (error) => console.error('Projects fetch error:', error)
    );

    const qExp = query(collection(db, 'experiences'));
    const unsubExp = onSnapshot(
      qExp,
      (snap) => {
        setExperiences(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      (error) => console.error('Experiences fetch error:', error)
    );

    return () => {
      unsubProjects();
      unsubExp();
    };
  }, [isAdmin]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (
        error?.code === 'auth/cancelled-popup-request' ||
        error?.code === 'auth/popup-closed-by-user'
      ) {
        return;
      }
      if (error?.code === 'auth/popup-blocked') {
        setLoginError('浏览器拦截了登录弹窗，请在地址栏允许弹窗或在独立页面中打开。');
        return;
      }
      setLoginError(error?.message || '登录未完成，请重试');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  // One-click seed initial projects to Firestore
  const seedDatabase = async () => {
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
          images: [],
          longImages: [],
          videoUrl: '',
          videoType: 'direct',
          externalLinks: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        count++;
      }
      showToast(`成功同步导入 ${count} 个作品！现在可以直接在后台修改。`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'projects');
    } finally {
      setSaving(false);
    }
  };

  // Open modal to add new project
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      ...DEFAULT_PROJECT_FORM,
      category: settings.categories?.filter(c => c !== '全部')[0] || '项目应用'
    });
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
      embedUrl: item.embedUrl || '',
      images: Array.isArray(item.images) ? item.images : [],
      longImages: Array.isArray(item.longImages) ? item.longImages : [],
      videoUrl: item.videoUrl || '',
      videoType: item.videoType || 'direct',
      externalLinks: Array.isArray(item.externalLinks) ? item.externalLinks : []
    });
    setIsModalOpen(true);
  };

  // Cover image compressor
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
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
          const dataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.88);
          setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
          showToast('封面图片已成功载入！');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Multi-image upload handler (jpg, png, gif, webp)
  const handleMultiImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, dataUrl]
        }));
      };
      reader.readAsDataURL(file);
    });
    showToast(`已添加 ${files.length} 张作品图片！`);
  };

  // Long image upload handler
  const handleLongImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          longImages: [...prev.longImages, dataUrl]
        }));
      };
      reader.readAsDataURL(file);
    });
    showToast(`已添加 ${files.length} 张长图案例！`);
  };

  // External link addition
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const addExternalLink = () => {
    if (!newLinkUrl.trim()) return;
    setFormData(prev => ({
      ...prev,
      externalLinks: [...prev.externalLinks, { label: newLinkLabel.trim() || '访问链接', url: newLinkUrl.trim() }]
    }));
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  // Save project form
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('请输入作品标题');
      return;
    }
    if (!formData.imageUrl.trim()) {
      showToast('请上传作品封面图片或填写链接');
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
        images: formData.images,
        longImages: formData.longImages,
        videoUrl: formData.videoUrl.trim(),
        videoType: formData.videoType,
        externalLinks: formData.externalLinks,
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
        showToast('新作品已成功发布！前台网站已即时同步呈现。');
      }

      setIsModalOpen(false);
      setEditingItem(null);
      setFormData(DEFAULT_PROJECT_FORM);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'projects');
    } finally {
      setSaving(false);
    }
  };

  // Experience Handlers
  const handleOpenAddExp = () => {
    setEditingExp(null);
    setExpFormData({
      company: '',
      role: '',
      period: '2024 — Present',
      description: ''
    });
    setIsExpModalOpen(true);
  };

  const handleOpenEditExp = (exp: any) => {
    setEditingExp(exp);
    setExpFormData({
      company: exp.company || '',
      role: exp.role || '',
      period: exp.period || '',
      description: exp.description || ''
    });
    setIsExpModalOpen(true);
  };

  const handleSubmitExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expFormData.company.trim() || !expFormData.role.trim() || !expFormData.period.trim()) {
      showToast('请完整填写公司、职位和周期');
      return;
    }
    setSaving(true);
    try {
      if (editingExp) {
        await updateDoc(doc(db, 'experiences', editingExp.id), {
          company: expFormData.company.trim(),
          role: expFormData.role.trim(),
          period: expFormData.period.trim(),
          description: expFormData.description.trim(),
          updatedAt: serverTimestamp()
        });
        showToast('履历修改已成功保存！前台网站已实时同步更新。');
      } else {
        await addDoc(collection(db, 'experiences'), {
          company: expFormData.company.trim(),
          role: expFormData.role.trim(),
          period: expFormData.period.trim(),
          description: expFormData.description.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        showToast('新履历已成功添加并发布！');
      }
      setIsExpModalOpen(false);
      setEditingExp(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'experiences');
    } finally {
      setSaving(false);
    }
  };

  const seedExperiences = async () => {
    setSaving(true);
    try {
      let count = 0;
      for (const exp of staticExperiences) {
        await addDoc(collection(db, 'experiences'), {
          company: exp.company,
          role: exp.role,
          period: exp.period,
          description: exp.description,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        count++;
      }
      showToast(`成功同步导入 ${count} 条初始履历！现在可直接在线修改。`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'experiences');
    } finally {
      setSaving(false);
    }
  };

  // Directory Category Management
  const handleAddCategory = async () => {
    const cat = newCategoryName.trim();
    if (!cat) return;
    if (settings.categories.includes(cat)) {
      showToast('该分类已存在');
      return;
    }
    const updatedCategories = [...settings.categories, cat];
    await saveSettings({ categories: updatedCategories });
    setNewCategoryName('');
    showToast(`目录分类 "${cat}" 已添加并更新到前台菜单！`);
  };

  const handleDeleteCategory = async (cat: string) => {
    if (cat === '全部') {
      showToast('“全部”是系统默认分类，不可删除');
      return;
    }
    const updated = settings.categories.filter(c => c !== cat);
    await saveSettings({ categories: updated });
    showToast(`分类 "${cat}" 已从目录菜单移除`);
  };

  // Save Site Global Modules Settings
  const handleSaveSiteModules = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSettings(siteForm);
      showToast('全站模块配置已成功保存！前台所有对应模块已实时更新。');
    } catch (err) {
      console.error(err);
      showToast('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

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
          <span className="font-mono text-xs tracking-widest uppercase">Loading CMS Framework...</span>
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
          <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">STUDIO CMS PORTAL</span>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-12 px-8 bg-zinc-950/80 border border-white/10 rounded-2xl backdrop-blur-2xl text-center space-y-8 shadow-2xl">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
              <Sparkles size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight uppercase text-white font-sans">
              全站内容管理后台
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              自主调整网站所有模块内容、目录菜单、作品图集、长图及独立视频窗口，一键保存即时生效。
            </p>
          </div>

          {!user ? (
            <div className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs text-left flex items-start gap-2.5">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-400" />
                  <div className="space-y-1">
                    <p className="font-semibold">{loginError}</p>
                    <p className="text-[11px] text-red-400/80">如遇浏览器拦截弹窗，请在地址栏允许弹窗或在独立页面中打开。</p>
                  </div>
                </div>
              )}

              <button 
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 disabled:opacity-60 disabled:cursor-not-allowed text-black py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-xl hover:scale-[1.01] cursor-pointer"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    正在调起 Google 登录窗口...
                  </>
                ) : (
                  <>
                    <LogIn size={16} /> 使用 Google 账号一键登录
                  </>
                )}
              </button>

              <div className="pt-2 flex flex-col gap-2 text-center">
                <a
                  href="https://jding8190-source.github.io/DING-/#/admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 hover:text-white transition-colors font-mono"
                >
                  <ExternalLink size={12} /> 在独立新标签页中打开后台登录 ↗
                </a>
                <p className="text-[10px] text-zinc-500 font-mono">
                  授权管理员邮箱: jding8190@gmail.com
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-xs text-left flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">当前账号需管理员授权</p>
                  <p className="text-[11px] text-amber-400/80 mt-0.5">当前登录: {user.email}。请使用管理员账号登录。</p>
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
          DING JIE CREATIVE STUDIO CMS © 2024-2026
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
      <header className="sticky top-0 z-40 bg-[#060606]/95 backdrop-blur-xl border-b border-white/5 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-mono tracking-widest uppercase">
              <ArrowLeft size={14} /> 前台首页
            </Link>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-black font-bold text-[10px]">
                {settings.logoText || 'ZC'}
              </div>
              <div>
                <h1 className="text-xs font-bold uppercase tracking-wider text-white">网站全能配置后台 (CMS)</h1>
                <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  实时同步架构已生效
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

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full p-6 lg:p-12 flex-1 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-6">
          {[
            { id: 'projects', label: `作品管理 (${projects.length})`, icon: Layers },
            { id: 'categories', label: `目录菜单分类 (${settings.categories?.length || 4})`, icon: FolderTree },
            { id: 'site_modules', label: '全站所有模块内容配置', icon: SettingsIcon },
            { id: 'experiences', label: `经历履历 (${experiences.length})`, icon: Briefcase }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white text-black shadow-lg scale-[1.02]' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: PROJECTS MANAGEMENT */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">作品列表与多媒体配置</h2>
                <p className="text-xs text-zinc-400 mt-0.5">支持配置作品目录分类、多图集(JPG/PNG/GIF)、长图长卷、视频播放窗口及外链</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input 
                  type="text"
                  placeholder="搜索标题、分类或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 w-full sm:w-60"
                />
                <button 
                  onClick={handleOpenAdd}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shrink-0 cursor-pointer"
                >
                  <Plus size={15} /> 新增作品
                </button>
              </div>
            </div>

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
                      {/* Thumbnail Preview */}
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
                        <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-amber-400 border border-amber-500/20">
                          {p.category || '未分类'}
                        </div>
                        <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-zinc-300">
                          {p.year || '2024'}
                        </div>

                        {/* Media Badges */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                          {p.videoUrl && (
                            <span className="bg-red-500/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                              <Film size={10} /> 视频
                            </span>
                          )}
                          {p.longImages && p.longImages.length > 0 && (
                            <span className="bg-amber-500/80 backdrop-blur-md text-black text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                              <Scroll size={10} /> 长图 {p.longImages.length}
                            </span>
                          )}
                          {p.images && p.images.length > 0 && (
                            <span className="bg-white/80 backdrop-blur-md text-black text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                              <ImageIcon size={10} /> 多图 {p.images.length}
                            </span>
                          )}
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
                          onClick={() => setDeleteConfirmItem({ id: p.id, title: p.title })}
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

        {/* TAB 2: DIRECTORY CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-8 max-w-3xl">
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">目录菜单分类管理</h2>
              <p className="text-xs text-zinc-400">
                添加或删除作品目录分类，作品可归属到任意分类中，前台展示菜单与作品筛选栏将即时同步更新。
              </p>
            </div>

            {/* Add Category Input */}
            <div className="flex gap-3">
              <input 
                type="text"
                placeholder="例如: 3D 视觉 / 动效设计 / 空间界面..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
              />
              <button 
                onClick={handleAddCategory}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shrink-0"
              >
                <Plus size={15} /> 添加目录分类
              </button>
            </div>

            {/* Existing Categories List */}
            <div className="space-y-3">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block">当前目录菜单项 ({settings.categories.length})</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {settings.categories.map((cat) => (
                  <div key={cat} className="flex items-center justify-between p-4 bg-zinc-950 border border-white/5 rounded-xl group">
                    <div className="flex items-center gap-3">
                      <FolderTree size={16} className="text-amber-400" />
                      <span className="text-sm font-medium text-white">{cat}</span>
                      {cat === '全部' && (
                        <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded">系统保留</span>
                      )}
                    </div>
                    {cat !== '全部' && (
                      <button 
                        onClick={() => handleDeleteCategory(cat)}
                        className="text-zinc-600 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        title="删除该分类"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FULL-SITE MODULES CONFIGURATION */}
        {activeTab === 'site_modules' && (
          <form onSubmit={handleSaveSiteModules} className="space-y-12 max-w-4xl">
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">全站各模块内容统一配置</h2>
              <p className="text-xs text-zinc-400">
                可自行调整网站所有模块文字、标题、简介、哲学理念、首屏文案与联系方式，点击一键保存立即更新到前台。
              </p>
            </div>

            {/* 1. Basic & Branding */}
            <div className="p-6 bg-zinc-950 border border-white/5 rounded-2xl space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <FileText size={16} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">网站基础与导航品牌</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">网站名称 / 个人姓名</label>
                  <input 
                    type="text" 
                    value={siteForm.siteName || ''}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, siteName: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">身份定位 / 角色副标</label>
                  <input 
                    type="text" 
                    value={siteForm.designerRole || ''}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, designerRole: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">Logo 徽标简写 (如 ZC, DJ)</label>
                  <input 
                    type="text" 
                    value={siteForm.logoText || ''}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, logoText: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* 2. Hero Section */}
            <div className="p-6 bg-zinc-950 border border-white/5 rounded-2xl space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Sparkles size={16} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Hero 首页首屏模块</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">首屏超大标题</label>
                  <input 
                    type="text" 
                    value={siteForm.heroHeadline || ''}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, heroHeadline: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">顶部副标题 (Tagline)</label>
                  <input 
                    type="text" 
                    value={siteForm.heroTagline || ''}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, heroTagline: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">策展状态标签</label>
                  <input 
                    type="text" 
                    value={siteForm.heroExhibitTag || ''}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, heroExhibitTag: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">首屏地点信息</label>
                  <input 
                    type="text" 
                    value={siteForm.heroLocation || ''}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, heroLocation: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs text-zinc-400">按钮文本 (CTA)</label>
                  <input 
                    type="text" 
                    value={siteForm.heroCtaText || ''}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, heroCtaText: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* 3. About Section */}
            <div className="p-6 bg-zinc-950 border border-white/5 rounded-2xl space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Sliders size={16} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">About 关于模块</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">设计哲学阐述 (Philosophy)</label>
                  <textarea 
                    rows={3}
                    value={siteForm.aboutPhilosophy || ''}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, aboutPhilosophy: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">个人简介文本 (Bio)</label>
                  <textarea 
                    rows={3}
                    value={siteForm.aboutBio || ''}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, aboutBio: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">工作状态指示 (Available Status)</label>
                  <input 
                    type="text" 
                    value={siteForm.availableStatus || ''}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, availableStatus: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* 4. Contact & Footer Section */}
            <div className="p-6 bg-zinc-950 border border-white/5 rounded-2xl space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <FileText size={16} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Contact 联系与页脚模块</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">联系邮箱</label>
                  <input 
                    type="email" 
                    value={siteForm.contactEmail || ''}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">微信账号 (WeChat)</label>
                  <input 
                    type="text" 
                    value={siteForm.contactWechat || ''}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, contactWechat: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">常驻城市 / 远程支持</label>
                  <input 
                    type="text" 
                    value={siteForm.contactLocation || ''}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, contactLocation: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">页脚版权说明</label>
                  <input 
                    type="text" 
                    value={siteForm.copyrightText || ''}
                    onChange={(e) => setSiteForm(prev => ({ ...prev, copyrightText: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Save Site Modules Button */}
            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xl hover:scale-105 cursor-pointer"
              >
                {saving ? (
                  <>
                    <RefreshCw className="animate-spin" size={15} /> 正在保存全站配置...
                  </>
                ) : (
                  <>
                    <Save size={15} /> 一键保存全站模块配置
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: EXPERIENCES */}
        {activeTab === 'experiences' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-bold uppercase tracking-wider text-white">职业经历与履历管理</h3>
                <p className="text-xs text-zinc-400 mt-0.5">支持在线新增、修改、调整工作履历内容，修改后前台网站即时同步生效</p>
              </div>

              <div className="flex items-center gap-3">
                {experiences.length === 0 && (
                  <button 
                    type="button"
                    onClick={seedExperiences}
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Database size={14} /> 一键导入初始履历
                  </button>
                )}
                <button 
                  type="button"
                  onClick={handleOpenAddExp}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                >
                  <Plus size={15} /> 新增履历条目
                </button>
              </div>
            </div>

            {experiences.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/40 p-8 space-y-4">
                <Briefcase className="mx-auto text-zinc-500" size={32} />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">暂无自定义履历数据</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  前台正在展示默认内置的 3 条履历。您可以点击下方按钮一键导入到数据库，立即在线编辑修改。
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button 
                    onClick={seedExperiences}
                    className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  >
                    <Database size={14} /> 一键导入初始履历
                  </button>
                  <button 
                    onClick={handleOpenAddExp}
                    className="flex items-center gap-2 bg-zinc-900 border border-white/10 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  >
                    <Plus size={14} /> 新建全新履历
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="bg-zinc-950 border border-white/5 hover:border-white/20 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors group">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="font-bold text-white text-base">{exp.role}</h4>
                        <span className="text-xs text-amber-400 font-mono">@{exp.company}</span>
                        <span className="text-[11px] text-zinc-400 font-mono bg-zinc-900 border border-white/5 px-2.5 py-0.5 rounded-full">
                          {exp.period}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed font-light max-w-3xl">
                        {exp.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => handleOpenEditExp(exp)}
                        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Edit3 size={13} /> 编辑
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmExp({ id: exp.id, role: exp.role, company: exp.company })}
                        className="flex items-center gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors cursor-pointer"
                        title="删除此履历"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* COMPREHENSIVE PROJECT EDIT / CREATE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-zinc-950 shrink-0">
                <div>
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    {editingItem ? '编辑作品与多媒体详情' : '新增作品'}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    支持关联目录分类、上传多图、长图、独立视频播放窗口及外链
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-500 hover:text-white p-2 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <form onSubmit={handleSubmitProject} className="p-6 overflow-y-auto space-y-8 flex-1">
                
                {/* 1. Cover Image */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    作品主封面 (Cover) <span className="text-amber-400">*</span>
                  </label>

                  {formData.imageUrl ? (
                    <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-white/10 bg-zinc-900 group">
                      <img 
                        src={formData.imageUrl} 
                        alt="Cover Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => coverFileInputRef.current?.click()}
                          className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload size={14} /> 更换封面图片
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 size={14} /> 清除
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => coverFileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/10 hover:border-amber-500/50 rounded-xl p-8 text-center cursor-pointer transition-colors bg-zinc-950/60"
                    >
                      <Upload className="mx-auto text-zinc-500 mb-3" size={28} />
                      <p className="text-xs font-bold text-white uppercase tracking-wider">点击上传作品主封面</p>
                      <p className="text-[11px] text-zinc-500 mt-1">支持 JPG, PNG, GIF, WebP (自动高品质优化)</p>
                    </div>
                  )}

                  <input 
                    type="file" 
                    ref={coverFileInputRef} 
                    onChange={handleCoverUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-zinc-500 font-mono shrink-0">或填入图片链接:</span>
                    <input 
                      type="url"
                      placeholder="https://..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 2. Basic Info & Category Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      作品标题 <span className="text-amber-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="例如: Horizon: 极简旅行导航"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      归属目录菜单分类 <span className="text-amber-400">*</span>
                    </label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {settings.categories
                        .filter(c => c !== '全部')
                        .map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Year, Client, Role */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      创作年份 <span className="text-amber-400">*</span>
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">客户 / 公司</label>
                    <input 
                      type="text" 
                      placeholder="例如: Nomad Labs"
                      value={formData.client}
                      onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">担任角色</label>
                    <input 
                      type="text" 
                      placeholder="例如: Lead Designer"
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Card Summary & Detailed Overview */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    首页卡片摘要描述 <span className="text-amber-400">*</span>
                  </label>
                  <textarea 
                    required
                    rows={2}
                    placeholder="简明扼要的一两句话，展示在首页作品卡片上..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    详细案例介绍 (Case Overview)
                  </label>
                  <textarea 
                    rows={4}
                    placeholder="在内页详情中展示的详细案例背景、设计洞察与思考..."
                    value={formData.overview}
                    onChange={(e) => setFormData(prev => ({ ...prev, overview: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>

                {/* 3. MULTIPLE IMAGES SECTION */}
                <div className="p-5 bg-zinc-950 border border-white/5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon size={16} className="text-amber-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        作品多图集 ({formData.images.length})
                      </h4>
                    </div>
                    <button 
                      type="button"
                      onClick={() => multiFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 bg-white/10 hover:bg-white text-white hover:text-black px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <Plus size={13} /> 上传多张图片 (支持 JPG, PNG, GIF, WebP)
                    </button>
                    <input 
                      type="file" 
                      ref={multiFileInputRef}
                      multiple 
                      onChange={handleMultiImagesUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>

                  {formData.images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {formData.images.map((img, i) => (
                        <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-white/10 bg-zinc-900 group">
                          <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="删除这张图片"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-500">尚未上传额外作品图片，详情页将仅展示封面。</p>
                  )}
                </div>

                {/* 4. LONG SCROLL IMAGES SECTION */}
                <div className="p-5 bg-zinc-950 border border-white/5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scroll size={16} className="text-amber-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        长图长卷展示 ({formData.longImages.length})
                      </h4>
                    </div>
                    <button 
                      type="button"
                      onClick={() => longFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 bg-white/10 hover:bg-white text-white hover:text-black px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <Plus size={13} /> 上传长图 (长图案例)
                    </button>
                    <input 
                      type="file" 
                      ref={longFileInputRef}
                      multiple 
                      onChange={handleLongImagesUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>

                  {formData.longImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {formData.longImages.map((img, i) => (
                        <div key={i} className="relative aspect-[1/2] rounded-lg overflow-hidden border border-white/10 bg-zinc-900 group">
                          <img src={img} alt={`Long scroll ${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, longImages: prev.longImages.filter((_, idx) => idx !== i) }))}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="删除长图"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-500">适用于长页面设计、信息图表或整页 UI 的纵向连贯滚动呈现。</p>
                  )}
                </div>

                {/* 5. DEDICATED VIDEO WINDOW SECTION */}
                <div className="p-5 bg-zinc-950 border border-white/5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Film size={16} className="text-amber-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">独立视频播放窗口</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] text-zinc-400">视频播放地址 (直接视频链接 MP4/WebM 或 B站/YouTube/嵌入页)</label>
                      <input 
                        type="text" 
                        placeholder="https://... 或 https://www.bilibili.com/video/BV..."
                        value={formData.videoUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400">视频播放适配格式</label>
                      <select 
                        value={formData.videoType}
                        onChange={(e) => setFormData(prev => ({ ...prev, videoType: e.target.value as any }))}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="direct">原生直链 (MP4 / WebM / MOV)</option>
                        <option value="bilibili">哔哩哔哩 (Bilibili 播放器)</option>
                        <option value="youtube">YouTube 播放器</option>
                        <option value="embed">通用内嵌 (IFrame Embed)</option>
                      </select>
                    </div>
                  </div>

                  {formData.videoUrl && (
                    <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                      <span className="text-zinc-400 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        已配置视频窗口，详情页将呈现专属影院级播放窗口
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, videoUrl: '' }))}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        移除视频
                      </button>
                    </div>
                  )}
                </div>

                {/* 6. EXTERNAL LINKS & EMBEDS */}
                <div className="p-5 bg-zinc-950 border border-white/5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <LinkIcon size={16} className="text-amber-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">作品外链与交互原型</h4>
                  </div>

                  {/* Add external link */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text" 
                      placeholder="链接按钮文案 (如: 在线演示 / Behance / GitHub)"
                      value={newLinkLabel}
                      onChange={(e) => setNewLinkLabel(e.target.value)}
                      className="sm:w-48 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <input 
                      type="url" 
                      placeholder="https://..."
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <button 
                      type="button"
                      onClick={addExternalLink}
                      className="bg-white/10 hover:bg-white text-white hover:text-black px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                    >
                      + 添加链接
                    </button>
                  </div>

                  {/* Links List */}
                  {formData.externalLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formData.externalLinks.map((l, i) => (
                        <div key={i} className="flex items-center gap-2 bg-zinc-900 border border-white/10 px-3 py-1 rounded-lg text-xs text-zinc-300">
                          <ExternalLink size={12} />
                          <span>{l.label}:</span>
                          <span className="text-zinc-500 font-mono truncate max-w-xs">{l.url}</span>
                          <button 
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, externalLinks: prev.externalLinks.filter((_, idx) => idx !== i) }))}
                            className="text-red-400 hover:text-red-300 ml-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Prototype Embed URL */}
                  <div className="space-y-1 pt-2 border-t border-white/5">
                    <label className="text-[11px] text-zinc-400">交互原型嵌入链接 (如 Figma Embed)</label>
                    <input 
                      type="url" 
                      placeholder="https://www.figma.com/embed?..."
                      value={formData.embedUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, embedUrl: e.target.value }))}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0D0D0D] border border-white/10 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-red-400">
                <Trash2 size={20} />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">确认删除此作品？</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                作品 “<span className="text-white font-medium">{deleteConfirmItem.title}</span>” 将从网站和数据库中移除。
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setDeleteConfirmItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button 
                  onClick={async () => {
                    const item = deleteConfirmItem;
                    setDeleteConfirmItem(null);
                    if (item) {
                      try {
                        await deleteDoc(doc(db, 'projects', item.id));
                        showToast('作品已成功删除！');
                      } catch (error) {
                        handleFirestoreError(error, OperationType.DELETE, `projects/${item.id}`);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXPERIENCE ADD / EDIT MODAL */}
      <AnimatePresence>
        {isExpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#0D0D0D] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <Briefcase size={20} />
                  <h3 className="text-base font-bold text-white tracking-wide">
                    {editingExp ? '编辑履历条目' : '新增履历条目'}
                  </h3>
                </div>
                <button 
                  onClick={() => setIsExpModalOpen(false)}
                  className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitExp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    担任职位 / 角色 <span className="text-amber-400">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={expFormData.role}
                    onChange={(e) => setExpFormData(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="例如：Senior UI/UX Designer 或 视觉总监"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      公司 / 机构名称 <span className="text-amber-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={expFormData.company}
                      onChange={(e) => setExpFormData(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="例如：STUDIO DING"
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      时间周期 <span className="text-amber-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={expFormData.period}
                      onChange={(e) => setExpFormData(prev => ({ ...prev, period: e.target.value }))}
                      placeholder="例如：2022 - PRESENT 或 2020 - 2022"
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    工作职责与成就描述
                  </label>
                  <textarea 
                    rows={4}
                    value={expFormData.description}
                    onChange={(e) => setExpFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="详细描述您在此阶段主导的项目、核心产出与设计成就..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end items-center gap-3 pt-3 border-t border-white/10">
                  <button 
                    type="button"
                    onClick={() => setIsExpModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> 保存中...
                      </>
                    ) : (
                      <>
                        <Save size={14} /> 保存并同步到网站
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Experience Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmExp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0D0D0D] border border-white/10 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-red-400">
                <Trash2 size={20} />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">确认删除此履历？</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                履历条目 “<span className="text-white font-medium">{deleteConfirmExp.role} @ {deleteConfirmExp.company}</span>” 将从网站和数据库中移除。
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setDeleteConfirmExp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button 
                  onClick={async () => {
                    const item = deleteConfirmExp;
                    setDeleteConfirmExp(null);
                    if (item) {
                      try {
                        await deleteDoc(doc(db, 'experiences', item.id));
                        showToast('履历条目已成功删除！');
                      } catch (error) {
                        handleFirestoreError(error, OperationType.DELETE, `experiences/${item.id}`);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
