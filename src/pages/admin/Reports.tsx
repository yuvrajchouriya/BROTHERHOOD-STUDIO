import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Calendar, BarChart } from "lucide-react";

const Reports = () => {
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
              <h3 className="font-semibold text-blue-600">Reports Feature Coming Soon</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Downloadable PDF/CSV reports are being developed. This will include weekly and monthly 
                summaries, custom date range exports, and automated email reports.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="opacity-50 cursor-not-allowed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Traffic, conversions, and engagement summary for the past week.
            </p>
            <div className="text-sm text-muted-foreground">Coming soon...</div>
          </CardContent>
        </Card>

        <Card className="opacity-50 cursor-not-allowed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive monthly analytics with trends and insights.
            </p>
            <div className="text-sm text-muted-foreground">Coming soon...</div>
          </CardContent>
        </Card>

        <Card className="opacity-50 cursor-not-allowed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Custom Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Generate reports for any custom date range.
            </p>
            <div className="text-sm text-muted-foreground">Coming soon...</div>
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
