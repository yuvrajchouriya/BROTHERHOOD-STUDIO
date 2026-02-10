import { useEffect, useState } from "react";

interface PreloadOptions {
  enabled?: boolean;
  priority?: boolean;
}

/**
 * Hook to preload images in the background
 * @param imageUrls Array of image URLs to preload
 * @param options Preload options
 * @returns Object with loading status and preloaded count
 */
export const useImagePreload = (
  imageUrls: string[],
  options: PreloadOptions = {}
) => {
  const { enabled = true, priority = false } = options;
  const [loadedCount, setLoadedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled || imageUrls.length === 0) {
      setIsComplete(true);
      return;
    }

    setLoadedCount(0);
    setIsComplete(false);

    const validUrls = imageUrls.filter((url) => url && typeof url === "string");
    
    if (validUrls.length === 0) {
      setIsComplete(true);
      return;
    }

    let mounted = true;
    let loadedImages = 0;

    const preloadImage = (url: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          if (mounted) {
            loadedImages++;
            setLoadedCount(loadedImages);
            if (loadedImages === validUrls.length) {
              setIsComplete(true);
            }
          }
          resolve();
        };

        img.onerror = () => {
          if (mounted) {
            loadedImages++;
            setLoadedCount(loadedImages);
            if (loadedImages === validUrls.length) {
              setIsComplete(true);
            }
          }
          resolve();
        };

        // Set fetchpriority for high priority images
        if (priority) {
          img.fetchPriority = "high";
        }

        img.src = url;
      });
    };

    // Preload images concurrently
    Promise.all(validUrls.map(preloadImage));

    return () => {
      mounted = false;
    };
  }, [imageUrls.join(","), enabled, priority]);

  return {
    loadedCount,
    totalCount: imageUrls.length,
    isComplete,
    progress: imageUrls.length > 0 ? loadedCount / imageUrls.length : 1,
  };
};

/**
 * Add preload link tags for critical images
 * @param imageUrls Array of image URLs to preload via link tags
 */
export const addPreloadLinks = (imageUrls: string[]) => {
  imageUrls.forEach((url) => {
    if (!url) return;
    
    // Check if link already exists
    const existing = document.querySelector(`link[href="${url}"]`);
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = url;
    document.head.appendChild(link);
  });
};

export default useImagePreload;
