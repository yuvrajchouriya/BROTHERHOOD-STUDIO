import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { gsap } from "gsap";
import { ArrowLeft, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrackEvent } from "@/components/TrackingProvider";

// Extract YouTube video ID from various URL formats
const getYouTubeId = (url: string | null): string | null => {
  if (!url) return null;
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const FilmDetail = () => {
  const { filmId } = useParams<{ filmId: string }>();
  const videoRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const trackEvent = useTrackEvent();

  // Fetch film details from database
  const { data: film, isLoading } = useQuery({
    queryKey: ['film', filmId],
    queryFn: async () => {
      if (!filmId) return null;
      const { data, error } = await supabase
        .from('films')
        .select('*')
        .eq('id', filmId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!filmId,
  });

  const youtubeId = film ? getYouTubeId(film.youtube_url) : null;

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!film) return;

    // Track film view
    trackEvent('film_play', film.id, film.title, {
      film_id: film.id,
      title: film.title,
      category: film.category,
    });

    // Video container animation
    const video = videoRef.current;
    if (video) {
      gsap.fromTo(
        video,
        { opacity: 0, scale: 0.98 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
        }
      );
    }

    // Content animation
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
  }, [film]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <main className="grain min-h-screen bg-background">
        <Header />
        <section className="pt-20 sm:pt-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Skeleton className="aspect-video w-full" />
          </div>
        </section>
        <section className="py-12 sm:py-16">
          <div className="container mx-auto max-w-3xl px-6 text-center">
            <Skeleton className="mx-auto h-12 w-64" />
            <Skeleton className="mx-auto mt-4 h-6 w-48" />
          </div>
        </section>
      </main>
    );
  }

  if (!film) {
    return (
      <main className="grain min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[80vh] items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="font-display text-3xl text-foreground">
              Film Not Found
            </h1>
            <Link
              to="/films"
              className="mt-6 inline-flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
            >
              <ArrowLeft size={18} />
              <span>Back to Films</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="grain min-h-screen bg-background">
      <Header />

      {/* Video Section - Fullscreen Style */}
      <section className="pt-20 sm:pt-24">
        <div ref={videoRef} className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Video Player Container */}
          <div className="relative aspect-video w-full overflow-hidden bg-charcoal">
            {youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&color=white`}
                title={film.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-foreground/60">Video not available</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Film Details Section */}
      <section className="py-12 sm:py-16">
        <div ref={contentRef} className="container mx-auto max-w-3xl px-6 text-center">
          {/* Film Title */}
          <h1 className="font-display text-3xl text-foreground sm:text-4xl md:text-5xl">
            {film.title}
          </h1>

          {/* Divider */}
          <div className="mx-auto my-6 h-px w-16 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Details Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-foreground/50 sm:gap-8 sm:text-sm">
            <div>
              <span className="text-primary">A Brotherhood Studio Film</span>
            </div>
            {film.category && (
              <>
                <div className="hidden h-4 w-px bg-foreground/20 sm:block" />
                <div>
                  <span className="text-foreground/40">Category:</span>{" "}
                  <span className="text-foreground/70">{film.category}</span>
                </div>
              </>
            )}
            {film.location && (
              <>
                <div className="hidden h-4 w-px bg-foreground/20 sm:block" />
                <div>
                  <span className="text-foreground/40">Location:</span>{" "}
                  <span className="text-foreground/70">{film.location}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* End Section */}
      <section className="border-t border-primary/10 py-12 sm:py-16">
        <div className="container mx-auto px-6 text-center">
          {/* Back to Films */}
          <Link
            to="/films"
            className="inline-flex items-center gap-3 text-sm uppercase tracking-widest text-foreground/60 transition-colors hover:text-primary"
          >
            <ArrowLeft size={18} />
            <span>Back to Films</span>
          </Link>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="mx-auto mt-10 flex flex-col items-center gap-2 text-foreground/40 transition-colors hover:text-primary"
          >
            <ChevronUp size={24} />
            <span className="text-xs uppercase tracking-widest">Back to Top</span>
          </button>
        </div>
      </section>
    </main>
  );
};

export default FilmDetail;
