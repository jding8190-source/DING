import persisted from '../data/content';
import { projects as defaultProjects } from '../constants';
import { DEFAULT_SETTINGS, staticExperiences } from '../data/defaults';
import { publishContent, fetchLiveContent } from './remoteStore';

/**
 * 本地内容库：与 firebase/firestore 常用 API 形状兼容，去掉了对外部后端的依赖。
 * - 读：来自 src/data/content.ts（构建时打包，线上只读）
 * - 写：本机管理台通过 /api/content 落盘到同一文件，Vite HMR 即时刷新
 */

type Ref = {
  kind: 'collection' | 'doc' | 'query';
  path: string;
  id?: string;
  order?: { field: string; dir: string };
};

const snapshot: any = persisted || {};
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

let state: any = {
  settings: { ...clone(DEFAULT_SETTINGS), ...(snapshot.settings || {}) },
  projects: snapshot.projects == null ? clone(defaultProjects) : snapshot.projects,
  experiences: snapshot.experiences == null
    ? staticExperiences.map((item, i) => ({ id: `exp-${i + 1}`, ...item }))
    : snapshot.experiences,
};

export const db = {};
export const isWritable = true; // 线上与本机均可编辑，写入统一发布到部署仓库

const listeners = new Set<() => void>();

/** 保存即发布：全站内容一次提交到部署仓库 content.json，站点运行时读取，无需重新构建。 */
async function persist(): Promise<void> {
  await publishContent(state);
}

async function commit() {
  try {
    await persist();
  } catch (error) {
    handleFirestoreError(error);
    throw error;
  } finally {
    listeners.forEach(fn => fn());
  }
}

export const serverTimestamp = () => new Date().toISOString();

export function handleFirestoreError(error: unknown, _operation?: unknown, _path?: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn('[本地内容库]', message);
  window.dispatchEvent(new CustomEvent('ding-admin-toast', { detail: message }));
}

export const OperationType = {
  CREATE: 'create', UPDATE: 'update', DELETE: 'delete',
  LIST: 'list', GET: 'get', WRITE: 'write',
};

export function collection(_db: unknown, path: string): Ref {
  return { kind: 'collection', path };
}

export function doc(_db: unknown, path: string, id?: string): Ref {
  return { kind: 'doc', path, id: id ?? (path === 'settings' ? 'global' : '') };
}

export function orderBy(field: string, dir: 'asc' | 'desc' = 'asc') {
  return { field, dir };
}

export function query(ref: Ref, ...clauses: any[]): Ref {
  const order = clauses.find(c => c && c.field);
  return { kind: 'query', path: ref.path, order };
}

function listFor(ref: Ref): any[] {
  const list: any[] = Array.isArray(state[ref.path]) ? state[ref.path] : [];
  if (!ref.order) return list;
  const { field, dir } = ref.order;
  return [...list].sort((a, b) => {
    const av = String(a?.[field] ?? '');
    const bv = String(b?.[field] ?? '');
    return dir === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv);
  });
}

function querySnap(ref: Ref) {
  const items = listFor(ref);
  return {
    empty: items.length === 0,
    size: items.length,
    docs: items.map(item => ({ id: item.id, exists: () => true, data: () => item })),
  };
}

function docSnap(id: string, data: any) {
  return { exists: () => data != null, id, data: () => data };
}

function findDoc(ref: Ref): any {
  const list: any[] = Array.isArray(state[ref.path]) ? state[ref.path] : [];
  return list.find(item => item.id === ref.id) ?? null;
}

export function onSnapshot(
  ref: Ref,
  onNext: (snap: any) => void,
  onError?: (error: unknown) => void,
): () => void {
  const fire = () => {
    try {
      onNext(
        ref.kind === 'doc' && ref.path === 'settings'
          ? docSnap('global', state.settings)
          : querySnap(ref),
      );
    } catch (error) {
      onError?.(error);
    }
  };
  listeners.add(fire);
  queueMicrotask(fire);
  return () => { listeners.delete(fire); };
}

export async function getDocs(ref: Ref) {
  return querySnap(ref);
}

export async function getDoc(ref: Ref) {
  return docSnap(ref.id ?? 'global', ref.path === 'settings' ? state.settings : findDoc(ref));
}

export async function addDoc(ref: Ref, data: any) {
  const id = `${ref.path}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const list: any[] = Array.isArray(state[ref.path]) ? state[ref.path] : (state[ref.path] = []);
  list.push({ ...data, id });
  await commit();
  return { id };
}

export async function updateDoc(ref: Ref, data: any) {
  const list: any[] = Array.isArray(state[ref.path]) ? state[ref.path] : (state[ref.path] = []);
  const index = list.findIndex(item => item.id === ref.id);
  if (index >= 0) list[index] = { ...list[index], ...data };
  else list.push({ ...data, id: ref.id });
  await commit();
}

export async function deleteDoc(ref: Ref) {
  const list: any[] = Array.isArray(state[ref.path]) ? state[ref.path] : [];
  state[ref.path] = list.filter(item => item.id !== ref.id);
  await commit();
}

export async function setDoc(ref: Ref, data: any, options?: { merge?: boolean }) {
  if (ref.path === 'settings') {
    state.settings = options?.merge ? { ...state.settings, ...data } : data;
  } else {
    const list: any[] = Array.isArray(state[ref.path]) ? state[ref.path] : (state[ref.path] = []);
    const index = list.findIndex(item => item.id === ref.id);
    if (index >= 0) list[index] = options?.merge ? { ...list[index], ...data } : data;
    else list.push({ ...data, id: ref.id });
  }
  await commit();
}

/** 启动时读取线上最新内容（同源 + raw 双源），覆盖打包快照并通知所有订阅组件。 */
export async function hydrateLiveContent(): Promise<void> {
  const live = await fetchLiveContent();
  if (!live) return;
  state = {
    settings: { ...clone(DEFAULT_SETTINGS), ...(live.settings || {}) },
    projects: live.projects,
    experiences: live.experiences,
    publishedAt: live.publishedAt || '',
  };
  listeners.forEach(fn => fn());
}

void hydrateLiveContent();
