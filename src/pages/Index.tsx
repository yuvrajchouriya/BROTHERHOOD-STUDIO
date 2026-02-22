import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedGallery from "@/components/FeaturedGallery";
import BrandStory from "@/components/BrandStory";
import CTASection from "@/components/CTASection";
import WeddingFilms from "@/components/WeddingFilms";
import Services from "@/components/Services";
import Recognition from "@/components/Recognition";
import FinalImage from "@/components/FinalImage";
import Locations from "@/components/Locations";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import CopyrightFooter from "@/components/CopyrightFooter";
import BackgroundPreloader from "@/components/BackgroundPreloader";


const Index = () => {
  return (
    <main className="grain min-h-screen overflow-x-hidden bg-background">
      <BackgroundPreloader />
      <Header />
      <HeroSection />
      <FeaturedGallery />
      <BrandStory />
      <CTASection />
      <WeddingFilms />
      <Services />
      <Recognition />
      <FinalImage />
      <Locations />
      <CopyrightFooter />
      <FloatingWhatsApp />
    </main>
  );
};

export default Index;
