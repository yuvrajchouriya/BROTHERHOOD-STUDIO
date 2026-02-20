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
  const brotherhoodRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const isMobile = window.innerWidth < 768;

    // ── Scroll parallax (all devices) ────────────────────────────────
    const ctx = gsap.context(() => {
      const bgLayer = bgLayerRef.current;
      const midLayer = midLayerRef.current;
      const content = contentRef.current;

      if (!bgLayer || !midLayer || !content) return;

      gsap.to(bgLayer, { yPercent: isMobile ? 10 : 25, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(midLayer, { yPercent: isMobile ? 15 : 40, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(content, { yPercent: isMobile ? 20 : 60, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true } });

      // Wave reveal on mobile only
      if (isMobile) {
        const brotherhoodEl = brotherhoodRef.current;
        const title = titleRef.current;
        if (brotherhoodEl && title) {
          brotherhoodEl.innerHTML = "BROTHERHOOD"
            .split("")
            .map((ch) => `<span class="wl" style="display:inline-block;opacity:0;transform:translateY(40px)">${ch}</span>`)
            .join("");
          gsap.to(brotherhoodEl.querySelectorAll(".wl"), { y: 0, opacity: 1, duration: 0.55, stagger: 0.05, ease: "power3.out", delay: 0.3 });
        }
      }
    }, sectionRef);

    // ── Float tween (mobile only) — stored as plain variable ─────────
    // IMPORTANT: created OUTSIDE ctx so we can pause/resume freely
    let floatTween: gsap.core.Tween | null = null;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;

    if (isMobile) {
      const title = titleRef.current;
      if (title) {
        floatTween = gsap.to(title, {
          y: 8,
          rotateX: 1.5,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }

    // ── Desktop: mouse parallax ───────────────────────────────────────
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const bgLayer = bgLayerRef.current;
      const content = contentRef.current;
      const title = titleRef.current;
      if (!bgLayer || !content || !title) return;
      try {
        const xPos = (e.clientX / window.innerWidth - 0.5) * 2;
        const yPos = (e.clientY / window.innerHeight - 0.5) * 2;
        gsap.to(title, { rotateY: xPos * 8, rotateX: -yPos * 5, x: xPos * 15, y: yPos * 10, duration: 0.8, ease: "power2.out", overwrite: "auto" });
        gsap.to(content, { x: xPos * 10, y: yPos * 8, duration: 1, ease: "power2.out", overwrite: "auto" });
        gsap.to(bgLayer, { x: -xPos * 20, y: -yPos * 15, duration: 1.2, ease: "power2.out", overwrite: "auto" });
      } catch (err) { console.warn("Mouse error", err); }
    };

    // ── Mobile: deviceorientation tilt ───────────────────────────────
    // gamma = left/right (−90 to 90°)
    // beta  = front/back (0° = flat on table, 90° = held upright)
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const bgLayer = bgLayerRef.current;
      const title = titleRef.current;
      if (!bgLayer || !title) return;
      try {
        const gamma = e.gamma ?? 0;
        const beta = e.beta ?? 0;
        const restingBeta = 75; // typical upright holding angle

        // Deadzone: ignore tiny sensor noise
        const isTilting = Math.abs(gamma) > 3 || Math.abs(beta - restingBeta) > 4;
        if (!isTilting) return;

        // Pause float so it does not fight tilt
        if (floatTween && !floatTween.paused()) floatTween.pause();
        if (resumeTimer) clearTimeout(resumeTimer);

        const moveX = gamma * 2.5;
        const moveY = (beta - restingBeta) * 1.5;

        gsap.to(title, {
          x: moveX,
          y: moveY,
          rotateY: gamma * 0.9,
          rotateX: -(beta - restingBeta) * 0.6,
          duration: 0.4,
          ease: "power2.out",
          overwrite: true,
        });
        gsap.to(bgLayer, {
          x: -moveX * 1.5,
          y: -moveY,
          duration: 0.55,
          ease: "power2.out",
          overwrite: "auto",
        });

        // Resume float 1s after phone goes still
        resumeTimer = setTimeout(() => {
          if (floatTween) floatTween.resume();
        }, 1000);
      } catch (err) { console.warn("Orientation error", err); }
    };

    // Add listeners — orientation on ALL devices (won't fire on desktop)
    window.addEventListener("deviceorientation", handleOrientation, { passive: true });
    if (!isMobile) window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleOrientation);
      if (resumeTimer) clearTimeout(resumeTimer);
      floatTween?.kill();
      ctx.revert();
      if (titleRef.current) gsap.killTweensOf(titleRef.current);
      if (contentRef.current) gsap.killTweensOf(contentRef.current);
      if (bgLayerRef.current) gsap.killTweensOf(bgLayerRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="parallax-container relative h-screen min-h-[600px] w-full overflow-hidden"
      style={{ perspective: "1200px" }}
    >
      {/* Background Layer */}
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

      {/* Mid Layer */}
      <div
        ref={midLayerRef}
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, hsl(var(--background) / 0.4) 50%, hsl(var(--background) / 0.8) 100%)`,
          transformStyle: "preserve-3d",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center, transparent 30%, hsl(var(--background) / 0.7) 100%)` }}
      />

      {/* Bokeh */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/20 blur-xl animate-float"
            style={{ width: `${60 + i * 30}px`, height: `${60 + i * 30}px`, left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.8}s`, animationDuration: `${6 + i}s` }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center sm:px-6"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="relative w-full max-w-[360px] sm:max-w-none" style={{ perspective: "1000px" }}>
          <h1
            ref={titleRef}
            className="hero-3d-title mb-12 font-display text-[2.6rem] font-medium tracking-tight text-foreground sm:mb-6 sm:text-5xl sm:tracking-wider md:text-7xl lg:text-8xl"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* BROTHERHOOD */}
            <span ref={brotherhoodRef} className="relative inline-block">
              BROTHERHOOD{" "}
              <span className="absolute inset-0 text-primary/10 pointer-events-none select-none" style={{ transform: "translateZ(-30px) translateX(3px) translateY(3px)" }} aria-hidden="true">BROTHERHOOD{" "}</span>
              <span className="absolute inset-0 text-primary/5  pointer-events-none select-none" style={{ transform: "translateZ(-60px) translateX(6px) translateY(6px)" }} aria-hidden="true">BROTHERHOOD{" "}</span>
            </span>

            {/* STUDIO */}
            <span className="text-gold-gradient relative inline-block">
              STUDIO
              <span className="absolute inset-0 text-gold/20 blur-sm pointer-events-none select-none" style={{ transform: "translateZ(-20px)" }} aria-hidden="true">STUDIO</span>
            </span>
          </h1>
        </div>

        {/* Wedding • Pre-Wedding • Films */}
        <div className="mb-5 flex flex-wrap items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] text-foreground/70 sm:mb-8 sm:gap-4 sm:text-sm md:tracking-[0.3em] md:text-base">
          <span className="animate-fade-in" style={{ animationDelay: "0.3s" }}>Wedding</span>
          <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
          <span className="animate-fade-in" style={{ animationDelay: "0.5s" }}>Pre-Wedding</span>
          <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
          <span className="animate-fade-in" style={{ animationDelay: "0.7s" }}>Films</span>
        </div>

        {/* Tagline */}
        <p className="max-w-sm font-display text-lg italic text-foreground/60 sm:max-w-md sm:text-lg md:text-xl animate-fade-in" style={{ animationDelay: "0.9s" }}>
          Crafting Timeless Love Stories
        </p>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 sm:bottom-10">
          <div className="flex flex-col items-center gap-2 animate-float">
            <span className="text-xs uppercase tracking-[0.2em] text-foreground/40">Scroll</span>
            <div className="h-12 w-[1px] bg-gradient-to-b from-primary to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
