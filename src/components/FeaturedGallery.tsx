import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { getThumbnailUrl } from "@/lib/imageUtils";

gsap.registerPlugin(ScrollTrigger);

interface HomeProject {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  gallery_id: string | null;
  film_id: string | null;
  category: string | null;
}

interface TiltCardProps {
  project: HomeProject;
  index: number;
}

const TiltCard = ({ project, index }: TiltCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Use optimized thumbnail
  const thumbnailSrc = getThumbnailUrl(project.image_url, { 
    width: 600, 
    quality: 80 
  });

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Scroll animation
    gsap.fromTo(
      card,
      {
        y: 100,
        opacity: 0,
        rotateX: 15,
      },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 1,
        delay: index * 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, [index]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const shine = shineRef.current;
    if (!card || !shine) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation based on mouse position
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    // Apply 3D transform
    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      scale: 1.02,
      duration: 0.4,
      ease: "power2.out",
    });

    // Move shine effect
    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;
    gsap.to(shine, {
      background: `radial-gradient(circle at ${shineX}% ${shineY}%, hsl(var(--gold) / 0.3) 0%, transparent 60%)`,
      opacity: 1,
      duration: 0.3,
    });
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    const shine = shineRef.current;
    if (!card || !shine) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.5,
      ease: "power2.out",
    });

    gsap.to(shine, {
      opacity: 0,
      duration: 0.3,
    });

    setIsHovered(false);
  };

  const defaultImage = "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974";
  
  // Determine link based on category
  const getLinkTo = () => {
    if (project.category === "film" && project.film_id) {
      return `/films/${project.film_id}`;
    }
    if (project.gallery_id) {
      return `/gallery/${project.gallery_id}`;
    }
    return "/gallery";
  };

  const linkTo = getLinkTo();

  return (
    <Link to={linkTo}>
      <div
        ref={cardRef}
        className="group cursor-pointer"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
      <div 
        className="relative aspect-[3/4] overflow-hidden rounded-sm"
        style={{
          transformStyle: "preserve-3d",
          boxShadow: isHovered 
            ? "0 25px 50px -12px hsl(var(--charcoal) / 0.8), 0 0 40px hsl(var(--gold) / 0.15)" 
            : "0 10px 30px -10px hsl(var(--charcoal) / 0.6)",
          transition: "box-shadow 0.4s ease",
        }}
      >
        {/* Image */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={thumbnailSrc || defaultImage}
          alt={project.title}
          className={`h-full w-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            transform: isHovered ? "scale(1.08)" : "scale(1)",
          }}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />

        {/* Shine Effect */}
        <div
          ref={shineRef}
          className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300"
          style={{
            mixBlendMode: "overlay",
          }}
        />

        {/* 3D Frame Border */}
        <div 
          className="absolute inset-0 border border-primary/0 transition-all duration-500"
          style={{
            borderColor: isHovered ? "hsl(var(--primary) / 0.4)" : "transparent",
            boxShadow: isHovered ? "inset 0 0 30px hsl(var(--gold) / 0.1)" : "none",
          }}
        />

        {/* Content - pops forward on hover */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 transition-transform duration-500"
          style={{
            transform: isHovered ? "translateZ(40px) translateY(-5px)" : "translateZ(0)",
            transformStyle: "preserve-3d",
          }}
        >
          <h3 className="font-display text-lg text-foreground sm:text-xl md:text-2xl drop-shadow-lg">
            {project.title}
          </h3>
          {project.subtitle && (
            <p className="mt-1 text-xs uppercase tracking-wider text-primary sm:text-sm">
              {project.subtitle}
            </p>
          )}
        </div>

        {/* Corner accents */}
        <div 
          className="absolute top-3 left-3 w-6 h-6 border-l border-t border-primary/0 transition-all duration-500"
          style={{
            borderColor: isHovered ? "hsl(var(--primary) / 0.6)" : "transparent",
          }}
        />
        <div 
          className="absolute bottom-3 right-3 w-6 h-6 border-r border-b border-primary/0 transition-all duration-500"
          style={{
            borderColor: isHovered ? "hsl(var(--primary) / 0.6)" : "transparent",
          }}
        />
      </div>
      </div>
    </Link>
  );
};

const CardSkeleton = () => (
  <div className="relative">
    <Skeleton className="aspect-[3/4] w-full rounded-sm" />
  </div>
);

const FeaturedGallery = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  // Fetch home projects from database
  // Fetch only GALLERY home projects (not films)
  const { data: projects, isLoading } = useQuery({
    queryKey: ['home-projects-gallery'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_projects')
        .select('*')
        .eq('is_visible', true)
        .eq('category', 'gallery')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as HomeProject[];
    },
  });

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;

    gsap.fromTo(
      title,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: title,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className="bg-background py-16 sm:py-24 md:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Title */}
        <div ref={titleRef} className="mb-10 text-center sm:mb-16">
          <h2 className="mb-4 font-display text-2xl text-foreground sm:text-3xl md:text-5xl">
            Stories We've Told
          </h2>
          <div className="section-divider" />
        </div>

        {/* Featured Weddings Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <TiltCard key={project.id} project={project} index={index} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-foreground/60">Featured stories coming soon.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedGallery;
