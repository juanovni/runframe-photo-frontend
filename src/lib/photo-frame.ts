import type { FrameTemplate, Participant } from "../types";

const WIDTH = 1080;
const HEIGHT = 1350;
const LOGO_PATHS = {
  sopla: "/assets/logos/sopla-white.png",
  ccbites: "/assets/logos/ccbites.png",
  favorita: "/assets/logos/la-favorita.png",
  claro: "/assets/logos/claro.png"
} as const;

export function getEffectiveCameraWindow(frame: FrameTemplate) {
  if (!frame.cameraWindow) return undefined;

  if (typeof window !== "undefined") {
    const isTablet = window.matchMedia("(min-width: 768px) and (max-width: 1100px)").matches;
    if (isTablet) {
      return {
        x: 0.01,
        y: 0.08,
        width: 0.96,
        height: 0.82,
        radius: 48
      };
    }
  }

  return frame.cameraWindow;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function fitImage(ctx: CanvasRenderingContext2D, image: CanvasImageSource, sourceWidth: number, sourceHeight: number) {
  const scale = Math.max(WIDTH / sourceWidth, HEIGHT / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  ctx.drawImage(image, (WIDTH - width) / 2, (HEIGHT - height) / 2, width, height);
}

function fitImageInRect(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function wave(ctx: CanvasRenderingContext2D, y: number, color: string, amplitude: number, width = 18) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-40, y);
  ctx.bezierCurveTo(220, y - amplitude, 350, y + amplitude, 560, y);
  ctx.bezierCurveTo(760, y - amplitude, 900, y + amplitude, 1130, y - 20);
  ctx.stroke();
}

function soplaMark(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, color = "#fff") {
  ctx.strokeStyle = color;
  ctx.lineWidth = 7 * scale;
  ctx.lineCap = "round";
  for (let index = 0; index < 3; index += 1) {
    ctx.beginPath();
    ctx.moveTo(x, y + index * 17 * scale);
    ctx.bezierCurveTo(x + 35 * scale, y + (index * 17 + 26) * scale, x + 75 * scale, y + (index * 17 - 17) * scale, x + 125 * scale, y + index * 17 * scale);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.font = `900 ${48 * scale}px Roboto, sans-serif`;
  ctx.fillText("SOPLA", x + 148 * scale, y + 43 * scale);
}

export async function imageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  return image;
}

async function loadOptionalImage(src: string): Promise<HTMLImageElement | null> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = src;
  try {
    await image.decode();
    return image;
  } catch {
    return null;
  }
}

function drawSponsorFallbacks(ctx: CanvasRenderingContext2D) {
  ctx.textAlign = "center";
  ctx.fillStyle = "#0860ae";
  ctx.font = "900 48px Roboto, sans-serif";
  ctx.fillText("ccbites", 205, 1294);
  ctx.fillStyle = "#d71920";
  ctx.font = "italic 800 38px Roboto, sans-serif";
  ctx.fillText("La Favorita", 535, 1293);
  ctx.fillStyle = "#e52521";
  ctx.font = "900 54px Roboto, sans-serif";
  ctx.fillText("Claro", 870, 1298);
}

function drawSponsors(ctx: CanvasRenderingContext2D, logos: { ccbites: HTMLImageElement | null; favorita: HTMLImageElement | null; claro: HTMLImageElement | null; }) {
  if (!logos.ccbites || !logos.favorita || !logos.claro) {
    drawSponsorFallbacks(ctx);
    return;
  }

  ctx.drawImage(logos.ccbites, 58, 1238, 248, 81);
  ctx.drawImage(logos.favorita, 369, 1218, 288, 132);
  ctx.drawImage(logos.claro, 760, 1230, 250, 96);
}

function drawHeaderLogo(ctx: CanvasRenderingContext2D, logo: HTMLImageElement | null) {
  if (!logo) {
    soplaMark(ctx, 60, 54, 0.72);
    return;
  }

  ctx.drawImage(logo, 44, 28, 388, 92);
}

async function composeWithOverlay(rawDataUrl: string, overlayPath: string, frame: FrameTemplate): Promise<string | null> {
  const [photo, overlay] = await Promise.all([
    imageFromDataUrl(rawDataUrl),
    loadOptionalImage(overlayPath)
  ]);

  if (!overlay) return null;

  const canvasWidth = overlay.naturalWidth || WIDTH;
  const canvasHeight = overlay.naturalHeight || HEIGHT;
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#d9f6fb";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const effectiveWindow = getEffectiveCameraWindow(frame);

  if (effectiveWindow) {
    const x = canvasWidth * effectiveWindow.x;
    const y = canvasHeight * effectiveWindow.y;
    const width = canvasWidth * effectiveWindow.width;
    const height = canvasHeight * effectiveWindow.height;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, effectiveWindow.radius ?? 0);
    ctx.clip();
    fitImageInRect(ctx, photo, photo.naturalWidth, photo.naturalHeight, x, y, width, height);
    ctx.restore();
  } else {
    const scale = Math.max(canvasWidth / photo.naturalWidth, canvasHeight / photo.naturalHeight);
    const drawWidth = photo.naturalWidth * scale;
    const drawHeight = photo.naturalHeight * scale;
    ctx.drawImage(photo, (canvasWidth - drawWidth) / 2, (canvasHeight - drawHeight) / 2, drawWidth, drawHeight);
  }

  ctx.drawImage(overlay, 0, 0, canvasWidth, canvasHeight);

  return canvas.toDataURL("image/jpeg", 0.92);
}

