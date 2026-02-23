import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import ScrollToTop from "@/components/ScrollToTop";
import GlobalGSAPCleaner from "@/components/GlobalGSAPCleaner";
import Index from "./pages/Index";

// Lazy loaded components for better initial performance
const Plans = lazy(() => import("./pages/Plans"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const Gallery = lazy(() => import("./pages/Gallery"));
const GalleryStory = lazy(() => import("./pages/GalleryStory"));
const BookUs = lazy(() => import("./pages/BookUs"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const TeamMemberWork = lazy(() => import("./pages/TeamMemberWork"));
const Films = lazy(() => import("./pages/Films"));
const FilmDetail = lazy(() => import("./pages/FilmDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin Pages (Lazy loaded)
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const HomeProjects = lazy(() => import("./pages/admin/HomeProjects"));
const HomeFilms = lazy(() => import("./pages/admin/HomeFilms"));
const Galleries = lazy(() => import("./pages/admin/Galleries"));
const GalleryPhotos = lazy(() => import("./pages/admin/GalleryPhotos"));
const AdminFilms = lazy(() => import("./pages/admin/Films"));
const AdminPlans = lazy(() => import("./pages/admin/Plans"));
const TeamMembers = lazy(() => import("./pages/admin/TeamMembers"));
const TeamWork = lazy(() => import("./pages/admin/TeamWork"));
const Enquiries = lazy(() => import("./pages/admin/Enquiries"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const Locations = lazy(() => import("./pages/admin/Locations"));
const AdminServices = lazy(() => import("./pages/admin/Services"));
const ServicePhotos = lazy(() => import("./pages/admin/ServicePhotos"));
const ServiceContent = lazy(() => import("./pages/admin/ServiceContent"));
const SecurityDashboard = lazy(() => import("./pages/admin/SecurityDashboard"));

const queryClient = new QueryClient();

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-[hsl(222,47%,5%)]">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[hsl(190,100%,50%)] border-t-transparent shadow-[0_0_15px_rgba(0,212,255,0.4)]"></div>
      <span className="text-[hsl(215,15%,55%)] animate-pulse font-medium tracking-wider">LOADING</span>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <GlobalErrorBoundary>
          <GlobalGSAPCleaner />
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </GlobalErrorBoundary>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
