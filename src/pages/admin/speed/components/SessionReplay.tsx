import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, MousePointer2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReplayEvent {
    t: number;
    e: 'move' | 'click' | 'scroll';
    x?: number;
    y?: number;
    tag?: string;
}

const SessionReplay = () => {
    const [selectedJourney, setSelectedJourney] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const playbackRef = useRef<number | null>(null);

    // Canvas Refs
    const cursorRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 1. Fetch Journeys with Replays
    const { data: journeys } = useQuery({
        queryKey: ['replay_journeys'],
        queryFn: async () => {
            // Join not natively supported in simple client query nicely without types, 
            // so fetching recent journeys and we'll see if they have events.
            const { data } = await supabase
                .from('rum_journeys')
                .select('id, start_time, entry_page, device_type')
                .order('start_time', { ascending: false })
                .limit(10);
            return data;
        }
    });

    // 2. Fetch Events for Selected Journey
    const { data: eventsData } = useQuery({
        queryKey: ['replay_events', selectedJourney],
        queryFn: async () => {
            if (!selectedJourney) return null;
            const { data } = await supabase
                .from('rum_replay_events')
                .select('events_chunk')
                .eq('journey_id', selectedJourney)
                .order('created_at', { ascending: true });

            // Flatten chunks
            const allEvents = data?.flatMap(d => d.events_chunk as ReplayEvent[]) || [];
            return allEvents;
        },
        enabled: !!selectedJourney
    });

    useEffect(() => {
        if (eventsData?.length) {
            const start = eventsData[0].t;
            const end = eventsData[eventsData.length - 1].t;
            setDuration(end - start);
            setCurrentTime(0);
        }
    }, [eventsData]);

    // Playback Loop
    useEffect(() => {
        if (isPlaying) {
            const startTime = Date.now() - currentTime;
            playbackRef.current = window.setInterval(() => {
                const now = Date.now();
                let nextTime = now - startTime;
                if (nextTime >= duration) {
                    nextTime = duration;
                    setIsPlaying(false);
                }
                setCurrentTime(nextTime);
            }, 50);
        } else {
            if (playbackRef.current) clearInterval(playbackRef.current);
        }
        return () => { if (playbackRef.current) clearInterval(playbackRef.current) };
    }, [isPlaying, duration]);

    // Render Frame Logic
    const currentFrame = eventsData?.find(e => (e.t - (eventsData[0]?.t || 0)) >= currentTime);

    useEffect(() => {
        if (currentFrame && cursorRef.current && containerRef.current) {
            if (currentFrame.e === 'move' || currentFrame.e === 'click') {
                cursorRef.current.style.transform = `translate(${currentFrame.x}px, ${currentFrame.y}px)`;
                if (currentFrame.e === 'click') {
                    cursorRef.current.classList.add('scale-150', 'bg-red-500');
                    setTimeout(() => cursorRef.current?.classList.remove('scale-150', 'bg-red-500'), 200);
                }
            }
            if (currentFrame.e === 'scroll') {
                // Visualize scroll (rudimentary)
                // containerRef.current.scrollTop = currentFrame.y || 0;
            }
        }
    }, [currentTime, currentFrame]);


    return (
        <div className="grid gap-6 md:grid-cols-4 h-[600px]">
            {/* Sidebar List */}
            <Card className="col-span-1 h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="text-sm">Select Session</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-2 space-y-2">
                    {journeys?.map(j => (
                        <div
                            key={j.id}
                            onClick={() => setSelectedJourney(j.id)}
                            className={`p-3 rounded text-sm cursor-pointer border hover:bg-accent ${selectedJourney === j.id ? 'bg-accent border-primary' : ''}`}
                        >
                            <div className="font-semibold truncate">{j.entry_page}</div>
                            <div className="text-xs text-muted-foreground flex justify-between mt-1">
                                <span>{j.device_type}</span>
                                <span>{new Date(j.start_time).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Replay Player */}
            <Card className="col-span-3 h-full flex flex-col relative overflow-hidden bg-slate-950">
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <Button size="icon" variant="secondary" onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <div className="bg-background/80 px-3 py-2 rounded text-xs font-mono backdrop-blur">
                        {Math.floor(currentTime / 1000)}s / {Math.floor(duration / 1000)}s
                    </div>
                </div>

                {/* Viewport Simulation */}
                <div ref={containerRef} className="flex-1 relative bg-white m-12 rounded shadow-2xl overflow-hidden border">
                    {selectedJourney ? (
                        <>
                            <div className="absolute top-0 w-full h-8 bg-gray-100 border-b flex items-center px-4 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                </div>
                                <div className="flex-1 bg-white h-5 rounded text-[10px] flex items-center px-2 text-gray-400 mx-4">
                                    https://brotherhoodstudio.com...
                                </div>
                            </div>

                            {/* The Page Content Placeholder */}
                            <div className="mt-8 p-8 opacity-50 pointer-events-none grayscale">
                                <h1 className="text-4xl font-bold text-gray-300">Session Replay</h1>
                                <div className="h-4 w-3/4 bg-gray-100 mt-4 rounded"></div>
                                <div className="h-4 w-1/2 bg-gray-100 mt-2 rounded"></div>
                                <div className="grid grid-cols-3 gap-4 mt-8">
                                    <div className="h-32 bg-gray-50 rounded border"></div>
                                    <div className="h-32 bg-gray-50 rounded border"></div>
                                    <div className="h-32 bg-gray-50 rounded border"></div>
                                </div>
                                <p className="mt-8 text-center text-gray-400">
                                    (Visual approximation of user screen)
                                </p>
                            </div>

                            {/* The Cursor */}
                            <div
                                ref={cursorRef}
                                className="absolute top-0 left-0 w-6 h-6 pointer-events-none transition-transform duration-75 z-50"
                                style={{ willChange: 'transform' }}
                            >
                                <MousePointer2 className="h-6 w-6 text-black fill-white drop-shadow-md" />
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Select a session to replay
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default SessionReplay;
