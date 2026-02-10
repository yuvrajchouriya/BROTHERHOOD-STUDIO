import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { TrackingProvider } from "@/components/TrackingProvider";
import RumTracker from "@/components/RumTracker";
import GoogleServices from "@/components/GoogleServices";
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
import Dashboard from "./pages/admin/Dashboard";
import HomeProjects from "./pages/admin/HomeProjects";
import HomeFilms from "./pages/admin/HomeFilms";
import DebugHomeFilm from "./pages/admin/DebugHomeFilm";
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
import Reports from "./pages/admin/Reports";
import AdminLogs from "./pages/admin/AdminLogs";
import SpeedMonitoring from "./pages/admin/speed/SpeedMonitoring";

// Analytics Pages
import AnalyticsDashboard from "./pages/admin/analytics/Dashboard";
import AnalyticsVisitors from "./pages/admin/analytics/Visitors";
import AnalyticsEngagement from "./pages/admin/analytics/Engagement";
import AnalyticsPages from "./pages/admin/analytics/Pages";
import AnalyticsTraffic from "./pages/admin/analytics/TrafficSources";
import AnalyticsGeo from "./pages/admin/analytics/GeoLocation";
import AnalyticsRealTime from "./pages/admin/analytics/RealTime";
import AnalyticsConversions from "./pages/admin/analytics/Conversions";
import AnalyticsEvents from "./pages/admin/analytics/Events";
import AnalyticsPerformance from "./pages/admin/analytics/Performance";
import AnalyticsSEO from "./pages/admin/analytics/SEO";
import AnalyticsDecisions from "./pages/admin/analytics/Decisions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GoogleServices />
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        {/* RUM Tracker for Speed Monitoring */}
        <RumTracker />
        <TrackingProvider>
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

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AnalyticsDashboard />} />
              <Route path="home-projects" element={<HomeProjects />} />
              <Route path="home-films" element={<HomeFilms />} />
              <Route path="debug-home-films" element={<DebugHomeFilm />} />
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
              <Route path="reports" element={<Reports />} />
              <Route path="logs" element={<AdminLogs />} />
              <Route path="speed" element={<SpeedMonitoring />} />

              {/* Analytics Routes */}
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="analytics/visitors" element={<AnalyticsVisitors />} />
              <Route path="analytics/engagement" element={<AnalyticsEngagement />} />
              <Route path="analytics/pages" element={<AnalyticsPages />} />
              <Route path="analytics/traffic" element={<AnalyticsTraffic />} />
              <Route path="analytics/geo" element={<AnalyticsGeo />} />
              <Route path="analytics/realtime" element={<AnalyticsRealTime />} />
              <Route path="analytics/conversions" element={<AnalyticsConversions />} />
              <Route path="analytics/events" element={<AnalyticsEvents />} />
              <Route path="analytics/performance" element={<AnalyticsPerformance />} />
              <Route path="analytics/seo" element={<AnalyticsSEO />} />
              <Route path="analytics/decisions" element={<AnalyticsDecisions />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TrackingProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
