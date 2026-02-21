import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useImagePreload } from "@/hooks/useImagePreload";

// Fallback service images
import weddingImg from "@/assets/services/wedding-photography.jpg";
import preWeddingImg from "@/assets/services/pre-wedding.jpg";
import eventImg from "@/assets/services/event-photography.jpg";
import candidImg from "@/assets/services/candid-photography.jpg";
import filmmakingImg from "@/assets/services/filmmaking.jpg";
import cinematographyImg from "@/assets/services/cinematography.jpg";
import droneImg from "@/assets/services/drone-shoot.jpg";
import reelImg from "@/assets/services/reel-creation.jpg";
import musicImg from "@/assets/services/music-album.jpg";
import destinationImg from "@/assets/services/destination-shoot.jpg";

gsap.registerPlugin(ScrollTrigger);

// Fallback static services (used when database is empty)
const fallbackServices = [
  { id: "1", title: "Wedding Photography", description: "Capturing your special day with timeless elegance and emotion.", thumbnail_url: weddingImg },
  { id: "2", title: "Pre-Wedding Shoot", description: "Romantic pre-wedding sessions at stunning locations.", thumbnail_url: preWeddingImg },
  { id: "3", title: "Event Photography", description: "Professional coverage for corporate events and celebrations.", thumbnail_url: eventImg },
  { id: "4", title: "Candid Photography", description: "Natural, unposed moments that capture real emotions.", thumbnail_url: candidImg },
  { id: "5", title: "Filmmaking", description: "Professional film production with cinematic storytelling.", thumbnail_url: filmmakingImg },
  { id: "6", title: "Cinematography", description: "Cinematic wedding films that tell your love story.", thumbnail_url: cinematographyImg },
  { id: "7", title: "Drone Shoot", description: "Breathtaking aerial photography and videography.", thumbnail_url: droneImg },
  { id: "8", title: "Reel Creation", description: "Trending reels for social media and viral content.", thumbnail_url: reelImg },
  { id: "9", title: "Music Album Shoot", description: "Creative album cover shoots and music video production.", thumbnail_url: musicImg },
  { id: "10", title: "Destination Shoot", description: "Adventure photography at exotic locations worldwide.", thumbnail_url: destinationImg },
];

interface Service {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
}

interface ServiceCardProps {
  service: Service;
  index: number;
  isFromDatabase: boolean;
}

