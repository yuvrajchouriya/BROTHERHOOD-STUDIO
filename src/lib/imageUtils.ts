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
  options: ImageTransformOptions = {}
): string => {
  if (!originalUrl) return '';
  
  const {
    width = 400,
    height,
    quality = 75,
    resize = 'cover'
  } = options;

  // For Supabase Storage URLs, use render/image transformation
  if (isSupabaseStorageUrl(originalUrl)) {
    // Convert public URL to render URL for transformations
    // From: /storage/v1/object/public/bucket/path
    // To: /storage/v1/render/image/public/bucket/path?width=X&quality=Y
    const transformedUrl = originalUrl.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    );
    
    const params = new URLSearchParams();
    params.set('width', width.toString());
    if (height) params.set('height', height.toString());
    params.set('quality', quality.toString());
    params.set('resize', resize);
    
    return `${transformedUrl}?${params.toString()}`;
  }
  
  // For external URLs, return as-is
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
