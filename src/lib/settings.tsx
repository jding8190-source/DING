import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { db } from './firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { SiteSettings } from '../types';

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Ding Jie",
  siteTitle: "Ding Jie — Creative Director & Product Designer",
  logoText: "ZC",
  designerRole: "Creative Director",
  
  heroHeadline: "DESIGN",
  heroTagline: "Creative Exhibition Lab",
  heroExhibitTag: "PORTFOLIO CURATION 2024-2026",
  heroLocation: "SHANGHAI / TOKYO / REMOTE",
  heroCtaText: "Enter Exhibition",
  heroBgUrl: "./hero_bg.png",

  aboutBio: "聚焦于极简、秩序感与空间深度的跨学科数字体验设计。致力于将尖端科技与高级极简视觉融汇一体，通过克制的排版、通透的光影与精准的交互构建卓越的产品体验。",
  aboutPhilosophy: "优秀的设计不应喧宾夺主，而应如静水深流，在触动使用者的瞬间建立起牢固的情感链接与认知秩序。",
  aboutSkills: ["Design Systems", "Product Architecture", "Spatial UI", "Art Direction", "Motion Prototyping", "Visual Branding"],
  availableStatus: "Available — 2024-2026",

  contactEmail: "jding8190@gmail.com",
  contactWechat: "dingjie_design",
  contactLocation: "Shanghai, China & Remote",
  copyrightText: "© 2024-2026 DING JIE. ALL RIGHTS RESERVED.",

  categories: ["全部", "项目应用", "品牌视觉", "运营设计"]
};

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  saveSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  loading: false,
  saveSettings: async () => {}
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const docRef = doc(db, 'settings', 'global');
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<SiteSettings>;
          setSettings({
            ...DEFAULT_SETTINGS,
            ...data,
            categories: data.categories && data.categories.length > 0 
              ? (data.categories.includes("全部") ? data.categories : ["全部", ...data.categories])
              : DEFAULT_SETTINGS.categories
          });
        }
        setLoading(false);
      }, (err) => {
        console.warn('Settings snapshot listener info:', err);
        setLoading(false);
      });
    } catch (err) {
      console.warn('Could not connect settings listener:', err);
      setLoading(false);
    }
    return () => unsubscribe();
  }, []);

  const saveSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = {
      ...settings,
      ...newSettings,
      updatedAt: new Date().toISOString()
    };
    const docRef = doc(db, 'settings', 'global');
    await setDoc(docRef, updated, { merge: true });
    setSettings(updated);
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SettingsContext);
}
