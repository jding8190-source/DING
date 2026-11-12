/** 本机管理台媒体上传：文件写入 public/uploads/，返回可在站点中直接使用的相对地址。 */
export async function uploadFile(file: File): Promise<string> {
  if (!(import.meta as any).env?.DEV) {
    throw new Error('当前为线上只读版本。请在本机运行 npm run dev 打开管理台上传媒体。');
  }
  const res = await fetch(`/api/upload?name=${encodeURIComponent(file.name)}`, {
    method: 'POST',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || `上传失败（HTTP ${res.status}）`);
  return out.url as string;
}

export async function uploadFiles(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) urls.push(await uploadFile(file));
  return urls;
}
