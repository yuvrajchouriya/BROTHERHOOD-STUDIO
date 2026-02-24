import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useImagePreload } from "@/hooks/useImagePreload";

gsap.registerPlugin(ScrollTrigger);

interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  photo_url: string | null;
  bio: string | null;
}

interface TeamWork {
  id: string;
  team_member_id: string;
  image_url: string;
  display_order: number;
}

interface WorkItemProps {
  work: {
    id: string;
    image_url: string;
  };
  index: number;
}

const WorkItem = ({ work, index }: WorkItemProps) => {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const item = itemRef.current;
    if (!item) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 50, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, itemRef);

    return () => ctx.revert();
  }, [index]);

  return (
    <div
      ref={itemRef}
      className="group relative w-full aspect-video md:aspect-[21/9] overflow-hidden"
    >
      <img
        src={work.image_url}
        alt={`Work ${index + 1}`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading={index < 3 ? "eager" : "lazy"}
        decoding="async"
      />

    </div>
  );
};

const TeamMemberWork = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const heroRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);


  // Fetch team member details
  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ['team-member', memberId],
    queryFn: async () => {
      if (!memberId) return null;
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', memberId)
        .single();
      if (error) throw error;
      return data as TeamMember;
    },
    enabled: !!memberId,
  });

  // Fetch team member work
  const { data: works, isLoading: worksLoading } = useQuery({
    queryKey: ['team-work', memberId],
    queryFn: async () => {
      if (!memberId) return [];
      const { data, error } = await supabase
        .from('team_work')
        .select('*')
        .eq('team_member_id', memberId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as TeamWork[];
    },
    enabled: !!memberId,
  });

  // Preload images
  const imageUrls = works?.map(w => w.image_url) || [];
  useImagePreload(imageUrls.slice(0, 5), { priority: true });

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!member) return;

    const ctx = gsap.context(() => {
      // Hero animation
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

      // Profile content animation
      const profile = profileRef.current;
      if (profile) {
        gsap.fromTo(
          profile.children,
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
    }, profileRef);

    return () => ctx.revert();
  }, [member]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isLoading = memberLoading || worksLoading;

  if (isLoading) {
    return (
      <main className="grain min-h-screen bg-background">
        <Header />
        <section className="relative h-[50vh] w-full overflow-hidden sm:h-[60vh]">
          <Skeleton className="h-full w-full" />
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

  if (!member) {
    return (
      <main className="grain min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[80vh] items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="font-display text-3xl text-foreground">
              Team Member Not Found
            </h1>
            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
            >
              <ArrowLeft size={18} />
              <span>Back to About Us</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const defaultImage = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974";

  return (
    <main className="grain min-h-screen bg-background">
      <Header />

      {/* Hero Image */}
      <section ref={heroRef} className="relative h-[50vh] w-full overflow-hidden sm:h-[60vh]">
        <img
          src={member.photo_url || defaultImage}
          alt={member.name}
          className="h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </section>

      {/* Profile Info */}
      <section className="py-12 sm:py-16">
        <div ref={profileRef} className="container mx-auto max-w-3xl px-6 text-center">
          <h1 className="font-display text-3xl text-foreground sm:text-4xl md:text-5xl">
            {member.name}
          </h1>
          <p className="mt-3 text-sm uppercase tracking-widest text-primary">
            {member.role}
          </p>

          {/* Divider */}
          <div className="mx-auto my-8 h-px w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Bio */}
          {member.bio && (
            <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-foreground/60">
              {member.bio}
            </p>
          )}
        </div>
      </section>

      {/* Works Section */}
      {works && works.length > 0 && (
        <section className="pb-16 sm:pb-24">
          <div className="container mx-auto px-6">
            {/* Section Title */}
            <div className="mb-12 text-center">
              <h2 className="font-display text-2xl text-foreground sm:text-3xl">
                Selected Work
              </h2>
              <div className="section-divider" />
            </div>

            <div className="w-full flex flex-col">
              {works?.map((work, index) => (
                <WorkItem
                  key={work.id}
                  work={work}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* End Section */}
      <section className="border-t border-primary/10 py-12 sm:py-16">
        <div className="container mx-auto px-6 text-center">
          {/* Back to About */}
          <Link
            to="/about"
            className="inline-flex items-center gap-3 text-sm uppercase tracking-widest text-foreground/60 transition-colors hover:text-primary"
          >
            <ArrowLeft size={18} />
            <span>Back to About Us</span>
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

export default TeamMemberWork;
