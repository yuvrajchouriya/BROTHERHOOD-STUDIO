import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Share2 } from "lucide-react";

const SpeedReports = () => {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Performance Report</CardTitle>
                        <CardDescription>Feb 03 - Feb 10, 2026</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span>Avg LCP:</span> <span className="font-bold text-green-600">2.1s</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span>Incidents:</span> <span className="font-bold">2</span>
                        </div>
                        <Button className="w-full" variant="outline">
                            <Download className="h-4 w-4 mr-2" /> Download PDF
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Executive Summary</CardTitle>
                        <CardDescription>January 2026</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span>Score Improvement:</span> <span className="font-bold text-green-600">+12%</span>
                        </div>
                        <Button className="w-full" variant="outline">
                            <Download className="h-4 w-4 mr-2" /> Download PDF
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle>Custom Report</CardTitle>
                        <CardDescription>Generate report for specific date range</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button className="w-full">
                            <FileText className="h-4 w-4 mr-2" /> Generate New
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SpeedReports;
