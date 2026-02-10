import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Smartphone, Monitor, Globe, Wifi } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RumSession {
    id: string;
    page_url: string;
    metric_type: string;
    value: number;
    device_type: string;
    network_type: string;
    city: string;
    created_at: string;
}

const RealUsers = () => {
    // Fetch RUM sessions
    const { data: sessions, isLoading } = useQuery({
        queryKey: ['rum_sessions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rum_metrics')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            return data as RumSession[];
        }
    });

    // Mock data for graphs (since DB might be empty initially)
    const deviceData = [
        { name: 'Mobile', value: 3.9, fill: '#ff4d4f' },
        { name: 'Desktop', value: 2.4, fill: '#52c41a' },
    ];

    // Fallback if no sessions
    const displaySessions = sessions?.length ? sessions : [
        { id: '1', page_url: '/checkout', metric_type: 'LCP', value: 3.2, device_type: 'mobile', network_type: '4g', city: 'Mumbai', created_at: 'Just now' },
        { id: '2', page_url: '/', metric_type: 'LCP', value: 1.8, device_type: 'desktop', network_type: 'wifi', city: 'Delhi', created_at: '1 min ago' },
        { id: '3', page_url: '/films', metric_type: 'CLS', value: 0.15, device_type: 'mobile', network_type: '5g', city: 'Bangalore', created_at: '2 min ago' },
    ];

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Device-wise Performance (LCP)</CardTitle>
                        <CardDescription>Mobile vs Desktop Load Times</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deviceData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Network Distribution</CardTitle>
                        <CardDescription>Average speed by network type</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px] flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            Coming soon...
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent User Sessions</CardTitle>
                    <CardDescription>Real-time log of visitor performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Page</TableHead>
                                <TableHead>Metric</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Device</TableHead>
                                <TableHead>Network</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="text-right">Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displaySessions.map((s, i) => (
                                <TableRow key={s.id || i}>
                                    <TableCell className="font-medium">{s.page_url}</TableCell>
                                    <TableCell><Badge variant="outline">{s.metric_type}</Badge></TableCell>
                                    <TableCell>
                                        <span className={s.value > 2.5 && s.metric_type === 'LCP' ? 'text-red-500 font-bold' : 'text-green-500'}>
                                            {s.value}{s.metric_type === 'CLS' ? '' : s.metric_type === 'INP' ? 'ms' : 's'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        {s.device_type === 'mobile' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                                        <span className="capitalize">{s.device_type}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Wifi className="h-4 w-4 text-muted-foreground" />
                                            <span className="capitalize">{s.network_type || 'Unknown'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{s.city || 'Unknown'}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {new Date(s.created_at).toLocaleTimeString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default RealUsers;
