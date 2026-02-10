import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Insight {
  id: string;
  insight_type: string;
  title: string;
  description: string | null;
  priority: string;
  suggested_action: string | null;
  status: string;
  created_at: string;
}

const Decisions = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('decision_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'viewed' | 'applied') => {
    try {
      await supabase
        .from('decision_insights')
        .update({ status })
        .eq('id', id);

      setInsights(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    } catch (error) {
      console.error('Error updating insight:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'viewed': return <Eye className="h-4 w-4 text-blue-500" />;
      default: return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    }
  };

  const activeInsights = insights.filter(i => i.status !== 'applied').length;
  const highPriorityCount = insights.filter(i => i.priority === 'high' && i.status !== 'applied').length;

  // Sample insights to show when no real data
  const sampleInsights: Insight[] = [
    {
      id: '1',
      insight_type: 'traffic',
      title: 'Mobile Traffic Growing',
      description: 'Mobile visitors increased by 25% this week. Consider optimizing mobile experience further.',
      priority: 'medium',
      suggested_action: 'Review mobile layout and add mobile-specific CTAs',
      status: 'new',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      insight_type: 'conversion',
      title: 'WhatsApp CTR High on Films Page',
      description: 'Films page has 3x higher WhatsApp click rate than other pages.',
      priority: 'high',
      suggested_action: 'Add more films or promote film content on homepage',
      status: 'new',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      insight_type: 'content',
      title: 'Gallery Page Low Engagement',
      description: 'Gallery page has lower scroll depth compared to other pages.',
      priority: 'low',
      suggested_action: 'Consider adding more visual cues or story text',
      status: 'viewed',
      created_at: new Date().toISOString()
    }
  ];

  const displayInsights = insights.length > 0 ? insights : sampleInsights;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Decision & Growth</h1>
        <p className="text-muted-foreground">AI-powered insights and recommendations</p>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={async () => {
            setLoading(true);
            await supabase.functions.invoke('analytics-aggregate', { body: { metric_type: 'generate_insights' } });
            fetchInsights();
          }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          <Lightbulb className="mr-2 h-4 w-4" />
          Analyze Now
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Insights</CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInsights || displayInsights.filter(i => i.status !== 'applied').length}</div>
          </CardContent>
        </Card>

        <Card className={highPriorityCount > 0 ? "border-red-500/20 bg-red-500/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Priority Actions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {highPriorityCount || displayInsights.filter(i => i.priority === 'high').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Actions Applied</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {insights.filter(i => i.status === 'applied').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg border p-4">
                  <div className="h-4 w-48 rounded bg-muted mb-2" />
                  <div className="h-3 w-full rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {displayInsights.map((insight) => (
                <div key={insight.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(insight.status)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{insight.title}</h4>
                          <Badge variant={getPriorityColor(insight.priority) as "default" | "secondary" | "destructive" | "outline"}>
                            {insight.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {insight.insight_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                        {insight.suggested_action && (
                          <p className="text-sm mt-2">
                            <span className="font-medium">Suggested Action:</span>{' '}
                            {insight.suggested_action}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {insight.status === 'new' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(insight.id, 'viewed')}
                        >
                          Mark Viewed
                        </Button>
                      )}
                      {insight.status !== 'applied' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => updateStatus(insight.id, 'applied')}
                        >
                          Applied
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Growth Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Growth Tracking</h3>
              <p className="text-sm text-muted-foreground mt-1">
                As more data is collected, this dashboard will show traffic growth trends,
                conversion improvements, and AI-generated recommendations based on your
                website's performance patterns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Decisions;
