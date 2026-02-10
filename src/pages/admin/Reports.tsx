import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Calendar, BarChart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAdminAction } from "@/lib/adminLogger";

const Reports = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const generateReport = async (type: 'weekly' | 'monthly' | 'custom') => {
    setDownloading(type);
    try {
      const dateRange = type === 'weekly' ? '7d' : type === 'monthly' ? '30d' : '90d';
      
      // Fetch visitors data as a proxy for the report
      const { data: visitors, error } = await supabase.functions.invoke('analytics-aggregate', {
         body: { metric_type: 'visitors', date_range: dateRange }
      });

      if (error) throw error;

      // Create a downloadable blob
      const reportData = {
         title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
         generated_at: new Date().toISOString(),
         data: visitors
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brotherhood_report_${type}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      logAdminAction('export', 'reports', { report_type: type });
      toast.success(`${type} report downloaded successfully`);

    } catch (e) {
      console.error(e);
      toast.error("Failed to generate report");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Download analytics reports</p>
      </div>

      {/* Info Card */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <FileDown className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-600">Analytics Reports</h3>
              <p className="text-sm text-muted-foreground mt-1">
                 Export your data for offline analysis. Reports include visitor stats, engagement metrics, and more.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Weekly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Traffic, conversions, and engagement summary for the past 7 days.
            </p>
            <Button 
               variant="outline" 
               className="w-full" 
               onClick={() => generateReport('weekly')}
               disabled={!!downloading}
            >
              {downloading === 'weekly' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
              Download JSON
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Monthly Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive analytics for the past 30 days.
            </p>
            <Button 
               variant="outline" 
               className="w-full" 
               onClick={() => generateReport('monthly')}
               disabled={!!downloading}
            >
              {downloading === 'monthly' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
              Download JSON
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              Quarterly Report (90d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Long-term trends and insights for the last 90 days.
            </p>
            <Button 
               variant="outline" 
               className="w-full" 
               onClick={() => generateReport('custom')}
               disabled={!!downloading}
            >
              {downloading === 'custom' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
              Download JSON
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* What will be included */}
      <Card>
        <CardHeader>
          <CardTitle>Report Contents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Traffic Report</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Total visitors and sessions</li>
                <li>• New vs returning visitors</li>
                <li>• Device and browser breakdown</li>
                <li>• Geographic distribution</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Conversion Report</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• WhatsApp clicks and form submissions</li>
                <li>• Conversion rates by page</li>
                <li>• Top performing content</li>
                <li>• Engagement metrics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
