/**
 * Image optimization utilities for Supabase Storage
 * 
 * For images stored in Supabase Storage, we can use image transformations
 * to serve optimized versions without affecting the original.
 * 
 * This keeps the website fast while maintaining original quality when needed.
 */

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Check if URL is from Supabase Storage
 */
export const isSupabaseStorageUrl = (url: string): boolean => {
  return url.includes('supabase') && url.includes('/storage/v1/object/public/');
};

/**
 * Get optimized thumbnail URL for gallery grids
 * Uses Supabase image transformations for storage URLs
 * For external URLs, returns as-is (browser will handle)
 */
export const getThumbnailUrl = (
  originalUrl: string | null | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options: ImageTransformOptions = {}
): string => {
  if (!originalUrl) return '';
  // Note: Supabase image transformation (/render/image/) requires the Pro plan.
  // Returning the original URL to ensure images always load on the free tier.
  return originalUrl;
};

/**
 * Get medium quality URL for previews
 */
export const getPreviewUrl = (
  originalUrl: string | null | undefined,
  options: ImageTransformOptions = {}
): string => {
  return getThumbnailUrl(originalUrl, {
    width: 800,
    quality: 80,
    resize: 'cover',
    ...options
  });
};

/**
 * Get full quality original URL
 * This is what loads when user opens the lightbox
 */
export const getFullQualityUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  return url; // Return original URL for full quality
};

/**
 * Placeholder for lazy loading
 * Returns a tiny blurred placeholder or empty string
 */
export const getPlaceholderUrl = (
  originalUrl: string | null | undefined
): string => {
  if (!originalUrl) return '';

  if (isSupabaseStorageUrl(originalUrl)) {
    const transformedUrl = originalUrl.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    );
    return `${transformedUrl}?width=20&quality=10&resize=cover`;
  }

  return '';
};

/**
 * Optimize image before upload
 * Resizes image and converts to WebP format to save space and improve loading speed
 * without significantly compromising quality.
 */
export const optimizeImage = async (
  file: File,
  maxWidth = 1920,
  quality = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert image to WebP"));
          }
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => reject(new Error("Failed to load image for optimization"));
  });
};
