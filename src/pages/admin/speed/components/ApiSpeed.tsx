import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ApiSpeed = () => {
    // Mock API Metrics
    const apiData = [
        { endpoint: '/auth/login', duration: 450, status: 200 },
        { endpoint: '/api/films', duration: 320, status: 200 },
        { endpoint: '/api/checkout/process', duration: 1900, status: 200 },
        { endpoint: '/api/search', duration: 800, status: 200 },
        { endpoint: '/api/gallery/photos', duration: 600, status: 200 },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Backend API Performance</CardTitle>
                    <CardDescription>Average response time per endpoint (ms)</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={apiData} layout="vertical" margin={{ left: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis
                                dataKey="endpoint"
                                type="category"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                width={150}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                            />
                            <Bar dataKey="duration" radius={[0, 4, 4, 0]} barSize={30}>
                                {apiData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.duration > 1000 ? '#ef4444' : '#3b82f6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader><CardTitle className="text-base">Slowest Endpoint</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-red-500">/api/checkout/process</div>
                        <div className="text-sm text-muted-foreground">1.9s avg response</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-base">Error Rate (5xx)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-green-500">0.2%</div>
                        <div className="text-sm text-muted-foreground">Very stable</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-base">Total Requests (1h)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">4.2k</div>
                        <div className="text-sm text-muted-foreground">~70 req/min</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ApiSpeed;
