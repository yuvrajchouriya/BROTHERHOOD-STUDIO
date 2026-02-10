import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Badge } from "@/components/ui/badge";

const PagePerformance = () => {
    // Mock Data (In real app, we fetch from 'rum_metrics' grouped by page_url)
    const pageData = [
        { page: '/checkout', loadTime: 5.1, status: 'poor' },
        { page: '/films', loadTime: 3.8, status: 'needs-improvement' },
        { page: '/services/wedding', loadTime: 3.2, status: 'needs-improvement' },
        { page: '/', loadTime: 2.6, status: 'good' },
        { page: '/contact', loadTime: 1.8, status: 'good' },
        { page: '/about', loadTime: 1.5, status: 'good' },
    ];

    const getColor = (time: number) => {
        if (time > 4) return '#ef4444'; // Red
        if (time > 2.5) return '#eab308'; // Yellow
        return '#22c55e'; // Green
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Page Load Time Analysis</CardTitle>
                    <CardDescription>Average load time per page (s)</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={pageData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis
                                dataKey="page"
                                type="category"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                width={120}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                            />
                            <Bar dataKey="loadTime" radius={[0, 4, 4, 0]} barSize={30}>
                                {pageData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getColor(entry.loadTime)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pageData.map((page) => (
                    <Card key={page.page}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-base font-medium truncate" title={page.page}>{page.page}</CardTitle>
                                <Badge variant={page.status === 'good' ? 'secondary' : page.status === 'poor' ? 'destructive' : 'outline'}>
                                    {page.status === 'needs-improvement' ? 'Avg' : page.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{page.loadTime}s</div>
                            <p className="text-xs text-muted-foreground">Avg Load Time</p>

                            <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${Math.min((page.loadTime / 6) * 100, 100)}%`,
                                        backgroundColor: getColor(page.loadTime)
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default PagePerformance;
