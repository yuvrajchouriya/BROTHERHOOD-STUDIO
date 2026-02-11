import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Recognition = () => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const text = textRef.current;
    if (!text) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        text,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: text,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, textRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="bg-background py-16 sm:py-24 md:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="section-divider mb-10 sm:mb-16" />
        <div ref={textRef} className="mx-auto max-w-2xl text-center">
          <p className="font-display text-lg italic text-muted-foreground sm:text-xl md:text-2xl">
            "Recognized for storytelling,
            <br />
            <span className="text-primary">trusted for emotions.</span>"
          </p>
        </div>
      </div>
    </section>
  );
};

export default Recognition;
