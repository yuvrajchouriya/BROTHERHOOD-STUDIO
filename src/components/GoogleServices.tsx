import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
    google_analytics_id: string | null;
    google_tag_manager_id: string | null;
    google_search_console: string | null;
}

/**
 * GoogleServices Component
 * Fetches Google service IDs from database and injects tracking scripts
 */
const GoogleServices = () => {
    const { data: settings } = useQuery<SiteSettings | null>({
        queryKey: ['site-settings-google'],
        queryFn: async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('google_analytics_id, google_tag_manager_id, google_search_console')
                .single();
            return data;
        },
        refetchOnWindowFocus: false,
    });

    // Inject Google Analytics
    useEffect(() => {
        if (!settings?.google_analytics_id) return;

        const gaId = settings.google_analytics_id;

        // Check if script already exists
        if (document.getElementById('ga-script')) return;

        // Create gtag.js script
        const script1 = document.createElement('script');
        script1.id = 'ga-script';
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script1);

        // Create inline script
        const script2 = document.createElement('script');
        script2.id = 'ga-inline';
        script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;
        document.head.appendChild(script2);

        // Cleanup
        return () => {
            document.getElementById('ga-script')?.remove();
            document.getElementById('ga-inline')?.remove();
        };
    }, [settings?.google_analytics_id]);

    // Inject Google Tag Manager
    useEffect(() => {
        if (!settings?.google_tag_manager_id) return;

        const gtmId = settings.google_tag_manager_id;

        // Check if script already exists
        if (document.getElementById('gtm-script')) return;

        // Create GTM head script
        const script = document.createElement('script');
        script.id = 'gtm-script';
        script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `;
        document.head.appendChild(script);

        // Create GTM noscript
        if (!document.getElementById('gtm-noscript')) {
            const noscript = document.createElement('noscript');
            noscript.id = 'gtm-noscript';
            noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
            document.body.insertBefore(noscript, document.body.firstChild);
        }

        // Cleanup
        return () => {
            document.getElementById('gtm-script')?.remove();
            document.getElementById('gtm-noscript')?.remove();
        };
    }, [settings?.google_tag_manager_id]);

    // Inject Google Search Console
    useEffect(() => {
        if (!settings?.google_search_console) return;

        const verificationCode = settings.google_search_console;

        // Check if meta tag already exists
        if (document.querySelector('meta[name="google-site-verification"]')) return;

        // Create meta tag
        const meta = document.createElement('meta');
        meta.name = 'google-site-verification';
        meta.content = verificationCode;
        document.head.appendChild(meta);

        // Cleanup
        return () => {
            document.querySelector('meta[name="google-site-verification"]')?.remove();
        };
    }, [settings?.google_search_console]);

    return null;
};

export default GoogleServices;
