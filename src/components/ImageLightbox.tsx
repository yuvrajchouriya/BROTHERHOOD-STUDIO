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
    <div className="fixed inset-0 z-50 bg-black" style={{ overflow: 'hidden' }}>

      {/* DESKTOP BOX wrapper — fullscreen, fixed position */}
      <div
        className="
          fixed inset-0
          hidden md:flex flex-col
          bg-black
          border border-white/15
          overflow-hidden
          z-50
        "
      >
        {/* Top bar: counter + zoom controls + close */}
        <div className="flex items-center justify-between px-4 py-2 bg-black/70 border-b border-white/10 flex-shrink-0 z-10">
          <span className="text-sm text-white/50">{activeIndex + 1} / {images.length}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 1} className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="min-w-[46px] text-center text-xs text-white/50">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleResetZoom} className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image area — flex centered, strictly clipped inside the box */}
        <div
          ref={containerRef}
          className="relative flex-1 min-h-0 overflow-hidden flex items-center justify-center"
          style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 className="h-8 w-8 animate-spin text-white/60" />
            </div>
          )}
          {/* Transform wrapper — handles zoom and pan */}
          <div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <img
              src={fullQualityUrl}
              alt={`Image ${activeIndex + 1}`}
              className={`select-none transition-opacity duration-200 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
              draggable={false}
              onLoad={() => setIsImageLoading(false)}
            />
          </div>
        </div>

        {/* Desktop Navigation arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={navigatePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/60 text-white hover:bg-black/90"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={navigateNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/60 text-white hover:bg-black/90"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Desktop thumbnail strip */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 p-2 bg-black/70 border-t border-white/10 overflow-x-auto flex-shrink-0">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => { if (onNavigate) onNavigate(idx); else setInternalIndex(idx); }}
                className={`relative h-12 w-12 flex-shrink-0 overflow-hidden rounded transition-all ${idx === activeIndex ? 'ring-2 ring-white opacity-100' : 'opacity-40 hover:opacity-70'}`}
              >
                <img src={getThumbnailUrl(img, { width: 100, quality: 60 })} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── MOBILE: fullscreen layout ── */}
      <div className="fixed inset-0 flex flex-col md:hidden">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-20">
          <span className="text-sm text-white/60">{activeIndex + 1} / {images.length}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 1} className="text-white/70 hover:text-white hover:bg-white/10">
              <ZoomOut className="h-5 w-5" />
            </Button>
            <span className="min-w-[44px] text-center text-sm text-white/60">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} className="text-white/70 hover:text-white hover:bg-white/10">
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleResetZoom} className="text-white/70 hover:text-white hover:bg-white/10">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <div className="w-px h-5 bg-white/20 mx-1" />
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile image area */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 className="h-8 w-8 animate-spin text-white/60" />
            </div>
          )}
          <img
            src={fullQualityUrl}
            alt={`Image ${activeIndex + 1}`}
            className={`absolute select-none transition-opacity duration-200 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
            style={{
              top: '50%',
              left: '50%',
              maxWidth: '100vw',
              maxHeight: '100vh',
              width: 'auto',
              height: 'auto',
              transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
            draggable={false}
            onLoad={() => setIsImageLoading(false)}
          />
        </div>

        {/* Mobile Navigation */}
        {images.length > 1 && (
          <>
            <Button variant="ghost" size="icon" onClick={navigatePrev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/80">
              <ChevronLeft className="h-7 w-7" />
            </Button>
            <Button variant="ghost" size="icon" onClick={navigateNext} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/80">
              <ChevronRight className="h-7 w-7" />
            </Button>
          </>
        )}

        {/* Mobile thumbnail strip */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 p-3 bg-gradient-to-t from-black/80 to-transparent overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => { if (onNavigate) onNavigate(idx); else setInternalIndex(idx); }}
                className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md transition-all ${idx === activeIndex ? 'ring-2 ring-white opacity-100' : 'opacity-40 hover:opacity-70'}`}
              >
                <img src={getThumbnailUrl(img, { width: 100, quality: 60 })} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
