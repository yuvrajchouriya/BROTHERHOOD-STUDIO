import { createContext, useContext, type ReactNode } from 'react';
import { useTracking } from '@/hooks/useTracking';

interface TrackingContextValue {
  trackEvent: (
    eventType: 'whatsapp_click' | 'form_submit' | 'film_play' | 'gallery_open' | 'service_view' | 'plan_view' | 'link_click',
    elementId?: string,
    elementText?: string,
    metadata?: Record<string, unknown>
  ) => void;
}

const TrackingContext = createContext<TrackingContextValue | null>(null);

interface TrackingProviderProps {
  children: ReactNode;
}

export function TrackingProvider({ children }: TrackingProviderProps) {
  const { trackEvent } = useTracking();

  return (
    <TrackingContext.Provider value={{ trackEvent }}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTrackingContext() {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTrackingContext must be used within a TrackingProvider');
  }
  return context;
}

// Export a hook that safely returns trackEvent or a no-op function
export function useTrackEvent() {
  const context = useContext(TrackingContext);
  
  const noOp = () => {};
  
  if (!context) {
    return noOp;
  }
  
  return context.trackEvent;
}
