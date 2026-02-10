import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { MousePointerClick, AlertCircle, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface InteractionMetric {
    id: string;
    metric_type: string;
    value: number;
    metadata: {
        event_name?: string;
        element_selector?: string;
        input_delay?: number;
        processing_start?: number;
        processing_end?: number;
    };
    created_at: string;
}

const InteractionPerformance = () => {
    // Fetch Interaction Data
    const { data: interactions, isLoading } = useQuery({
        queryKey: ['rum_interactions'],
        queryFn: async () => {
            // In a real scenario, we'd aggregate this in SQL or Edge Function for scale.
            // Fetching raw for demo/prototype.
            const { data, error } = await supabase
                .from('rum_metrics')
                .select('*')
                .eq('metric_type', 'INTERACTION')
                .order('created_at', { ascending: false })
                .limit(200);

            if (error) throw error;
            return data as unknown as InteractionMetric[];
        }
    });

    // Mock Data for "Empty" state or fallback
    const mockData = [
        { name: 'Add to Cart Data', delay: 420, color: '#ef4444' }, // Red
        { name: 'Login Button', delay: 180, color: '#3b82f6' }, // Blue
        { name: 'Menu Toggle', delay: 85, color: '#22c55e' }, // Green
        { name: 'Filter Apply', delay: 350, color: '#f97316' }, // Orange
        { name: 'Search Bar', delay: 60, color: '#22c55e' },
    ];

    // Process Data
    // Group by Element/Action and avg delay
    const processedData = interactions?.length ?
        Object.entries(interactions.reduce((acc, curr) => {
            const key = curr.metadata.element_selector || curr.metadata.event_name || 'Unknown Action';
            if (!acc[key]) acc[key] = { total: 0, count: 0 };
            acc[key].total += curr.value;
            acc[key].count += 1;
            return acc;
        }, {} as Record<string, { total: number, count: number }>))
            .map(([name, stats]) => ({
                name: name.length > 20 ? name.substring(0, 20) + '...' : name,
                delay: Math.round(stats.total / stats.count),
                color: (stats.total / stats.count) > 200 ? '#ef4444' : '#22c55e'
            }))
            .sort((a, b) => b.delay - a.delay)
            .slice(0, 5) // Top 5 slowest
        : mockData;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Interaction Latency (INP)</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">142ms</div>
                        <p className="text-xs text-muted-foreground">+12% from last week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Slow Interactions (&gt;200ms)</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">18</div>
                        <p className="text-xs text-muted-foreground">Requires optimization</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fast Interactions (&lt;100ms)</CardTitle>
                        <Zap className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">842</div>
                        <p className="text-xs text-muted-foreground">Good user experience</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Top Slowest Interactions</CardTitle>
                        <CardDescription>
                            Elements causing the most input delay for users.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={processedData} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" unit="ms" />
                                <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                                    formatter={(value: number) => [`${value}ms`, 'Avg Delay']}
                                />
                                <Bar dataKey="delay" radius={[0, 4, 4, 0]} barSize={32}>
                                    {processedData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Interaction Insights</CardTitle>
                        <CardDescription>Automated feedback based on click data.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {processedData.some(d => d.delay > 200) && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Heavy JavaScript Execution</AlertTitle>
                                <AlertDescription>
                                    Some buttons like <strong>{processedData[0].name}</strong> have delays over 200ms.
                                    This indicates the main thread is blocked by heavy event handlers.
                                    Try debouncing clicks or using <code>useTransition()</code>.
                                </AlertDescription>
                            </Alert>
                        )}
                        <Alert>
                            <Zap className="h-4 w-4" />
                            <AlertTitle>Good Response Time</AlertTitle>
                            <AlertDescription>
                                Navigation menu and search inputs are responding under 100ms. Great work tracking 'pointerdown' events.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InteractionPerformance;
