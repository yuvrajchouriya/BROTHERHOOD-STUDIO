const CopyrightFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-foreground/10 bg-background py-6">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-xs text-foreground/50 sm:text-sm">
            © {currentYear} Brotherhood Studio. All rights reserved.
          </p>
          <p className="text-xs text-foreground/30">
            Crafting Timeless Stories Since 2020
          </p>
        </div>
      </div>
    </footer>
  );
};

export default CopyrightFooter;
