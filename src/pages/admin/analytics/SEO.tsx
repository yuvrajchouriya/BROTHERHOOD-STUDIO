import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, TrendingUp, Eye, MousePointerClick, ArrowUp, ArrowDown, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdvancedAreaChart from "@/components/admin/charts/AdvancedAreaChart";
import NeonBarChart from "@/components/admin/charts/NeonBarChart";

interface SEOData {
  overview: {
    totalClicks: number;
    totalImpressions: number;
    avgCTR: number;
    avgPosition: number;
  };
  keywords: Array<{
    keyword: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    page_url: string;
  }>;
  pages: Array<{
    page_url: string;
    clicks: number;
    impressions: number;
    position: number;
    indexed: boolean;
    status: string;
  }>;
  trend: Array<{
    date: string;
    clicks: number;
    impressions: number;
  }>;
}

const SEO = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SEOData>({
    overview: { totalClicks: 0, totalImpressions: 0, avgCTR: 0, avgPosition: 0 },
    keywords: [],
    pages: [],
    trend: [],
  });

  useEffect(() => {
    fetchSEOData();
  }, [dateRange]);

  const fetchSEOData = async () => {
    setLoading(true);
    try {
      // Fetch from seo_cache
      const { data: cacheData } = await supabase
        .from('seo_cache')
        .select('*')
        .eq('date_range', dateRange)
        .single();

      // Fetch keywords
      const { data: keywordsData } = await supabase
        .from('seo_keywords')
        .select('*')
        .eq('date_range', dateRange)
        .order('clicks', { ascending: false })
        .limit(20);

      // Fetch pages
      const { data: pagesData } = await supabase
        .from('seo_pages')
        .select('*')
        .order('clicks', { ascending: false })
        .limit(20);

      // Use real data if available
      if (cacheData?.data && typeof cacheData.data === 'object' && 'overview' in cacheData.data) {
        setData(cacheData.data as unknown as SEOData);
      } else {
        // No data available - set empty state
        setData({
          overview: {
            totalClicks: 0,
            totalImpressions: 0,
            avgCTR: 0,
            avgPosition: 0,
          },
          keywords: keywordsData?.map(k => ({
            keyword: k.keyword,
            clicks: k.clicks || 0,
            impressions: k.impressions || 0,
            ctr: Number(k.ctr) || 0,
            position: Number(k.avg_position) || 0,
            page_url: k.page_url || '',
          })) || [],
          pages: pagesData?.map(p => ({
            page_url: p.page_url,
            clicks: p.clicks || 0,
            impressions: p.impressions || 0,
            position: Number(p.avg_position) || 0,
            indexed: p.indexed || false,
            status: p.status || 'unknown',
          })) || [],
          trend: [],
        });
      }
    } catch (error) {
      console.error('Error fetching SEO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-[hsl(152,100%,50%)]" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-[hsl(348,100%,60%)]" />;
      default:
        return <AlertCircle className="h-4 w-4 text-[hsl(35,100%,50%)]" />;
    }
  };

  const getPositionBadge = (position: number) => {
    if (position <= 3) return <Badge className="admin-badge-success">Top 3</Badge>;
    if (position <= 10) return <Badge className="admin-badge-success">Page 1</Badge>;
    if (position <= 20) return <Badge className="admin-badge-warning">Page 2</Badge>;
    return <Badge className="admin-badge-error">Low</Badge>;
  };

  const indexedPages = data.pages.filter(p => p.indexed).length;
  const totalPages = data.pages.length;
  const indexedPercent = totalPages > 0 ? (indexedPages / totalPages) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
            SEO & Google Search Console
          </h1>
          <p className="text-[hsl(215,15%,55%)]">Monitor your search performance and rankings</p>
        </div>
        <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
          <TabsList className="bg-[hsl(222,47%,10%)] border border-[hsl(222,30%,25%)]">
            <TabsTrigger value="7d" className="data-[state=active]:bg-[hsl(190,100%,50%)]/20 data-[state=active]:text-[hsl(190,100%,50%)]">7 Days</TabsTrigger>
            <TabsTrigger value="30d" className="data-[state=active]:bg-[hsl(190,100%,50%)]/20 data-[state=active]:text-[hsl(190,100%,50%)]">30 Days</TabsTrigger>
            <TabsTrigger value="90d" className="data-[state=active]:bg-[hsl(190,100%,50%)]/20 data-[state=active]:text-[hsl(190,100%,50%)]">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)] animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 rounded bg-[hsl(222,30%,25%)]" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 rounded bg-[hsl(222,30%,25%)]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)] admin-glow-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(215,15%,55%)]">Total Clicks</CardTitle>
                <MousePointerClick className="h-4 w-4 text-[hsl(190,100%,50%)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[hsl(190,100%,50%)]" style={{ textShadow: '0 0 15px rgba(0, 212, 255, 0.4)' }}>
                  {data.overview.totalClicks.toLocaleString()}
                </div>
                <p className="text-xs text-[hsl(215,15%,55%)] flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-[hsl(152,100%,50%)]" /> +12% from last period
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)] admin-glow-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(215,15%,55%)]">Impressions</CardTitle>
                <Eye className="h-4 w-4 text-[hsl(265,89%,56%)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[hsl(265,89%,56%)]" style={{ textShadow: '0 0 15px rgba(124, 58, 237, 0.4)' }}>
                  {data.overview.totalImpressions.toLocaleString()}
                </div>
                <p className="text-xs text-[hsl(215,15%,55%)] flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-[hsl(152,100%,50%)]" /> +8% from last period
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)] admin-glow-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(215,15%,55%)]">Avg CTR</CardTitle>
                <TrendingUp className="h-4 w-4 text-[hsl(152,100%,50%)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[hsl(152,100%,50%)]" style={{ textShadow: '0 0 15px rgba(0, 255, 136, 0.4)' }}>
                  {data.overview.avgCTR}%
                </div>
                <p className="text-xs text-[hsl(215,15%,55%)] flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3 text-[hsl(152,100%,50%)]" /> +0.3% from last period
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)] admin-glow-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(215,15%,55%)]">Avg Position</CardTitle>
                <Search className="h-4 w-4 text-[hsl(35,100%,50%)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[hsl(35,100%,50%)]" style={{ textShadow: '0 0 15px rgba(255, 170, 0, 0.4)' }}>
                  {data.overview.avgPosition}
                </div>
                <p className="text-xs text-[hsl(215,15%,55%)] flex items-center gap-1 mt-1">
                  <ArrowDown className="h-3 w-3 text-[hsl(152,100%,50%)]" /> -1.2 (improved)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trend Chart */}
          <Card className="bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)]">
            <CardHeader>
              <CardTitle className="text-[hsl(215,20%,88%)]">Clicks & Impressions Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <AdvancedAreaChart
                data={data.trend}
                dataKey="clicks"
                secondaryDataKey="impressions"
                xAxisKey="date"
                height={250}
                color="#00d4ff"
                secondaryColor="#7c3aed"
              />
            </CardContent>
          </Card>

          {/* Keywords & Pages */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top Keywords */}
            <Card className="bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)]">
              <CardHeader>
                <CardTitle className="text-[hsl(215,20%,88%)]">Top Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[hsl(222,30%,18%)]">
                      <TableHead className="text-[hsl(215,15%,55%)]">Keyword</TableHead>
                      <TableHead className="text-[hsl(215,15%,55%)] text-right">Clicks</TableHead>
                      <TableHead className="text-[hsl(215,15%,55%)] text-right">CTR</TableHead>
                      <TableHead className="text-[hsl(215,15%,55%)] text-right">Pos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.keywords.slice(0, 5).map((kw, index) => (
                      <TableRow key={index} className="border-[hsl(222,30%,18%)] hover:bg-[hsl(222,47%,12%)]">
                        <TableCell className="text-[hsl(215,20%,88%)] font-medium max-w-[200px] truncate">
                          {kw.keyword}
                        </TableCell>
                        <TableCell className="text-[hsl(190,100%,50%)] text-right">{kw.clicks}</TableCell>
                        <TableCell className="text-[hsl(152,100%,50%)] text-right">{kw.ctr}%</TableCell>
                        <TableCell className="text-right">
                          {getPositionBadge(kw.position)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Page Performance */}
            <Card className="bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)]">
              <CardHeader>
                <CardTitle className="text-[hsl(215,20%,88%)]">Page Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <NeonBarChart
                  data={data.pages.slice(0, 5).map(p => ({
                    name: p.page_url.length > 15 ? p.page_url.slice(0, 15) + '...' : p.page_url,
                    clicks: p.clicks,
                  }))}
                  dataKey="clicks"
                  height={200}
                  layout="vertical"
                  colorByValue
                />
              </CardContent>
            </Card>
          </div>

          {/* Indexing Status */}
          <Card className="bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)]">
            <CardHeader>
              <CardTitle className="text-[hsl(215,20%,88%)] flex items-center justify-between">
                <span>Indexing Status</span>
                <span className="text-sm font-normal text-[hsl(215,15%,55%)]">
                  {indexedPages} of {totalPages} pages indexed
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(215,15%,55%)]">Indexed Pages</span>
                  <span className="text-[hsl(152,100%,50%)]">{indexedPercent.toFixed(0)}%</span>
                </div>
                <div className="h-2 rounded-full bg-[hsl(222,30%,15%)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${indexedPercent}%`,
                      background: 'linear-gradient(90deg, #00d4ff 0%, #00ff88 100%)',
                      boxShadow: '0 0 15px rgba(0, 255, 136, 0.4)',
                    }}
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="border-[hsl(222,30%,18%)]">
                    <TableHead className="text-[hsl(215,15%,55%)]">URL</TableHead>
                    <TableHead className="text-[hsl(215,15%,55%)]">Status</TableHead>
                    <TableHead className="text-[hsl(215,15%,55%)] text-right">Clicks</TableHead>
                    <TableHead className="text-[hsl(215,15%,55%)] text-right">Position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.pages.map((page, index) => (
                    <TableRow key={index} className="border-[hsl(222,30%,18%)] hover:bg-[hsl(222,47%,12%)]">
                      <TableCell className="text-[hsl(215,20%,88%)]">{page.page_url}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(page.status)}
                          <span className="text-[hsl(215,15%,55%)] capitalize">{page.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[hsl(190,100%,50%)] text-right">{page.clicks}</TableCell>
                      <TableCell className="text-right">{page.position.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-[hsl(222,47%,10%)] border-[hsl(190,100%,50%)]/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Search className="h-8 w-8 text-[hsl(190,100%,50%)]" />
                <div>
                  <h3 className="font-semibold text-[hsl(190,100%,50%)]">Connect Google Search Console</h3>
                  <p className="text-sm text-[hsl(215,15%,55%)] mt-1">
                    To get real SEO data, connect your Google Search Console account. This will show actual impressions,
                    clicks, and keyword rankings from Google search results.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SEO;
