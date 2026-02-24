import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useImagePreload } from "@/hooks/useImagePreload";
import { getThumbnailUrl, getPreviewUrl } from "@/lib/imageUtils";

gsap.registerPlugin(ScrollTrigger);

interface PhotoItemProps {
  src: string;
  index: number;
}

const PhotoItem = ({ src, index }: PhotoItemProps) => {
  const photoRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Use preview quality for gallery display (smaller, faster loading)
  // First 3 images use larger preview, rest use smaller thumbnails
  const optimizedSrc = index < 3
    ? getPreviewUrl(src, { width: 1200, quality: 85 })
    : getPreviewUrl(src, { width: 800, quality: 80 });

  useEffect(() => {
    const photo = photoRef.current;
    if (!photo) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        photo,
        {
          opacity: 0,
          y: 60,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: photo,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, photoRef);

    return () => ctx.revert();
  }, [index]);

  return (
    <div
      ref={photoRef}
      className="relative w-full aspect-video md:aspect-[21/9] lg:aspect-screen overflow-hidden group"
    >
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={optimizedSrc}
        alt={`Wedding moment ${index + 1}`}
        className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading={index < 3 ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
      />

    </div>
  );
};

const GalleryStory = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);


  // Fetch gallery details
  const { data: gallery, isLoading: galleryLoading } = useQuery({
    queryKey: ['gallery', storyId],
    queryFn: async () => {
      if (!storyId) return null;
      const { data, error } = await supabase
        .from('galleries')
        .select('*')
        .eq('id', storyId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!storyId,
  });

  // Fetch gallery photos
  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: ['gallery-photos', storyId],
    queryFn: async () => {
      if (!storyId) return [];
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('gallery_id', storyId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!storyId,
  });

  // Preload first 10 images for faster display
  const imageUrls = photos?.map(p => p.image_url) || [];
  useImagePreload(imageUrls.slice(0, 10), { priority: true });

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!gallery) return;

    const ctx = gsap.context(() => {
      // Hero image reveal
      const hero = heroRef.current;
      if (hero) {
        gsap.fromTo(
          hero.querySelector("img"),
          { scale: 1.1, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1.5,
            ease: "power3.out",
          }
        );
      }

      // Content reveal
      const content = contentRef.current;
      if (content) {
        gsap.fromTo(
          content.children,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            delay: 0.5,
            ease: "power3.out",
          }
        );
      }
    });

    return () => ctx.revert();
  }, [gallery]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isLoading = galleryLoading || photosLoading;

  if (isLoading) {
    return (
      <main className="grain min-h-screen bg-background">
        <Header />
        <section className="relative h-[70vh] w-full overflow-hidden sm:h-[85vh]">
          <Skeleton className="h-full w-full" />
        </section>
        <section className="py-12 sm:py-20">
          <div className="container mx-auto max-w-3xl px-6 text-center">
            <Skeleton className="mx-auto h-12 w-64" />
            <Skeleton className="mx-auto mt-4 h-6 w-48" />
          </div>
        </section>
      </main>
    );
  }

  if (!gallery) {
    return (
      <main className="grain min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[80vh] items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="font-display text-3xl text-foreground">
              Story Not Found
            </h1>
            <Link
              to="/gallery"
              className="mt-6 inline-flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
            >
              <ArrowLeft size={18} />
              <span>Back to Gallery</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const defaultHeroImage = "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974";

  return (
    <main className="grain min-h-screen bg-background">
      <Header />

      {/* Hero Image - Full Width */}
      <section ref={heroRef} className="relative h-[70vh] w-full overflow-hidden sm:h-[85vh]">
        <img
          src={gallery.thumbnail_url || defaultHeroImage}
          alt={gallery.project_name}
          className="h-full w-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </section>

      {/* Story Content */}
      <section className="py-12 sm:py-20">
        <div
          ref={contentRef}
          className="container mx-auto max-w-3xl px-6 text-center"
        >
          {/* Couple Name */}
          <h1 className="font-display text-3xl text-foreground sm:text-4xl md:text-5xl">
            {gallery.project_name}
          </h1>

          {/* Story Title */}
          <p className="mt-3 text-sm uppercase tracking-widest text-primary sm:text-base">
            {gallery.category || "Wedding Story"}
          </p>

          {/* Divider */}
          <div className="mx-auto my-8 h-px w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Story Text */}
          {gallery.story_text && (
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg">
              {gallery.story_text}
            </p>
          )}

          {/* Details Bar */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-foreground/50 sm:gap-10 sm:text-sm">
            <div>
              <span className="text-primary">Captured by:</span>{" "}
              <span className="text-foreground/70">Brotherhood Studio</span>
            </div>
            {gallery.location && (
              <>
                <div className="hidden h-4 w-px bg-foreground/20 sm:block" />
                <div>
                  <span className="text-primary">Location:</span>{" "}
                  <span className="text-foreground/70">{gallery.location}</span>
                </div>
              </>
            )}
            {gallery.category && (
              <>
                <div className="hidden h-4 w-px bg-foreground/20 sm:block" />
                <div>
                  <span className="text-primary">Category:</span>{" "}
                  <span className="text-foreground/70">{gallery.category}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Photo Story - Vertical Scroll */}
      {photos && photos.length > 0 && (
        <section className="pb-16 sm:pb-24">
          <div className="w-full">
            <div className="flex flex-col">
              {photos?.map((photo, index) => (
                <PhotoItem
                  key={photo.id}
                  src={photo.image_url}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* End Section */}
      <section className="border-t border-primary/10 py-12 sm:py-16">
        <div className="container mx-auto px-6 text-center">
          {/* Back to Gallery */}
          <Link
            to="/gallery"
            className="inline-flex items-center gap-3 text-sm uppercase tracking-widest text-foreground/60 transition-colors hover:text-primary"
          >
            <ArrowLeft size={18} />
            <span>Back to Gallery</span>
          </Link>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="mx-auto mt-10 flex flex-col items-center gap-2 text-foreground/40 transition-colors hover:text-primary"
          >
            <ChevronUp size={24} />
            <span className="text-xs uppercase tracking-widest">
              Back to Top
            </span>
          </button>
        </div>
      </section>


    </main>
  );
};

export default GalleryStory;
