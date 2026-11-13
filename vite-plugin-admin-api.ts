import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const API_BASE = 'https://api.github.com/repos/jding8190-source/DING-';
const PUBLIC_BASE = 'https://jding8190-source.github.io/DING-';
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif',
  'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov', 'video/ogg': '.ogg',
};
const ALLOWED_EXTS = new Set(Object.values(EXT_BY_MIME));
const MAX_BODY = 160 * 1024 * 1024;

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function readBody(req: any, limit = MAX_BODY): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
      if (body.length > limit) { reject(new Error('请求体过大')); req.destroy(); }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

/** 令牌只从系统钥匙串读取，不写入任何文件、不返回给浏览器。 */
function tokenFor(root: string): string {
  const out = execFileSync('git', ['-C', root, 'credential', 'fill'], {
    input: 'protocol=https\nhost=github.com\n\n',
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const line = out.split('\n').find((l: string) => l.startsWith('password='));
  return line ? line.slice('password='.length) : '';
}

/** 仅在本机开发服务器生效：GitHub 写操作代理 + 媒体回源 + 兼容旧的内容/上传端点。 */
export default function adminApi(): Plugin {
  let root = '';
  return {
    name: 'ding-admin-api',
    configResolved(config) { root = config.root; },
    configureServer(server) {
      const publicDir = () => path.resolve(root, 'public');

      // 线上后台上传的媒体不在本机磁盘，回源到已发布的站点，避免本地预览 404。
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = String(req.url || '').split('?')[0];
        if (!/^\/media_[\w.-]+$/.test(url)) { next(); return; }
        if (fs.existsSync(path.join(publicDir(), url.slice(1)))) { next(); return; }
        fetch(PUBLIC_BASE + String(req.url || ''))
          .then(async (r) => {
            res.statusCode = r.status;
            const ct = r.headers.get('content-type');
            if (ct) res.setHeader('Content-Type', ct);
            res.end(Buffer.from(await r.arrayBuffer()));
          })
          .catch(() => { res.statusCode = 404; res.end('Not found'); });
      });

      // 前端所有 GitHub 写操作统一走这里；令牌不出服务端。
      server.middlewares.use('/api/github', (req: any, res: any) => {
        if (req.method !== 'POST') { json(res, 405, { message: '仅支持 POST' }); return; }
        (async () => {
          const raw = await readBody(req);
          const { path: apiPath, method, body } = JSON.parse(raw);
          if (typeof apiPath !== 'string' || !/^\/(git|contents)\//.test(apiPath)) {
            json(res, 403, { message: '不允许的 API 路径' }); return;
          }
          const token = tokenFor(root);
          if (!token) { json(res, 500, { message: '系统钥匙串中未找到 GitHub 凭据' }); return; }
          const upstream = await fetch(API_BASE + apiPath, {
            method: method || 'GET',
            headers: {
              'Authorization': 'Bearer ' + token,
              'Accept': 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
              'Content-Type': 'application/json',
              'User-Agent': 'WorkBuddy',
            },
            body: body == null ? undefined : JSON.stringify(body),
          });
          const text = await upstream.text();
          try {
            fs.appendFileSync('/tmp/ding-admin-api.log', `${new Date().toISOString()} ${method || 'GET'} ${apiPath} -> ${upstream.status}\n`);
          } catch { /* 日志失败不影响请求 */ }
          res.statusCode = upstream.status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(text || '{}');
        })().catch((error: any) => json(res, 502, { message: error?.message || '代理请求失败' }));
      });

      // 兼容端点：手工把当前内容写成源码兜底与本地预览快照。
      server.middlewares.use('/api/content', (req: any, res: any) => {
        if (req.method === 'GET') { json(res, 200, { writable: true }); return; }
        if (req.method !== 'POST') { json(res, 405, { error: '仅支持 GET / POST' }); return; }
        (async () => {
          const data = JSON.parse(await readBody(req, 20 * 1024 * 1024));
          if (!data || !Array.isArray(data.projects) || !Array.isArray(data.experiences) || !data.settings) {
            json(res, 400, { error: '内容结构不合法' }); return;
          }
          const target = path.resolve(root, 'src/data/content.ts');
          const tmp = `${target}.tmp`;
          fs.writeFileSync(tmp, `// 由本机管理台自动写入，请勿手工修改结构。\nexport default ${JSON.stringify(data, null, 2)};\n`, 'utf8');
          fs.renameSync(tmp, target);
          fs.mkdirSync(publicDir(), { recursive: true });
          fs.writeFileSync(path.join(publicDir(), 'content.json'), JSON.stringify(data, null, 2), 'utf8');
          json(res, 200, { ok: true });
        })().catch((error: any) => json(res, 400, { error: error?.message || '写入失败' }));
      });

      // 兼容端点：手工上传媒体到本机 public/。
      server.middlewares.use('/api/upload', (req: any, res: any) => {
        if (req.method !== 'POST') { json(res, 405, { error: '仅支持 POST' }); return; }
        const url = new URL(req.url || '/', 'http://localhost');
        const supplied = url.searchParams.get('name') || '';
        const mime = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
        const ext = EXT_BY_MIME[mime] || path.extname(supplied).toLowerCase();
        if (!ALLOWED_EXTS.has(ext)) { json(res, 415, { error: `不支持的文件类型：${mime || ext || '未知'}` }); return; }
        const chunks: Buffer[] = [];
        let size = 0;
        req.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_BODY) { json(res, 413, { error: '文件超过 100 MB 上限' }); req.destroy(); return; }
          chunks.push(chunk);
        });
        req.on('end', () => {
          const safe = /^media_[\w.-]+$/.test(supplied)
            ? supplied
            : `media_${Date.now()}-${crypto.randomBytes(5).toString('hex')}${ext}`;
          fs.mkdirSync(publicDir(), { recursive: true });
          fs.writeFileSync(path.join(publicDir(), safe), Buffer.concat(chunks));
          json(res, 200, { url: `./${safe}` });
        });
      });
    },
  };
}
