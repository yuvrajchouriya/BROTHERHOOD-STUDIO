import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface GeoData {
  country?: string;
  city?: string;
  region?: string;
}

// Simple IP to geo lookup using free API
async function getGeoFromIP(ip: string): Promise<GeoData> {
  try {
    // Skip for localhost/private IPs
    if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '::1') {
      return {};
    }

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`);
    
    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.country,
        city: data.city,
        region: data.regionName,
      };
    }
    
    return {};
  } catch (error) {
    console.error('Geo lookup error:', error);
    return {};
  }
}

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
    const { action, data } = body;

    // Get client IP for geo lookup
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     '127.0.0.1';

    console.log(`Track event: ${action} from IP: ${clientIP}`);

    switch (action) {
      case 'create_visitor': {
        // Get geo data
        const geoData = await getGeoFromIP(clientIP);
        
        const visitorData = {
          ...data,
          country: geoData.country || null,
          city: geoData.city || null,
          region: geoData.region || null,
        };

        const { data: visitor, error } = await supabase
          .from('visitors')
          .upsert(visitorData, { onConflict: 'fingerprint' })
          .select('id')
          .single();

        if (error) {
          console.error('Error creating visitor:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ visitor_id: visitor.id, geo: geoData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_visitor_geo': {
        const { visitor_id } = data;
        const geoData = await getGeoFromIP(clientIP);
        
        if (geoData.country || geoData.city) {
          await supabase
            .from('visitors')
            .update({
              country: geoData.country,
              city: geoData.city,
              region: geoData.region,
            })
            .eq('id', visitor_id);
        }

        return new Response(
          JSON.stringify({ success: true, geo: geoData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create_session': {
        const { data: session, error } = await supabase
          .from('sessions')
          .insert(data)
          .select('id')
          .single();

        if (error) {
          console.error('Error creating session:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ session_id: session.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'end_session': {
        const { session_id, exit_page, duration_seconds } = data;
        
        const { error } = await supabase
          .from('sessions')
          .update({
            ended_at: new Date().toISOString(),
            exit_page,
            duration_seconds,
            is_active: false,
          })
          .eq('id', session_id);

        if (error) {
          console.error('Error ending session:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'track_pageview': {
        const { error } = await supabase
          .from('page_views')
          .insert(data);

        if (error) {
          console.error('Error tracking pageview:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update session page count
        if (data.session_id) {
          const { data: session } = await supabase
            .from('sessions')
            .select('page_count')
            .eq('id', data.session_id)
            .single();

          if (session) {
            await supabase
              .from('sessions')
              .update({ page_count: (session.page_count || 0) + 1 })
              .eq('id', data.session_id);
          }
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'track_event': {
        const { error } = await supabase
          .from('click_events')
          .insert(data);

        if (error) {
          console.error('Error tracking event:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_pageview': {
        const { session_id, page_path, time_on_page, scroll_depth } = data;
        
        const { error } = await supabase
          .from('page_views')
          .update({ time_on_page, scroll_depth })
          .eq('session_id', session_id)
          .eq('page_path', page_path)
          .order('viewed_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error updating pageview:', error);
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Track event error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
