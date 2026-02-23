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
    setZoom((prev) => Math.min(prev + 0.5, 4));
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
      setZoom((prev) => Math.min(prev + zoomStep, 4));
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
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm" style={{ overflow: 'hidden' }}>

      {/* Header Controls — always visible above the image box */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <span className="text-sm text-white/60">
          {activeIndex + 1} / {images.length}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 1} className="text-white/70 hover:text-white hover:bg-white/10">
            <ZoomOut className="h-5 w-5" />
          </Button>
          <span className="min-w-[52px] text-center text-sm text-white/60">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 4} className="text-white/70 hover:text-white hover:bg-white/10">
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleResetZoom} className="text-white/70 hover:text-white hover:bg-white/10">
            <RotateCcw className="h-5 w-5" />
          </Button>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={navigatePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/80"
          >
            <ChevronLeft className="h-7 w-7" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={navigateNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/80"
          >
            <ChevronRight className="h-7 w-7" />
          </Button>
        </>
      )}

      {/* IMAGE BOX — strictly clipped, fills the full screen */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{
          overflow: 'hidden',
          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        {/* Loading spinner */}
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 className="h-8 w-8 animate-spin text-white/60" />
          </div>
        )}

        {/* Image — centered, scaled in-place, never escapes the container */}
        <img
          src={fullQualityUrl}
          alt={`Image ${activeIndex + 1}`}
          className={`absolute select-none transition-opacity duration-200 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{
            // Position at center of screen
            top: '50%',
            left: '50%',
            // Max size is the viewport, object-contain keeps aspect ratio
            maxWidth: '100vw',
            maxHeight: '100vh',
            width: 'auto',
            height: 'auto',
            // Translate to center, then apply zoom and pan offset
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom})`,
            transformOrigin: 'center center',
            // Smooth zoom transition
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          draggable={false}
          onLoad={() => setIsImageLoading(false)}
        />
      </div>

      {/* Thumbnail strip — bottom bar */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 p-3 bg-gradient-to-t from-black/80 to-transparent overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (onNavigate) onNavigate(idx);
                else setInternalIndex(idx);
              }}
              className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md transition-all ${idx === activeIndex
                  ? 'ring-2 ring-white opacity-100'
                  : 'opacity-40 hover:opacity-70'
                }`}
            >
              <img
                src={getThumbnailUrl(img, { width: 100, quality: 60 })}
                alt={`Thumb ${idx + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;
