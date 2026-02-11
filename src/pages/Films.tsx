import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

gsap.registerPlugin(ScrollTrigger);

interface Film {
  id: string;
  title: string;
  category: string | null;
  location: string | null;
  thumbnail_url: string | null;
  youtube_url: string | null;
}

interface FilmCardProps {
  film: Film;
  index: number;
}

const FilmCard = ({ film, index }: FilmCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        card,
        { y: 80, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: index * 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, cardRef);

    return () => ctx.revert();
  }, [index]);

  const defaultImage = "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974";

  return (
    <Link to={`/films/${film.id}`}>
      <div
        ref={cardRef}
        className="group relative cursor-pointer overflow-hidden"
        style={{
          boxShadow: "0 15px 40px -10px hsl(var(--charcoal) / 0.8)",
        }}
      >
        {/* Thumbnail Container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {/* Image */}
          <img
            src={film.thumbnail_url || defaultImage}
            alt={film.title}
            className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-50"
          />

          {/* Dark Overlay on Hover */}
          <div className="absolute inset-0 bg-background/0 transition-all duration-500 group-hover:bg-background/60" />

          {/* Play Icon - Center */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-background/20 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
              <Play size={28} className="ml-1 text-primary" fill="hsl(var(--primary))" />
            </div>
          </div>

          {/* Bottom Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />

          {/* Gold Border on Hover */}
          <div className="absolute inset-0 border-2 border-primary/0 transition-all duration-500 group-hover:border-primary/40" />
        </div>

        {/* Content - Below Image */}
        <div className="absolute bottom-0 left-0 right-0 p-5 transition-transform duration-500 group-hover:-translate-y-2">
          <h3 className="font-display text-lg text-foreground drop-shadow-lg sm:text-xl">
            {film.title}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-wider text-primary">
            {film.category || "Wedding Film"}
          </p>
          <p className="mt-0.5 text-xs text-foreground/50">{film.location || "India"}</p>
        </div>
      </div>
    </Link>
  );
};

const FilmCardSkeleton = () => (
  <div className="relative overflow-hidden">
    <Skeleton className="aspect-[3/4] w-full" />
  </div>
);

const Films = () => {
  const titleRef = useRef<HTMLDivElement>(null);

  // Fetch films from database
  const { data: films, isLoading } = useQuery({
    queryKey: ['films'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('films')
        .select('id, title, category, location, thumbnail_url, youtube_url')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Film[];
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
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="grain min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="flex min-h-[50vh] flex-col items-center justify-center pt-24">
        <div ref={titleRef} className="container mx-auto px-6 text-center">
          <h1 className="font-display text-4xl text-foreground sm:text-5xl md:text-7xl">
            Films
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-foreground/60 sm:text-lg">
            Love Stories, Told Like Cinema
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      </section>

      {/* Films Grid */}
      <section className="pb-24 pt-8 sm:pb-32">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <FilmCardSkeleton key={i} />
              ))}
            </div>
          ) : films && films.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
              {films.map((film, index) => (
                <FilmCard key={film.id} film={film} index={index} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-foreground/60">No films available yet.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Films;
