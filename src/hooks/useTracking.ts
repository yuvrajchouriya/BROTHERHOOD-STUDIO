import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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
  setSessionStart,
  updateLastActivity,
  isSessionExpired,
  clearSession,
  getSessionDuration,
  type ClickEventData,
} from '@/lib/analytics';

interface UseTrackingReturn {
  trackEvent: (eventType: ClickEventData['event_type'], elementId?: string, elementText?: string, metadata?: Record<string, unknown>) => void;
  trackPageView: () => void;
}

export function useTracking(): UseTrackingReturn {
  const location = useLocation();
  const isInitialized = useRef(false);
  const currentPageRef = useRef<string>('');
  const pageStartTimeRef = useRef<number>(Date.now());
  const maxScrollDepthRef = useRef<number>(0);
  const visitorIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Initialize or retrieve visitor
  const initializeVisitor = useCallback(async (): Promise<string | null> => {
    try {
      let fingerprint = getStoredFingerprint();
      if (!fingerprint) {
        fingerprint = generateFingerprint();
        setStoredFingerprint(fingerprint);
      }

      let visitorId = getStoredVisitorId();

      if (!visitorId) {
        // Create new visitor
        const visitorData = {
          fingerprint,
          device_type: getDeviceType(),
          browser: getBrowser(),
          os: getOS(),
          screen_resolution: getScreenResolution(),
        };

        const { data, error } = await supabase
          .from('visitors')
          .upsert(visitorData, { onConflict: 'fingerprint' })
          .select('id')
          .single();

        if (error) {
          console.error('Error creating visitor:', error);
          return null;
        }

        visitorId = data.id;
        setStoredVisitorId(visitorId);
      } else {
        // Update last visit
        // Use a safe update that doesn't fail if visitor doesn't exist
        const { error } = await supabase
          .from('visitors')
          .update({
            last_visit: new Date().toISOString(),
          })
          .eq('id', visitorId);

        if (error) {
          console.warn("Failed to update visitor last_visit", error);
        }
      }

      visitorIdRef.current = visitorId;
      return visitorId;
    } catch (error) {
      console.error('Error initializing visitor:', error);
      return null;
    }
  }, []);

  // Initialize or retrieve session
  const initializeSession = useCallback(async (visitorId: string): Promise<string | null> => {
    try {
      let sessionId = getStoredSessionId();

      // Check if session is expired or doesn't exist
      if (!sessionId || isSessionExpired()) {
        // End previous session if exists
        if (sessionId) {
          const duration = getSessionDuration();
          await supabase
            .from('sessions')
            .update({
              ended_at: new Date().toISOString(),
              duration_seconds: duration,
              is_active: false,
              exit_page: currentPageRef.current || location.pathname
            })
            .eq('id', sessionId);
        }

        clearSession();

        // Create new session
        const utmParams = getUTMParams();
        const sessionData = {
          visitor_id: visitorId,
          entry_page: location.pathname,
          referrer: getReferrer(),
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
          is_active: true,
        };

        const { data, error } = await supabase
          .from('sessions')
          .insert(sessionData)
          .select('id')
          .single();

        if (error) {
          console.error('Error creating session:', error);
          return null;
        }

        sessionId = data.id;
        setStoredSessionId(sessionId);
        setSessionStart(Date.now());
      }

      updateLastActivity();
      sessionIdRef.current = sessionId;
      return sessionId;
    } catch (error) {
      console.error('Error initializing session:', error);
      return null;
    }
  }, [location.pathname]);

  // Track page view
  const trackPageView = useCallback(async () => {
    if (!visitorIdRef.current || !sessionIdRef.current) return;

    try {
      const pageViewData = {
        session_id: sessionIdRef.current,
        visitor_id: visitorIdRef.current,
        page_path: location.pathname,
        page_title: document.title,
        referrer_path: getInternalReferrerPath(),
      };

      await supabase.from('page_views').insert(pageViewData);

      // Update session page count
      await supabase
        .from('sessions')
        .update({ page_count: supabase.rpc ? undefined : undefined })
        .eq('id', sessionIdRef.current);

      // Reset page metrics
      pageStartTimeRef.current = Date.now();
      maxScrollDepthRef.current = 0;
      currentPageRef.current = location.pathname;
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }, [location.pathname]);

  // Track click events
  const trackEvent = useCallback(async (
    eventType: ClickEventData['event_type'],
    elementId?: string,
    elementText?: string,
    metadata?: Record<string, unknown>
  ) => {
    // If tracking failed to init, silently return
    if (!visitorIdRef.current || !sessionIdRef.current) return;

    try {
      await supabase.from('click_events').insert([{
        session_id: sessionIdRef.current,
        visitor_id: visitorIdRef.current,
        page_path: location.pathname,
        event_type: eventType as string,
        element_id: elementId || null,
        element_text: elementText || null,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : {},
      }]);
    } catch (error) {
      // Catch all errors (network, supabase, serialization) to prevent app crash
      console.error('Error tracking event:', error);
    }
  }, [location.pathname]);

  // Update page metrics (time on page, scroll depth)
  const updatePageMetrics = useCallback(async () => {
    if (!sessionIdRef.current || !currentPageRef.current) return;

    try {
      const timeOnPage = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);

      // Update the last page view with time and scroll data
      await supabase
        .from('page_views')
        .update({
          time_on_page: timeOnPage,
          scroll_depth: maxScrollDepthRef.current,
        })
        .eq('session_id', sessionIdRef.current)
        .eq('page_path', currentPageRef.current)
        .order('viewed_at', { ascending: false })
        .limit(1);
    } catch (error) {
      console.error('Error updating page metrics:', error);
    }
  }, []);

  // End session
  const endSession = useCallback(async () => {
    if (!sessionIdRef.current) return;

    try {
      await updatePageMetrics();

      const duration = getSessionDuration();
      await supabase
        .from('sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: duration,
          is_active: false,
          exit_page: currentPageRef.current || location.pathname,
        })
        .eq('id', sessionIdRef.current);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, [location.pathname, updatePageMetrics]);

  // Initialize tracking
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const init = async () => {
      const visitorId = await initializeVisitor();
      if (visitorId) {
        await initializeSession(visitorId);
        await trackPageView();
      }
    };

    init();

    // Handle visibility change (tab switch/close)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        updatePageMetrics();
      }
    };

    // Handle before unload (page close)
    const handleBeforeUnload = () => {
      endSession();
    };

    // Track scroll depth
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = scrollHeight > 0
        ? Math.round((window.scrollY / scrollHeight) * 100)
        : 100;

      if (scrollDepth > maxScrollDepthRef.current) {
        maxScrollDepthRef.current = scrollDepth;
      }

      updateLastActivity();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [initializeVisitor, initializeSession, trackPageView, updatePageMetrics, endSession]);

  // Track page changes
  useEffect(() => {
    if (!isInitialized.current || !visitorIdRef.current) return;

    // Update metrics for previous page before tracking new one
    if (currentPageRef.current && currentPageRef.current !== location.pathname) {
      updatePageMetrics();
    }

    trackPageView();
  }, [location.pathname, trackPageView, updatePageMetrics]);

  return { trackEvent, trackPageView };
}
