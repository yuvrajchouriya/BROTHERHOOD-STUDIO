import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MapPin, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Location {
  id: string;
  city_name: string;
  google_map_url: string | null;
  status: string;
  display_order: number;
}

const expansionRegions = [
  {
    region: "Central India",
    cities: ["Nagpur", "Jabalpur", "Bhopal", "Indore", "Raipur"],
  },
  {
    region: "West India",
    cities: ["Mumbai", "Pune", "Ahmedabad"],
  },
  {
    region: "North India",
    cities: ["Delhi NCR", "Jaipur", "Lucknow"],
  },
  {
    region: "South India",
    cities: ["Hyderabad", "Bangalore", "Chennai"],
  },
];

const Locations = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const expansionRef = useRef<HTMLDivElement>(null);
  const [zoomedLocations, setZoomedLocations] = useState<Record<string, boolean>>({});

  const toggleZoom = (id: string) => {
    setZoomedLocations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getEmbedUrl = (url: string, zoomIn: boolean, cityName: string): string => {
    if (!url) return "";

    // If it contains an iframe tag, extract the src
    if (url.includes('<iframe')) {
      const srcMatch = url.match(/src="([^"]+)"/);
      if (srcMatch) url = srcMatch[1];
    }

    const apiKey = "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8";
    const zoomValue = zoomIn ? 18 : 13;

    // Already a direct embed URL — use as-is (but tweak zoom if v1/place)
    if (url.includes('output=embed') || url.includes('google.com/maps/embed')) {
      if (url.includes('v1/place') || url.includes('v1/view')) {
        try {
          const urlObj = new URL(url);
          urlObj.searchParams.set('zoom', String(zoomValue));
          return urlObj.toString();
        } catch {
          return url;
        }
      }
      return url;
    }

    // Extract @lat,lon from standard Google Maps share links
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${coordMatch[1]},${coordMatch[2]}&zoom=${zoomValue}`;
    }

    // Extract /place/Name from share links
    const placeMatch = url.match(/(?:maps\/place\/)([^/@?]+)/);
    if (placeMatch) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(placeName)}&zoom=${zoomValue}`;
    }

    // Fallback: use city name search
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(cityName + ", India")}&zoom=${zoomValue}`;
  };

  // Fetch locations from database
  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Location[];
    },
  });

  // Filter active and coming soon locations
  const activeLocations = locations?.filter(loc => loc.status === 'Active') || [];
  const comingSoonLocations = locations?.filter(loc => loc.status === 'ComingSoon') || [];

  useEffect(() => {
    const title = titleRef.current;
    const content = contentRef.current;
    const expansion = expansionRef.current;

    if (!title || !content || !expansion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none none", // Changed: Only play once
        },
      });

      tl.fromTo(
        title,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      )
        .fromTo(
          content,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          "-=0.4"
        )
        .fromTo(
          expansion,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
          "-=0.3"
        );

      // Animate region cards
      gsap.fromTo(
        ".region-card",
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: expansion,
            start: "top 80%",
            toggleActions: "play none none none", // Changed: Only play once
          },
        }
      );
    }, sectionRef.current); // Scope to sectionRef.current

    return () => ctx.revert();
  }, [activeLocations]); // Re-run if locations change (though they are fetched once)

  return (
    <section ref={sectionRef} className="bg-background py-16 sm:py-24 md:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Title */}
        <div ref={titleRef} className="mb-10 text-center sm:mb-16">
          <h2 className="mb-4 font-display text-2xl text-foreground sm:text-3xl md:text-5xl">
            Our Locations
          </h2>
          <div className="section-divider" />
        </div>

        <div ref={contentRef}>
          {/* Active Locations */}
          {activeLocations.length > 0 && (
            <div className="mb-10 sm:mb-16">
              <h3 className="mb-6 text-center text-xs uppercase tracking-[0.2em] text-primary sm:mb-8 sm:text-sm sm:tracking-[0.3em]">
                Active Studios
              </h3>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
                {activeLocations.map((location) => (
                  <div
                    key={location.id}
                    className="group flex cursor-pointer items-center gap-2 sm:gap-3"
                  >
                    <MapPin
                      size={18}
                      className="text-primary transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5"
                    />
                    <span className="gold-underline font-display text-lg text-foreground transition-colors group-hover:text-primary sm:text-xl md:text-2xl">
                      {location.city_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map Embeds - Dynamic from Database */}
          {activeLocations.length > 0 && activeLocations.some(loc => loc.google_map_url) && (
            <div className="mb-10 grid gap-4 sm:mb-16 sm:gap-6 md:grid-cols-2">
              {activeLocations.map((location) => {
                if (!location.google_map_url) return null;
                const isZoomed = zoomedLocations[location.id] || false;
                const embedUrl = getEmbedUrl(location.google_map_url || "", isZoomed, location.city_name);

                return (
                  <div key={location.id} className="overflow-hidden border border-border/20 group/map">
                    <div className="flex items-center justify-between bg-card px-3 py-2 sm:px-4">
                      <p className="text-xs uppercase tracking-wider text-primary sm:text-sm font-display">
                        {location.city_name} Studio
                      </p>
                      <button
                        onClick={() => toggleZoom(location.id)}
                        className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                      >
                        {isZoomed ? (
                          <>Show Full City <MapPin size={12} /></>
                        ) : (
                          <>Zoom to Studio <Sparkles size={12} /></>
                        )}
                      </button>
                    </div>
                    <div className="aspect-video relative bg-muted/10">
                      {embedUrl ? (
                        <iframe
                          key={`${location.id}-${isZoomed}`}
                          src={embedUrl}
                          width="100%"
                          height="100%"
                          style={{
                            border: 0,
                            filter: isZoomed ? "none" : "grayscale(1) invert(0.95) contrast(0.9)"
                          }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`Brotherhood Studio - ${location.city_name}`}
                          className="transition-all duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground italic p-4 text-center">
                          Map location for {location.city_name} is being updated...
                        </div>
                      )}
                      {!isZoomed && embedUrl && (
                        <div
                          className="absolute inset-0 bg-transparent cursor-pointer"
                          onClick={() => toggleZoom(location.id)}
                          title="Click to zoom in"
                        />
                      )}
                    </div>
                    <a
                      href={location.google_map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-card px-3 py-1.5 text-center text-[10px] text-muted-foreground transition-colors hover:text-primary sm:px-4 sm:py-2"
                    >
                      View Map Source -&gt;
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expanding Across India - Vision Section */}
        <div ref={expansionRef} className="mt-16 sm:mt-24">
          {/* Main Heading */}
          <div className="mb-12 text-center sm:mb-16">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 animate-pulse text-primary sm:h-6 sm:w-6" />
              <span className="text-xs uppercase tracking-[0.3em] text-primary sm:text-sm">
                Our Vision
              </span>
              <Sparkles className="h-5 w-5 animate-pulse text-primary sm:h-6 sm:w-6" />
            </div>
            <h3 className="mb-4 font-display text-2xl text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
              Expanding Across{" "}
              <span className="text-gold-gradient">India</span>
            </h3>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg">
              From every corner of India, we're coming to capture your moments
            </p>
          </div>

          {/* Vision Message */}
          <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
            <p className="text-sm leading-relaxed text-foreground/80 sm:text-base md:text-lg">
              Brotherhood Studio is on a mission to bring{" "}
              <span className="font-semibold text-primary">cinematic storytelling</span> to every
              state, every city, every celebration across India. Your love story
              deserves to be captured with artistry, no matter where you are.
            </p>
          </div>

          {/* Region-wise Cities Grid */}
          <div className="mb-12 grid gap-4 sm:mb-16 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {expansionRegions.map((item) => (
              <div
                key={item.region}
                className="region-card group relative overflow-hidden border border-border/30 bg-card/50 p-6 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:bg-card/80"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Region name */}
                <h4 className="relative mb-4 text-center text-xs uppercase tracking-[0.2em] text-primary sm:text-sm">
                  {item.region}
                </h4>

                {/* Cities */}
                <div className="relative flex flex-wrap justify-center gap-2">
                  {item.cities.map((city) => (
                    <span
                      key={city}
                      className="rounded-full border border-border/50 bg-background/50 px-3 py-1 text-xs text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-foreground sm:text-sm"
                    >
                      {city}
                    </span>
                  ))}
                </div>

                {/* Corner accent */}
                <div className="absolute right-0 top-0 h-8 w-8 border-r border-t border-primary/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 h-8 w-8 border-b border-l border-primary/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            ))}
          </div>


          {/* CTA Section */}
          <div className="flex justify-center">
            <div className="w-full max-w-2xl rounded-2xl border border-primary/20 bg-card/30 p-8 text-center backdrop-blur-sm sm:p-10">
              <h4 className="mb-3 font-display text-xl text-foreground sm:text-2xl">
                Want us in your city?
              </h4>
              <p className="mb-8 text-sm text-muted-foreground sm:text-base">
                We travel across the globe for specialized shoots. Let us know where you need us.
              </p>
              <Link
                to="/book"
                className="gold-button inline-flex items-center gap-2 text-sm md:text-base"
              >
                <span>Let Us Know</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section >
  );
};

export default Locations;
