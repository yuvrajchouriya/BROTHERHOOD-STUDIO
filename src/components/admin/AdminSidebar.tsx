import {
  LayoutDashboard,
  Home,
  Image,
  Film,
  CreditCard,
  Users,
  MessageSquare,
  Settings,
  MapPin,
  Briefcase,
  BarChart3,
  UserCheck,
  MousePointerClick,
  FileText,
  Globe,
  MapPinned,
  Activity,
  Target,
  Zap,
  Gauge,
  Lightbulb,
  FileDown,
  ScrollText,
  ChevronDown,
  Search
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Website Control items (FIRST as per plan - moved up)
const websiteControlItems = [
  { title: "Home Galleries", url: "/admin/home-projects", icon: Home },
  { title: "Home Films", url: "/admin/home-films", icon: Film },
  { title: "Galleries", url: "/admin/galleries", icon: Image },
  { title: "Films", url: "/admin/films", icon: Film },
  { title: "Services", url: "/admin/services", icon: Briefcase },
  { title: "Plans", url: "/admin/plans", icon: CreditCard },
  { title: "Team", url: "/admin/team", icon: Users },
  { title: "Locations", url: "/admin/locations", icon: MapPin },
  { title: "Enquiries", url: "/admin/enquiries", icon: MessageSquare },
];

// Analytics & Growth items (SECOND as per plan)
const analyticsItems = [
  { title: "Visitors", url: "/admin/analytics/visitors", icon: UserCheck },
  { title: "Engagement", url: "/admin/analytics/engagement", icon: MousePointerClick },
  { title: "Pages", url: "/admin/analytics/pages", icon: FileText },
  { title: "Traffic Sources", url: "/admin/analytics/traffic", icon: Globe },
  { title: "Geo Location", url: "/admin/analytics/geo", icon: MapPinned },
  { title: "Real-Time", url: "/admin/analytics/realtime", icon: Activity },
  { title: "Conversions", url: "/admin/analytics/conversions", icon: Target },
  { title: "Events", url: "/admin/analytics/events", icon: Zap },
  { title: "Performance", url: "/admin/analytics/performance", icon: Gauge },
  { title: "SEO (GSC)", url: "/admin/analytics/seo", icon: Search },
  { title: "Decision & Growth", url: "/admin/analytics/decisions", icon: Lightbulb },
];

// System items (THIRD as per plan)
const systemItems = [
  { title: "Reports", url: "/admin/reports", icon: FileDown },
  { title: "Admin Logs", url: "/admin/logs", icon: ScrollText },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const [analyticsOpen, setAnalyticsOpen] = useState(
    location.pathname.includes('/admin/analytics')
  );
  const [websiteOpen, setWebsiteOpen] = useState(
    !location.pathname.includes('/admin/analytics') &&
    !location.pathname.includes('/admin/reports') &&
    !location.pathname.includes('/admin/logs') &&
    !location.pathname.includes('/admin/settings') &&
    location.pathname !== '/admin'
  );
  const [systemOpen, setSystemOpen] = useState(
    location.pathname.includes('/admin/reports') ||
    location.pathname.includes('/admin/logs') ||
    location.pathname.includes('/admin/settings')
  );

  const isActive = (url: string) => {
    if (url === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname === url || location.pathname.startsWith(url + '/');
  };

  const renderMenuItem = (item: { title: string; url: string; icon: React.ComponentType<{ className?: string }> }) => {
    const active = isActive(item.url);
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.url}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200",
              active
                ? "bg-[hsl(190,100%,50%)]/15 text-[hsl(190,100%,50%)] border-l-2 border-[hsl(190,100%,50%)] shadow-[0_0_15px_rgba(0,212,255,0.2)]"
                : "text-[hsl(215,15%,55%)] hover:bg-[hsl(190,100%,50%)]/10 hover:text-[hsl(215,20%,88%)] border-l-2 border-transparent"
            )}
          >
            <item.icon className={cn("h-4 w-4", active && "drop-shadow-[0_0_6px_rgba(0,212,255,0.8)]")} />
            {!collapsed && <span className="text-sm">{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const SectionHeader = ({
    title,
    isOpen,
    onToggle,
    gradient = false
  }: {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    gradient?: boolean;
  }) => (
    <CollapsibleTrigger
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
        gradient
          ? "bg-gradient-to-r from-[hsl(190,100%,50%)]/10 to-[hsl(265,89%,56%)]/10 text-[hsl(190,100%,50%)]"
          : "text-[hsl(215,15%,45%)] hover:text-[hsl(215,20%,88%)]"
      )}
    >
      {title}
      <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
    </CollapsibleTrigger>
  );

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-[hsl(222,30%,18%)] bg-gradient-to-b from-[hsl(222,47%,5%)] to-[hsl(222,47%,8%)]"
    >
      <SidebarContent className="overflow-y-auto scrollbar-thin">
        {/* Header / Logo */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-4">
            {!collapsed ? (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[hsl(190,100%,50%)] to-[hsl(265,89%,56%)] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BS</span>
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
                  Admin
                </span>
              </div>
            ) : (
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[hsl(190,100%,50%)] to-[hsl(265,89%,56%)] flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-sm">BS</span>
              </div>
            )}
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* Analytics Dashboard (Main Dashboard) */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/admin"
                    end
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200",
                      location.pathname === '/admin'
                        ? "bg-[hsl(190,100%,50%)]/15 text-[hsl(190,100%,50%)] border-l-2 border-[hsl(190,100%,50%)] shadow-[0_0_15px_rgba(0,212,255,0.2)]"
                        : "text-[hsl(215,15%,55%)] hover:bg-[hsl(190,100%,50%)]/10 hover:text-[hsl(215,20%,88%)] border-l-2 border-transparent"
                    )}
                  >
                    <BarChart3 className={cn("h-4 w-4", location.pathname === '/admin' && "drop-shadow-[0_0_6px_rgba(0,212,255,0.8)]")} />
                    {!collapsed && <span className="text-sm font-medium">Analytics Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Divider */}
        <div className="mx-3 h-px bg-gradient-to-r from-transparent via-[hsl(222,30%,25%)] to-transparent" />

        {/* Analytics & Growth Section (1st as per plan) */}
        <SidebarGroup>
          {!collapsed ? (
            <Collapsible open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
              <SectionHeader
                title="Analytics & Growth"
                isOpen={analyticsOpen}
                onToggle={() => setAnalyticsOpen(!analyticsOpen)}
                gradient
              />
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {analyticsItems.map(renderMenuItem)}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarGroupContent>
              <SidebarMenu>
                {analyticsItems.slice(0, 1).map(renderMenuItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        {/* Divider */}
        <div className="mx-3 h-px bg-gradient-to-r from-transparent via-[hsl(222,30%,25%)] to-transparent" />

        {/* Website Control Section (2nd as per plan) */}
        <SidebarGroup>
          {!collapsed ? (
            <Collapsible open={websiteOpen} onOpenChange={setWebsiteOpen}>
              <SectionHeader
                title="Website Control"
                isOpen={websiteOpen}
                onToggle={() => setWebsiteOpen(!websiteOpen)}
              />
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {websiteControlItems.map(renderMenuItem)}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarGroupContent>
              <SidebarMenu>
                {websiteControlItems.slice(0, 1).map(renderMenuItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        {/* Divider */}
        <div className="mx-3 h-px bg-gradient-to-r from-transparent via-[hsl(222,30%,25%)] to-transparent" />

        {/* System Section (3rd as per plan) */}
        <SidebarGroup>
          {!collapsed ? (
            <Collapsible open={systemOpen} onOpenChange={setSystemOpen}>
              <SectionHeader
                title="System"
                isOpen={systemOpen}
                onToggle={() => setSystemOpen(!systemOpen)}
              />
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {systemItems.map(renderMenuItem)}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarGroupContent>
              <SidebarMenu>
                {systemItems.slice(-1).map(renderMenuItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
