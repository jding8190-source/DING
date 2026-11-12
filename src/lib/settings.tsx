import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { db, doc, onSnapshot, setDoc, getDoc } from './localStore';
import { DEFAULT_SETTINGS } from '../data/defaults';
import { SiteSettings } from '../types';

export { DEFAULT_SETTINGS };

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
      adminToken: 'ding8190_admin_token',
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
