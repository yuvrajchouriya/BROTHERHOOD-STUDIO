import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

const AlertsIncidents = () => {
    const alerts = [
        { id: 1, type: 'LCP Spike', message: 'LCP increased to 4.2s on /checkout', severity: 'high', status: 'open', time: '10 mins ago' },
        { id: 2, type: 'API Latency', message: '/api/search response > 2s', severity: 'medium', status: 'resolved', time: '2 hours ago' },
        { id: 3, type: 'JS Bundle', message: 'Main bundle size increased by 150KB', severity: 'low', status: 'ignored', time: '1 day ago' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <Card className="flex-1 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900">
                    <CardHeader className="pb-2"><CardTitle className="text-red-600 text-lg">Active Incidents</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-red-700">1</div></CardContent>
                </Card>
                <Card className="flex-1">
                    <CardHeader className="pb-2"><CardTitle className="text-lg">Resolved Today</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold">4</div></CardContent>
                </Card>
                <Card className="flex-1">
                    <CardHeader className="pb-2"><CardTitle className="text-lg">Avg Resolution Time</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold">24m</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Alerts</CardTitle>
                    <CardDescription>System monitored Performance Incidents</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {alerts.map((alert) => (
                            <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${alert.status === 'open' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {alert.status === 'open' ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{alert.type}</h4>
                                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>{alert.severity}</Badge>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                            <Clock className="h-3 w-3" /> {alert.time}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AlertsIncidents;
