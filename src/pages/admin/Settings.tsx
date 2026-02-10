import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Loader2, Save, Activity } from "lucide-react";

interface SiteSettings {
  id: string;
  whatsapp_number: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  facebook_url: string | null;
  google_analytics_id: string | null;
  google_tag_manager_id: string | null;
  google_search_console: string | null;
  ga_property_id: string | null;
  ga_client_email: string | null;
  ga_private_key: string | null;
  pagespeed_api_key: string | null;
  gsc_site_url: string | null;
}

const Settings = () => {
  const [formData, setFormData] = useState({
    whatsapp_number: "",
    instagram_url: "",
    youtube_url: "",
    facebook_url: "",
    google_analytics_id: "",
    google_tag_manager_id: "",
    google_search_console: "",
    ga_property_id: "",
    ga_client_email: "",
    ga_private_key: "",
    pagespeed_api_key: "",
    gsc_site_url: "",
  });

  const [simulating, setSimulating] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as SiteSettings | null;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        whatsapp_number: settings.whatsapp_number || "",
        instagram_url: settings.instagram_url || "",
        youtube_url: settings.youtube_url || "",
        facebook_url: settings.facebook_url || "",
        google_analytics_id: settings.google_analytics_id || "",
        google_tag_manager_id: settings.google_tag_manager_id || "",
        google_search_console: settings.google_search_console || "",
        ga_property_id: settings.ga_property_id || "",
        ga_client_email: settings.ga_client_email || "",
        ga_private_key: settings.ga_private_key || "",
        pagespeed_api_key: settings.pagespeed_api_key || "",
        gsc_site_url: settings.gsc_site_url || "",
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (settings?.id) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            whatsapp_number: data.whatsapp_number || null,
            instagram_url: data.instagram_url || null,
            youtube_url: data.youtube_url || null,
            facebook_url: data.facebook_url || null,
            google_analytics_id: data.google_analytics_id || null,
            google_tag_manager_id: data.google_tag_manager_id || null,
            google_search_console: data.google_search_console || null,
            ga_property_id: data.ga_property_id || null,
            ga_client_email: data.ga_client_email || null,
            ga_private_key: data.ga_private_key || null,
            pagespeed_api_key: data.pagespeed_api_key || null,
            gsc_site_url: data.gsc_site_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({
            whatsapp_number: data.whatsapp_number || null,
            instagram_url: data.instagram_url || null,
            youtube_url: data.youtube_url || null,
            facebook_url: data.facebook_url || null,
            google_analytics_id: data.google_analytics_id || null,
            google_tag_manager_id: data.google_tag_manager_id || null,
            google_search_console: data.google_search_console || null,
            ga_property_id: data.ga_property_id || null,
            ga_client_email: data.ga_client_email || null,
            ga_private_key: data.ga_private_key || null,
            pagespeed_api_key: data.pagespeed_api_key || null,
            gsc_site_url: data.gsc_site_url || null,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const simulateTraffic = async () => {
    setSimulating(true);
    try {
      toast({ title: "Starting Simulation", description: "Generating analytics data..." });

      // 1. Create a simulated visitor
      const visitorRes = await supabase.functions.invoke('track-event', {
        body: {
          action: 'create_visitor',
          data: {
            fingerprint: `sim-${Math.random().toString(36).substring(7)}`,
            device_type: Math.random() > 0.5 ? 'mobile' : 'desktop',
            browser: 'Chrome (Simulated)',
            os: 'Windows (Simulated)',
            screen_resolution: '1920x1080'
          }
        }
      });

      if (visitorRes.error) throw new Error("Failed to create visitor");
      const visitorId = visitorRes.data.visitor_id;

      // 2. Start a session
      const sessionRes = await supabase.functions.invoke('track-event', {
        body: {
          action: 'start_session',
          data: {
            visitor_id: visitorId,
            entry_page: '/',
            referrer: Math.random() > 0.5 ? 'https://google.com' : 'https://instagram.com',
            utm_source: Math.random() > 0.5 ? 'organic' : 'social',
            utm_medium: 'referral'
          }
        }
      });

      if (sessionRes.error) throw new Error("Failed to start session");
      const sessionId = sessionRes.data.session_id;

      // 3. Generate random interactions
      const interactionCount = 10;
      for (let i = 0; i < interactionCount; i++) {
        const isView = Math.random() > 0.3;

        if (isView) {
          const pages = ['/', '/films', '/gallery', '/services', '/book'];
          const page = pages[Math.floor(Math.random() * pages.length)];

          await supabase.functions.invoke('track-event', {
            body: {
              action: 'page_view',
              data: {
                session_id: sessionId,
                page_path: page,
                page_title: "Simulated " + page,
              }
            }
          });
        } else {
          const eventTypes = ['whatsapp_click', 'form_submit', 'film_play', 'gallery_open'];
          const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];

          await supabase.functions.invoke('track-event', {
            body: {
              action: 'track_event',
              data: {
                session_id: sessionId,
                page_path: '/simulated',
                event_type: type,
                event_label: 'sim-label',
                event_value: 'sim-value',
                metadata: { simulated: true }
              }
            }
          });
        }
        // Small delay
        await new Promise(r => setTimeout(r, 100));
      }

      toast({
        title: "Simulation Complete",
        description: "Generated visitor, session, and events. Check dashboard in 30s.",
      });

    } catch (error) {
      console.error(error);
      toast({
        title: "Simulation Failed",
        description: "Could not generate events. Is the Edge Function deployed?",
        variant: "destructive"
      });
    } finally {
      setSimulating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure site settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Site Settings
          </CardTitle>
          <CardDescription>
            These settings will be used across the website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <Input
                id="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                placeholder="919301781585"
              />
              <p className="text-xs text-muted-foreground">Enter with country code, no + or spaces</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram_url">Instagram URL</Label>
              <Input
                id="instagram_url"
                value={formData.instagram_url}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                placeholder="https://instagram.com/yourusername"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube_url">YouTube URL</Label>
              <Input
                id="youtube_url"
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook_url">Facebook URL</Label>
              <Input
                id="facebook_url"
                value={formData.facebook_url}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Analytics & Tracking</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                  <Input
                    id="google_analytics_id"
                    value={formData.google_analytics_id}
                    onChange={(e) => setFormData({ ...formData, google_analytics_id: e.target.value })}
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="text-xs text-muted-foreground">Your Google Analytics measurement ID</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google_tag_manager_id">Google Tag Manager ID</Label>
                  <Input
                    id="google_tag_manager_id"
                    value={formData.google_tag_manager_id}
                    onChange={(e) => setFormData({ ...formData, google_tag_manager_id: e.target.value })}
                    placeholder="GTM-XXXXXXX"
                  />
                  <p className="text-xs text-muted-foreground">Your Google Tag Manager container ID</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google_search_console">Google Search Console Code</Label>
                  <Input
                    id="google_search_console"
                    value={formData.google_search_console}
                    onChange={(e) => setFormData({ ...formData, google_search_console: e.target.value })}
                    placeholder="google-site-verification=..."
                  />
                  <p className="text-xs text-muted-foreground">Your Search Console verification code</p>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-3">Google Analytics 4 (Data API)</h4>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ga_property_id">GA4 Property ID</Label>
                      <Input
                        id="ga_property_id"
                        value={formData.ga_property_id}
                        onChange={(e) => setFormData({ ...formData, ga_property_id: e.target.value })}
                        placeholder="123456789"
                      />
                      <p className="text-xs text-muted-foreground">Found in Admin {'>'} Property Settings</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ga_client_email">Service Account Email</Label>
                      <Input
                        id="ga_client_email"
                        value={formData.ga_client_email}
                        onChange={(e) => setFormData({ ...formData, ga_client_email: e.target.value })}
                        placeholder="service-account@project.iam.gserviceaccount.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ga_private_key">Service Account Private Key</Label>
                      <div className="relative">
                        <Input
                          id="ga_private_key"
                          type="password"
                          value={formData.ga_private_key}
                          onChange={(e) => setFormData({ ...formData, ga_private_key: e.target.value })}
                          placeholder="-----BEGIN PRIVATE KEY-----..."
                          className="pr-10"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Paste the entire private key from the JSON file</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-3">PageSpeed Insights</h4>
                  <div className="space-y-2">
                    <Label htmlFor="pagespeed_api_key">API Key</Label>
                    <Input
                      id="pagespeed_api_key"
                      type="password"
                      value={formData.pagespeed_api_key}
                      onChange={(e) => setFormData({ ...formData, pagespeed_api_key: e.target.value })}
                      placeholder="AIzaSy..."
                    />
                    <p className="text-xs text-muted-foreground">Required for Performance tab scores</p>
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Developer Tools */}
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-yellow-500" />
            Developer Tools
          </CardTitle>
          <CardDescription>
            Tools to verify and test your analytics integration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Simulate Traffic</h4>
              <p className="text-sm text-muted-foreground">
                Generate fake visitors, sessions, and events to populate the dashboard.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={simulateTraffic}
              disabled={simulating}
              className="border-yellow-500/50 hover:bg-yellow-500/10 hover:text-yellow-600"
            >
              {simulating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Simulating...
                </>
              ) : (
                "Generate Data"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
```
