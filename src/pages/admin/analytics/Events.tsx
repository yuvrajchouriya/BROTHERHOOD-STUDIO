import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Zap, MessageCircle, Image, Play, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EventsData {
  totalEvents: number;
  events: Array<{
    event_type: string;
    count: number;
    lastTriggered: string;
    topPage: string;
  }>;
  recentEvents: Array<{
    id: string;
    event_type: string;
    page_path: string;
    clicked_at: string;
    element_text: string;
  }>;
}

const Events = () => {
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days'>('7days');
  const [data, setData] = useState<EventsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: eventsData } = await supabase.functions.invoke('analytics-aggregate', {
        body: { metric_type: 'events', date_range: dateRange }
      });
      setData(eventsData);
    } catch (error) {
      console.error('Error fetching events data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      case 'whatsapp_click': return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'form_submit': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'film_play': return <Play className="h-4 w-4 text-purple-500" />;
      case 'gallery_open': return <Image className="h-4 w-4 text-orange-500" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'whatsapp_click': return 'WhatsApp Click';
      case 'form_submit': return 'Form Submit';
      case 'film_play': return 'Film Play';
      case 'gallery_open': return 'Gallery Open';
      case 'service_view': return 'Service View';
      case 'plan_view': return 'Plan View';
      case 'link_click': return 'Link Click';
      default: return type;
    }
  };

  // Get stats for specific events
  const whatsappClicks = data?.events?.find(e => e.event_type === 'whatsapp_click')?.count || 0;
  const galleryOpens = data?.events?.find(e => e.event_type === 'gallery_open')?.count || 0;
  const filmPlays = data?.events?.find(e => e.event_type === 'film_play')?.count || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Track all user interactions</p>
        </div>
        <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="7days">7 Days</TabsTrigger>
            <TabsTrigger value="30days">30 Days</TabsTrigger>
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
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.totalEvents || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">WhatsApp Clicks</CardTitle>
                <MessageCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{whatsappClicks}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Gallery Opens</CardTitle>
                <Image className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{galleryOpens}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Film Plays</CardTitle>
                <Play className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{filmPlays}</div>
              </CardContent>
            </Card>
          </div>

          {/* Event Types Table */}
          <Card>
            <CardHeader>
              <CardTitle>Event Types Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead>Last Triggered</TableHead>
                    <TableHead>Top Page</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.events?.map((event) => (
                    <TableRow key={event.event_type}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEventIcon(event.event_type)}
                          {getEventLabel(event.event_type)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">{event.count}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(event.lastTriggered)}
                      </TableCell>
                      <TableCell>{event.topPage}</TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No events yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.recentEvents?.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEventIcon(event.event_type)}
                          {getEventLabel(event.event_type)}
                        </div>
                      </TableCell>
                      <TableCell>{event.page_path}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {event.element_text || '-'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDate(event.clicked_at)}
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No events yet
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

export default Events;
