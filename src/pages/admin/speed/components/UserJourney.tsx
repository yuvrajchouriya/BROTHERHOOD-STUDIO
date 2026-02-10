import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, Clock, MapPin, Monitor, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Journey {
    id: string;
    entry_page: string;
    exit_page: string;
    step_count: number;
    total_duration_sec: number;
    device_type: string;
    country: string;
    start_time: string;
    status: string;
}

const UserJourney = () => {
    // Fetch recent journeys
    const { data: journeys, isLoading } = useQuery({
        queryKey: ['rum_journeys'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rum_journeys')
                .select('*')
                .order('start_time', { ascending: false })
                .limit(20);
            if (error) throw error;
            return data as Journey[];
        }
    });

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active Journeys</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{journeys?.filter(j => j.status === 'active').length || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg Journey Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {journeys?.length
                                ? Math.round(journeys.reduce((acc, curr) => acc + (curr.step_count || 1), 0) / journeys.length)
                                : 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Bounce Rate (Est)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {journeys?.length
                                ? Math.round((journeys.filter(j => j.step_count === 1).length / journeys.length) * 100)
                                : 0}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent User Journeys</CardTitle>
                    <CardDescription>
                        Track where users enter, navigate, and drop off.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-4">
                            {journeys?.map((journey) => (
                                <div key={journey.id} className="flex flex-col gap-2 p-4 border rounded-lg bg-card/50 hover:bg-accent/5 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={journey.status === 'active' ? 'default' : 'secondary'} className="uppercase text-[10px]">
                                                {journey.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(journey.start_time), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><Monitor className="h-3 w-3" /> {journey.device_type}</span>
                                            <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {journey.country || 'Unknown'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm mt-2 flex-wrap">
                                        <div className="flex items-center gap-2 p-2 bg-background/50 rounded border text-xs">
                                            <MapPin className="h-3 w-3 text-green-500" />
                                            <span className="font-mono text-green-500">{journey.entry_page}</span>
                                        </div>

                                        <ArrowRight className="h-4 w-4 text-muted-foreground/50" />

                                        <div className="flex items-center gap-1 text-xs text-muted-foreground px-2">
                                            {journey.step_count > 2 && <span className="font-bold">... {journey.step_count - 2} steps ...</span>}
                                        </div>

                                        {journey.step_count > 1 && <ArrowRight className="h-4 w-4 text-muted-foreground/50" />}

                                        <div className="flex items-center gap-2 p-2 bg-background/50 rounded border text-xs">
                                            <MapPin className="h-3 w-3 text-red-500" />
                                            <span className="font-mono text-red-500">{journey.exit_page || journey.entry_page}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {!journeys?.length && (
                                <div className="text-center py-10 text-muted-foreground">
                                    No journeys recorded yet. Visit the site to generate data.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserJourney;
