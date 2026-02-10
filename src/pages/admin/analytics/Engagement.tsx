import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, MousePointerClick, ArrowDown, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import NeonBarChart from "@/components/admin/charts/NeonBarChart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface EngagementData {
  avgSessionDuration: number;
  avgScrollDepth: number;
  bounceRate: string;
  pages: Array<{
    page_path: string;
    views: number;
    avg_time: number;
    avg_scroll: number;
  }>;
}

const Engagement = () => {
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d'>('7d');
  const [overview, setOverview] = useState<{ avgSessionDuration: number; avgScrollDepth: number; bounceRate: string } | null>(null);
  const [pages, setPages] = useState<EngagementData['pages']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: overviewData } = await supabase.functions.invoke('analytics-aggregate', {
        body: { metric_type: 'overview', date_range: dateRange }
      });
      setOverview(overviewData);

      const { data: pagesData } = await supabase.functions.invoke('analytics-aggregate', {
        body: { metric_type: 'pages', date_range: dateRange }
      });
      setPages(pagesData?.pages || []);
    } catch (error) {
      console.error('Error fetching engagement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const avgTimePerPage = pages.length > 0
    ? Math.round(pages.reduce((sum, p) => sum + p.avg_time, 0) / pages.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Engagement</h1>
          <p className="text-muted-foreground">User engagement metrics</p>
        </div>
        <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(overview?.avgSessionDuration || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Time per Page</CardTitle>
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(avgTimePerPage)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Scroll Depth</CardTitle>
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.avgScrollDepth || 0}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview?.bounceRate || 0}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Time on Page by Page</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {pages.length > 0 ? (
                    <NeonBarChart
                      data={pages.slice(0, 8)}
                      dataKey="avg_time"
                      xAxisKey="page_path"
                      height={300}
                      layout="vertical"
                      barSize={20}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scroll Depth by Page</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {pages.length > 0 ? (
                    <NeonBarChart
                      data={pages.slice(0, 8)}
                      dataKey="avg_scroll"
                      xAxisKey="page_path"
                      height={300}
                      layout="vertical"
                      barSize={20}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pages Table */}
          <Card>
            <CardHeader>
              <CardTitle>Page Engagement Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Avg Time</TableHead>
                    <TableHead className="text-right">Scroll %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.page_path}>
                      <TableCell className="font-medium">{page.page_path}</TableCell>
                      <TableCell className="text-right">{page.views}</TableCell>
                      <TableCell className="text-right">{formatDuration(page.avg_time)}</TableCell>
                      <TableCell className="text-right">{page.avg_scroll}%</TableCell>
                    </TableRow>
                  )) || (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Engagement;
