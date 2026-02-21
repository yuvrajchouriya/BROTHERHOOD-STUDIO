const FinalImage = () => {
  return (
    <section className="relative h-[50vh] w-full overflow-hidden sm:h-[70vh]">
      <div
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
