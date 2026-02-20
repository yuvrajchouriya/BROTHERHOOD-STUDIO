import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Plans from "./pages/Plans";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetail from "./pages/ServiceDetail";
import Gallery from "./pages/Gallery";
import GalleryStory from "./pages/GalleryStory";
import BookUs from "./pages/BookUs";
import AboutUs from "./pages/AboutUs";
import TeamMemberWork from "./pages/TeamMemberWork";
import Films from "./pages/Films";
import FilmDetail from "./pages/FilmDetail";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import HomeProjects from "./pages/admin/HomeProjects";
import HomeFilms from "./pages/admin/HomeFilms";
import Galleries from "./pages/admin/Galleries";
import GalleryPhotos from "./pages/admin/GalleryPhotos";
import AdminFilms from "./pages/admin/Films";
import AdminPlans from "./pages/admin/Plans";
import TeamMembers from "./pages/admin/TeamMembers";
import TeamWork from "./pages/admin/TeamWork";
import Enquiries from "./pages/admin/Enquiries";
import Settings from "./pages/admin/Settings";
import Locations from "./pages/admin/Locations";
import AdminServices from "./pages/admin/Services";
import ServicePhotos from "./pages/admin/ServicePhotos";
import ServiceContent from "./pages/admin/ServiceContent";
import SecurityDashboard from "./pages/admin/SecurityDashboard";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <GlobalErrorBoundary>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:serviceId" element={<ServiceDetail />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/gallery/:storyId" element={<GalleryStory />} />
            <Route path="/book" element={<BookUs />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/about/team/:memberId" element={<TeamMemberWork />} />
            <Route path="/films" element={<Films />} />
            <Route path="/films/:filmId" element={<FilmDetail />} />

            {/* Admin Routes — URL hidden from public */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/secure-portal-9273" element={<AdminLayout />}>
              <Route index element={<HomeProjects />} />
              <Route path="home-projects" element={<HomeProjects />} />
              <Route path="home-films" element={<HomeFilms />} />
              <Route path="galleries" element={<Galleries />} />
              <Route path="galleries/:id/photos" element={<GalleryPhotos />} />
              <Route path="films" element={<AdminFilms />} />
              <Route path="plans" element={<AdminPlans />} />
              <Route path="team" element={<TeamMembers />} />
              <Route path="team/:id/work" element={<TeamWork />} />
              <Route path="enquiries" element={<Enquiries />} />
              <Route path="settings" element={<Settings />} />
              <Route path="locations" element={<Locations />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="services/:id/photos" element={<ServicePhotos />} />
              <Route path="services/:id/content" element={<ServiceContent />} />
              <Route path="security" element={<SecurityDashboard />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </GlobalErrorBoundary>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider >
);

export default App;
