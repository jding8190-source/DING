/**
 * 线上发布通道：把后台保存的内容与媒体直接提交到 GitHub Pages 部署仓库。
 * - 本机 dev：请求经 Vite 插件 /api/github 代理，令牌由服务端从系统钥匙串读取，不进浏览器、不落文件。
 * - 线上静态页：使用本人浏览器内保存的令牌直连 api.github.com（已实测 CORS 允许 PUT + Authorization）。
 * 令牌只用于写 jding8190-source/DING- 的 main 分支；绝不写入源码或仓库。
 */
const OWNER = 'jding8190-source';
const REPO = 'DING-';
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;
const RAW_URL = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/content.json`;
const TOKEN_KEY = 'ding_publish_token';
const DEV = Boolean((import.meta as any).env?.DEV);
const MAX_BLOB = 100 * 1024 * 1024;

export const isDev = DEV;

export function getStoredToken(): string {
  try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
}
export function setStoredToken(value: string) {
  localStorage.setItem(TOKEN_KEY, value.trim());
}
export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function api(path: string, method = 'GET', body?: unknown): Promise<any> {
  let res: Response;
  if (DEV) {
    res = await fetch('/api/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, method, body }),
    });
  } else {
    const token = getStoredToken();
    if (!token) throw new Error('尚未配置发布令牌。请在后台顶部「发布通道」粘贴一次 GitHub 令牌。');
    res = await fetch(API_BASE + path, {
      method,
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text.slice(0, 160) }; }
  if (!res.ok) {
    throw new Error(`发布失败（GitHub HTTP ${res.status}）：${data.message || '未知错误'}`);
  }
  return data;
}

/** 一次提交写入多个根级文件；base_tree 保留其余构建产物，路径不含斜杠以避开嵌套 tree 限制。 */
async function commitOnce(files: { path: string; base64: string }[], message: string): Promise<string> {
  const entries: { path: string; mode: string; type: string; sha: string }[] = [];
  for (const file of files) {
    const blob = await api('/git/blobs', 'POST', { content: file.base64, encoding: 'base64' });
    entries.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  const ref = await api('/git/ref/heads/main');
  const parent: string = ref.object.sha;
  const parentCommit = await api('/git/commits/' + parent);
  const tree = await api('/git/trees', 'POST', { base_tree: parentCommit.tree.sha, tree: entries });
  const commit = await api('/git/commits', 'POST', { message, tree: tree.sha, parents: [parent] });
  await api('/git/refs/heads/main', 'PATCH', { sha: commit.sha });
  return commit.sha as string;
}

// 所有提交串行执行：上传与保存并发时不会互相顶掉 main 引用（避免 409 非快进）。
let chain: Promise<unknown> = Promise.resolve();
function serialize<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(task, task);
  chain = run.catch(() => undefined);
  return run;
}

const RETRYABLE = /HTTP (409|422|429|500|502|503|504)/;

async function commitFiles(files: { path: string; base64: string }[], message: string): Promise<string> {
  return serialize(async () => {
    let last: unknown = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await commitOnce(files, message);
      } catch (error) {
        last = error;
        const text = error instanceof Error ? error.message : String(error);
        if (!RETRYABLE.test(text)) throw error;
        await new Promise(resolve => setTimeout(resolve, 700 * (attempt + 1)));
      }
    }
    throw last instanceof Error ? last : new Error('发布失败：GitHub 多次拒绝提交');
  });
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

export function textBase64(text: string): string {
  return bytesToBase64(new TextEncoder().encode(text));
}

export async function fileBase64(file: File): Promise<string> {
  if (file.size > MAX_BLOB) throw new Error('单文件超过 100 MB 上限，请压缩后再上传');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsDataURL(file);
  });
}

/** 保存全站内容：写 content.json 到部署仓库，站点运行时读取，无需重新构建。 */
export async function publishContent(snapshot: any): Promise<string> {
  const payload = { ...snapshot, publishedAt: new Date().toISOString() };
  return commitFiles(
    [{ path: 'content.json', base64: textBase64(JSON.stringify(payload, null, 2)) }],
    'content: 后台保存并发布',
  );
}

/** 上传单个媒体：以 media_* 根级文件写入部署仓库，返回站内相对地址。 */
export async function publishAsset(name: string, base64: string): Promise<string> {
  await commitFiles([{ path: name, base64 }], 'media: 后台上传 ' + name);
  return './' + name;
}

/** 批量上传：多个文件合并为一次提交，减少部署次数与等待时间。 */
export async function publishAssets(items: { name: string; base64: string }[]): Promise<string[]> {
  if (items.length === 0) return [];
  await commitFiles(items.map(item => ({ path: item.name, base64: item.base64 })), `media: 后台上传 ${items.length} 个文件`);
  return items.map(item => './' + item.name);
}

async function tryFetch(url: string): Promise<any | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.settings && Array.isArray(data.projects) && Array.isArray(data.experiences)) return data;
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** 读取线上最新内容；同源与 raw 双源并行，取 publishedAt 最新的一份，任一失败自动回退打包默认值。 */
export async function fetchLiveContent(): Promise<any | null> {
  const t = Date.now();
  const urls = DEV
    ? [`${RAW_URL}?t=${t}`, `./content.json?t=${t}`]
    : [`./content.json?t=${t}`, `${RAW_URL}?t=${t}`];
  const results = (await Promise.all(urls.map(tryFetch))).filter(Boolean) as any[];
  if (results.length === 0) return null;
  return results.sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')))[0];
}
