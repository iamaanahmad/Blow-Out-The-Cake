import { toPng } from 'html-to-image';

export async function exportCardToPngDataUrl(node: HTMLElement): Promise<string> {
  return toPng(node, { pixelRatio: 2, backgroundColor: '#2b0f4c' });
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}
