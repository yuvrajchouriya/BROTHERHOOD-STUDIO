import {
  Home,
  Image,
  Film,
  CreditCard,
  Users,
  MessageSquare,
  Settings,
  MapPin,
  Briefcase,
  FileDown,
  ChevronDown,
  ShieldCheck,
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

const ADMIN_BASE = "/secure-portal-9273";

// Website Control items
const websiteControlItems = [
  { title: "Home Galleries", url: `${ADMIN_BASE}/home-projects`, icon: Home },
  { title: "Home Films", url: `${ADMIN_BASE}/home-films`, icon: Film },
  { title: "Galleries", url: `${ADMIN_BASE}/galleries`, icon: Image },
  { title: "Films", url: `${ADMIN_BASE}/films`, icon: Film },
  { title: "Services", url: `${ADMIN_BASE}/services`, icon: Briefcase },
  { title: "Plans", url: `${ADMIN_BASE}/plans`, icon: CreditCard },
  { title: "Team", url: `${ADMIN_BASE}/team`, icon: Users },
  { title: "Locations", url: `${ADMIN_BASE}/locations`, icon: MapPin },
  { title: "Enquiries", url: `${ADMIN_BASE}/enquiries`, icon: MessageSquare },
];

// System items
const systemItems = [
  { title: "Security Center", url: `${ADMIN_BASE}/security`, icon: ShieldCheck },
  { title: "Settings", url: `${ADMIN_BASE}/settings`, icon: Settings },
];

const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === '/secure-portal-9273') {
      return location.pathname === '/secure-portal-9273';
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

        {/* Website Control (Main Items) */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {websiteControlItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Divider */}
        <div className="mx-3 h-px bg-gradient-to-r from-transparent via-[hsl(222,30%,25%)] to-transparent" />

        {/* System Items */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
