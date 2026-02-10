import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Settings, Server, Image as ImageIcon, FileCode, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const RootCauseInsights = () => {
    // 1. Fetch Key Metrics for Analysis
    const { data: metrics } = useQuery({
        queryKey: ['rum_root_cause'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rum_metrics')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(500);
            if (error) throw error;
            return data;
        }
    });

    // 2. Simple Mock Analysis Engine (In production, aggregated specific queries are better)
    // We will simulate "current state" based on last few data points or defaults
    const analysis = {
        lcp: 2800, // Bad > 2500
        cls: 0.05, // Good < 0.1
        inp: 240, // Needs Improvement > 200
        ttfb: 900, // Bad > 800
        longTasks: 12, // High
    };

    // 3. Generate Recommendations
    const insights = [];

    // LCP Rules
    if (analysis.lcp > 2500) {
        insights.push({
            type: 'CRITICAL',
            metric: 'LCP (Largest Contentful Paint)',
            value: `${(analysis.lcp / 1000).toFixed(1)}s`,
            icon: ImageIcon,
            title: 'Hero Image Optimization Required',
            description: 'Your LCP is high (2.8s). The largest element is likely an unoptimized image.',
            action: 'Convert Hero images to WebP/AVIF and add priority="high" attribute.',
            impact: 'High Impact (Speed Score +15)'
        });
    }

    // TTFB Rules
    if (analysis.ttfb > 800) {
        insights.push({
            type: 'WARNING',
            metric: 'TTFB (Time to First Byte)',
            value: `${analysis.ttfb}ms`,
            icon: Server,
            title: 'Slow Server Response',
            description: 'The server is taking too long to respond. DB queries might be unoptimized.',
            action: 'Check usage of getServerSideProps vs getStaticProps. Implement caching.',
            impact: 'Medium Impact'
        });
    }

    // INP Rules
    if (analysis.inp > 200 || analysis.longTasks > 5) {
        insights.push({
            type: 'WARNING',
            metric: 'INP (Interaction Next Paint)',
            value: `${analysis.inp}ms`,
            icon: FileCode,
            title: 'Main Thread Blocking',
            description: `We detected ${analysis.longTasks} Long Tasks (>50ms). This blocks user clicks.`,
            action: 'Code-split large bundles and use Web Workers for heavy computations.',
            impact: 'High Impact (UX Interaction)'
        });
    }

    // CLS Rules (Good case)
    if (analysis.cls < 0.1) {
        insights.push({
            type: 'SUCCESS',
            metric: 'CLS (Cumulative Layout Shift)',
            value: analysis.cls,
            icon: CheckCircle2,
            title: 'Visual Stability is Excellent',
            description: 'No significant layout shifts detected. Elements are stable.',
            action: 'Maintain current dimensions attributes on images.',
            impact: 'Keep up the good work'
        });
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {insights.map((insight, idx) => (
                    <Card key={idx} className={`border-l-4 ${insight.type === 'CRITICAL' ? 'border-l-red-500' :
                            insight.type === 'WARNING' ? 'border-l-yellow-500' : 'border-l-green-500'
                        }`}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <insight.icon className={`h-5 w-5 ${insight.type === 'CRITICAL' ? 'text-red-500' :
                                            insight.type === 'WARNING' ? 'text-yellow-500' : 'text-green-500'
                                        }`} />
                                    {insight.title}
                                </CardTitle>
                            </div>
                            <CardDescription className="font-mono text-xs">
                                Problem Source: {insight.metric} = {insight.value}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted/50 p-3 rounded-md text-sm mb-4">
                                <span className="font-semibold block mb-1">Diagnosis:</span>
                                {insight.description}
                            </div>
                            <div className="flex items-start gap-2 text-sm">
                                <Lightbulb className="h-4 w-4 text-[hsl(190,100%,50%)] mt-0.5 shrink-0" />
                                <div>
                                    <span className="font-semibold text-[hsl(190,100%,50%)]">Suggested Fix:</span>
                                    <p className="text-muted-foreground mt-0.5">{insight.action}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t text-xs font-semibold text-muted-foreground text-right w-full">
                                {insight.impact}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Automated Performance Audit Logic
                    </CardTitle>
                    <CardDescription>
                        How our system analyzes your site speed 24/7.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4 text-center">
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-bold text-2xl text-red-500">&gt; 2.5s</h4>
                            <p className="text-sm text-muted-foreground">LCP Threshold</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-bold text-2xl text-yellow-500">&gt; 200ms</h4>
                            <p className="text-sm text-muted-foreground">INP Threshold</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-bold text-2xl text-yellow-500">&gt; 0.1</h4>
                            <p className="text-sm text-muted-foreground">CLS Threshold</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-bold text-2xl text-red-500">&gt; 5</h4>
                            <p className="text-sm text-muted-foreground">Long Tasks / min</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RootCauseInsights;
