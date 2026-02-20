import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Camera,
  Heart,
  PartyPopper,
  Sparkles,
  Video,
  Plane,
  Film,
  Music,
  MapPin,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    icon: Camera,
    title: "Wedding Photography",
    description: "Capturing every precious moment of your special day with artistic precision.",
  },
  {
    icon: Heart,
    title: "Pre-Wedding Shoot",
    description: "Romantic pre-wedding sessions at stunning locations.",
  },
  {
    icon: PartyPopper,
    title: "Event Photography",
    description: "Professional coverage for all your celebrations and events.",
  },
  {
    icon: Sparkles,
    title: "Candid Photography",
    description: "Natural, unposed moments that tell your authentic story.",
  },
  {
    icon: Video,
    title: "Cinematography",
    description: "Cinematic wedding films crafted like motion pictures.",
  },
  {
    icon: Plane,
    title: "Drone Shoot",
    description: "Breathtaking aerial perspectives of your venue and ceremonies.",
  },
  {
    icon: Film,
    title: "Reel Creation",
    description: "Trending social media reels to share your moments.",
  },
  {
    icon: Music,
    title: "Music Album Shoot",
    description: "Creative photoshoots for artists and music projects.",
  },
  {
    icon: MapPin,
    title: "Destination Shoot",
    description: "Travel with us for exotic destination wedding coverage.",
  },
];

const Services = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    const grid = gridRef.current;
    if (!title || !grid) return;

    const ctx = gsap.context(() => {
      const cards = grid.querySelectorAll(".service-card");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        title,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      ).fromTo(
        cards,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
        },
        "-=0.4"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-muted/30 py-16 sm:py-24 md:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Title */}
        <div ref={titleRef} className="mb-10 text-center sm:mb-16">
          <h2 className="mb-4 font-display text-2xl text-foreground sm:text-3xl md:text-5xl">
            Our <span className="text-primary">Services</span>
          </h2>
          <p className="hidden sm:block mx-auto max-w-xl px-4 font-body text-sm text-muted-foreground sm:px-0 sm:text-base">
            From traditional ceremonies to cinematic storytelling,
            we offer complete coverage for your special moments.
          </p>
          <div className="section-divider mt-6" />
        </div>

        {/* Services Grid */}
        <div
          ref={gridRef}
          className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="service-card group relative overflow-hidden border border-border/20 bg-card p-5 transition-all duration-500 hover:border-primary/30 sm:p-8"
              >
                {/* Icon */}
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center border border-primary/30 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground sm:mb-4 sm:h-14 sm:w-14">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>

                {/* Content */}
                <h3 className="mb-2 font-display text-lg text-foreground transition-colors group-hover:text-primary sm:text-xl">
                  {service.title}
                </h3>
                <p className="hidden sm:block text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {service.description}
                </p>

                {/* Hover decoration */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
