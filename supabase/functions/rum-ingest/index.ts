import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { type, ...data } = await req.json()

        // Handle different ingestion types
        if (type === 'RUM_METRIC') {
            const { error } = await supabase.from('rum_metrics').insert({
                page_url: data.page_url,
                metric_type: data.metric_type,
                value: data.value,
                device_type: data.device_type,
                network_type: data.network_type,
                browser: data.browser,
                city: data.city,
                country: data.country
            })
            if (error) throw error
        } else if (type === 'RESOURCE_METRIC') {
            const { error } = await supabase.from('resource_metrics').insert({
                page_url: data.page_url,
                resource_name: data.resource_name,
                resource_type: data.resource_type,
                duration: data.duration,
                initiator_type: data.initiator_type,
                transfer_size: data.transfer_size,
                is_cache_hit: data.is_cache_hit
            })
            if (error) throw error
        } else if (type === 'API_METRIC') {
            const { error } = await supabase.from('api_metrics').insert({
                endpoint: data.endpoint,
                method: data.method,
                status_code: data.status_code,
                duration: data.duration,
                error_message: data.error_message
            })
            if (error) throw error
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