export async function composePhoto(rawDataUrl: string, frame: FrameTemplate, participant: Participant): Promise<string> {
  if (frame.overlayImage) {
    const overlaid = await composeWithOverlay(rawDataUrl, frame.overlayImage, frame);
    if (overlaid) return overlaid;
  }

  const image = await imageFromDataUrl(rawDataUrl);
  const [soplaLogo, ccbitesLogo, favoritaLogo, claroLogo] = await Promise.all([
    loadOptionalImage(LOGO_PATHS.sopla),
    loadOptionalImage(LOGO_PATHS.ccbites),
    loadOptionalImage(LOGO_PATHS.favorita),
    loadOptionalImage(LOGO_PATHS.claro)
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#d9f6fb";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  fitImage(ctx, image, image.naturalWidth, image.naturalHeight);

  const topGradient = ctx.createLinearGradient(0, 0, 0, 230);
  topGradient.addColorStop(0, `${frame.accent}fa`);
  topGradient.addColorStop(1, `${frame.accent}00`);
  ctx.fillStyle = topGradient;
  ctx.fillRect(0, 0, WIDTH, 240);

  ctx.strokeStyle = frame.accent;
  ctx.lineWidth = 24;
  roundedRect(ctx, 18, 18, WIDTH - 36, HEIGHT - 36, 42);
  ctx.stroke();

  drawHeaderLogo(ctx, soplaLogo);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "right";
  ctx.font = "italic 900 55px Roboto, sans-serif";
  ctx.fillText(frame.eyebrow, WIDTH - 60, 102);

  ctx.fillStyle = frame.dark;
  ctx.beginPath();
  ctx.moveTo(0, 970);
  ctx.bezierCurveTo(250, 900, 330, 960, 465, 1060);
  ctx.bezierCurveTo(590, 1150, 760, 1120, 1080, 980);
  ctx.lineTo(1080, 1208);
  ctx.lineTo(0, 1208);
  ctx.closePath();
  ctx.fill();

  wave(ctx, 968, "#fff", 65, 7);
  wave(ctx, 986, frame.accent, 70, 18);
  wave(ctx, 1010, "#bff5ff", 72, 6);

  ctx.textAlign = "left";
  ctx.fillStyle = "#fff";
  ctx.font = "italic 900 94px Roboto, sans-serif";
  ctx.fillText(frame.title, 58, 1083);
  ctx.fillStyle = frame.accent;
  ctx.font = "800 34px Roboto, sans-serif";
  ctx.fillText(frame.subtitle, 62, 1135);
  ctx.fillStyle = "#fff";
  ctx.font = "italic 600 25px Roboto, sans-serif";
  ctx.fillText(`Dorsal ${participant.bib}  ·  Tu carrera. Tu momento.`, 62, 1176);

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 1208, WIDTH, 142);
  drawSponsors(ctx, { ccbites: ccbitesLogo, favorita: favoritaLogo, claro: claroLogo });

  return canvas.toDataURL("image/jpeg", 0.9);
}

export function captureVideoFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 960;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export function createDemoPhoto(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1200;
  const ctx = canvas.getContext("2d")!;
  const sky = ctx.createLinearGradient(0, 0, 0, 1200);
  sky.addColorStop(0, "#8ddced");
  sky.addColorStop(0.52, "#e9f7f7");
  sky.addColorStop(0.53, "#5f8797");
  sky.addColorStop(1, "#263e48");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 900, 1200);
  ctx.fillStyle = "rgba(255,255,255,.65)";
  ctx.fillRect(70, 230, 760, 110);
  ctx.fillStyle = "#44bdd6";
  ctx.fillRect(70, 245, 760, 75);
  ctx.fillStyle = "#fff";
  ctx.font = "900 42px Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SOPLA RUN 10K", 450, 298);
  ctx.strokeStyle = "rgba(255,255,255,.38)";
  ctx.lineWidth = 16;
  for (let x = 100; x < 900; x += 180) {
    ctx.beginPath();
    ctx.moveTo(x, 1200);
    ctx.lineTo(420 + (x - 450) * 0.22, 520);
    ctx.stroke();
  }
  ctx.fillStyle = "#e5ad86";
  ctx.beginPath();
  ctx.arc(450, 430, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#192b34";
  ctx.beginPath();
  ctx.arc(450, 390, 105, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e5ad86";
  ctx.lineWidth = 70;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(330, 635);
  ctx.lineTo(205, 410);
  ctx.lineTo(185, 235);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(570, 635);
  ctx.lineTo(690, 825);
  ctx.stroke();
  ctx.fillStyle = "#46c7df";
  roundedRect(ctx, 300, 515, 300, 500, 80);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "900 44px Roboto, sans-serif";
  ctx.fillText("SOPLA", 450, 700);
  ctx.fillStyle = "#fff";
  ctx.fillRect(350, 800, 200, 135);
  ctx.fillStyle = "#0a2b50";
  ctx.font = "900 64px Roboto, sans-serif";
  ctx.fillText("1258", 450, 895);
  return canvas.toDataURL("image/jpeg", 0.9);
}