const ServiceCard = ({ service, index, isFromDatabase }: ServiceCardProps) => {
  const cardRef = useRef<HTMLDivElement | HTMLAnchorElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        card,
        { y: 100, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: (index % 3) * 0.12,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: card,
            start: "top 92%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, cardRef);

    return () => ctx.revert();
  }, [index]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    const card = cardRef.current;
    const content = contentRef.current;
    if (!card || !content) return;

    gsap.to(card, { y: -15, scale: 1.03, duration: 0.4, ease: "power2.out" });
    gsap.to(content, { y: -10, duration: 0.3, ease: "power2.out" });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    const card = cardRef.current;
    const content = contentRef.current;
    if (!card || !content) return;

    gsap.to(card, { y: 0, scale: 1, duration: 0.4, ease: "power2.out" });
    gsap.to(content, { y: 0, duration: 0.3, ease: "power2.out" });
  };

  const defaultImage = "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974";
  const imageUrl = service.thumbnail_url || defaultImage;

  const cardContent = (
    <div
      className="relative aspect-[4/5] overflow-hidden rounded-2xl transition-all duration-500"
      style={{
        background: isHovered
          ? "linear-gradient(135deg, hsl(var(--card) / 0.9) 0%, hsl(var(--card) / 0.7) 100%)"
          : "hsl(var(--card) / 0.8)",
        backdropFilter: "blur(20px)",
        boxShadow: isHovered
          ? "0 30px 60px -15px hsl(var(--charcoal) / 0.7), 0 0 50px hsl(var(--gold) / 0.2), inset 0 1px 0 hsl(var(--foreground) / 0.1)"
          : "0 15px 35px -10px hsl(var(--charcoal) / 0.5), inset 0 1px 0 hsl(var(--foreground) / 0.05)",
      }}
    >
      {/* Image with Overlay */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <img
          src={imageUrl}
          alt={service.title}
          className="h-full w-full object-cover transition-all duration-700"
          style={{
            transform: isHovered ? "scale(1.15)" : "scale(1)",
            filter: isHovered ? "brightness(0.4)" : "brightness(0.5)",
          }}
          loading={index < 6 ? "eager" : "lazy"}
          decoding="async"
        />
      </div>

      {/* Animated Gradient Border */}
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: "linear-gradient(135deg, hsl(var(--gold) / 0.5), transparent 50%, hsl(var(--gold) / 0.3))",
          padding: "2px",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        {isHovered && (
          <>
            <div className="absolute w-2 h-2 bg-primary/40 rounded-full animate-pulse" style={{ top: "20%", left: "15%", animationDelay: "0s" }} />
            <div className="absolute w-1.5 h-1.5 bg-primary/30 rounded-full animate-pulse" style={{ top: "60%", right: "20%", animationDelay: "0.3s" }} />
            <div className="absolute w-1 h-1 bg-primary/50 rounded-full animate-pulse" style={{ bottom: "30%", left: "25%", animationDelay: "0.6s" }} />
          </>
        )}
      </div>

      {/* Content */}
      <div ref={contentRef} className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
        {/* Service Number Badge */}
        <div
          className="inline-flex items-center justify-center w-10 h-10 mb-4 rounded-full font-display text-sm transition-all duration-500"
          style={{
            background: isHovered ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.1)",
            color: isHovered ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground) / 0.5)",
            boxShadow: isHovered ? "0 0 20px hsl(var(--gold) / 0.5)" : "none",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>

        <h3
          className="font-display text-xl sm:text-2xl mb-2 transition-all duration-500"
          style={{
            color: isHovered ? "hsl(var(--primary))" : "hsl(var(--foreground))",
            textShadow: isHovered ? "0 0 30px hsl(var(--gold) / 0.5)" : "none",
          }}
        >
          {service.title}
        </h3>

        <p
          className="hidden sm:block text-sm leading-relaxed transition-all duration-500"
          style={{
            color: "hsl(var(--foreground) / 0.7)",
            opacity: isHovered ? 1 : 0.8,
            transform: isHovered ? "translateY(0)" : "translateY(5px)",
          }}
        >
          {service.description}
        </p>

        {/* View More Link */}
        <div
          className="mt-4 flex items-center gap-2 text-xs uppercase tracking-widest transition-all duration-500"
          style={{
            color: "hsl(var(--primary))",
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? "translateY(0)" : "translateY(10px)",
          }}
        >
          <span>{isFromDatabase ? "View Details" : "Enquire Now"}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  );

  if (isFromDatabase) {
    return (
      <Link
        to={`/services/${service.id}`}
        ref={cardRef as React.RefObject<HTMLAnchorElement>}
        className="group cursor-pointer relative block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div
      ref={cardRef}
      className="group cursor-pointer relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {cardContent}
    </div>
  );
};

const ServiceCardSkeleton = () => (
  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
    <Skeleton className="h-full w-full" />
  </div>
);

const ServicesPage = () => {
  const titleRef = useRef<HTMLDivElement>(null);

  // Fetch services from database
  const { data: dbServices, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, title, description, thumbnail_url')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Service[];
    },
  });

  // Use database services if available, otherwise fallback
  const services = (dbServices && dbServices.length > 0) ? dbServices : fallbackServices;
  const isFromDatabase = !!(dbServices && dbServices.length > 0);

  // Preload service images
  const imageUrls = services.map(s => s.thumbnail_url).filter(Boolean) as string[];
  useImagePreload(imageUrls.slice(0, 6), { priority: true });

  useEffect(() => {
    window.scrollTo(0, 0);

    const title = titleRef.current;
    if (!title) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        title,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );
    }, titleRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="grain min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div ref={titleRef} className="text-center">
            <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-foreground mb-4">
              Our <span className="text-gold-gradient">Services</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              From intimate moments to grand celebrations, we offer comprehensive photography
              and videography services tailored to capture your unique story.
            </p>
            <div className="section-divider mt-8" />
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {services?.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} isFromDatabase={isFromDatabase} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-foreground mb-4">
            Ready to Create Magic?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Let's discuss your vision and create something extraordinary together.
          </p>
          <Link to="/book" className="btn-luxury inline-block">
            <span>Book a Session</span>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ServicesPage;
