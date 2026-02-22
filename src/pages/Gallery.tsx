import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { getThumbnailUrl } from "@/lib/imageUtils";

gsap.registerPlugin(ScrollTrigger);

interface GalleryStory {
  id: string;
  project_name: string;
  location: string | null;
  thumbnail_url: string | null;
  category: string | null;
}

interface StoryCardProps {
  story: GalleryStory;
  index: number;
  fetchPriority?: "high" | "low" | "auto";
}

const StoryCard = ({ story, index }: StoryCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Use optimized thumbnail for faster loading
  const thumbnailSrc = getThumbnailUrl(story.thumbnail_url, {
    width: 600,
    quality: 80
  });

  const isPriority = index < 3;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const ctx = gsap.context(() => {
      // Staggered scroll animation with parallax
      gsap.fromTo(
        card,
        {
          y: 80,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          delay: index * 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      );

    }, cardRef); // Scope to cardRef

    return () => ctx.revert();
  }, [index]);

  const handleMouseEnter = () => {
    const card = cardRef.current;
    if (!card) return;

    gsap.to(card, {
      y: -8,
      duration: 0.4,
      ease: "power2.out",
    });

    gsap.to(card.querySelector(".card-overlay"), {
      opacity: 0.7,
      duration: 0.4,
    });

    gsap.to(card.querySelector(".card-image"), {
      scale: 1.08,
      duration: 0.6,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    gsap.to(card, {
      y: 0,
      duration: 0.4,
      ease: "power2.out",
    });

    gsap.to(card.querySelector(".card-overlay"), {
      opacity: 0.5,
      duration: 0.4,
    });

    gsap.to(card.querySelector(".card-image"), {
      scale: 1,
      duration: 0.6,
      ease: "power2.out",
    });
  };

  const defaultImage = "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974";

  const handleClick = () => {
    // Track gallery open removed
  };

  return (
    <Link to={`/gallery/${story.id}`} onClick={handleClick}>
      <div
        ref={cardRef}
        className="group relative cursor-pointer overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          boxShadow: "0 20px 50px -15px hsl(var(--charcoal) / 0.7)",
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden">
          {/* Loading placeholder */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <img
            src={thumbnailSrc || defaultImage}
            alt={story.project_name}
            className={`card-image h-full w-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading={isPriority ? "eager" : "lazy"}
            fetchPriority={isPriority ? "high" : "auto"}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
          />

          {/* Gradient Overlay */}
          <div className="card-overlay absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-50 transition-opacity duration-500" />

          {/* Gold Frame Border */}
          <div className="absolute inset-0 border border-primary/0 transition-all duration-500 group-hover:border-primary/30" />

          {/* Corner Accents */}
          <div className="absolute left-4 top-4 h-8 w-8 border-l border-t border-primary/0 transition-all duration-500 group-hover:border-primary/50" />
          <div className="absolute bottom-4 right-4 h-8 w-8 border-b border-r border-primary/0 transition-all duration-500 group-hover:border-primary/50" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <h3 className="font-display text-xl text-foreground drop-shadow-lg sm:text-2xl md:text-3xl">
            {story.project_name}
          </h3>
          <p className="mt-2 text-sm uppercase tracking-wider text-primary">
            {story.category || "Wedding Story"}
          </p>
          <p className="mt-1 text-xs text-foreground/60">{story.location || "India"}</p>

          {/* View Story Indicator */}
          <div className="mt-4 flex items-center gap-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <span className="text-xs uppercase tracking-widest text-primary">
              View Story
            </span>
            <div className="h-px w-8 bg-primary" />
          </div>
        </div>
      </div>
    </Link>
  );
};

const GalleryCardSkeleton = () => (
  <div className="relative overflow-hidden">
    <Skeleton className="aspect-[4/5] w-full" />
  </div>
);

const Gallery = () => {
  const titleRef = useRef<HTMLDivElement>(null);

  // Fetch galleries from database
  const { data: galleries, isLoading } = useQuery({
    queryKey: ['galleries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('galleries')
        .select('id, project_name, location, thumbnail_url, category')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as GalleryStory[];
    },
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      const title = titleRef.current;
      if (title) {
        gsap.fromTo(
          title.children,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
          }
        );
      }
    }); // Scope not strictly necessary for simple logic but good practice, or scope to a container ref if available. 
    // Since titleRef is used inside, we can scope to titleRef if it's the container, but titleRef is the div. 
    // Let's scope to nothing (global in effect but cleanup works) or better, create a main container ref.
    // For now, scoping to nothing is fine as long as we revert.

    return () => ctx.revert();
  }, []);

  return (
    <main className="grain min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="flex min-h-[50vh] flex-col items-center justify-center pt-24">
        <div ref={titleRef} className="container mx-auto px-6 text-center">
          <h1 className="font-display text-4xl text-foreground sm:text-5xl md:text-7xl">
            Gallery
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-foreground/60 sm:text-lg">
            Moments That Became Stories
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="pb-24 pt-8 sm:pb-32">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <GalleryCardSkeleton key={i} />
              ))}
            </div>
          ) : galleries && galleries.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {galleries.map((story, index) => (
                <StoryCard key={story.id} story={story} index={index} fetchPriority={index < 3 ? "high" : "auto"} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-foreground/60">No galleries available yet.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Gallery;
