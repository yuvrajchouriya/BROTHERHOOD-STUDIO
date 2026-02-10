import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Gauge, Clock, Smartphone, Monitor, RefreshCw, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import NeonBarChart from "@/components/admin/charts/NeonBarChart";

interface PerformanceData {
  avgLoadTime: number;
  mobileScore: number;
  desktopScore: number;
  slowPagesCount: number;
  pages: Array<{
    page_url: string;
    load_time: number;
    score: number;
    lcp: number;
    cls: number;
    inp: number;
    device_type: string;
    status: string;
  }>;
}

const Performance = () => {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: pagesData, error } = await supabase
        .from('performance_pages')
        .select('*')
        .order('last_checked', { ascending: false });

      if (error) throw error;

      const pages = pagesData || [];
      const avgLoadTime = pages.length > 0
        ? pages.reduce((sum, p) => sum + (p.load_time || 0), 0) / pages.length
        : 0;

      const mobilePages = pages.filter(p => p.device_type === 'mobile');
      const desktopPages = pages.filter(p => p.device_type === 'desktop');

      const mobileScore = mobilePages.length > 0
        ? Math.round(mobilePages.reduce((sum, p) => sum + (p.score || 0), 0) / mobilePages.length)
        : 78;

      const desktopScore = desktopPages.length > 0
        ? Math.round(desktopPages.reduce((sum, p) => sum + (p.score || 0), 0) / desktopPages.length)
        : 92;

      const slowPagesCount = pages.filter(p => (p.load_time || 0) > 3000).length;

      setData({
        avgLoadTime: avgLoadTime || 1800,
        mobileScore,
        desktopScore,
        slowPagesCount,
        pages: pages.length > 0 ? pages : samplePages
      });
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setData({
        avgLoadTime: 1800,
        mobileScore: 78,
        desktopScore: 92,
        slowPagesCount: 2,
        pages: samplePages
      });
    } finally {
      setLoading(false);
    }
  };

  const samplePages = [
    { page_url: '/', load_time: 1200, score: 92, lcp: 1.8, cls: 0.05, inp: 120, device_type: 'desktop', status: 'good' },
    { page_url: '/gallery', load_time: 2100, score: 78, lcp: 2.4, cls: 0.08, inp: 180, device_type: 'mobile', status: 'needs_improvement' },
    { page_url: '/films', load_time: 1800, score: 85, lcp: 2.1, cls: 0.03, inp: 150, device_type: 'desktop', status: 'good' },
    { page_url: '/services', load_time: 1500, score: 88, lcp: 1.9, cls: 0.04, inp: 140, device_type: 'mobile', status: 'good' },
    { page_url: '/about', load_time: 3200, score: 62, lcp: 3.5, cls: 0.12, inp: 250, device_type: 'mobile', status: 'poor' },
  ];

  const overallScore = data ? Math.round((data.mobileScore + data.desktopScore) / 2) : 85;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[hsl(152,100%,50%)]';
    if (score >= 50) return 'text-[hsl(35,100%,50%)]';
    return 'text-[hsl(348,100%,60%)]';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[hsl(152,100%,50%)]/15 text-[hsl(152,100%,50%)] border border-[hsl(152,100%,50%)]/30"><CheckCircle className="h-3 w-3" /> Good</span>;
      case 'needs_improvement':
        return <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[hsl(35,100%,50%)]/15 text-[hsl(35,100%,50%)] border border-[hsl(35,100%,50%)]/30"><AlertTriangle className="h-3 w-3" /> Needs Work</span>;
      case 'poor':
        return <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-[hsl(348,100%,60%)]/15 text-[hsl(348,100%,60%)] border border-[hsl(348,100%,60%)]/30"><AlertTriangle className="h-3 w-3" /> Poor</span>;
      default:
        return <span className="text-xs text-[hsl(215,15%,55%)]">Unknown</span>;
    }
  };

  const pagePerformanceData = (data?.pages || []).slice(0, 6).map(p => ({
    name: p.page_url.length > 12 ? p.page_url.slice(0, 12) + '...' : p.page_url,
    value: p.score || 0
  }));

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
            Performance & Speed
          </h1>
          <p className="text-[hsl(215,15%,55%)]">Website performance metrics and Core Web Vitals</p>
        </div>
        <Button
          onClick={fetchData}
          variant="outline"
          className="bg-[hsl(222,47%,10%)] border-[hsl(222,30%,18%)] text-[hsl(215,20%,88%)] hover:bg-[hsl(190,100%,50%)]/10 hover:border-[hsl(190,100%,50%)]/50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse h-32 rounded-2xl bg-gradient-to-br from-[hsl(222,47%,12%)] to-[hsl(222,47%,8%)]" />
          ))}
        </div>
      ) : (
        <>
          {/* Modern Stats - Minimal Design */}
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            {/* Avg Load Time */}
            <div className="group relative p-6 rounded-2xl border border-[hsl(222,30%,18%)] hover:border-[hsl(190,100%,50%)]/40 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <Clock className="h-5 w-5 text-[hsl(190,100%,50%)]" />
                <TrendingUp className="h-4 w-4 text-[hsl(152,100%,50%)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[hsl(215,15%,55%)] uppercase tracking-wider">Avg Load Time</p>
                <p className="text-4xl font-bold text-[hsl(215,20%,88%)]">
                  {((data?.avgLoadTime || 0) / 1000).toFixed(1)}<span className="text-xl text-[hsl(215,15%,55%)]">s</span>
                </p>
              </div>
            </div>

            {/* Mobile Score */}
            <div className="group relative p-6 rounded-2xl border border-[hsl(222,30%,18%)] hover:border-[hsl(265,89%,56%)]/40 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <Smartphone className="h-5 w-5 text-[hsl(265,89%,56%)]" />
                <TrendingUp className="h-4 w-4 text-[hsl(152,100%,50%)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[hsl(215,15%,55%)] uppercase tracking-wider">Mobile Score</p>
                <p className={`text-4xl font-bold ${getScoreColor(data?.mobileScore || 0)}`}>
                  {data?.mobileScore || 0}<span className="text-xl text-[hsl(215,15%,55%)]">/100</span>
                </p>
              </div>
            </div>

            {/* Desktop Score */}
            <div className="group relative p-6 rounded-2xl border border-[hsl(222,30%,18%)] hover:border-[hsl(152,100%,50%)]/40 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <Monitor className="h-5 w-5 text-[hsl(152,100%,50%)]" />
                <TrendingUp className="h-4 w-4 text-[hsl(152,100%,50%)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[hsl(215,15%,55%)] uppercase tracking-wider">Desktop Score</p>
                <p className={`text-4xl font-bold ${getScoreColor(data?.desktopScore || 0)}`}>
                  {data?.desktopScore || 0}<span className="text-xl text-[hsl(215,15%,55%)]">/100</span>
                </p>
              </div>
            </div>

            {/* Slow Pages */}
            <div className="group relative p-6 rounded-2xl border border-[hsl(222,30%,18%)] hover:border-[hsl(348,100%,60%)]/40 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <AlertTriangle className="h-5 w-5 text-[hsl(348,100%,60%)]" />
                <TrendingUp className="h-4 w-4 text-[hsl(152,100%,50%)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-[hsl(215,15%,55%)] uppercase tracking-wider">Slow Pages</p>
                <p className="text-4xl font-bold text-[hsl(348,100%,60%)]">
                  {data?.slowPagesCount || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Overall Score - Minimal Circular Design */}
          <div className="relative overflow-hidden rounded-3xl border border-[hsl(222,30%,18%)] p-6 md:p-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(190,100%,50%)]/3 rounded-full blur-3xl" />
            <div className="relative">
              <h3 className="text-lg md:text-xl font-bold text-[hsl(215,20%,88%)] mb-6 md:mb-8">Overall Performance Score</h3>
              <div className="flex items-center justify-center">
                <div className="relative">
                  {/* Circular Progress - Responsive Size */}
                  <svg className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="42%"
                      stroke="hsl(222,30%,18%)"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="42%"
                      stroke={overallScore >= 90 ? 'hsl(152,100%,50%)' : overallScore >= 50 ? 'hsl(35,100%,50%)' : 'hsl(348,100%,60%)'}
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${(overallScore / 100) * 264} 264`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                      style={{
                        filter: `drop-shadow(0 0 8px ${overallScore >= 90 ? 'rgba(0,255,127,0.4)' : overallScore >= 50 ? 'rgba(255,165,0,0.4)' : 'rgba(255,100,130,0.4)'})`
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className={`text-4xl sm:text-5xl md:text-6xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</p>
                    <p className="text-xs sm:text-sm text-[hsl(215,15%,55%)] mt-1 md:mt-2">Overall</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Web Vitals - Clean List Design */}
          <div className="space-y-6">
            <h3 className="text-xl md:text-2xl font-bold text-[hsl(215,20%,88%)]">Core Web Vitals</h3>

            <div className="grid gap-4">
              {/* LCP */}
              <div className="group relative p-4 md:p-6 rounded-2xl border border-[hsl(222,30%,18%)] hover:border-[hsl(35,100%,50%)]/30 transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-2 w-2 rounded-full bg-[hsl(35,100%,50%)]" />
                      <p className="text-xs uppercase tracking-wider text-[hsl(215,15%,55%)]">Largest Contentful Paint</p>
                    </div>
                    <p className="text-4xl md:text-5xl font-bold text-[hsl(35,100%,50%)] mb-2">2.1s</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-[hsl(215,15%,55%)]">Target: <span className="text-[hsl(152,100%,50%)]">Under 2.5s</span></span>
                      <span className="text-[hsl(215,15%,45%)]">• Measures loading performance</span>
                    </div>
                  </div>
                  <div className="text-right self-end sm:self-auto">
                    <div className="text-5xl md:text-6xl font-bold text-[hsl(35,100%,50%)]/20">78</div>
                    <p className="text-xs text-[hsl(215,15%,55%)]">score</p>
                  </div>
                </div>
              </div>

              {/* CLS */}
              <div className="group relative p-4 md:p-6 rounded-2xl border border-[hsl(222,30%,18%)] hover:border-[hsl(152,100%,50%)]/30 transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-2 w-2 rounded-full bg-[hsl(152,100%,50%)]" />
                      <p className="text-xs uppercase tracking-wider text-[hsl(215,15%,55%)]">Cumulative Layout Shift</p>
                    </div>
                    <p className="text-4xl md:text-5xl font-bold text-[hsl(152,100%,50%)] mb-2">0.05</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-[hsl(215,15%,55%)]">Target: <span className="text-[hsl(152,100%,50%)]">Under 0.1</span></span>
                      <span className="text-[hsl(215,15%,45%)]">• Measures visual stability</span>
                    </div>
                  </div>
                  <div className="text-right self-end sm:self-auto">
                    <div className="text-5xl md:text-6xl font-bold text-[hsl(152,100%,50%)]/20">92</div>
                    <p className="text-xs text-[hsl(215,15%,55%)]">score</p>
                  </div>
                </div>
              </div>

              {/* INP */}
              <div className="group relative p-4 md:p-6 rounded-2xl border border-[hsl(222,30%,18%)] hover:border-[hsl(152,100%,50%)]/30 transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-2 w-2 rounded-full bg-[hsl(152,100%,50%)]" />
                      <p className="text-xs uppercase tracking-wider text-[hsl(215,15%,55%)]">Interaction to Next Paint</p>
                    </div>
                    <p className="text-4xl md:text-5xl font-bold text-[hsl(152,100%,50%)] mb-2">180ms</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-[hsl(215,15%,55%)]">Target: <span className="text-[hsl(152,100%,50%)]">Under 200ms</span></span>
                      <span className="text-[hsl(215,15%,45%)]">• Measures interactivity</span>
                    </div>
                  </div>
                  <div className="text-right self-end sm:self-auto">
                    <div className="text-5xl md:text-6xl font-bold text-[hsl(152,100%,50%)]/20">85</div>
                    <p className="text-xs text-[hsl(215,15%,55%)]">score</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page Performance Chart */}
          <div className="relative overflow-hidden rounded-3xl border border-[hsl(222,30%,18%)] p-8">
            <h3 className="text-xl font-bold text-[hsl(215,20%,88%)] mb-6">Page Performance Scores</h3>
            <div className="h-[300px]">
              {pagePerformanceData.length > 0 ? (
                <NeonBarChart data={pagePerformanceData} dataKey="value" layout="vertical" colorByValue />
              ) : (
                <div className="flex h-full items-center justify-center text-[hsl(215,15%,55%)]">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Pages Table */}
          <div className="relative overflow-hidden rounded-3xl border border-[hsl(222,30%,18%)] p-8">
            <h3 className="text-xl font-bold text-[hsl(215,20%,88%)] mb-6">All Pages Performance</h3>
            <Table>
              <TableHeader>
                <TableRow className="border-[hsl(222,30%,18%)] hover:bg-transparent">
                  <TableHead className="text-[hsl(215,15%,55%)]">Page</TableHead>
                  <TableHead className="text-[hsl(215,15%,55%)]">Device</TableHead>
                  <TableHead className="text-right text-[hsl(215,15%,55%)]">Load Time</TableHead>
                  <TableHead className="text-right text-[hsl(215,15%,55%)]">Score</TableHead>
                  <TableHead className="text-right text-[hsl(215,15%,55%)]">LCP</TableHead>
                  <TableHead className="text-right text-[hsl(215,15%,55%)]">CLS</TableHead>
                  <TableHead className="text-[hsl(215,15%,55%)]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.pages || []).map((page, idx) => (
                  <TableRow key={idx} className="border-[hsl(222,30%,18%)] hover:bg-[hsl(222,47%,8%)]">
                    <TableCell className="font-medium text-[hsl(215,20%,88%)]">{page.page_url}</TableCell>
                    <TableCell className="capitalize text-[hsl(215,15%,55%)]">{page.device_type}</TableCell>
                    <TableCell className="text-right text-[hsl(215,20%,88%)]">
                      {((page.load_time || 0) / 1000).toFixed(2)}s
                    </TableCell>
                    <TableCell className={`text-right font-bold ${getScoreColor(page.score || 0)}`}>
                      {page.score || 0}
                    </TableCell>
                    <TableCell className="text-right text-[hsl(215,20%,88%)]">{page.lcp}s</TableCell>
                    <TableCell className="text-right text-[hsl(215,20%,88%)]">{page.cls}</TableCell>
                    <TableCell>{getStatusBadge(page.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};

export default Performance;
