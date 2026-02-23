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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-background/80 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground/60">
            {activeIndex + 1} / {images.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="text-foreground/60 hover:text-foreground"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <span className="min-w-[60px] text-center text-sm text-foreground/60">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 4}
            className="text-foreground/60 hover:text-foreground"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetZoom}
            className="text-foreground/60 hover:text-foreground"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          <div className="w-px h-6 bg-foreground/20 mx-2" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={navigatePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/50 text-foreground/60 hover:bg-background/80 hover:text-foreground"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={navigateNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/50 text-foreground/60 hover:bg-background/80 hover:text-foreground"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Image Container */}
      <div
        ref={containerRef}
        className="flex items-center justify-center w-full h-full p-16 overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in" }}
      >
        {/* Loading spinner */}
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <img
          src={fullQualityUrl}
          alt={`Image ${activeIndex + 1}`}
          className={`max-w-full max-h-full object-contain select-none transition-all duration-200 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          }}
          draggable={false}
          onLoad={() => setIsImageLoading(false)}
        />
      </div>

      {/* Thumbnail Strip (for multiple images) - uses small thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-2 p-4 bg-gradient-to-t from-background/80 to-transparent overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (onNavigate) {
                  onNavigate(idx);
                } else {
                  setInternalIndex(idx);
                }
              }}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded transition-all ${idx === activeIndex
                ? "ring-2 ring-primary opacity-100"
                : "opacity-50 hover:opacity-80"
                }`}
            >
              <img
                src={getThumbnailUrl(img, { width: 100, quality: 60 })}
                alt={`Thumbnail ${idx + 1}`}
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
