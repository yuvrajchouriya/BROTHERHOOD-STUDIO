import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Loader2, Save, Activity } from "lucide-react";
import AdminLoader from "@/components/admin/AdminLoader";

interface SiteSettings {
  id: string;
  whatsapp_number: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  facebook_url: string | null;
}

const Settings = () => {
  const [formData, setFormData] = useState({
    whatsapp_number: "",
    instagram_url: "",
    youtube_url: "",
    facebook_url: "",
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

      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (settings?.id) {
        const { error } = await (supabase
          .from('site_settings') as any)
          .update({
            whatsapp_number: data.whatsapp_number || null,
            instagram_url: data.instagram_url || null,
            youtube_url: data.youtube_url || null,
            facebook_url: (data as any).facebook_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from('site_settings') as any)
          .insert({
            whatsapp_number: data.whatsapp_number || null,
            instagram_url: data.instagram_url || null,
            youtube_url: data.youtube_url || null,
            facebook_url: (data as any).facebook_url || null,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      // logAdminAction removed
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
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

  // simulateTraffic function removed


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <AdminLoader label="Loading settings..." />
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
    </div>
  );
};

export default Settings;
