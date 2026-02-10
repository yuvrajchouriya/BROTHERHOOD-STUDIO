import { supabase } from '@/integrations/supabase/client';
import {
    generateFingerprint,
    getDeviceType,
    getBrowser,
    getOS,
    getScreenResolution,
    getUTMParams,
    getReferrer,
    getInternalReferrerPath,
    getStoredVisitorId,
    setStoredVisitorId,
    getStoredSessionId,
    setStoredSessionId,
    getStoredFingerprint,
    setStoredFingerprint,
    isSessionExpired,
    clearSession,
    setSessionStart,
    updateLastActivity,
} from './analytics';

// Analytics tracker class
class AnalyticsTracker {
    private visitorId: string | null = null;
    private sessionId: string | null = null;
    private fingerprint: string = '';
    private pageStartTime: number = Date.now();
    private currentPath: string = '';
    private scrollDepth: number = 0;
    private initialized: boolean = false;

    async initialize() {
        if (this.initialized) return;

        // Check if session expired
        const storedSessionId = getStoredSessionId();
        if (storedSessionId && isSessionExpired()) {
            clearSession();
        }

        // Get or create fingerprint
        this.fingerprint = getStoredFingerprint() || generateFingerprint();
        setStoredFingerprint(this.fingerprint);

        // Initialize visitor and session
        await this.initVisitor();
        await this.initSession();

        // Setup tracking
        this.setupPageTracking();
        this.setupScrollTracking();
        this.setupUnloadTracking();

        this.initialized = true;
    }

    private async initVisitor() {
        const storedVisitorId = getStoredVisitorId();

        if (storedVisitorId) {
            this.visitorId = storedVisitorId;
            return;
        }

        try {
            const { data, error } = await supabase.functions.invoke('track-event', {
                body: {
                    action: 'create_visitor',
                    data: {
                        fingerprint: this.fingerprint,
                        device_type: getDeviceType(),
                        browser: getBrowser(),
                        os: getOS(),
                        screen_resolution: getScreenResolution(),
                        language: navigator.language,
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    },
                },
            });

            if (!error && data?.visitor_id) {
                this.visitorId = data.visitor_id;
                setStoredVisitorId(this.visitorId);
            }
        } catch (error) {
            console.error('Analytics: Failed to create visitor', error);
        }
    }

    private async initSession() {
        const storedSessionId = getStoredSessionId();

        if (storedSessionId && !isSessionExpired()) {
            this.sessionId = storedSessionId;
            updateLastActivity();
            return;
        }

        const utmParams = getUTMParams();
        const referrer = getReferrer();

        try {
            const { data, error } = await supabase.functions.invoke('track-event', {
                body: {
                    action: 'create_session',
                    data: {
                        visitor_id: this.visitorId,
                        landing_page: window.location.pathname,
                        referrer: referrer,
                        utm_source: utmParams.utm_source,
                        utm_medium: utmParams.utm_medium,
                        utm_campaign: utmParams.utm_campaign,
                    },
                },
            });

            if (!error && data?.session_id) {
                this.sessionId = data.session_id;
                setStoredSessionId(this.sessionId);
                setSessionStart(Date.now());
                updateLastActivity();
            }
        } catch (error) {
            console.error('Analytics: Failed to create session', error);
        }
    }

    private setupPageTracking() {
        this.currentPath = window.location.pathname;
        this.trackPageView();

        // Monitor path changes for SPA
        let lastPath = this.currentPath;
        setInterval(() => {
            const currentPath = window.location.pathname;
            if (currentPath !== lastPath) {
                this.updatePageView(); // Update previous page
                lastPath = currentPath;
                this.currentPath = currentPath;
                this.pageStartTime = Date.now();
                this.scrollDepth = 0;
                this.trackPageView(); // Track new page
            }
        }, 1000);
    }

    private setupScrollTracking() {
        let maxScroll = 0;
        const updateScroll = () => {
            const scrollPercentage = Math.min(
                100,
                Math.round(
                    ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
                )
            );
            maxScroll = Math.max(maxScroll, scrollPercentage);
            this.scrollDepth = maxScroll;
        };

        window.addEventListener('scroll', updateScroll, { passive: true });
        updateScroll(); // Initial scroll depth
    }

    private setupUnloadTracking() {
        const handleUnload = () => {
            this.updatePageView();
        };

        window.addEventListener('beforeunload', handleUnload);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                handleUnload();
            }
        });
    }

    private async trackPageView() {
        updateLastActivity();

        try {
            await supabase.functions.invoke('track-event', {
                body: {
                    action: 'track_pageview',
                    data: {
                        session_id: this.sessionId,
                        visitor_id: this.visitorId,
                        page_path: window.location.pathname,
                        page_title: document.title,
                        referrer_path: getInternalReferrerPath(),
                    },
                },
            });
        } catch (error) {
            console.error('Analytics: Failed to track pageview', error);
        }
    }

    private async updatePageView() {
        const timeOnPage = Math.round((Date.now() - this.pageStartTime) / 1000);
        updateLastActivity();

        try {
            await supabase.functions.invoke('track-event', {
                body: {
                    action: 'update_pageview',
                    data: {
                        session_id: this.sessionId,
                        page_path: this.currentPath,
                        time_on_page: timeOnPage,
                        scroll_depth: this.scrollDepth,
                    },
                },
            });
        } catch (error) {
            console.error('Analytics: Failed to update pageview', error);
        }
    }

    async trackEvent(
        eventType: string,
        elementId?: string,
        elementText?: string,
        metadata?: Record<string, unknown>
    ) {
        if (!this.initialized) {
            console.warn('Analytics not initialized');
            return;
        }

        updateLastActivity();

        try {
            await supabase.functions.invoke('track-event', {
                body: {
                    action: 'track_event',
                    data: {
                        session_id: this.sessionId,
                        visitor_id: this.visitorId,
                        page_path: window.location.pathname,
                        event_type: eventType,
                        element_id: elementId,
                        element_text: elementText,
                        metadata: metadata,
                    },
                },
            });
        } catch (error) {
            console.error('Analytics: Failed to track event', error);
        }
    }
}

// Singleton instance
const tracker = new AnalyticsTracker();

// Initialize analytics
export function initializeAnalytics() {
    if (typeof window === 'undefined') return;
    tracker.initialize();
}

// Public API for tracking events
export const trackAnalyticsEvent = {
    whatsappClick: (phone: string) => tracker.trackEvent('whatsapp_click', undefined, phone, { phone }),
    formSubmit: (formType: string, formData?: Record<string, unknown>) =>
        tracker.trackEvent('form_submit', undefined, formType, { form_type: formType, ...formData }),
    filmPlay: (filmId: string, filmTitle: string) =>
        tracker.trackEvent('film_play', filmId, filmTitle, { film_id: filmId, title: filmTitle }),
    galleryOpen: (galleryId: string, galleryTitle: string) =>
        tracker.trackEvent('gallery_open', galleryId, galleryTitle, { gallery_id: galleryId, title: galleryTitle }),
    serviceView: (serviceId: string, serviceTitle: string) =>
        tracker.trackEvent('service_view', serviceId, serviceTitle, { service_id: serviceId, title: serviceTitle }),
    planView: (planId: string, planName: string) =>
        tracker.trackEvent('plan_view', planId, planName, { plan_id: planId, name: planName }),
    linkClick: (url: string, text?: string) =>
        tracker.trackEvent('link_click', undefined, text, { url, text }),
};
