import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target, MessageCircle, FileText, Play, Image, TrendingDown, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import GlowPieChart from "@/components/admin/charts/GlowPieChart";
import ConversionFunnel from "@/components/admin/charts/ConversionFunnel";

interface ConversionsData {
  totalConversions: number;
  whatsappClicks: number;
  formSubmits: number;
  filmPlays: number;
  galleryOpens: number;
  conversionRate: string;
  events: Array<{
    id: string;
    event_type: string;
    page_path: string;
    clicked_at: string;
    element_text: string;
  }>;
}

const Conversions = () => {
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d'>('7d');
  const [data, setData] = useState<ConversionsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: conversionsData } = await supabase.functions.invoke('analytics-aggregate', {
        body: { metric_type: 'conversions', date_range: dateRange }
      });
      setData(conversionsData);
    } catch (error) {
      console.error('Error fetching conversions data:', error);
    } finally {
      setLoading(false);
    }
  };

  const funnelData = [
    { name: 'Visitors', value: data?.totalConversions || 0, color: 'hsl(190, 100%, 50%)' },
    { name: 'Gallery View', value: data?.galleryOpens || 0, color: 'hsl(210, 100%, 50%)' },
    { name: 'Film Play', value: data?.filmPlays || 0, color: 'hsl(265, 89%, 56%)' },
    { name: 'WhatsApp Click', value: data?.whatsappClicks || 0, color: 'hsl(152, 100%, 50%)' },
    { name: 'Form Submit', value: data?.formSubmits || 0, color: 'hsl(35, 100%, 50%)' },
  ];

  const conversionPieData = [
    { name: 'WhatsApp', value: data?.whatsappClicks || 0 },
    { name: 'Form', value: data?.formSubmits || 0 },
    { name: 'Film Play', value: data?.filmPlays || 0 },
    { name: 'Gallery', value: data?.galleryOpens || 0 },
  ].filter(d => d.value > 0);

  const intentData: { name: string; value: number; color: string }[] = [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'whatsapp_click': return <MessageCircle className="h-4 w-4 text-[hsl(152,100%,50%)]" />;
      case 'form_submit': return <FileText className="h-4 w-4 text-[hsl(190,100%,50%)]" />;
      case 'film_play': return <Play className="h-4 w-4 text-[hsl(265,89%,56%)]" />;
      case 'gallery_open': return <Image className="h-4 w-4 text-[hsl(35,100%,50%)]" />;
      default: return <Target className="h-4 w-4 text-[hsl(215,15%,55%)]" />;
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'whatsapp_click': return 'WhatsApp Click';
      case 'form_submit': return 'Form Submit';
      case 'film_play': return 'Film Play';
      case 'gallery_open': return 'Gallery Open';
      default: return type;
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
            Conversions & Funnel
          </h1>
          <p className="text-[hsl(215,15%,55%)]">Track key conversion events and user journey</p>
        </div>
        <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
          <TabsList className="bg-[hsl(222,47%,10%)] border border-[hsl(222,30%,18%)]">
            <TabsTrigger value="today" className="data-[state=active]:bg-[hsl(190,100%,50%)]/20 data-[state=active]:text-[hsl(190,100%,50%)]">Today</TabsTrigger>
            <TabsTrigger value="7d" className="data-[state=active]:bg-[hsl(190,100%,50%)]/20 data-[state=active]:text-[hsl(190,100%,50%)]">7 Days</TabsTrigger>
            <TabsTrigger value="30d" className="data-[state=active]:bg-[hsl(190,100%,50%)]/20 data-[state=active]:text-[hsl(190,100%,50%)]">30 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse h-32 rounded-2xl bg-gradient-to-br from-[hsl(222,47%,12%)] to-[hsl(222,47%,8%)]" />
          ))}
        </div>
      ) : (
        <>
          {/* Modern Stats Grid - Glassmorphism Style */}
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            {/* Total Conversions */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(190,100%,50%)]/10 to-[hsl(265,89%,56%)]/10 p-6 backdrop-blur-sm border border-[hsl(190,100%,50%)]/20 hover:border-[hsl(190,100%,50%)]/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(190,100%,50%)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[hsl(215,15%,65%)] uppercase tracking-wider">Total</span>
                  <Target className="h-5 w-5 text-[hsl(190,100%,50%)] drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent mb-1">
                  {data?.totalConversions || 0}
                </div>
                <p className="text-xs text-[hsl(215,15%,55%)]">{data?.conversionRate || 0}% conversion rate</p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(152,100%,50%)]/10 to-[hsl(152,100%,30%)]/5 p-6 backdrop-blur-sm border border-[hsl(152,100%,50%)]/20 hover:border-[hsl(152,100%,50%)]/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(152,100%,50%)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[hsl(215,15%,65%)] uppercase tracking-wider">WhatsApp</span>
                  <MessageCircle className="h-5 w-5 text-[hsl(152,100%,50%)] drop-shadow-[0_0_8px_rgba(0,255,127,0.6)]" />
                </div>
                <div className="text-4xl font-bold text-[hsl(152,100%,50%)]">
                  {data?.whatsappClicks || 0}
                </div>
                <p className="text-xs text-[hsl(215,15%,55%)]">clicks</p>
              </div>
            </div>

            {/* Form Submit */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(190,100%,50%)]/10 to-[hsl(190,100%,30%)]/5 p-6 backdrop-blur-sm border border-[hsl(190,100%,50%)]/20 hover:border-[hsl(190,100%,50%)]/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(190,100%,50%)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[hsl(215,15%,65%)] uppercase tracking-wider">Forms</span>
                  <FileText className="h-5 w-5 text-[hsl(190,100%,50%)] drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]" />
                </div>
                <div className="text-4xl font-bold text-[hsl(190,100%,50%)]">
                  {data?.formSubmits || 0}
                </div>
                <p className="text-xs text-[hsl(215,15%,55%)]">submissions</p>
              </div>
            </div>

            {/* Film Play */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(265,89%,56%)]/10 to-[hsl(265,89%,36%)]/5 p-6 backdrop-blur-sm border border-[hsl(265,89%,56%)]/20 hover:border-[hsl(265,89%,56%)]/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(265,89%,56%)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[hsl(215,15%,65%)] uppercase tracking-wider">Films</span>
                  <Play className="h-5 w-5 text-[hsl(265,89%,56%)] drop-shadow-[0_0_8px_rgba(124,58,237,0.6)]" />
                </div>
                <div className="text-4xl font-bold text-[hsl(265,89%,56%)]">
                  {data?.filmPlays || 0}
                </div>
                <p className="text-xs text-[hsl(215,15%,55%)]">plays</p>
              </div>
            </div>
          </div>

          {/* Gallery Open - Full Width Stat */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[hsl(35,100%,50%)]/10 via-[hsl(35,100%,40%)]/5 to-transparent p-6 backdrop-blur-sm border border-[hsl(35,100%,50%)]/20 hover:border-[hsl(35,100%,50%)]/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(35,100%,50%)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Image className="h-6 w-6 text-[hsl(35,100%,50%)] drop-shadow-[0_0_8px_rgba(255,165,0,0.6)]" />
                  <span className="text-sm font-medium text-[hsl(215,15%,65%)] uppercase tracking-wider">Gallery Opens</span>
                </div>
                <div className="text-5xl font-bold text-[hsl(35,100%,50%)]">
                  {data?.galleryOpens || 0}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[hsl(215,15%,55%)]">Total gallery views</p>
              </div>
            </div>
          </div>

          {/* Conversion Funnel - Modern Design */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(222,47%,12%)] to-[hsl(222,47%,8%)] p-8 border border-[hsl(222,30%,18%)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(190,100%,50%)]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[hsl(265,89%,56%)]/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <TrendingDown className="h-6 w-6 text-[hsl(190,100%,50%)]" />
                <h2 className="text-2xl font-bold text-[hsl(215,20%,88%)]">Conversion Funnel</h2>
              </div>
              <div className="h-[400px]">
                <ConversionFunnel data={funnelData} />
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Conversion Breakdown */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(222,47%,12%)] to-[hsl(222,47%,8%)] p-8 border border-[hsl(222,30%,18%)]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(152,100%,50%)]/5 rounded-full blur-3xl" />
              <div className="relative">
                <h3 className="text-xl font-bold text-[hsl(215,20%,88%)] mb-6">Conversion Breakdown</h3>
                <div className="h-[300px]">
                  {conversionPieData.length > 0 ? (
                    <GlowPieChart data={conversionPieData} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[hsl(215,15%,55%)]">
                      No conversions yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Intent Score Distribution */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(222,47%,12%)] to-[hsl(222,47%,8%)] p-8 border border-[hsl(222,30%,18%)]">
              <div className="absolute top-0 left-0 w-64 h-64 bg-[hsl(265,89%,56%)]/5 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="h-6 w-6 text-[hsl(265,89%,56%)]" />
                  <h3 className="text-xl font-bold text-[hsl(215,20%,88%)]">Intent Score Distribution</h3>
                </div>
                <div className="space-y-4">
                  {intentData.length > 0 ? (
                    intentData.map((intent) => (
                      <div key={intent.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[hsl(215,20%,88%)]">{intent.name}</span>
                          <span className="font-bold" style={{ color: intent.color }}>{intent.value} users</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-[hsl(222,47%,8%)] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(intent.value / 300) * 100}%`,
                              background: `linear-gradient(90deg, ${intent.color}, ${intent.color}80)`,
                              boxShadow: `0 0 10px ${intent.color}40`
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-[hsl(215,15%,55%)]">
                      No intent data available yet
                    </div>
                  )}
                </div>
                <p className="text-xs text-[hsl(215,15%,55%)] mt-6 pt-6 border-t border-[hsl(222,30%,18%)]">
                  Intent Score = Gallery (+2) + Film Play (+5) + WhatsApp (+10) + Form Submit (+20)
                </p>
              </div>
            </div>
          </div>

          {/* Recent Conversions - Modern Table */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(222,47%,12%)] to-[hsl(222,47%,8%)] p-8 border border-[hsl(222,30%,18%)]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(35,100%,50%)]/5 rounded-full blur-3xl" />
            <div className="relative">
              <h3 className="text-xl font-bold text-[hsl(215,20%,88%)] mb-6">Recent Conversions</h3>
              <Table>
                <TableHeader>
                  <TableRow className="border-[hsl(222,30%,18%)] hover:bg-transparent">
                    <TableHead className="text-[hsl(215,15%,55%)]">Event</TableHead>
                    <TableHead className="text-[hsl(215,15%,55%)]">Page</TableHead>
                    <TableHead className="text-[hsl(215,15%,55%)]">Details</TableHead>
                    <TableHead className="text-right text-[hsl(215,15%,55%)]">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.events?.slice(0, 15).map((event) => (
                    <TableRow key={event.id} className="border-[hsl(222,30%,18%)] hover:bg-[hsl(222,47%,8%)]">
                      <TableCell>
                        <div className="flex items-center gap-2 text-[hsl(215,20%,88%)]">
                          {getEventIcon(event.event_type)}
                          {getEventLabel(event.event_type)}
                        </div>
                      </TableCell>
                      <TableCell className="text-[hsl(215,20%,88%)]">{event.page_path}</TableCell>
                      <TableCell className="text-[hsl(215,15%,55%)]">
                        {event.element_text || '-'}
                      </TableCell>
                      <TableCell className="text-right text-[hsl(215,15%,55%)]">
                        {formatDate(event.clicked_at)}
                      </TableCell>
                    </TableRow>
                  )) || (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-[hsl(215,15%,55%)]">
                          No conversions yet
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Conversions;
