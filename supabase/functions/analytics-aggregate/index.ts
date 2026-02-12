import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SignJWT, importPKCS8 } from 'npm:jose@4.14.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Define Interfaces
interface GA4Row {
  metricValues: { value: string }[];
  dimensionValues: { value: string }[];
}

interface GSCRow {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  keys: string[];
}

interface KeywordData {
  keyword: string;
  clicks: number;
  impressions: number;
  ctr: string;
  position: number;
  page_url: string;
}

interface PageData {
  page_url: string;
  clicks: number;
  impressions: number;
  posSum: number;
  count: number;
  position: number;
  indexed: boolean;
  status: string;
}

// --- Google Auth Helpers ---

async function getAccessToken(clientEmail: string, privateKey: string, scopes: string[]) {
  try {
    const pkcs8 = await importPKCS8(privateKey, 'RS256');
    const jwt = await new SignJWT({
      scope: scopes.join(' '),
    })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer(clientEmail)
      .setSubject(clientEmail)
      .setAudience('https://oauth2.googleapis.com/token')
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(pkcs8);

    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    params.append('assertion', jwt);

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    const data = await res.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Google access token:', error);
    return null;
  }
}

async function runGA4Report(accessToken: string, propertyId: string, requestBody: Record<string, unknown>, isRealtime = false) {
  const url = isRealtime
    ? `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`
    : `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`GA4 API Error (${isRealtime ? 'Realtime' : 'Standard'}):`, err);
    throw new Error(`GA4 API Error: ${res.statusText}`);
  }

  return res.json();
}

async function runGSCQuery(accessToken: string, siteUrl: string, startDate: string, endDate: string) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['query', 'page'],
      rowLimit: 50,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('GSC API Error:', err);
    throw new Error(`GSC API Error: ${res.statusText}`);
  }
  return res.json();
}

async function fetchPageSpeed(apiKey: string, url: string, strategy: 'mobile' | 'desktop') {
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=${strategy}&category=PERFORMANCE`;
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error('PageSpeed API Error');
  return res.json();
}

