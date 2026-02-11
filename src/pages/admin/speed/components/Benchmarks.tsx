import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";

const Benchmarks = () => {
    const data = [
        { metric: 'LCP (s)', you: 2.4, amazon: 2.1, flipkart: 2.3 },
        { metric: 'CLS', you: 0.05, amazon: 0.02, flipkart: 0.04 },
        { metric: 'INP (ms)', you: 150, amazon: 120, flipkart: 180 },
    ];

    const inpData = [
        { name: 'Your Site', value: 150, fill: 'var(--color-you)' },
        { name: 'Amazon', value: 120, fill: 'var(--color-amazon)' },
        { name: 'Flipkart', value: 180, fill: 'var(--color-flipkart)' },
    ];

    const benchmarkConfig = {
        you: {
            label: "Your Site",
            color: "#3b82f6",
        },
        amazon: {
            label: "Amazon",
            color: "#10b981",
        },
        flipkart: {
            label: "Flipkart",
            color: "#f59e0b",
        },
    } satisfies ChartConfig;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Core Web Vitals vs Competitors</CardTitle>
                    <CardDescription>Comparing LCP (Loading Speed) against Industry Giants</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={benchmarkConfig} className="h-[300px] w-full">
                        <BarChart data={[data[0]]} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="metric"
                                type="category"
                                width={80}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="you" fill="var(--color-you)" radius={[0, 4, 4, 0]} barSize={20} />
                            <Bar dataKey="amazon" fill="var(--color-amazon)" radius={[0, 4, 4, 0]} barSize={20} />
                            <Bar dataKey="flipkart" fill="var(--color-flipkart)" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Interaction Delay (INP)</CardTitle>
                        <CardDescription>Lower is better (ms)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={benchmarkConfig} className="h-[250px] w-full">
                            <BarChart data={inpData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis hide />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="flex flex-col justify-center items-center bg-primary/5 border-primary/20">
                    <CardContent className="text-center pt-6">
                        <h3 className="text-lg font-semibold mb-2">Verdict</h3>
                        <p className="text-2xl font-bold text-primary mb-2">Competitive 🚀</p>
                        <p className="text-sm text-muted-foreground">
                            Your site is faster than Flipkart but slightly slower than Amazon on Desktop.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Benchmarks;
