import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const BrandStory = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const text = textRef.current;
    if (!text) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        text,
        {
          y: 80,
          opacity: 0,
          filter: "blur(10px)",
        },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[50vh] items-center justify-center bg-background py-16 sm:min-h-[60vh] sm:py-24 md:py-32"
    >
      <div
        ref={textRef}
        className="container mx-auto max-w-4xl px-4 text-center sm:px-6"
      >
        <blockquote className="font-display text-xl italic leading-relaxed text-foreground/80 sm:text-2xl md:text-4xl lg:text-5xl">
          "A picture is not just an image,
          <br />
          <span className="text-primary">it's a feeling frozen in time.</span>"
        </blockquote>
      </div>
    </section>
  );
};

export default BrandStory;
