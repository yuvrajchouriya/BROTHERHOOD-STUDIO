import { useState, useEffect, useCallback, useRef } from "react";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getThumbnailUrl, getFullQualityUrl } from "@/lib/imageUtils";

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (index: number) => void;
}

const ImageLightbox = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate
}: ImageLightboxProps) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [internalIndex, setInternalIndex] = useState(currentIndex);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const activeIndex = onNavigate ? currentIndex : internalIndex;
  const currentImage = images[activeIndex];

  // Get full quality URL for lightbox display
  const fullQualityUrl = getFullQualityUrl(currentImage);


  // Reset zoom and loading state when image changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setIsImageLoading(true);
  }, [activeIndex]);

  // Reset internal index when prop changes
  useEffect(() => {
    setInternalIndex(currentIndex);
  }, [currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          navigatePrev();
          break;
        case "ArrowRight":
          navigateNext();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "0":
          handleResetZoom();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, activeIndex, images.length]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => prev + 0.5);
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Mouse wheel zoom handling with non-passive listener support
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: WheelEvent) => {
    // We use a native event listener here because React's onWheel is passive by default
    // and preventDefault() would be ignored, causing the whole page to scroll.
    e.preventDefault();

    const zoomStep = 0.25;
    if (e.deltaY < 0) {
      // Scroll up - zoom in
      setZoom((prev) => prev + zoomStep);
    } else {
      // Scroll down - zoom out
      setZoom((prev) => {
        const newZoom = Math.max(prev - zoomStep, 1);
        if (newZoom === 1) {
          setPosition({ x: 0, y: 0 });
        }
        return newZoom;
      });
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container && isOpen) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [isOpen, handleWheel]);

  const navigateNext = useCallback(() => {
    if (images.length <= 1) return;
    const newIndex = (activeIndex + 1) % images.length;
    if (onNavigate) {
      onNavigate(newIndex);
    } else {
      setInternalIndex(newIndex);
    }
  }, [activeIndex, images.length, onNavigate]);

  const navigatePrev = useCallback(() => {
    if (images.length <= 1) return;
    const newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    if (onNavigate) {
      onNavigate(newIndex);
    } else {
      setInternalIndex(newIndex);
    }
  }, [activeIndex, images.length, onNavigate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2);
    } else {
      handleResetZoom();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/98 flex flex-col p-4 md:p-8 lg:p-12 overflow-hidden">
      {/* 
         THE MAIN BOX
         All content (header, image, footer) is wrapped inside this bordered box.
         It fills the available space left by the outer padding.
      */}
      <div className="flex-1 flex flex-col border border-white/20 rounded-2xl bg-black relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">

        {/* Box Header: contains counter, zoom controls, and close button */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/90 border-b border-white/10 flex-shrink-0 z-30">
          <span className="text-sm font-medium text-white/50">{activeIndex + 1} / {images.length}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 1} className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10">
              <ZoomOut className="h-5 w-5" />
            </Button>
            <span className="min-w-[48px] text-center text-sm font-mono text-white/50">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10">
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleResetZoom} className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10">
              <RotateCcw className="h-5 w-5" />
            </Button>
            <div className="w-px h-5 bg-white/20 mx-1" />
            <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Image Display Area: handles centering, cropping on zoom, and navigation arrows */}
        <div
          ref={containerRef}
          className="relative flex-1 min-h-0 overflow-hidden flex items-center justify-center p-2"
          style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20">
              <Loader2 className="h-8 w-8 animate-spin text-white/60" />
            </div>
          )}

          {/* 
             The Image Wrapper: translates and scales the image.
             Flex centering in parent ensures image is dead-center on screen.
          */}
          <img
            src={fullQualityUrl}
            alt={`Image ${activeIndex + 1}`}
            className={`select-none transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'} max-w-full max-h-full w-auto h-auto object-contain`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0, 0.4, 1)',
            }}
            draggable={false}
            onLoad={() => setIsImageLoading(false)}
          />

          {/* Navigation Arrows: positioned inside the box area */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={navigatePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/60 text-white shadow-lg hover:bg-black/90 transition-all active:scale-95"
              >
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={navigateNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/60 text-white shadow-lg hover:bg-black/90 transition-all active:scale-95"
              >
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
            </>
          )}
        </div>

        {/* Box Footer: thumbnail strip */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 bg-black/90 border-t border-white/10 overflow-x-auto flex-shrink-0 z-30 scrollbar-hide">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => { if (onNavigate) onNavigate(idx); else setInternalIndex(idx); }}
                className={`relative h-12 w-12 md:h-16 md:w-16 flex-shrink-0 overflow-hidden rounded-lg transition-all duration-300 ${idx === activeIndex
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-105 opacity-100 shadow-xl'
                  : 'opacity-40 hover:opacity-75 hover:scale-105'
                  }`}
              >
                <img
                  src={getThumbnailUrl(img, { width: 150, quality: 70 })}
                  alt={`Thumb ${idx + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
