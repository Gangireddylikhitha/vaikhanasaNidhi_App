import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import guruLogo from '../assets/images/vaikhanasaGuru.png';
import { isNativeApp } from './native';

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1200;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  for (let i = 0; i < words.length; i += 1) {
    const testLine = `${line}${words[i]} `;
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, curY);
      line = `${words[i]} `;
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, curY);
  return curY + lineHeight;
}

/** Renders logo + text lines onto a portrait status-style card and returns a PNG blob. */
export async function buildShareCard({ title, lines = [], footer = 'వైఖానస నిధి' }) {
  if (document.fonts?.ready) {
    try { await document.fonts.ready; } catch { /* fonts API optional */ }
  }

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');

  const bgGrad = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
  bgGrad.addColorStop(0, '#1a1407');
  bgGrad.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  ctx.strokeStyle = '#C88F2D';
  ctx.lineWidth = 5;
  ctx.strokeRect(22, 22, CARD_WIDTH - 44, CARD_HEIGHT - 44);

  let y = 200;
  try {
    const logo = await loadImage(guruLogo);
    const logoSize = 180;
    ctx.drawImage(logo, (CARD_WIDTH - logoSize) / 2, y - logoSize + 40, logoSize, logoSize);
  } catch {
    // Logo optional — card still renders without it.
  }
  y += 90;

  ctx.textAlign = 'center';
  ctx.fillStyle = '#E4B24B';
  ctx.font = "600 42px 'Tiro Telugu', serif";
  ctx.fillText('వైఖానస నిధి', CARD_WIDTH / 2, y);
  y += 78;

  ctx.fillStyle = '#F6D67A';
  ctx.font = "700 54px 'Tiro Telugu', serif";
  ctx.fillText(title, CARD_WIDTH / 2, y);
  y += 50;

  ctx.strokeStyle = 'rgba(200,143,45,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, y);
  ctx.lineTo(CARD_WIDTH - 120, y);
  ctx.stroke();
  y += 120;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#E8D5A0';
  ctx.font = "400 36px 'Tiro Telugu', serif";
  const maxWidth = CARD_WIDTH - 160;
  for (const line of lines) {
    y = wrapText(ctx, line, 80, y, maxWidth, 52) + 22;
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(228,178,75,0.65)';
  ctx.font = "italic 28px 'Tiro Telugu', serif";
  ctx.fillText(footer, CARD_WIDTH / 2, CARD_HEIGHT - 55);

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Builds a share card and opens the native share sheet (or web fallback) with it. */
export async function shareCardImage({ title, lines, footer, dialogTitle, shareTitle }) {
  const blob = await buildShareCard({ title, lines, footer });
  if (!blob) return false;

  if (isNativeApp()) {
    const base64 = await blobToBase64(blob);
    const fileName = `share-${Date.now()}.png`;
    const written = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache,
    });
    await Share.share({
      title: shareTitle || title,
      files: [written.uri],
      dialogTitle: dialogTitle || title,
    });
    return true;
  }

  const file = new File([blob], 'share.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: shareTitle || title });
    return true;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'panchangam.png';
  a.click();
  URL.revokeObjectURL(url);
  return true;
}
