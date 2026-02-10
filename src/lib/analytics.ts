// Analytics utility functions for tracking system

export interface VisitorData {
  fingerprint: string;
  device_type: string;
  browser: string;
  os: string;
  screen_resolution: string;
  country?: string;
  city?: string;
  region?: string;
}

export interface SessionData {
  id?: string;
  visitor_id: string;
  entry_page: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

export interface PageViewData {
  session_id: string;
  visitor_id: string;
  page_path: string;
  page_title: string;
  referrer_path: string | null;
}

export interface ClickEventData {
  session_id: string;
  visitor_id: string;
  page_path: string;
  event_type: 'whatsapp_click' | 'form_submit' | 'film_play' | 'gallery_open' | 'service_view' | 'plan_view' | 'link_click';
  element_id?: string;
  element_text?: string;
  metadata?: Record<string, unknown>;
}

// Generate a simple browser fingerprint
export function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    screen.width + 'x' + screen.height,
    screen.colorDepth?.toString() || '',
    navigator.hardwareConcurrency?.toString() || '',
    navigator.maxTouchPoints?.toString() || '',
  ];
  
  // Create a simple hash
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36) + Date.now().toString(36).slice(-4);
}

// Detect device type
export function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// Detect browser
export function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung Browser';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Trident')) return 'Internet Explorer';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Edg')) return 'Edge Chromium';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Unknown';
}

// Detect OS
export function getOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown';
}

// Get screen resolution
export function getScreenResolution(): string {
  return `${screen.width}x${screen.height}`;
}

// Get UTM parameters from URL
export function getUTMParams(): { utm_source: string | null; utm_medium: string | null; utm_campaign: string | null } {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
  };
}

// Get referrer
export function getReferrer(): string | null {
  const referrer = document.referrer;
  if (!referrer) return null;
  
  try {
    const url = new URL(referrer);
    // Don't count internal referrers
    if (url.hostname === window.location.hostname) {
      return null;
    }
    return url.hostname;
  } catch {
    return referrer;
  }
}

// Get internal referrer path
export function getInternalReferrerPath(): string | null {
  const referrer = document.referrer;
  if (!referrer) return null;
  
  try {
    const url = new URL(referrer);
    if (url.hostname === window.location.hostname) {
      return url.pathname;
    }
    return null;
  } catch {
    return null;
  }
}

// Session storage keys
const STORAGE_KEYS = {
  VISITOR_ID: 'bs_visitor_id',
  SESSION_ID: 'bs_session_id',
  FINGERPRINT: 'bs_fingerprint',
  SESSION_START: 'bs_session_start',
  LAST_ACTIVITY: 'bs_last_activity',
};

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

export function getStoredVisitorId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
}

export function setStoredVisitorId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.VISITOR_ID, id);
}

export function getStoredSessionId(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
}

export function setStoredSessionId(id: string): void {
  sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, id);
}

export function getStoredFingerprint(): string | null {
  return localStorage.getItem(STORAGE_KEYS.FINGERPRINT);
}

export function setStoredFingerprint(fingerprint: string): void {
  localStorage.setItem(STORAGE_KEYS.FINGERPRINT, fingerprint);
}

export function getSessionStart(): number | null {
  const start = sessionStorage.getItem(STORAGE_KEYS.SESSION_START);
  return start ? parseInt(start, 10) : null;
}

export function setSessionStart(timestamp: number): void {
  sessionStorage.setItem(STORAGE_KEYS.SESSION_START, timestamp.toString());
}

export function getLastActivity(): number | null {
  const activity = sessionStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
  return activity ? parseInt(activity, 10) : null;
}

export function updateLastActivity(): void {
  sessionStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
}

export function isSessionExpired(): boolean {
  const lastActivity = getLastActivity();
  if (!lastActivity) return true;
  return Date.now() - lastActivity > SESSION_TIMEOUT;
}

export function clearSession(): void {
  sessionStorage.removeItem(STORAGE_KEYS.SESSION_ID);
  sessionStorage.removeItem(STORAGE_KEYS.SESSION_START);
  sessionStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
}

// Calculate session duration in seconds
export function getSessionDuration(): number {
  const start = getSessionStart();
  if (!start) return 0;
  return Math.floor((Date.now() - start) / 1000);
}
