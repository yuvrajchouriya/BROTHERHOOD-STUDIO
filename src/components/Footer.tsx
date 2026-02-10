const Footer = () => {
  return (
    <footer className="border-t border-border/20 bg-background py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:gap-6 md:flex-row md:text-left">
          {/* Brand Name */}
          <a href="/" className="flex items-center">
            <span className="font-display text-lg font-semibold tracking-wide text-foreground sm:text-xl">
              Brotherhood Studio
            </span>
          </a>

          {/* Copyright & Developer Credit */}
          <div className="order-3 text-center md:order-2">
            <p className="text-xs text-muted-foreground sm:text-sm">
              © {new Date().getFullYear()} Brotherhood Studio. All rights reserved.
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground/60 sm:text-xs">
              Website by <span className="text-primary/80">Yuvraj Kirar</span>
            </p>
          </div>

          {/* Social Links Placeholder */}
          <div className="order-2 flex gap-4 sm:gap-6 md:order-3">
            <a
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
              aria-label="Instagram"
            >
              Instagram
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
              aria-label="YouTube"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
