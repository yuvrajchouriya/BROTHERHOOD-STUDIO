import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layers, Image as ImageIcon, FileCode, Database } from "lucide-react";

const MicroLevel = () => {
    // Mock Resource Data (Simulating what 'resource_metrics' would return)
    const resources = [
        { name: 'hero-banner.jpg', type: 'image', duration: 1600, size: '2.4 MB', initiator: 'img', impact: 'high' },
        { name: 'main.bundle.js', type: 'script', duration: 900, size: '450 KB', initiator: 'script', impact: 'medium' },
        { name: 'analytics.js', type: 'script', duration: 700, size: '120 KB', initiator: 'script', impact: 'low' },
        { name: 'inter-font.woff2', type: 'font', duration: 400, size: '45 KB', initiator: 'css', impact: 'low' },
        { name: 'styles.css', type: 'css', duration: 350, size: '85 KB', initiator: 'link', impact: 'medium' },
        { name: 'api/user/profile', type: 'fetch', duration: 1200, size: '1.2 KB', initiator: 'fetch', impact: 'high' },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'image': return <ImageIcon className="h-4 w-4 text-blue-500" />;
            case 'script': return <FileCode className="h-4 w-4 text-yellow-500" />;
            case 'fetch': return <Database className="h-4 w-4 text-purple-500" />;
            default: return <Layers className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-2 md:col-span-1">
                    <CardHeader>
                        <CardTitle>Resource Impact Analysis</CardTitle>
                        <CardDescription>Top slowing down resources</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {resources.map((res, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 truncate max-w-[70%]">
                                            {getIcon(res.type)}
                                            <span className="font-medium truncate" title={res.name}>{res.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{res.duration}ms</span>
                                        </div>
                                    </div>
                                    <Progress
                                        value={(res.duration / 2000) * 100}
                                        className={`h-2 ${res.duration > 1000 ? 'bg-red-100 dark:bg-red-900' : 'bg-secondary'}`}
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{res.size} • {res.initiator}</span>
                                        {res.duration > 1000 && <span className="text-red-500 font-semibold">High Impact</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Optimization Suggestions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border rounded-lg bg-yellow-500/10 border-yellow-500/20">
                                <h4 className="font-semibold text-yellow-600 mb-1">Compress Images</h4>
                                <p className="text-sm text-yellow-600/80">
                                    `hero-banner.jpg` is 2.4 MB. Converting to WebP could save ~1.8 MB.
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg bg-blue-500/10 border-blue-500/20">
                                <h4 className="font-semibold text-blue-600 mb-1">Defer Blocking JS</h4>
                                <p className="text-sm text-blue-600/80">
                                    `main.bundle.js` blocks rendering for 900ms. Consider `defer` or `async`.
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg bg-purple-500/10 border-purple-500/20">
                                <h4 className="font-semibold text-purple-600 mb-1">Slow API Calls</h4>
                                <p className="text-sm text-purple-600/80">
                                    `api/user/profile` takes 1.2s. Check database indexing.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cache Status (Last 1 Hour)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Cache Hit Rate</span>
                                <span className="text-xl font-bold">84%</span>
                            </div>
                            <Progress value={84} className="h-3" />
                            <p className="text-xs text-muted-foreground mt-2">
                                16% of resources were fetched from origin server.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MicroLevel;
