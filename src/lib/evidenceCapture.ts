import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase';

const storage = getStorage(app);

async function captureFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
): Promise<Blob | null> {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
  });
}

async function getStream(facingMode: string): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
  } catch {
    return null;
  }
}

function stopStream(stream: MediaStream | null) {
  if (stream) stream.getTracks().forEach((t) => t.stop());
}

export async function captureEvidence(
  sessionId: string,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
): Promise<string[]> {
  const urls: string[] = [];
  const timestamp = Date.now();

  const cameras = [
    { mode: 'user', label: 'front' },
    { mode: 'environment', label: 'rear' },
  ];

  for (const cam of cameras) {
    const stream = await getStream(cam.mode);
    if (!stream) continue;

    video.srcObject = stream;
    video.setAttribute('playsinline', 'true');
    video.muted = true;

    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => {
        video.play().then(() => resolve()).catch(() => resolve());
      };
    });

    await new Promise((r) => setTimeout(r, 400));

    for (let i = 0; i < 3; i++) {
      const blob = await captureFrame(video, canvas);
      if (blob) {
        const filename = `${cam.label}_${timestamp}_${i}.jpg`;
        const storageRef = ref(storage, `showing-shield/${sessionId}/${filename}`);
        try {
          await uploadBytes(storageRef, blob);
          const url = await getDownloadURL(storageRef);
          urls.push(url);
        } catch {}
      }
      if (i < 2) await new Promise((r) => setTimeout(r, 300));
    }

    stopStream(stream);
  }

  video.srcObject = null;
  return urls;
}
