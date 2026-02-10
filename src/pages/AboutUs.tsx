import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Instagram, Youtube, Facebook, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_WHATSAPP = "919301781585";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo_url: string | null;
  bio: string | null;
  view_work_enabled: boolean | null;
}

interface TeamCardProps {
  member: TeamMember;
  index: number;
}

const TeamCard = ({ member, index }: TeamCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    gsap.fromTo(
      card,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: index * 0.15,
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
    const card = imageRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out",
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    const card = imageRef.current;
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  const defaultImage = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974";

  return (
    <div
      ref={cardRef}
      className="group relative"
    >
      {/* Image with 3D effect */}
      <div
        ref={imageRef}
        className="relative aspect-[3/4] overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transformStyle: "preserve-3d" }}
      >
        <img
          src={member.photo_url || defaultImage}
          alt={member.name}
          className="h-full w-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-70" />

        {/* Gold border on hover */}
        <div className="absolute inset-0 border border-primary/0 transition-all duration-500 group-hover:border-primary/30" />

        {/* Shine effect */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="font-display text-xl text-foreground sm:text-2xl">
          {member.name}
        </h3>
        <p className="mt-1 text-sm uppercase tracking-wider text-primary">
          {member.role}
        </p>

        {/* View Work Button */}
        {member.view_work_enabled && (
          <Link
            to={`/about/team/${member.id}`}
            className="mt-4 inline-flex items-center gap-2 border border-primary/40 px-4 py-2 text-xs uppercase tracking-widest text-primary opacity-0 transition-all duration-500 hover:bg-primary hover:text-background group-hover:opacity-100"
          >
            View Work
          </Link>
        )}
      </div>
    </div>
  );
};

const TeamCardSkeleton = () => (
  <div className="relative">
    <Skeleton className="aspect-[3/4] w-full" />
  </div>
);

const AboutUs = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const philosophyRef = useRef<HTMLDivElement>(null);

  // Fetch team members
  const { data: teamMembers, isLoading: teamLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as TeamMember[];
    },
  });

  // Fetch site settings
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const whatsappNumber = siteSettings?.whatsapp_number || DEFAULT_WHATSAPP;

  useEffect(() => {
    window.scrollTo(0, 0);

    // Hero animation
    const hero = heroRef.current;
    if (hero) {
      gsap.fromTo(
        hero.children,
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

    // Story animation
    const story = storyRef.current;
    if (story) {
      gsap.fromTo(
        story,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: story,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // Philosophy animation
    const philosophy = philosophyRef.current;
    if (philosophy) {
      gsap.fromTo(
        philosophy,
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: philosophy,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  }, []);

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      "Hello Brotherhood Studio, I would like to know more about your work."
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  // Format phone number for display
  const formatPhoneDisplay = (phone: string) => {
    if (phone.startsWith("91") && phone.length === 12) {
      return `+91 ${phone.slice(2)}`;
    }
    return phone;
  };

  return (
    <main className="grain min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="flex min-h-[45vh] flex-col items-center justify-center pt-24">
        <div ref={heroRef} className="container mx-auto px-6 text-center">
          <h1 className="font-display text-4xl text-foreground sm:text-5xl md:text-6xl">
            About Brotherhood Studio
          </h1>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-12 sm:py-20">
        <div
          ref={storyRef}
          className="container mx-auto max-w-3xl px-6 text-center"
        >
          <div className="space-y-6 text-base leading-relaxed text-foreground/70 sm:text-lg">
            <p>
              Brotherhood Studio was born from a simple belief —
              <br className="hidden sm:block" />
              every wedding carries emotions that deserve more than just pictures.
            </p>
            <p>
              We don't follow poses.
              <br className="hidden sm:block" />
              We don't interrupt moments.
              <br className="hidden sm:block" />
              We observe, feel, and quietly turn real emotions into timeless visuals.
            </p>
            <p>
              From intimate weddings to grand celebrations,
              <br className="hidden sm:block" />
              our work reflects stories that feel honest, cinematic, and deeply personal.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Quote Section */}
      <section className="py-16 sm:py-24">
        <div
          ref={philosophyRef}
          className="container mx-auto max-w-4xl px-6"
        >
          <div className="border-y border-primary/20 py-12 text-center sm:py-16">
            <blockquote className="font-display text-2xl italic text-foreground sm:text-3xl md:text-4xl">
              "We don't just capture moments.
              <br />
              We create films that feel like memories."
            </blockquote>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-6">
          {/* Section Title */}
          <div className="mb-12 text-center">
            <h2 className="font-display text-2xl text-foreground sm:text-3xl md:text-4xl">
              Our Team
            </h2>
            <div className="section-divider" />
          </div>

          {/* Team Grid */}
          {teamLoading ? (
            <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TeamCardSkeleton key={i} />
              ))}
            </div>
          ) : teamMembers && teamMembers.length > 0 ? (
            <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((member, index) => (
                <TeamCard key={member.id} member={member} index={index} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-foreground/60">Team members coming soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Our Presence Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-2xl px-6 text-center">
          <p className="text-base text-foreground/60 sm:text-lg">
            We currently serve weddings across{" "}
            <span className="text-primary">Amgaon</span> and{" "}
            <span className="text-primary">Chhindwara</span>,
            <br className="hidden sm:block" />
            with stories unfolding in new cities very soon.
          </p>
        </div>
      </section>

      {/* Social Links + WhatsApp Section */}
      <section className="border-t border-foreground/10 py-16 sm:py-20">
        <div className="container mx-auto px-6 text-center">
          {/* Social Media Icons */}
          <div className="mb-12">
            <p className="mb-6 text-sm uppercase tracking-widest text-foreground/50">
              Connect With Us
            </p>
            <div className="flex items-center justify-center gap-6">
              {siteSettings?.instagram_url && (
                <a
                  href={siteSettings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-16 w-16 sm:h-20 sm:w-20 md:h-28 md:w-28 items-center justify-center rounded-full border border-foreground/20 text-[#E4405F] transition-all duration-300 hover:border-[#E4405F] hover:bg-[#E4405F]/10"
                  aria-label="Instagram"
                >
                  <Instagram className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                </a>
              )}
              {siteSettings?.youtube_url && (
                <a
                  href={siteSettings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-16 w-16 sm:h-20 sm:w-20 md:h-28 md:w-28 items-center justify-center rounded-full border border-foreground/20 text-[#FF0000] transition-all duration-300 hover:border-[#FF0000] hover:bg-[#FF0000]/10"
                  aria-label="YouTube"
                >
                  <Youtube className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                </a>
              )}
              {siteSettings?.facebook_url && (
                <a
                  href={siteSettings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-16 w-16 sm:h-20 sm:w-20 md:h-28 md:w-28 items-center justify-center rounded-full border border-foreground/20 text-[#1877F2] transition-all duration-300 hover:border-[#1877F2] hover:bg-[#1877F2]/10"
                  aria-label="Facebook"
                >
                  <Facebook className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                </a>
              )}
              {siteSettings?.whatsapp_number && (
                <a
                  href={`https://wa.me/${siteSettings.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-16 w-16 sm:h-20 sm:w-20 md:h-28 md:w-28 items-center justify-center rounded-full border border-foreground/20 text-[#25D366] transition-all duration-300 hover:border-[#25D366] hover:bg-[#25D366]/10"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                </a>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-auto my-10 h-px w-16 bg-foreground/10" />

          {/* Contact Note */}
          <div>
            <p className="text-sm text-foreground/50">
              Have a question? Reach out to us anytime.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;