// --- Main Handler ---

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { metric_type, date_range = '7d' } = body;

    // 1. Fetch Credentials
    const { data: settings } = await supabase
      .from('site_settings')
      .select('ga_property_id, ga_client_email, ga_private_key, pagespeed_api_key, gsc_site_url')
      .single();

    const hasGA4Creds = settings?.ga_property_id && settings?.ga_client_email && settings?.ga_private_key;
    const hasPageSpeedCreds = !!settings?.pagespeed_api_key;
    const hasGSCCreds = settings?.gsc_site_url && settings?.ga_client_email && settings?.ga_private_key;

    // 2. Try External APIs if credentials exist
    if (hasGA4Creds || (metric_type === 'performance' && hasPageSpeedCreds) || (metric_type === 'seo' && hasGSCCreds)) {
      try {
        let accessToken = null;
        if ((hasGA4Creds && metric_type !== 'performance') || (metric_type === 'seo' && hasGSCCreds)) {
          // clean private key format
          let privateKey = settings.ga_private_key;
          if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
            privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
          }
          privateKey = privateKey.replace(/\\n/g, '\n').replace(/"/g, '');

          const scopes = ['https://www.googleapis.com/auth/analytics.readonly'];
          if (metric_type === 'seo') scopes.push('https://www.googleapis.com/auth/webmasters.readonly');

          accessToken = await getAccessToken(settings.ga_client_email, privateKey, scopes);
        }

        if (accessToken || (metric_type === 'performance' && hasPageSpeedCreds)) {
          let gaResult = null;

          // Helper to calculate date ranges
          const now = new Date();
          let startDateStr = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const endDateStr = new Date().toISOString().split('T')[0];

          if (date_range === 'today') startDateStr = new Date().toISOString().split('T')[0];
          if (date_range === '30d') startDateStr = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          if (date_range === '90d') startDateStr = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

          let ga4Start = '7daysAgo';
          if (date_range === 'today') ga4Start = 'today';
          if (date_range === '30d') ga4Start = '30daysAgo';
          if (date_range === '90d') ga4Start = '90daysAgo';

          switch (metric_type) {
            case 'visitors': {
              const report = await runGA4Report(accessToken!, settings.ga_property_id, {
                dateRanges: [{ startDate: ga4Start, endDate: 'today' }],
                metrics: [{ name: 'activeUsers' }, { name: 'newUsers' }, { name: 'sessions' }],
                dimensions: [{ name: 'deviceCategory' }, { name: 'browser' }],
              });
              // ... transform ...
              const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };
              const browsers: Record<string, number> = {};
              let totalUsers = 0, newUsers = 0;

              const rows = report.rows as GA4Row[] || [];
              rows.forEach((row) => {
                const u = parseInt(row.metricValues[0].value);
                const nu = parseInt(row.metricValues[1].value);
                const dev = row.dimensionValues[0].value.toLowerCase();
                const br = row.dimensionValues[1].value;
                totalUsers += u; newUsers += nu;
                if (dev === 'mobile') deviceBreakdown.mobile += u; else if (dev === 'tablet') deviceBreakdown.tablet += u; else deviceBreakdown.desktop += u;
                browsers[br] = (browsers[br] || 0) + u;
              });
              gaResult = { total: totalUsers, new: newUsers, returning: totalUsers - newUsers, deviceBreakdown, browsers, visitors: [] };
              break;
            }

            case 'traffic': {
              const report = await runGA4Report(accessToken!, settings.ga_property_id, {
                dateRanges: [{ startDate: ga4Start, endDate: 'today' }],
                metrics: [{ name: 'sessions' }],
                dimensions: [{ name: 'sessionSource' }],
              });

              const sources: { name: string; sessions: number; percentage: number }[] = [];
              let totalSessions = 0;
              let direct = 0;

              const rows = report.rows as GA4Row[] || [];
              rows.forEach((row) => {
                const s = parseInt(row.metricValues[0].value);
                totalSessions += s;
                sources.push({ name: row.dimensionValues[0].value, sessions: s, percentage: 0 });
                if (row.dimensionValues[0].value === '(direct)') direct += s;
              });

              sources.forEach(s => s.percentage = totalSessions > 0 ? Math.round((s.sessions / totalSessions) * 100) : 0);
              sources.sort((a, b) => b.sessions - a.sessions);

              gaResult = { totalSessions, sources, directPercentage: totalSessions > 0 ? ((direct / totalSessions) * 100).toFixed(0) : '0' };
              break;
            }

            case 'geo': {
              const report = await runGA4Report(accessToken!, settings.ga_property_id, {
                dateRanges: [{ startDate: ga4Start, endDate: 'today' }],
                metrics: [{ name: 'activeUsers' }],
                dimensions: [{ name: 'country' }, { name: 'city' }],
              });

              const countryMap = new Map<string, number>();
              const cityMap = new Map<string, number>();
              let total = 0;

              const rows = report.rows as GA4Row[] || [];
              rows.forEach((row) => {
                const u = parseInt(row.metricValues[0].value);
                const country = row.dimensionValues[0].value;
                const city = row.dimensionValues[1].value;
                total += u;
                countryMap.set(country, (countryMap.get(country) || 0) + u);
                cityMap.set(city, (cityMap.get(city) || 0) + u);
              });

              const countries = Array.from(countryMap.entries()).map(([name, users]) => ({ name, users, percentage: Math.round((users / total) * 100) })).sort((a, b) => b.users - a.users);
              const cities = Array.from(cityMap.entries()).map(([name, users]) => ({ name, users })).sort((a, b) => b.users - a.users);

              gaResult = {
                totalVisitors: total,
                countries: countries.slice(0, 10),
                cities: cities.slice(0, 10),
                uniqueCities: cities.length,
                topCountry: countries[0]?.name || 'Unknown',
                topCity: cities[0]?.name || 'Unknown'
              };
              break;
            }

            case 'realtime': {
              const report = await runGA4Report(accessToken!, settings.ga_property_id, {
                metrics: [{ name: 'activeUsers' }],
                dimensions: [{ name: 'city' }], // just dummy dim
              }, true);

              const active = report.rows ? parseInt(report.rows[0].metricValues[0].value) : 0; // Realtime aggregation might be simpler
              // For detailed realtime, structure varies. Assuming simplified total active:
              // Actually realtime report activeUsers is total.
              const totalActive = report.rows ? report.rows.reduce((acc: number, row: GA4Row) => acc + parseInt(row.metricValues[0].value), 0) : 0;

              gaResult = { activeUsers: totalActive, activeSessions: [], recentViews: [] };
              break;
            }

            case 'performance': {
              // PageSpeed
              const mobile = await fetchPageSpeed(settings.pagespeed_api_key, settings.gsc_site_url || 'https://brotherhood-studio.com', 'mobile');
              const desktop = await fetchPageSpeed(settings.pagespeed_api_key, settings.gsc_site_url || 'https://brotherhood-studio.com', 'desktop');

              const mScore = mobile.lighthouseResult?.categories?.performance?.score * 100 || 0;
              const dScore = desktop.lighthouseResult?.categories?.performance?.score * 100 || 0;
              const loadTime = mobile.lighthouseResult?.audits?.['interactive']?.numericValue || 0;

              gaResult = { avgLoadTime: (loadTime / 1000).toFixed(1), mobileScore: mScore, desktopScore: dScore, slowPagesCount: 0, pages: [] };
              break;
            }

            case 'seo': {
              if (!hasGSCCreds) throw new Error("No GSC Credentials");
              const gscData = await runGSCQuery(accessToken!, settings.gsc_site_url, startDateStr, endDateStr);

              let totalClicks = 0;
              let totalImpressions = 0;
              let weightedPos = 0;

              const keywords: KeywordData[] = [];
              const validPages = new Set<string>();

              // Process rows
              const rows = gscData.rows as GSCRow[] || [];
              rows.forEach((row) => {
                const clicks = row.clicks;
                const impressions = row.impressions;
                const ctr = row.ctr;
                const pos = row.position;
                const keyword = row.keys[0]; // query
                const page = row.keys[1]; // page

                totalClicks += clicks;
                totalImpressions += impressions;
                weightedPos += pos * impressions; // usage weighted avg

                // Keyword aggregation (simplified, GSC gives query-page combos)
                // We'll just push top combos
                keywords.push({ keyword, clicks, impressions, ctr: (ctr * 100).toFixed(2), position: pos, page_url: page });
                validPages.add(page);
              });

              const avgPosition = totalImpressions > 0 ? (weightedPos / totalImpressions).toFixed(1) : '0';
              const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0';

              const overview = { totalClicks, totalImpressions, avgCTR, avgPosition };

              // Sort keywords by clicks
              keywords.sort((a, b) => b.clicks - a.clicks);

              // Pages aggregation
              const pageMap = new Map<string, PageData>();
              rows.forEach((row) => {
                const p = row.keys[1];
                if (!pageMap.has(p)) {
                  pageMap.set(p, {
                    page_url: p,
                    clicks: 0,
                    impressions: 0,
                    posSum: 0,
                    count: 0,
                    position: 0,
                    indexed: true,
                    status: 'valid'
                  });
                }
                const entry = pageMap.get(p)!;
                entry.clicks += row.clicks;
                entry.impressions += row.impressions;
                entry.posSum += row.position * row.impressions;
              });

              const pages = Array.from(pageMap.values()).map((p) => ({
                ...p,
                position: p.impressions > 0 ? p.posSum / p.impressions : 0,
              })).sort((a, b) => b.clicks - a.clicks);


              gaResult = { overview, keywords, pages, trend: [] }; // Trend requires separate query or day-by-day

              // Cache this result
              await supabase.from('seo_cache').upsert({ date_range: date_range, data: gaResult }, { onConflict: 'date_range' });
              // Insert Keywords (clean replace for range)
              await supabase.from('seo_keywords').delete().eq('date_range', date_range);
              if (keywords.length > 0) {
                await supabase.from('seo_keywords').insert(keywords.slice(0, 50).map(k => ({ ...k, date_range: date_range })));
              }
              // Insert Pages using upsert
              if (pages.length > 0) {
                await supabase.from('seo_pages').upsert(pages.slice(0, 50).map((p) => ({
                  page_url: p.page_url, clicks: p.clicks, impressions: p.impressions, avg_position: p.position
                })), { onConflict: 'page_url' });
              }

              break;
            }

            case 'generate_insights': {
              // Logic Engine
              const insights = [];

              // 1. Fetch data
              const { data: traffic } = await supabase.from('visitors').select('*').limit(100);
              const { data: perf } = await supabase.from('performance_pages').select('*');
              const { data: seo } = await supabase.from('seo_keywords').select('*').order('clicks', { ascending: false }).limit(10);

              // Rule 1: Mobile Optimization
              const mobileUsers = traffic?.filter(t => t.device_type === 'mobile').length || 0;
              const totalUsers = traffic?.length || 1;
              const mobilePercent = (mobileUsers / totalUsers) * 100;
              const mobileScore = perf?.find(p => p.device_type === 'mobile')?.score || 100;

              if (mobilePercent > 40 && mobileScore < 60) {
                insights.push({
                  insight_type: 'performance',
                  title: 'Mobile Experience Needs Improvement',
                  description: `Mobile traffic is significant (${mobilePercent.toFixed(0)}%) but mobile performance score is low (${mobileScore}).`,
                  priority: 'high',
                  suggested_action: 'Optimize images and reduce JS for mobile devices.',
                  status: 'new'
                });
              }

              // Rule 2: SEO Opportunity
              const highImpressionLowClick = seo?.find(k => k.impressions > 500 && k.ctr < 2);
              if (highImpressionLowClick) {
                insights.push({
                  insight_type: 'seo',
                  title: `Unlock Potential for "${highImpressionLowClick.keyword}"`,
                  description: `Keyword "${highImpressionLowClick.keyword}" has high impressions but low CTR (${highImpressionLowClick.ctr}%).`,
                  priority: 'medium',
                  suggested_action: 'Improve title tag and meta description for this keyword\'s page.',
                  status: 'new'
                });
              }

              // Save insights
              if (insights.length > 0) {
                for (const insight of insights) {
                  // Check if similar exists (simple dedup title + today)
                  const { data: existing } = await supabase.from('decision_insights').select('id').eq('title', insight.title).eq('status', 'new').single();
                  if (!existing) {
                    await supabase.from('decision_insights').insert(insight);
                  }
                }
              }

              gaResult = { insights_generated: insights.length, details: insights };
              break;
            }
          }

          if (gaResult) {
            return new Response(JSON.stringify(gaResult), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
        }
      } catch (e) {
        console.error('External API implementation failed, falling back to internal:', e);
      }
    }


    // --- FALLBACK: INTERNAL SUPABASE LOGIC ---
    // (Preserve existing fallback logic for all types, adding basic mock for SEO if needed)

    console.log(`Internal analytics (Fallback): ${metric_type}`);
    const now = new Date();
    let startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (date_range === 'today') startDate = new Date();
    else if (date_range === '30d') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const startDateStr = startDate.toISOString();
    let result: Record<string, unknown> = {};

    // --- GENERIC CACHE FETCHING FOR ALL METRICS ---
    const { data: cache } = await supabase
      .from('analytics_cache')
      .select('data')
      .eq('metric_type', metric_type)
      .eq('date_range', date_range)
      .single();

    if (cache?.data) {
      return new Response(JSON.stringify(cache.data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Default Fallback (Zeros) if no cache
    console.log(`No cache found for ${metric_type}, returning empty defaults.`);

    switch (metric_type) {
      case 'visitors': {
        // 1. Total Visitors
        const { count: totalVisitors } = await supabase
          .from('visitors')
          .select('*', { count: 'exact', head: true });

        // 2. New Visitors (created_at within range)
        const { count: newVisitors } = await supabase
          .from('visitors')
          .select('*', { count: 'exact', head: true })
          .gte('first_visit', startDateStr);

        // 3. Device & Browser Breakdown
        const { data: recentVisitors } = await supabase
          .from('visitors')
          .select('device_type, browser')
          .gte('last_visit', startDateStr)
          .limit(1000);

        const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };
        const browsers: Record<string, number> = {};

        recentVisitors?.forEach(v => {
          const dev = (v.device_type || 'desktop').toLowerCase() as keyof typeof deviceBreakdown;
          if (deviceBreakdown[dev] !== undefined) deviceBreakdown[dev]++;
          else deviceBreakdown['desktop']++; // default

          const br = v.browser || 'Unknown';
          browsers[br] = (browsers[br] || 0) + 1;
        });

        const total = totalVisitors || 0;
        const newly = newVisitors || 0;

        result = {
          total: total,
          new: newly,
          returning: Math.max(0, total - newly),
          deviceBreakdown,
          browsers,
          visitors: []
        };
        break;
      }

      case 'overview': {
        // Engagement Overview
        const { data: sessions } = await supabase
          .from('sessions')
          .select('duration_seconds, page_count')
          .gte('created_at', startDateStr);

        let totalDuration = 0;
        let bounces = 0;
        const totalSessions = sessions?.length || 0;

        sessions?.forEach(s => {
          totalDuration += (s.duration_seconds || 0);
          if (!s.page_count || s.page_count <= 1) bounces++;
        });

        const avgSessionDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
        const bounceRate = totalSessions > 0 ? Math.round((bounces / totalSessions) * 100) : 0;

        // 2. Avg Scroll Depth from Page Views
        const { data: pvs } = await supabase
          .from('page_views')
          .select('scroll_depth')
          .gte('viewed_at', startDateStr)
          .limit(2000);

        let totalScroll = 0;
        pvs?.forEach(p => totalScroll += (p.scroll_depth || 0));
        const avgScrollDepth = pvs && pvs.length > 0 ? Math.round(totalScroll / pvs.length) : 0;

        result = { avgSessionDuration, avgScrollDepth, bounceRate: bounceRate.toString() };
        break;
      }

      case 'pages': {
        // Page Performance
        const { data: pvs } = await supabase
          .from('page_views')
          .select('page_path, time_on_page, scroll_depth')
          .gte('viewed_at', startDateStr)
          .limit(5000);

        const pageMap = new Map<string, { views: number, timeSum: number, scrollSum: number }>();

        pvs?.forEach(pv => {
          const path = pv.page_path || '/';
          if (!pageMap.has(path)) pageMap.set(path, { views: 0, timeSum: 0, scrollSum: 0 });
          const entry = pageMap.get(path)!;
          entry.views++;
          entry.timeSum += (pv.time_on_page || 0);
          entry.scrollSum += (pv.scroll_depth || 0);
        });

        const pages = Array.from(pageMap.entries()).map(([path, data]) => ({
          page_path: path,
          views: data.views,
          avg_time: Math.round(data.timeSum / data.views),
          avg_scroll: Math.round(data.scrollSum / data.views)
        })).sort((a, b) => b.views - a.views);

        result = {
          totalPages: pages.length,
          totalViews: pvs?.length || 0,
          topPage: pages[0]?.page_path || 'N/A',
          pages: pages
        };
        break;
      }

      case 'traffic': {
        // Traffic Sources from Sessions
        const { data: sessions } = await supabase
          .from('sessions')
          .select('utm_source, referrer')
          .gte('created_at', startDateStr);

        const sourceMap = new Map<string, number>();
        let direct = 0;
        const total = sessions?.length || 0;

        sessions?.forEach(s => {
          let source = s.utm_source;
          if (!source) {
            if (!s.referrer || s.referrer.includes('brotherhood')) source = 'Direct';
            else {
              try {
                const url = new URL(s.referrer);
                source = url.hostname;
              } catch { source = 'Referral'; }
            }
          }
          if (source === 'Direct') direct++;
          sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
        });

        const sources = Array.from(sourceMap.entries()).map(([name, sessions]) => ({
          name, sessions, percentage: total > 0 ? Math.round((sessions / total) * 100) : 0
        })).sort((a, b) => b.sessions - a.sessions);

        result = {
          totalSessions: total,
          sources,
          directPercentage: total > 0 ? ((direct / total) * 100).toFixed(0) : '0'
        };
        break;
      }

      case 'geo': {
        result = { totalVisitors: 0, countries: [], cities: [], uniqueCities: 0, topCountry: 'Unknown', topCity: 'Unknown' };
        break;
      }

      case 'realtime': {
        // Active sessions in last 30 minutes
        const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        const { count } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .gte('updated_at', thirtyMinsAgo);

        result = { activeUsers: count || 0, activeSessions: [], recentViews: [] };
        break;
      }

      case 'events': {
        const { data: events, count } = await supabase
          .from('click_events')
          .select('*', { count: 'exact' })
          .gte('created_at', startDateStr)
          .order('created_at', { ascending: false })
          .limit(50);

        result = { totalEvents: count || 0, events: [], recentEvents: events || [] };
        break;
      }

      case 'conversions': {
        const { data: events } = await supabase
          .from('click_events')
          .select('event_type')
          .gte('created_at', startDateStr);

        let whatsapp = 0, forms = 0, films = 0, gallery = 0;
        events?.forEach(e => {
          if (e.event_type === 'whatsapp_click') whatsapp++;
          else if (e.event_type === 'form_submit') forms++;
          else if (e.event_type === 'film_play') films++;
          else if (e.event_type === 'gallery_open') gallery++;
        });

        const totalConversions = whatsapp + forms;

        result = {
          totalConversions,
          whatsappClicks: whatsapp,
          formSubmits: forms,
          filmPlays: films,
          galleryOpens: gallery,
          conversionRate: '0',
          events: []
        };
        break;
      }

      case 'performance': {
        result = { avgLoadTime: 0, mobileScore: 0, desktopScore: 0, slowPagesCount: 0, pages: [] };
        break;
      }

      case 'generate_insights':
        result = { insights_generated: 0, details: [] };
        break;

      case 'seo':
        result = { overview: { totalClicks: 0, totalImpressions: 0, avgCTR: 0, avgPosition: 0 }, keywords: [], pages: [], trend: [] };
        break;
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Analytics aggregate error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
