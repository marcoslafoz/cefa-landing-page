import fs from 'fs';
import path from 'path';

export function getFileSize(url: string): string {
  try {
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    const filePath = path.join(process.cwd(), 'public', cleanUrl);

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const bytes = stats.size;

      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  } catch (error) {
    console.error(`Error getting file size for ${url}:`, error);
  }
  return '';
}
