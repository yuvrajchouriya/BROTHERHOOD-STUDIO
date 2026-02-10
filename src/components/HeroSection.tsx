import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const midLayerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bgLayer = bgLayerRef.current;
    const midLayer = midLayerRef.current;
    const content = contentRef.current;
    const title = titleRef.current;

    if (!section || !bgLayer || !midLayer || !content || !title) return;

    const isMobile = window.innerWidth < 768;

    // Multi-layer parallax - different speeds create depth
    gsap.to(bgLayer, {
      yPercent: isMobile ? 10 : 25,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(midLayer, {
      yPercent: isMobile ? 15 : 40,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.to(content, {
      yPercent: isMobile ? 20 : 60,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // 3D Mouse tilt effect on title - Desktop
    if (!isMobile) {
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const xPos = (clientX / window.innerWidth - 0.5) * 2;
        const yPos = (clientY / window.innerHeight - 0.5) * 2;

        // 3D tilt on title
        gsap.to(title, {
          rotateY: xPos * 8,
          rotateX: -yPos * 5,
          x: xPos * 15,
          y: yPos * 10,
          duration: 0.8,
          ease: "power2.out",
        });

        // Subtle movement on content
        gsap.to(content, {
          x: xPos * 10,
          y: yPos * 8,
          duration: 1,
          ease: "power2.out",
        });

        // Background subtle shift
        gsap.to(bgLayer, {
          x: -xPos * 20,
          y: -yPos * 15,
          duration: 1.2,
          ease: "power2.out",
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    } else {
      // Mobile: Shake Effect using Device Motion
      // Initial gentle float (breathing)
      const floatAnim = gsap.to(title, {
        y: 10,
        rotateX: 2,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Handle Device Motion
      const handleMotion = (e: DeviceMotionEvent) => {
        if (!e.accelerationIncludingGravity) return;

        const { x, y } = e.accelerationIncludingGravity;
        if (x === null || y === null) return;

        // Multiply for effect intensity
        // x typically ranges -10 to 10 approx (holding portrait)
        const moveX = x * 2;
        const moveY = y * 2;

        gsap.to(title, {
          x: moveX,
          y: moveY, // this might conflict with float, but user action overrides breathing momentarily
          rotateY: moveX * 0.5,
          rotateX: -moveY * 0.5,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto", // allow overwriting the float animation temporarily
        });

        // Also move background slightly for parallax
        gsap.to(bgLayer, {
          x: -moveX * 1.5,
          y: -moveY * 1.5,
          duration: 0.8,
          ease: "power2.out",
        });
      };

      // Request permission for iOS 13+ if needed (must be user triggered usually, but we try)
      if (
        typeof DeviceMotionEvent !== "undefined" &&
        (DeviceMotionEvent as any).requestPermission
      ) {
        // iOS 13+ requires permission, usually on click. 
        // We can't auto-trigger it here without user interaction.
        // So we just stick to the breathing animation fallback for now until user interacts elsewhere 
        // OR we just add the listener and hope it was already granted.
        // For now, let's just try-add it.
      } else {
        window.addEventListener("devicemotion", handleMotion);
      }

      return () => {
        window.removeEventListener("devicemotion", handleMotion);
        floatAnim.kill();
      };
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="parallax-container relative h-screen min-h-[600px] w-full overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      {/* Background Layer - Slowest */}
      <div
        ref={bgLayerRef}
        className="absolute inset-0 -z-20 scale-125"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transformStyle: "preserve-3d",
        }}
      />

      {/* Mid Layer - Gradient overlay with depth */}
      <div
        ref={midLayerRef}
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, hsl(var(--background) / 0.4) 50%, hsl(var(--background) / 0.8) 100%)`,
          transformStyle: "preserve-3d",
        }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, hsl(var(--background) / 0.7) 100%)`,
        }}
      />

      {/* Animated particles/bokeh effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/20 blur-xl animate-float"
            style={{
              width: `${60 + i * 30}px`,
              height: `${60 + i * 30}px`,
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${6 + i}s`,
            }}
          />
        ))}
      </div>

      {/* Content Layer - Fastest (closest to viewer) */}
      <div
        ref={contentRef}
        className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center sm:px-6"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* 3D Title with depth layers */}
        <div className="relative" style={{ perspective: "1000px" }}>
          <h1
            ref={titleRef}
            className="hero-3d-title mb-4 font-display text-3xl font-medium tracking-wider text-foreground sm:mb-6 sm:text-5xl md:text-7xl lg:text-8xl"
            style={{ transformStyle: "preserve-3d" }}
          >
            <span className="relative inline-block">
              BROTHERHOOD{" "}
              {/* 3D depth shadow layers */}
              <span
                className="absolute inset-0 text-primary/10 pointer-events-none select-none"
                style={{ transform: "translateZ(-30px) translateX(3px) translateY(3px)" }}
                aria-hidden="true"
              >
                BROTHERHOOD{" "}
              </span>
              <span
                className="absolute inset-0 text-primary/5 pointer-events-none select-none"
                style={{ transform: "translateZ(-60px) translateX(6px) translateY(6px)" }}
                aria-hidden="true"
              >
                BROTHERHOOD{" "}
              </span>
            </span>
            <span className="text-gold-gradient relative inline-block">
              STUDIO
              {/* Gold shadow layers */}
              <span
                className="absolute inset-0 text-gold/20 blur-sm pointer-events-none select-none"
                style={{ transform: "translateZ(-20px)" }}
                aria-hidden="true"
              >
                STUDIO
              </span>
            </span>
          </h1>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/70 sm:mb-8 sm:gap-4 sm:text-sm md:tracking-[0.3em] md:text-base">
          <span className="animate-fade-in" style={{ animationDelay: "0.3s" }}>Wedding</span>
          <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
          <span className="animate-fade-in" style={{ animationDelay: "0.5s" }}>Pre-Wedding</span>
          <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
          <span className="animate-fade-in" style={{ animationDelay: "0.7s" }}>Films</span>
        </div>

        <p className="max-w-xs font-display text-base italic text-foreground/60 sm:max-w-md sm:text-lg md:text-xl animate-fade-in" style={{ animationDelay: "0.9s" }}>
          Crafting Timeless Love Stories
        </p>

        {/* Scroll Indicator with 3D effect */}
        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:bottom-10 sm:block">
          <div className="flex flex-col items-center gap-2 animate-float">
            <span className="text-xs uppercase tracking-[0.2em] text-foreground/40">
              Scroll
            </span>
            <div className="h-12 w-[1px] bg-gradient-to-b from-primary to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
