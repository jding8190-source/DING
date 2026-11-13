/**
 * 媒体上传：图片 / GIF / 视频直接写入 GitHub Pages 部署仓库根目录（media_*），返回站内相对地址。
 * 本机 dev 由服务端代理附加令牌，线上由浏览器内令牌直连；上传即时生效，无需重新构建。
 */
import { publishAssets, fileBase64, isDev } from './remoteStore';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif',
  'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov', 'video/ogg': '.ogg',
};
const ALLOWED = /^\.(jpg|jpeg|png|webp|gif|mp4|webm|mov|ogg)$/;

function extFor(file: File): string {
  const byMime = EXT_BY_MIME[(file.type || '').toLowerCase()];
  if (byMime) return byMime;
  const dot = file.name.lastIndexOf('.');
  const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : '';
  if (!ALLOWED.test(ext)) throw new Error(`不支持的文件类型：${file.type || file.name || '未知'}`);
  return ext === '.jpeg' ? '.jpg' : ext;
}

export async function uploadFile(file: File): Promise<string> {
  const [url] = await uploadFiles([file]);
  return url;
}

/** 多文件合并为一次提交；本机再把同一份文件写进 public/，缩略图无需等 GitHub Pages 部署。 */
export async function uploadFiles(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];
  const stamp = Date.now();
  const prepared = files.map((file, index) => {
    const ext = extFor(file);
    const name = `media_${stamp}-${index}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    return { file, name };
  });

  const items: { name: string; base64: string }[] = [];
  for (const item of prepared) items.push({ name: item.name, base64: await fileBase64(item.file) });

  const urls = await publishAssets(items);

  if (isDev) {
    await Promise.all(items.map(async (item, index) => {
      try {
        await fetch(`/api/upload?name=${encodeURIComponent(item.name)}`, {
          method: 'POST',
          headers: { 'Content-Type': prepared[index].file.type || 'application/octet-stream' },
          body: prepared[index].file,
        });
      } catch { /* 本地预览副本失败不影响线上发布 */ }
    }));
  }

  return urls;
}
