import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FinalImage = () => {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    gsap.fromTo(
      image,
      { scale: 1 },
      {
        scale: 1.1,
        ease: "none",
        scrollTrigger: {
          trigger: image,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  }, []);

  return (
    <section className="relative h-[50vh] w-full overflow-hidden sm:h-[70vh]">
      <div
        ref={imageRef}
        className="h-full w-full"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1529636798458-92182e662485?q=80&w=2069')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Gradient overlay for smooth transition */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
    </section>
  );
};

export default FinalImage;
