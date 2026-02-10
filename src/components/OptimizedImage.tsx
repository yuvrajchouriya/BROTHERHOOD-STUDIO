import { useState, useRef, useEffect } from 'react';
import { getThumbnailUrl, getFullQualityUrl } from '@/lib/imageUtils';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  thumbnailWidth?: number;
  thumbnailQuality?: number;
  loadFullOnClick?: boolean;
  onClick?: () => void;
  aspectRatio?: 'square' | 'video' | 'auto';
}

/**
 * Optimized Image Component
 * 
 * - Shows thumbnail/compressed version initially (fast load)
 * - Lazy loads images only when in viewport
 * - Loads full quality only when clicked (for lightbox)
 */
const OptimizedImage = ({
  src,
  alt,
  className,
  thumbnailWidth = 400,
  thumbnailQuality = 75,
  loadFullOnClick = false,
  onClick,
  aspectRatio = 'auto',
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const thumbnailUrl = getThumbnailUrl(src, {
    width: thumbnailWidth,
    quality: thumbnailQuality,
  });

  const fullUrl = getFullQualityUrl(src);

  // Use full URL if showFull is true, otherwise use thumbnail
  const currentSrc = showFull ? fullUrl : thumbnailUrl;

  const handleClick = () => {
    if (loadFullOnClick && !showFull) {
      setShowFull(true);
    }
    onClick?.();
  };

  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: '',
  }[aspectRatio];

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-muted',
        aspectClass,
        className
      )}
      onClick={handleClick}
    >
      {/* Placeholder/Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {/* Only load image when in viewport */}
      {isInView && (
        <img
          src={currentSrc}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default OptimizedImage;
