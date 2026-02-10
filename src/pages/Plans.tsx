import Header from "@/components/Header";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Gift, Star, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

gsap.registerPlugin(ScrollTrigger);

interface Plan {
  id: string;
  plan_name: string;
  price: string;
  duration: string | null;
  services: string[] | null;
  bonus_items: string[] | null;
  is_highlighted: boolean | null;
  display_order: number | null;
}

const PlanCardSkeleton = () => (
  <div className="relative overflow-hidden border border-border/20 bg-card">
    <Skeleton className="h-32 w-full" />
    <div className="p-6">
      <Skeleton className="mx-auto h-10 w-24" />
      <Skeleton className="mx-auto mt-2 h-4 w-16" />
    </div>
    <div className="p-6 space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  </div>
);

const Plans = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Fetch plans from database
  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Plan[];
    },
  });

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll(".plan-card");

    if (cards && cards.length > 0) {
      gsap.fromTo(
        cards,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        }
      );
    }
  }, [plans]);

  // Assign colors based on display order
  const getColorScheme = (index: number) => {
    const colors = [
      { color: "from-red-600 to-red-800", borderColor: "border-red-600/30" },
      { color: "from-yellow-500 to-amber-600", borderColor: "border-primary/50" },
      { color: "from-amber-700 to-amber-900", borderColor: "border-amber-700/30" },
    ];
    return colors[index % colors.length];
  };

  return (
    <main className="grain min-h-screen overflow-x-hidden bg-background">
      <Header />
      
      <section ref={sectionRef} className="pb-16 pt-24 sm:pb-24 sm:pt-32 md:pb-32 md:pt-40">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Title */}
          <div className="mb-10 text-center sm:mb-16">
            <h1 className="mb-4 font-display text-3xl text-foreground sm:text-4xl md:text-6xl">
              Our <span className="text-primary">Plans</span>
            </h1>
            <p className="mx-auto max-w-2xl px-4 font-body text-sm text-muted-foreground sm:px-0 sm:text-base">
              Choose the perfect package to capture your special moments. 
              Every plan is crafted to deliver timeless memories.
            </p>
            <div className="section-divider mt-6" />
          </div>

          {/* Pricing Cards */}
          {isLoading ? (
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <PlanCardSkeleton key={i} />
              ))}
            </div>
          ) : plans && plans.length > 0 ? (
            <div
              ref={cardsRef}
              className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {plans.map((plan, index) => {
                const colorScheme = getColorScheme(index);
                const Icon = plan.is_highlighted ? Crown : Star;
                return (
                  <div
                    key={plan.id}
                    className={`plan-card group relative overflow-hidden border bg-card transition-all duration-500 ${colorScheme.borderColor} ${
                      plan.is_highlighted ? "lg:-mt-4 lg:mb-4" : ""
                    }`}
                  >
                    {/* Popular Badge */}
                    {plan.is_highlighted && (
                      <div className="absolute -right-10 top-5 rotate-45 bg-primary px-10 py-1 text-[10px] font-medium uppercase tracking-wider text-primary-foreground sm:-right-12 sm:top-6 sm:px-12 sm:text-xs">
                        Popular
                      </div>
                    )}

                    {/* Header */}
                    <div className={`bg-gradient-to-r ${colorScheme.color} p-4 text-center sm:p-6`}>
                      <Icon className="mx-auto mb-2 h-8 w-8 text-foreground/90 sm:mb-3 sm:h-10 sm:w-10" />
                      <h3 className="font-display text-xl text-foreground sm:text-2xl">
                        {plan.plan_name}
                      </h3>
                    </div>

                    {/* Price */}
                    <div className="border-b border-border/20 p-4 text-center sm:p-6">
                      <div className="font-display text-3xl text-foreground sm:text-4xl">
                        {plan.price}
                      </div>
                      {plan.duration && (
                        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                          {plan.duration}
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="p-4 sm:p-6">
                      {plan.services && plan.services.length > 0 && (
                        <>
                          <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-primary sm:mb-4 sm:text-xs">
                            Includes:
                          </p>
                          <ul className="space-y-2 sm:space-y-3">
                            {plan.services.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2 sm:gap-3">
                                <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary sm:h-4 sm:w-4" />
                                <span className="text-xs text-foreground/80 sm:text-sm">
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}

                      {/* Bonus Section */}
                      {plan.bonus_items && plan.bonus_items.length > 0 && (
                        <div className="mt-4 border-t border-border/20 pt-4 sm:mt-6 sm:pt-6">
                          <p className="mb-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-primary sm:mb-4 sm:text-xs">
                            <Gift className="h-3 w-3 sm:h-4 sm:w-4" />
                            Best Wishes (Bonus):
                          </p>
                          <ul className="space-y-1.5 sm:space-y-2">
                            {plan.bonus_items.map((item, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-xs text-muted-foreground sm:gap-3 sm:text-sm"
                              >
                                <span className="text-primary">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <div className="p-4 pt-0 sm:p-6 sm:pt-0">
                      <a
                        href="/book"
                        className="btn-luxury block w-full text-center text-xs sm:text-sm"
                      >
                        <span>Choose Plan</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-foreground/60">Plans coming soon.</p>
            </div>
          )}

          {/* Bottom Note */}
          <p className="mt-8 text-center text-xs text-muted-foreground sm:mt-12 sm:text-sm">
            All plans include professional editing & color grading. 
            Custom packages available on request.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Plans;
