import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const LocationNetwork = () => {
    const cityData = [
        { city: 'Delhi', loadTime: 2.4 },
        { city: 'Mumbai', loadTime: 2.1 },
        { city: 'Bangalore', loadTime: 1.9 },
        { city: 'Patna', loadTime: 3.9 },
        { city: 'Raipur', loadTime: 3.1 },
    ];

    const networkData = [
        { type: '4G', speed: 2.8 },
        { type: '5G', speed: 1.6 },
        { type: 'WiFi', speed: 1.2 },
        { type: '3G', speed: 4.5 },
    ];

    const cityChartConfig = {
        loadTime: {
            label: "Load Time (s)",
            color: "hsl(var(--primary))",
        },
    } satisfies ChartConfig;

    const networkChartConfig = {
        speed: {
            label: "Speed (s)",
            color: "hsl(var(--chart-2))",
        },
    } satisfies ChartConfig;

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>City-wise Latency</CardTitle>
                    <CardDescription>Avg Load Time (s) by Location</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={cityChartConfig} className="h-[300px] w-full">
                        <BarChart data={cityData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="city"
                                type="category"
                                width={80}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar
                                dataKey="loadTime"
                                fill="var(--color-loadTime)"
                                radius={[0, 4, 4, 0]}
                                barSize={20}
                            />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Network Performance</CardTitle>
                    <CardDescription>Avg Load Time (s) by Connection Type</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={networkChartConfig} className="h-[300px] w-full">
                        <BarChart data={networkData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="type"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis hide />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar
                                dataKey="speed"
                                fill="var(--color-speed)"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default LocationNetwork;
