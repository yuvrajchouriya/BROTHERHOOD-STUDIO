import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Eye, Clock, Target, Activity, Monitor, Smartphone, Tablet, MessageCircle, FileText, Play, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdvancedAreaChart from "@/components/admin/charts/AdvancedAreaChart";
import GlowPieChart from "@/components/admin/charts/GlowPieChart";
import NeonBarChart from "@/components/admin/charts/NeonBarChart";

interface OverviewData {
  totalVisitors: number;
  activeUsers: number;
  totalSessions: number;
  totalPageViews: number;
  avgSessionDuration: number;
  avgScrollDepth: number;
  whatsappClicks: number;
  formSubmits: number;
  filmPlays: number;
  galleryOpens: number;
  totalConversions: number;
  conversionRate: string;
  bounceRate: string;
}

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days'>('7days');
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState<{ deviceBreakdown: { mobile: number; desktop: number; tablet: number } } | null>(null);
  const [pages, setPages] = useState<{ pages: { page_path: string; views: number; avg_time: number }[] } | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data: overviewData } = await supabase.functions.invoke('analytics-aggregate', {
        body: { metric_type: 'overview', date_range: dateRange }
      });
      setOverview(overviewData);

      const { data: visitorsData } = await supabase.functions.invoke('analytics-aggregate', {
        body: { metric_type: 'visitors', date_range: dateRange }
      });
      setVisitors(visitorsData);

      const { data: pagesData } = await supabase.functions.invoke('analytics-aggregate', {
        body: { metric_type: 'pages', date_range: dateRange }
      });
      setPages(pagesData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const deviceData = visitors?.deviceBreakdown ? [
    { name: 'Mobile', value: visitors.deviceBreakdown.mobile },
    { name: 'Desktop', value: visitors.deviceBreakdown.desktop },
    { name: 'Tablet', value: visitors.deviceBreakdown.tablet },
  ].filter(d => d.value > 0) : [];

  const topPagesData = pages?.pages?.slice(0, 5).map(p => ({
    name: p.page_path.length > 15 ? p.page_path.slice(0, 15) + '...' : p.page_path,
    value: p.views
  })) || [];

  // Sample trend data for area chart
  const trendData: { name: string; visitors: number; views: number }[] = [];

  const StatCard = ({ title, value, subValue, icon: Icon, colorClass = "text-[hsl(190,100%,50%)]" }: {
    title: string;
    value: string | number;
    subValue?: string;
    icon: React.ElementType;
    colorClass?: string;
  }) => (
    <Card className="bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)] hover:border-[hsl(190,100%,50%)]/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[hsl(215,15%,55%)]">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClass} drop-shadow-[0_0_6px_rgba(0,212,255,0.6)]`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
          {value}
        </div>
        {subValue && (
          <p className="text-xs text-[hsl(215,15%,55%)]">{subValue}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-[hsl(215,15%,55%)]">Website performance overview</p>
        </div>
        <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
          <TabsList className="bg-[hsl(222,47%,10%)] border border-[hsl(222,30%,18%)]">
            <TabsTrigger value="today" className="data-[state=active]:bg-[hsl(190,100%,50%)]/20 data-[state=active]:text-[hsl(190,100%,50%)]">Today</TabsTrigger>
            <TabsTrigger value="7days" className="data-[state=active]:bg-[hsl(190,100%,50%)]/20 data-[state=active]:text-[hsl(190,100%,50%)]">7 Days</TabsTrigger>
            <TabsTrigger value="30days" className="data-[state=active]:bg-[hsl(190,100%,50%)]/20 data-[state=active]:text-[hsl(190,100%,50%)]">30 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)]">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 rounded bg-[hsl(222,30%,18%)]" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 rounded bg-[hsl(222,30%,18%)]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Top Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title="Total Visitors"
              value={overview?.totalVisitors || 0}
              subValue={`${overview?.activeUsers || 0} active now`}
              icon={Users}
            />
            <StatCard
              title="Page Views"
              value={overview?.totalPageViews || 0}
              subValue={`${overview?.totalSessions || 0} sessions`}
              icon={Eye}
              colorClass="text-[hsl(265,89%,56%)]"
            />
            <StatCard
              title="Avg Session"
              value={formatDuration(overview?.avgSessionDuration || 0)}
              subValue={`${overview?.avgScrollDepth || 0}% avg scroll`}
              icon={Clock}
              colorClass="text-[hsl(152,100%,50%)]"
            />
            <StatCard
              title="Conversions"
              value={overview?.totalConversions || 0}
              subValue={`${overview?.conversionRate || 0}% rate`}
              icon={Target}
              colorClass="text-[hsl(35,100%,50%)]"
            />
            <StatCard
              title="Active Now"
              value={overview?.activeUsers || 0}
              subValue="Live users"
              icon={Activity}
              colorClass="text-[hsl(152,100%,50%)]"
            />
          </div>

          {/* Main Charts Row */}
          <Card className="bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)]">
            <CardHeader>
              <CardTitle className="text-[hsl(215,20%,88%)]">Visitors Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <AdvancedAreaChart data={trendData} dataKey="visitors" secondaryDataKey="views" />
              </div>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Device Breakdown */}
            <Card className="bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)]">
              <CardHeader>
                <CardTitle className="text-[hsl(215,20%,88%)]">Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  {deviceData.length > 0 ? (
                    <GlowPieChart data={deviceData} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[hsl(215,15%,55%)]">
                      No data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Pages */}
            <Card className="bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)]">
              <CardHeader>
                <CardTitle className="text-[hsl(215,20%,88%)]">Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  {topPagesData.length > 0 ? (
                    <NeonBarChart data={topPagesData} dataKey="value" layout="vertical" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[hsl(215,15%,55%)]">
                      No data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Events */}
          <Card className="bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)]">
            <CardHeader>
              <CardTitle className="text-[hsl(215,20%,88%)]">Conversion Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-[hsl(222,47%,8%)] border border-[hsl(152,100%,50%)]/20 p-4 text-center hover:border-[hsl(152,100%,50%)]/50 transition-all hover:shadow-[0_0_15px_rgba(0,255,127,0.2)]">
                  <MessageCircle className="h-5 w-5 mx-auto mb-2 text-[hsl(152,100%,50%)] drop-shadow-[0_0_6px_rgba(0,255,127,0.6)]" />
                  <div className="text-2xl font-bold text-[hsl(152,100%,50%)]">
                    {overview?.whatsappClicks || 0}
                  </div>
                  <p className="text-sm text-[hsl(215,15%,55%)]">WhatsApp Clicks</p>
                </div>
                <div className="rounded-lg bg-[hsl(222,47%,8%)] border border-[hsl(190,100%,50%)]/20 p-4 text-center hover:border-[hsl(190,100%,50%)]/50 transition-all hover:shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                  <FileText className="h-5 w-5 mx-auto mb-2 text-[hsl(190,100%,50%)] drop-shadow-[0_0_6px_rgba(0,212,255,0.6)]" />
                  <div className="text-2xl font-bold text-[hsl(190,100%,50%)]">
                    {overview?.formSubmits || 0}
                  </div>
                  <p className="text-sm text-[hsl(215,15%,55%)]">Form Submits</p>
                </div>
                <div className="rounded-lg bg-[hsl(222,47%,8%)] border border-[hsl(265,89%,56%)]/20 p-4 text-center hover:border-[hsl(265,89%,56%)]/50 transition-all hover:shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                  <Play className="h-5 w-5 mx-auto mb-2 text-[hsl(265,89%,56%)] drop-shadow-[0_0_6px_rgba(124,58,237,0.6)]" />
                  <div className="text-2xl font-bold text-[hsl(265,89%,56%)]">
                    {overview?.filmPlays || 0}
                  </div>
                  <p className="text-sm text-[hsl(215,15%,55%)]">Film Plays</p>
                </div>
                <div className="rounded-lg bg-[hsl(222,47%,8%)] border border-[hsl(35,100%,50%)]/20 p-4 text-center hover:border-[hsl(35,100%,50%)]/50 transition-all hover:shadow-[0_0_15px_rgba(255,165,0,0.2)]">
                  <Image className="h-5 w-5 mx-auto mb-2 text-[hsl(35,100%,50%)] drop-shadow-[0_0_6px_rgba(255,165,0,0.6)]" />
                  <div className="text-2xl font-bold text-[hsl(35,100%,50%)]">
                    {overview?.galleryOpens || 0}
                  </div>
                  <p className="text-sm text-[hsl(215,15%,55%)]">Gallery Opens</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(215,15%,55%)]">Bounce Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[hsl(348,100%,60%)]">{overview?.bounceRate || 0}%</div>
              </CardContent>
            </Card>
            <Card className="bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(215,15%,55%)]">Avg Scroll Depth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[hsl(265,89%,56%)]">{overview?.avgScrollDepth || 0}%</div>
              </CardContent>
            </Card>
            <Card className="bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(215,15%,55%)]">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[hsl(152,100%,50%)]">{overview?.conversionRate || 0}%</div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
