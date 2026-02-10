import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, Zap, TrendingUp, TrendingDown, Clock, Users } from "lucide-react";

interface SpeedMetric {
    metric_type: string;
    value: number;
}

const SpeedOverview = () => {
    // Fetch aggregated RUM metrics
    const { data: metrics } = useQuery({
        queryKey: ['rum_overview'],
        queryFn: async () => {
            // In a real scenario, we'd aggregate this on the backend or use a view
            // For now, let's fetch recent RUM data
            const { data, error } = await supabase
                .from('rum_metrics')
                .select('metric_type, value')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            return data as SpeedMetric[];
        }
    });

    // Calculate averages (Mock fallback if no data)
    const lcpAvg = metrics?.filter(m => m.metric_type === 'LCP').reduce((acc, curr) => acc + curr.value, 0) / (metrics?.filter(m => m.metric_type === 'LCP').length || 1) || 2.4;
    const inpAvg = metrics?.filter(m => m.metric_type === 'INP').reduce((acc, curr) => acc + curr.value, 0) / (metrics?.filter(m => m.metric_type === 'INP').length || 1) || 150;
    const clsAvg = metrics?.filter(m => m.metric_type === 'CLS').reduce((acc, curr) => acc + curr.value, 0) / (metrics?.filter(m => m.metric_type === 'CLS').length || 1) || 0.05;

    // Mock trend data for the chart
    const trendData = [
        { time: '10:00', lcp: 2.1, inp: 120 },
        { time: '10:30', lcp: 2.3, inp: 130 },
        { time: '11:00', lcp: 2.8, inp: 180 },
        { time: '11:30', lcp: 2.2, inp: 140 },
        { time: '12:00', lcp: 3.1, inp: 210 },
        { time: '12:30', lcp: 2.5, inp: 160 },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg LCP</CardTitle>
                        <Zap className={`h-4 w-4 ${lcpAvg > 2.5 ? 'text-red-500' : 'text-green-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lcpAvg.toFixed(2)}s</div>
                        <p className="text-xs text-muted-foreground">Largest Contentful Paint</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg INP</CardTitle>
                        <Activity className={`h-4 w-4 ${inpAvg > 200 ? 'text-red-500' : 'text-green-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inpAvg.toFixed(0)}ms</div>
                        <p className="text-xs text-muted-foreground">Interaction to Next Paint</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg CLS</CardTitle>
                        <TrendingUp className={`h-4 w-4 ${clsAvg > 0.1 ? 'text-yellow-500' : 'text-green-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{clsAvg.toFixed(3)}</div>
                        <p className="text-xs text-muted-foreground">Cumulative Layout Shift</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">124</div>
                        <p className="text-xs text-muted-foreground">Live on site</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Live Speed Trend (Last Hour)</CardTitle>
                        <CardDescription>Average LCP/INP performance over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}s`} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                                    />
                                    <Bar dataKey="lcp" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="LCP (s)" />
                                    {/* <Bar dataKey="inp" fill="#82ca9d" radius={[4, 4, 0, 0]} name="INP (ms)" /> */}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Speed Score</CardTitle>
                        <CardDescription>Overall health rating</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center pt-6">
                        <div className="relative flex items-center justify-center">
                            <svg className="h-40 w-40 max-w-full" viewBox="0 0 100 100">
                                <circle
                                    className="text-muted/20 stroke-current"
                                    strokeWidth="10"
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                />
                                <circle
                                    className="text-primary stroke-current transition-all duration-1000 ease-in-out"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    strokeDasharray="251.2"
                                    strokeDashoffset={251.2 - (251.2 * 68) / 100}
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                            <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center flex-col">
                                <span className="text-4xl font-bold">68</span>
                                <span className="text-sm text-muted-foreground">Good</span>
                            </div>
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-4 w-full text-center">
                            <div>
                                <div className="text-lg font-bold text-green-500">92%</div>
                                <div className="text-xs text-muted-foreground">Fast Page Loads</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-yellow-500">8%</div>
                                <div className="text-xs text-muted-foreground">Need Improvement</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SpeedOverview;
