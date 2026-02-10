import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { metric_type, date_range = '7days' } = body;

    console.log(`Analytics aggregate: ${metric_type} for ${date_range}`);

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    
    switch (date_range) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const startDateStr = startDate.toISOString();

    let result: Record<string, unknown> = {};

    switch (metric_type) {
      case 'overview': {
        // Get visitor stats
        const { data: visitors } = await supabase
          .from('visitors')
          .select('id, first_visit, last_visit, total_visits')
          .gte('last_visit', startDateStr);

        // Get session stats
        const { data: sessions } = await supabase
          .from('sessions')
          .select('id, duration_seconds, page_count, is_active')
          .gte('started_at', startDateStr);

        // Get page view stats
        const { data: pageViews } = await supabase
          .from('page_views')
          .select('id, time_on_page, scroll_depth')
          .gte('viewed_at', startDateStr);

        // Get conversion events
        const { data: clickEvents } = await supabase
          .from('click_events')
          .select('id, event_type')
          .gte('clicked_at', startDateStr);

        const totalVisitors = visitors?.length || 0;
        const activeUsers = sessions?.filter(s => s.is_active)?.length || 0;
        const totalSessions = sessions?.length || 0;
        const totalPageViews = pageViews?.length || 0;
        
        const avgSessionDuration = sessions?.length 
          ? Math.round(sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessions.length)
          : 0;

        const avgScrollDepth = pageViews?.length
          ? Math.round(pageViews.reduce((sum, p) => sum + (p.scroll_depth || 0), 0) / pageViews.length)
          : 0;

        const whatsappClicks = clickEvents?.filter(e => e.event_type === 'whatsapp_click')?.length || 0;
        const formSubmits = clickEvents?.filter(e => e.event_type === 'form_submit')?.length || 0;
        const filmPlays = clickEvents?.filter(e => e.event_type === 'film_play')?.length || 0;
        const galleryOpens = clickEvents?.filter(e => e.event_type === 'gallery_open')?.length || 0;

        const totalConversions = whatsappClicks + formSubmits;
        const conversionRate = totalVisitors > 0 
          ? ((totalConversions / totalVisitors) * 100).toFixed(2)
          : '0';

        // Calculate bounce rate (sessions with only 1 page view)
        const bouncedSessions = sessions?.filter(s => (s.page_count || 0) <= 1)?.length || 0;
        const bounceRate = totalSessions > 0
          ? ((bouncedSessions / totalSessions) * 100).toFixed(2)
          : '0';

        result = {
          totalVisitors,
          activeUsers,
          totalSessions,
          totalPageViews,
          avgSessionDuration,
          avgScrollDepth,
          whatsappClicks,
          formSubmits,
          filmPlays,
          galleryOpens,
          totalConversions,
          conversionRate,
          bounceRate,
        };
        break;
      }

      case 'visitors': {
        const { data: visitors } = await supabase
          .from('visitors')
          .select('*')
          .gte('last_visit', startDateStr)
          .order('last_visit', { ascending: false });

        const newVisitors = visitors?.filter(v => {
          const firstVisit = new Date(v.first_visit);
          return firstVisit >= startDate;
        })?.length || 0;

        const returningVisitors = (visitors?.length || 0) - newVisitors;

        // Device breakdown
        const deviceBreakdown = {
          mobile: visitors?.filter(v => v.device_type === 'mobile')?.length || 0,
          desktop: visitors?.filter(v => v.device_type === 'desktop')?.length || 0,
          tablet: visitors?.filter(v => v.device_type === 'tablet')?.length || 0,
        };

        // Browser breakdown
        const browsers: Record<string, number> = {};
        visitors?.forEach(v => {
          if (v.browser) {
            browsers[v.browser] = (browsers[v.browser] || 0) + 1;
          }
        });

        result = {
          total: visitors?.length || 0,
          new: newVisitors,
          returning: returningVisitors,
          deviceBreakdown,
          browsers,
          visitors: visitors?.slice(0, 50), // Return first 50 for display
        };
        break;
      }

      case 'pages': {
        const { data: pageViews } = await supabase
          .from('page_views')
          .select('page_path, page_title, time_on_page, scroll_depth')
          .gte('viewed_at', startDateStr);

        // Aggregate by page
        const pageStats: Record<string, { views: number; totalTime: number; totalScroll: number }> = {};
        
        pageViews?.forEach(pv => {
          if (!pageStats[pv.page_path]) {
            pageStats[pv.page_path] = { views: 0, totalTime: 0, totalScroll: 0 };
          }
          pageStats[pv.page_path].views++;
          pageStats[pv.page_path].totalTime += pv.time_on_page || 0;
          pageStats[pv.page_path].totalScroll += pv.scroll_depth || 0;
        });

        const pages = Object.entries(pageStats).map(([path, stats]) => ({
          page_path: path,
          views: stats.views,
          avg_time: Math.round(stats.totalTime / stats.views),
          avg_scroll: Math.round(stats.totalScroll / stats.views),
        })).sort((a, b) => b.views - a.views);

        result = {
          totalPages: Object.keys(pageStats).length,
          totalViews: pageViews?.length || 0,
          pages,
          topPage: pages[0]?.page_path || 'N/A',
        };
        break;
      }

      case 'traffic': {
        const { data: sessions } = await supabase
          .from('sessions')
          .select('referrer, utm_source, utm_medium, utm_campaign')
          .gte('started_at', startDateStr);

        // Traffic sources
        const sources: Record<string, number> = { direct: 0 };
        
        sessions?.forEach(s => {
          if (!s.referrer && !s.utm_source) {
            sources.direct++;
          } else if (s.utm_source) {
            sources[s.utm_source] = (sources[s.utm_source] || 0) + 1;
          } else if (s.referrer) {
            sources[s.referrer] = (sources[s.referrer] || 0) + 1;
          }
        });

        const totalSessions = sessions?.length || 1;
        const sourceBreakdown = Object.entries(sources)
          .map(([source, count]) => ({
            source,
            count,
            percentage: ((count / totalSessions) * 100).toFixed(1),
          }))
          .sort((a, b) => b.count - a.count);

        result = {
          totalSessions,
          sources: sourceBreakdown,
          directPercentage: ((sources.direct / totalSessions) * 100).toFixed(1),
        };
        break;
      }

      case 'geo': {
        const { data: visitors } = await supabase
          .from('visitors')
          .select('country, city, region')
          .gte('last_visit', startDateStr);

        // Country breakdown
        const countries: Record<string, number> = {};
        const cities: Record<string, number> = {};
        
        visitors?.forEach(v => {
          if (v.country) {
            countries[v.country] = (countries[v.country] || 0) + 1;
          }
          if (v.city) {
            cities[v.city] = (cities[v.city] || 0) + 1;
          }
        });

        const countryBreakdown = Object.entries(countries)
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count);

        const cityBreakdown = Object.entries(cities)
          .map(([city, count]) => ({ city, count }))
          .sort((a, b) => b.count - a.count);

        result = {
          totalVisitors: visitors?.length || 0,
          countries: countryBreakdown,
          cities: cityBreakdown.slice(0, 20),
          topCountry: countryBreakdown[0]?.country || 'Unknown',
          topCity: cityBreakdown[0]?.city || 'Unknown',
          uniqueCities: cityBreakdown.length,
        };
        break;
      }

      case 'realtime': {
        // Get active sessions (last 5 minutes)
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
        
        const { data: activeSessions } = await supabase
          .from('sessions')
          .select(`
            id,
            visitor_id,
            entry_page,
            visitors (
              device_type,
              city,
              country
            )
          `)
          .eq('is_active', true)
          .gte('started_at', fiveMinutesAgo);

        // Get recent page views
        const { data: recentViews } = await supabase
          .from('page_views')
          .select('page_path, viewed_at, session_id')
          .gte('viewed_at', fiveMinutesAgo)
          .order('viewed_at', { ascending: false })
          .limit(20);

        result = {
          activeUsers: activeSessions?.length || 0,
          activeSessions: activeSessions?.slice(0, 10),
          recentViews,
        };
        break;
      }

      case 'conversions': {
        const { data: clickEvents } = await supabase
          .from('click_events')
          .select('*')
          .gte('clicked_at', startDateStr);

        const { data: visitors } = await supabase
          .from('visitors')
          .select('id')
          .gte('last_visit', startDateStr);

        const whatsappClicks = clickEvents?.filter(e => e.event_type === 'whatsapp_click') || [];
        const formSubmits = clickEvents?.filter(e => e.event_type === 'form_submit') || [];
        const filmPlays = clickEvents?.filter(e => e.event_type === 'film_play') || [];
        const galleryOpens = clickEvents?.filter(e => e.event_type === 'gallery_open') || [];

        const totalVisitors = visitors?.length || 1;
        const totalConversions = whatsappClicks.length + formSubmits.length;

        result = {
          totalConversions,
          whatsappClicks: whatsappClicks.length,
          formSubmits: formSubmits.length,
          filmPlays: filmPlays.length,
          galleryOpens: galleryOpens.length,
          conversionRate: ((totalConversions / totalVisitors) * 100).toFixed(2),
          events: clickEvents?.slice(0, 50),
        };
        break;
      }

      case 'events': {
        const { data: clickEvents } = await supabase
          .from('click_events')
          .select('*')
          .gte('clicked_at', startDateStr)
          .order('clicked_at', { ascending: false });

        // Group by event type
        const eventStats: Record<string, { count: number; lastTriggered: string; topPage: string }> = {};
        
        clickEvents?.forEach(e => {
          if (!eventStats[e.event_type]) {
            eventStats[e.event_type] = { count: 0, lastTriggered: e.clicked_at, topPage: e.page_path };
          }
          eventStats[e.event_type].count++;
        });

        const events = Object.entries(eventStats)
          .map(([type, stats]) => ({
            event_type: type,
            ...stats,
          }))
          .sort((a, b) => b.count - a.count);

        result = {
          totalEvents: clickEvents?.length || 0,
          events,
          recentEvents: clickEvents?.slice(0, 20),
        };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown metric type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Cache the result
    await supabase
      .from('analytics_cache')
      .upsert({
        metric_type,
        date_range,
        data: result,
        last_fetched_at: new Date().toISOString(),
      }, { onConflict: 'metric_type,date_range' });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analytics aggregate error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
