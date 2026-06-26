"use client";

/**
 * Downscale + re-encode an image entirely in the browser before upload.
 * Caps the longest edge at `maxEdge` px and exports JPEG, which turns a
 * multi-MB phone photo (incl. HEIC, which the canvas re-encodes) into
 * ~100-200KB. This keeps the JSON POST body small so it never trips the
 * reverse-proxy / platform body-size limit, and guarantees the preview
 * renders.
 *
 * Returns a base64 `data:image/jpeg` URL.
 */
export async function compressImage(
  file: File,
  maxEdge = 800,
  quality = 0.8
): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(new Error("Could not read the image file. Please try another."));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("That file does not appear to be a valid image."));
    image.src = dataUrl;
  });

  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx)
    throw new Error("Could not process the image. Please try a different browser.");
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", quality);
}

/** Hard ceiling on the original file we'll even attempt to decode (bytes). */
export const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;

/** Max size of the *encoded* result we'll accept for upload (chars/bytes). */
export const MAX_ENCODED_LENGTH = 1_500_000;
