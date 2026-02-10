import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Image, 
  Film, 
  CreditCard, 
  Users, 
  MessageSquare, 
  Home,
  Loader2,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [galleries, films, plans, teamMembers, enquiries, homeProjects] = await Promise.all([
        supabase.from('galleries').select('id', { count: 'exact' }),
        supabase.from('films').select('id', { count: 'exact' }),
        supabase.from('plans').select('id', { count: 'exact' }),
        supabase.from('team_members').select('id', { count: 'exact' }),
        supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('home_projects').select('id', { count: 'exact' }),
      ]);

      const newEnquiriesCount = await supabase
        .from('enquiries')
        .select('id', { count: 'exact' })
        .eq('status', 'New');

      return {
        galleriesCount: galleries.count || 0,
        filmsCount: films.count || 0,
        plansCount: plans.count || 0,
        teamCount: teamMembers.count || 0,
        homeProjectsCount: homeProjects.count || 0,
        newEnquiriesCount: newEnquiriesCount.count || 0,
        recentEnquiries: enquiries.data || [],
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { title: "Home Projects", value: stats?.homeProjectsCount, icon: Home, href: "/admin/home-projects" },
    { title: "Galleries", value: stats?.galleriesCount, icon: Image, href: "/admin/galleries" },
    { title: "Films", value: stats?.filmsCount, icon: Film, href: "/admin/films" },
    { title: "Plans", value: stats?.plansCount, icon: CreditCard, href: "/admin/plans" },
    { title: "Team Members", value: stats?.teamCount, icon: Users, href: "/admin/team" },
    { title: "New Enquiries", value: stats?.newEnquiriesCount, icon: MessageSquare, href: "/admin/enquiries", highlight: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Brotherhood Studio Admin Panel</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.href}>
            <Card className={`hover:shadow-md transition-shadow cursor-pointer ${stat.highlight && stats?.newEnquiriesCount ? 'border-primary' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.highlight && stats?.newEnquiriesCount ? 'text-primary' : 'text-muted-foreground'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Enquiries
          </CardTitle>
          <CardDescription>Latest booking requests</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentEnquiries.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No enquiries yet</p>
          ) : (
            <div className="space-y-4">
              {stats?.recentEnquiries.map((enquiry: any) => (
                <div key={enquiry.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{enquiry.name}</p>
                    <p className="text-sm text-muted-foreground">{enquiry.phone} • {enquiry.event_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(enquiry.created_at), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={enquiry.status === 'New' ? 'default' : enquiry.status === 'Contacted' ? 'secondary' : 'outline'}>
                      {enquiry.status}
                    </Badge>
                    <Link to="/admin/enquiries">
                      <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
