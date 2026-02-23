import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

gsap.registerPlugin(ScrollTrigger);

interface HomeFilmItem {
  id: string;
  title: string;
  image_url: string | null;
  video_url: string | null;
}

const WeddingFilms = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch featured film linked items or custom home film
  const { data: featuredFilm, isLoading } = useQuery({
    queryKey: ['home-featured-film'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_projects')
        .select('*')
        .eq('is_visible', true)
        .eq('category', 'film')
        .order('display_order', { ascending: true }) // First visible one
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;

      if (!data) return null;

      const project = data as any; // Temporary cast to avoid 'never' issues with Supabase types
      return {
        id: project.id,
        title: project.title,
        image_url: project.image_url,
        video_url: project.subtitle // Use subtitle as video_url
      } as HomeFilmItem;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const video = videoRef.current;
    const content = contentRef.current;

    if (!video || !content) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none none", // Changed: Only play once
        },
      });

      tl.fromTo(
        video,
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power3.out" }
      ).fromTo(
        content,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power3.out" },
        "-=0.7"
      );
    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  // Handle click: if video URL exists, go there. Else /films
  const handleBoxClick = () => {
    if (featuredFilm?.video_url) {
      window.open(featuredFilm.video_url, '_blank');
    } else {
      navigate('/films');
    }
  };

  return (
    <section ref={sectionRef} className="bg-background py-16 sm:py-24 md:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Video/Image Container */}
          <div
            ref={videoRef}
            className={`group relative aspect-video overflow-hidden border border-border/50 ${(featuredFilm as any)?.redirect_enabled !== false ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={() => {
              if ((featuredFilm as any)?.redirect_enabled !== false) {
                handleBoxClick();
              }
            }}
          >
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : featuredFilm ? (
              <>
                {/* Image */}
                <img
                  src={featuredFilm.image_url || ""}
                  alt={featuredFilm.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-background/30 transition-all duration-500 group-hover:bg-background/10">
                  <button
                    className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/50 bg-background/50 text-primary backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:border-primary group-hover:bg-primary group-hover:text-background sm:h-20 sm:w-20"
                  >
                    <Play size={28} fill="currentColor" className="sm:hidden" />
                    <Play size={32} fill="currentColor" className="hidden sm:block" />
                  </button>
                </div>

                {/* Floating effect border */}
                <div className="absolute inset-0 border border-primary/0 transition-all duration-500 group-hover:border-primary/30" />
              </>
            ) : (
              // Empty state
              <div className="h-full w-full flex flex-col items-center justify-center bg-muted/20">
                <Play className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-sm text-muted-foreground">No featured film</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Add Image in Admin</p>
              </div>
            )}
          </div>

          {/* Content */}
          <div ref={contentRef} className="text-center lg:pl-8 lg:text-left">
            <h2 className="mb-4 font-display text-2xl text-foreground sm:mb-6 sm:text-3xl md:text-5xl">
              Wedding Films
            </h2>
            <p className="mb-6 text-base leading-relaxed text-muted-foreground sm:mb-8 sm:text-lg">
              Stories crafted like cinema,
              <br />
              moments captured forever.
            </p>
            <p className="mb-8 text-sm text-muted-foreground/70 sm:mb-10 sm:text-base">
              Every wedding is a unique story waiting to be told. We don't just
              record moments – we create cinematic experiences that transport you
              back to the emotions, the laughter, and the tears of your special
              day.
            </p>
            <Link to="/films">
              <button className="btn-luxury">
                <span>Watch Films</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeddingFilms;
