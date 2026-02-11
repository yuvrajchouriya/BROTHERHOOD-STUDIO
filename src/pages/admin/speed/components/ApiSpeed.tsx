import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const ApiSpeed = () => {
    // Mock API Metrics
    const apiData = [
        { endpoint: '/auth/login', duration: 450, status: 200 },
        { endpoint: '/api/films', duration: 320, status: 200 },
        { endpoint: '/api/checkout/process', duration: 1900, status: 200 },
        { endpoint: '/api/search', duration: 800, status: 200 },
        { endpoint: '/api/gallery/photos', duration: 600, status: 200 },
    ];

    const chartConfig = {
        duration: {
            label: "Duration (ms)",
            color: "hsl(var(--primary))",
        },
    } satisfies ChartConfig;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Backend API Performance</CardTitle>
                    <CardDescription>Average response time per endpoint (ms)</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[400px] w-full">
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
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar dataKey="duration" radius={[0, 4, 4, 0]} barSize={30}>
                                {apiData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.duration > 1000 ? '#ef4444' : '#3b82f6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
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
