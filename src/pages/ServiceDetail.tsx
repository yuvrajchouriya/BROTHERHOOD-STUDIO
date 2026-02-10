import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import ImageLightbox from "@/components/ImageLightbox";
import { useImagePreload } from "@/hooks/useImagePreload";
import { useTrackEvent } from "@/components/TrackingProvider";

gsap.registerPlugin(ScrollTrigger);

interface PhotoItemProps {
  src: string;
  index: number;
  onClick: () => void;
}

const PhotoItem = ({ src, index, onClick }: PhotoItemProps) => {
  const photoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const photo = photoRef.current;
    if (!photo) return;

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
  }, [index]);

  return (
    <div
      ref={photoRef}
      className="relative overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <img
        src={src}
        alt={`Service photo ${index + 1}`}
        className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading={index < 3 ? "eager" : "lazy"}
        decoding="async"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm uppercase tracking-widest">
          View
        </span>
      </div>
    </div>
  );
};

const getVideoEmbedUrl = (url: string) => {
  if (!url) return null;

  // YouTube
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    // Handle youtube.com/watch?v=ID and youtu.be/ID
    let videoId = "";
    if (url.includes("v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else {
      videoId = url.split("/").pop() || "";
    }
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  }

  // Vimeo
  if (url.includes("vimeo.com")) {
    const videoId = url.split("/").pop();
    return `https://player.vimeo.com/video/${videoId}`;
  }

  return url;
};

const ServiceDetail = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const trackEvent = useTrackEvent();

  // Fetch service details
  const { data: service, isLoading: serviceLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      if (!serviceId) return null;
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!serviceId,
  });

  // Fetch service photos
  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: ['service-photos', serviceId],
    queryFn: async () => {
      if (!serviceId) return [];
      const { data, error } = await supabase
        .from('service_photos')
        .select('*')
        .eq('service_id', serviceId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!serviceId,
  });

  // Preload images
  const imageUrls = photos?.map(p => p.image_url) || [];
  useImagePreload(imageUrls.slice(0, 5), { priority: true });

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!service) return;

    // Track service view
    trackEvent('service_view', service.id, service.title, {
      service_id: service.id,
      title: service.title,
    });

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
  }, [service]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const isLoading = serviceLoading || photosLoading;

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

  if (!service) {
    return (
      <main className="grain min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[80vh] items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="font-display text-3xl text-foreground">
              Service Not Found
            </h1>
            <Link
              to="/services"
              className="mt-6 inline-flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
            >
              <ArrowLeft size={18} />
              <span>Back to Services</span>
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
          src={service.thumbnail_url || defaultHeroImage}
          alt={service.title}
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </section>

      {/* Service Content */}
      <section className="py-12 sm:py-20">
        <div
          ref={contentRef}
          className="container mx-auto max-w-3xl px-6 text-center"
        >
          {/* Service Title */}
          <h1 className="font-display text-3xl text-foreground sm:text-4xl md:text-5xl">
            {service.title}
          </h1>

          {/* Divider */}
          <div className="mx-auto my-8 h-px w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Description */}
          {service.description && (
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-foreground/70 sm:text-lg">
              {service.description}
            </p>
          )}

          {/* CTA */}
          <div className="mt-10">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 border border-primary/40 px-8 py-3 text-sm uppercase tracking-widest text-primary transition-all duration-500 hover:bg-primary hover:text-background"
            >
              Book This Service
            </Link>
          </div>
        </div>
      </section>

      {/* Video Gallery Section */}
      {service.video_urls && service.video_urls.length > 0 && (
        <section className="pb-16 sm:pb-24">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-12 text-center">
              <h2 className="font-display text-2xl text-foreground sm:text-3xl">
                Featured Films
              </h2>
              <div className="section-divider" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {service.video_urls.map((url: string, index: number) => {
                const embedUrl = getVideoEmbedUrl(url);
                if (!embedUrl) return null;

                return (
                  <div key={index} className="aspect-video w-full overflow-hidden rounded-lg border border-border/20 bg-muted">
                    <iframe
                      src={embedUrl}
                      title={`Service Video ${index + 1}`}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Photo Gallery */}
      {photos && photos.length > 0 && (
        <section className="pb-16 sm:pb-24">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6">
            <div className="mb-12 text-center">
              <h2 className="font-display text-2xl text-foreground sm:text-3xl">
                Our Work
              </h2>
              <div className="section-divider" />
            </div>
            <div className="space-y-8 sm:space-y-12">
              {photos.map((photo, index) => (
                <PhotoItem
                  key={photo.id}
                  src={photo.image_url}
                  index={index}
                  onClick={() => openLightbox(index)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* End Section */}
      <section className="border-t border-primary/10 py-12 sm:py-16">
        <div className="container mx-auto px-6 text-center">
          {/* Back to Services */}
          <Link
            to="/services"
            className="inline-flex items-center gap-3 text-sm uppercase tracking-widest text-foreground/60 transition-colors hover:text-primary"
          >
            <ArrowLeft size={18} />
            <span>Back to Services</span>
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

      {/* Lightbox */}
      <ImageLightbox
        images={imageUrls}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </main>
  );
};

export default ServiceDetail;
