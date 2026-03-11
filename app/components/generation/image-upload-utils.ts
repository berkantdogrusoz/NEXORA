/**
 * Shared image resize & compress utility used by Studio, Director, and Generate pages.
 */
export function resizeAndCompress(
  file: File,
  maxSize = 1536
): Promise<{ base64: string; contentType: string }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const MAX = maxSize;
      let w = img.width,
        h = img.height;
      if (w > MAX || h > MAX) {
        const ratio = Math.min(MAX / w, MAX / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      resolve({ base64: dataUrl.split(",")[1], contentType: "image/jpeg" });
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload a file via the /api/upload endpoint, with resize & compress.
 * Returns the uploaded URL on success, or throws an error string.
 */
export async function uploadReferenceImage(
  file: File,
  setError: (msg: string) => void
): Promise<string | null> {
  if (file.size > 10 * 1024 * 1024) {
    setError("Image must be under 10MB.");
    return null;
  }

  const { base64, contentType } = await resizeAndCompress(file);
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64, contentType }),
  });
  const data = await res.json();
  if (res.ok && data.url) {
    return data.url;
  } else {
    setError(data.error || "Failed to upload image.");
    return null;
  }
}
