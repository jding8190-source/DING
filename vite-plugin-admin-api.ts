import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'video/ogg': '.ogg',
};
const ALLOWED_EXTS = new Set(Object.values(EXT_BY_MIME));
const MAX_UPLOAD = 200 * 1024 * 1024;
const MAX_CONTENT = 20 * 1024 * 1024;

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

/** 仅在本机开发服务器生效：内容落盘到 src/data/content.ts，媒体落盘到 public/uploads/。 */
export default function adminApi(): Plugin {
  let root = '';
  return {
    name: 'ding-admin-api',
    configResolved(config) { root = config.root; },
    configureServer(server) {
      const contentFile = () => path.resolve(root, 'src/data/content.ts');
      const uploadsDir = () => path.resolve(root, 'public/uploads');

      server.middlewares.use('/api/content', (req: any, res: any) => {
        if (req.method === 'GET') { json(res, 200, { writable: true }); return; }
        if (req.method !== 'POST') { json(res, 405, { error: '仅支持 GET / POST' }); return; }
        let body = '';
        req.on('data', (chunk: Buffer) => {
          body += chunk.toString();
          if (body.length > MAX_CONTENT) req.destroy();
        });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (!data || !Array.isArray(data.projects) || !Array.isArray(data.experiences) || !data.settings || typeof data.settings !== 'object') {
              json(res, 400, { error: '内容结构不合法' });
              return;
            }
            const target = contentFile();
            const tmp = `${target}.tmp`;
            fs.writeFileSync(tmp, `// 由本机管理台自动写入，请勿手工修改结构。\nexport default ${JSON.stringify(data, null, 2)};\n`, 'utf8');
            fs.renameSync(tmp, target);
            json(res, 200, { ok: true });
          } catch (error: any) {
            json(res, 400, { error: error?.message || '写入失败' });
          }
        });
      });

      server.middlewares.use('/api/upload', (req: any, res: any) => {
        if (req.method !== 'POST') { json(res, 405, { error: '仅支持 POST' }); return; }
        const url = new URL(req.url || '/', 'http://localhost');
        const original = url.searchParams.get('name') || '';
        const mime = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
        const fromName = path.extname(original).toLowerCase();
        const ext = EXT_BY_MIME[mime] || (ALLOWED_EXTS.has(fromName) ? fromName : '');
        if (!ext) { json(res, 415, { error: `不支持的文件类型：${mime || fromName || '未知'}` }); return; }

        const chunks: Buffer[] = [];
        let size = 0;
        let aborted = false;
        req.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_UPLOAD && !aborted) {
            aborted = true;
            json(res, 413, { error: '文件超过 200 MB 上限' });
            req.destroy();
            return;
          }
          chunks.push(chunk);
        });
        req.on('end', () => {
          if (aborted) return;
          const name = `${Date.now()}-${crypto.randomBytes(5).toString('hex')}${ext}`;
          fs.mkdirSync(uploadsDir(), { recursive: true });
          fs.writeFileSync(path.join(uploadsDir(), name), Buffer.concat(chunks));
          json(res, 200, { url: `./uploads/${name}` });
        });
      });
    },
  };
}
