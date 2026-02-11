import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CTASection = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        button,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: button,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, buttonRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-6 text-center">
        <Link to="/gallery">
          <button ref={buttonRef} className="btn-luxury">
            <span>View Gallery</span>
          </button>
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
