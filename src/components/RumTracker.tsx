import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RumTracker = () => {
    const location = useLocation();

    // Helper to get or create Journey ID (Session ID)
    const getJourneyId = () => {
        if (typeof window === 'undefined') return null;
        let jid = sessionStorage.getItem('rum_journey_id');
        if (!jid) {
            jid = crypto.randomUUID();
            sessionStorage.setItem('rum_journey_id', jid);
            // Track Journey Start
            sendMetric({
                type: 'JOURNEY_START',
                journey_id: jid,
                page_url: window.location.pathname,
                referrer: document.referrer
            });
        }
        return jid;
    };

    useEffect(() => {
        const journeyId = getJourneyId();

        // Track Page View as Journey Event
        if (journeyId) {
            sendMetric({
                type: 'JOURNEY_EVENT',
                journey_id: journeyId,
                event_type: 'page_view',
                page_url: window.location.pathname
            });
        }

        // 1. Core Web Vitals Observer
        const observeWebVitals = () => {
            try {
                // LCP
                new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        sendMetric({
                            type: 'RUM_METRIC',
                            metric_type: 'LCP',
                            value: entry.startTime / 1000, // seconds
                            page_url: window.location.pathname,
                        });
                    }
                }).observe({ type: 'largest-contentful-paint', buffered: true, passive: true });

                // CLS
                new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        // @ts-ignore - layout-shift is fully supported but sometimes missing in standard TS lib
                        if (!entry.hadRecentInput) {
                            // @ts-ignore
                            sendMetric({
                                type: 'RUM_METRIC',
                                metric_type: 'CLS',
                                // @ts-ignore
                                value: entry.value,
                                page_url: window.location.pathname,
                            });
                        }
                    }
                }).observe({ type: 'layout-shift', buffered: true });

                // INP (Approximated by first-input for simplicity if full INP not avail, but let's try generic)
                // Note: INP requires more complex logic often, using 'event' timing. 
                // For simplicity and stability, we'll skip complex INP polyfill here and stick to native if available or just LCP/CLS/Resource.

            } catch (e) {
                console.warn('RUM Observer Error:', e);
            }
        };

        // 2. Resource Timing Observer
        const observeResources = () => {
            // Only capture heavy resources > 500ms to save bandwidth
            const resourceObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    const resourceEntry = entry as PerformanceResourceTiming;
                    if (resourceEntry.duration > 500) {
                        sendMetric({
                            type: 'RESOURCE_METRIC',
                            resource_name: resourceEntry.name.split('/').pop() || resourceEntry.name, // Just filename
                            resource_type: resourceEntry.initiatorType,
                            duration: resourceEntry.duration,
                            initiator_type: resourceEntry.initiatorType,
                            transfer_size: resourceEntry.transferSize || 0,
                            is_cache_hit: resourceEntry.transferSize === 0, // Rough check
                            page_url: window.location.pathname,
                        });
                    }
                });
            });
            resourceObserver.observe({ type: 'resource', buffered: true });
        };

        // 3. Long Task Observer (Main Thread Blocking)
        const observeLongTasks = () => {
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        sendMetric({
                            type: 'RUM_METRIC',
                            metric_type: 'LONG_TASK',
                            value: entry.duration,
                            page_url: window.location.pathname,
                            metadata: {
                                start_time: entry.startTime,
                                attribution: JSON.stringify(entry.attribution || [])
                            }
                        });
                    });
                });
                longTaskObserver.observe({ type: 'longtask', buffered: true });
            } catch (e) {
                console.warn('Long Task Observer not supported');
            }
        };

        // 4. Interaction Tracking (Clicks & input delays)
        const observeInteractions = () => {
            // Simple First Input Delay (FID) polyfill-ish approach or just click listener
            // For advanced INP: use 'event' timing. Here we use 'event' timing observer if supported.
            try {
                const eventObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        // @ts-ignore - interactionId/processingStart are part of Event Timing API
                        if (entry.interactionId) { // FIlter for meaningful interactions
                            sendMetric({
                                type: 'RUM_METRIC',
                                metric_type: 'INTERACTION', // Represents INP candidate
                                value: entry.duration,
                                page_url: window.location.pathname,
                                metadata: {
                                    event_name: entry.name,
                                    // @ts-ignore
                                    processing_start: entry.processingStart,
                                    // @ts-ignore
                                    processing_end: entry.processingEnd,
                                    input_delay: (entry as any).processingStart - entry.startTime,
                                    element_selector: (entry as any).target ? (entry as any).target.tagName : 'UNKNOWN'
                                }
                            });
                        }
                    });
                });
                eventObserver.observe({ type: 'event', durationThreshold: 16 } as any); // 16ms to catch any frame drop
            } catch (e) {
                // Fallback: Click listener for basic tracking
                document.addEventListener('click', (e) => {
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'BUTTON' || target.closest('button') || target.tagName === 'A') {
                        // We can't easily measure Duration here without Event Timing API, but we can log occurrence
                    }
                }, { passive: true });
            }
        };

        // 5. Session Replay Recorder (Lightweight)
        const recordSession = () => {
            if (!journeyId) return;

            const events: any[] = [];
            const FLUSH_INTERVAL = 5000; // Send every 5 seconds

            // Throttled listener
            let lastScroll = 0;
            const scrollListener = () => {
                const now = Date.now();
                if (now - lastScroll > 500) { // Max 2 per sec
                    events.push({ t: now, e: 'scroll', y: window.scrollY });
                    lastScroll = now;
                }
            };

            let lastMove = 0;
            const moveListener = (e: MouseEvent) => {
                const now = Date.now();
                if (now - lastMove > 200) { // Max 5 per sec
                    events.push({ t: now, e: 'move', x: e.clientX, y: e.clientY });
                    lastMove = now;
                }
            }

            const clickListener = (e: MouseEvent) => {
                events.push({
                    t: Date.now(),
                    e: 'click',
                    x: e.clientX,
                    y: e.clientY,
                    tag: (e.target as HTMLElement).tagName
                });
            }

            window.addEventListener('scroll', scrollListener, { passive: true });
            window.addEventListener('mousemove', moveListener, { passive: true });
            window.addEventListener('click', clickListener, { passive: true });

            // Flush Interval
            const interval = setInterval(() => {
                if (events.length > 0) {
                    const chunk = [...events];
                    events.length = 0; // Clear buffer
                    sendMetric({
                        type: 'REPLAY_CHUNK',
                        journey_id: journeyId,
                        events_chunk: chunk
                    });
                }
            }, FLUSH_INTERVAL);

            // Cleanup
            return () => {
                window.removeEventListener('scroll', scrollListener);
                window.removeEventListener('mousemove', moveListener);
                window.removeEventListener('click', clickListener);
                clearInterval(interval);
            }
        };

        // Helper to send data via Beacon
        const sendMetric = (data: any) => {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            if (!supabaseUrl) return;

            // Construct function URL: https://project.supabase.co -> https://project.supabase.co/functions/v1/rum-ingest
            const functionUrl = `${supabaseUrl}/functions/v1/rum-ingest`;

            // Enrich data with common fields
            const payload = {
                ...data,
                // Add journey_id if not present (for non-journey metrics)
                journey_id: data.journey_id || journeyId,
                device_type: getDeviceType(),
                network_type: (navigator as any).connection?.effectiveType || 'unknown',
                browser: getBrowser(),
                metadata: data.metadata || {}
            };

            navigator.sendBeacon(functionUrl, JSON.stringify(payload));
        };

        const cleanupReplay = recordSession();

        if (typeof window !== 'undefined') {
            observeWebVitals();
            observeResources();
            observeLongTasks();
            observeInteractions();
        }

        return () => {
            if (cleanupReplay) cleanupReplay();
        }

    }, [location.pathname]); // Re-run observers on route change (basic approach)

    // Metadata Helpers
    const getDeviceType = () => {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "tablet";
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "mobile";
        return "desktop";
    };

    const getBrowser = () => {
        if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) return 'Opera';
        else if (navigator.userAgent.indexOf("Chrome") != -1) return 'Chrome';
        else if (navigator.userAgent.indexOf("Safari") != -1) return 'Safari';
        else if (navigator.userAgent.indexOf("Firefox") != -1) return 'Firefox';
        else if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!(document as any).documentMode == true)) return 'IE';
        else return 'Unknown';
    }

    return null; // Headless component
};

export default RumTracker;
