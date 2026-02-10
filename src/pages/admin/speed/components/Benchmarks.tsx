import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Benchmarks = () => {
    const data = [
        { metric: 'LCP (s)', you: 2.4, amazon: 2.1, flipkart: 2.3 },
        { metric: 'CLS', you: 0.05, amazon: 0.02, flipkart: 0.04 },
        { metric: 'INP (ms)', you: 150, amazon: 120, flipkart: 180 }, // Scaled down effectively in chart? No, needs formatting
    ];

    // Separate chart for INP because scale is diff
    const inpData = [
        { name: 'Your Site', value: 150, fill: '#3b82f6' },
        { name: 'Amazon', value: 120, fill: '#10b981' },
        { name: 'Flipkart', value: 180, fill: '#f59e0b' },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Core Web Vitals vs Competitors</CardTitle>
                    <CardDescription>Comparing LCP (Loading Speed) against Industry Giants</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[data[0]]} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="metric" type="category" width={80} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Legend />
                            <Bar dataKey="you" name="Your Site" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="amazon" name="Amazon" fill="#10b981" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="flipkart" name="Flipkart" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Interaction Delay (INP)</CardTitle>
                        <CardDescription>Lower is better (ms)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={inpData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                <YAxis hide />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
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
