import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Briefcase, Loader2, Image as ImageIcon, Play, X } from "lucide-react";
import AdminLoader from "@/components/admin/AdminLoader";
import { Link } from "react-router-dom";
import ImageUploader from "@/components/admin/ImageUploader";

interface Service {
  id: string;
  title: string;
  description: string | null;
  thumbnail_type: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  display_order: number;
  video_urls: string[] | null;
}

const AdminServices = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail_type: "url",
    thumbnail_url: "",
    is_active: true,
    display_order: 0,
  });
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Service[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from('services')
          .update({
            title: data.title,
            description: data.description || null,
            thumbnail_type: data.thumbnail_type,
            thumbnail_url: data.thumbnail_url || null,
            is_active: data.is_active,
            display_order: data.display_order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('services')
          .insert({
            title: data.title,
            description: data.description || null,
            thumbnail_type: data.thumbnail_type,
            thumbnail_url: data.thumbnail_url || null,
            is_active: data.is_active,
            display_order: data.display_order,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingService ? "Service Updated" : "Service Created",
        description: "Changes saved successfully.",
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

  const updateVideoMutation = useMutation({
    mutationFn: async ({ id, urls }: { id: string; urls: string[] }) => {
      const { error } = await supabase
        .from('services')
        .update({
          video_urls: urls,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      setIsVideoDialogOpen(false);
      setEditingService(null);
      setVideoUrls([]);
      toast({
        title: "Video Links Updated",
        description: "Service video links saved successfully.",
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({
        title: "Service Deleted",
        description: "Service has been removed.",
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

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('services')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      thumbnail_type: "url",
      thumbnail_url: "",
      is_active: true,
      display_order: 0,
    });
    setEditingService(null);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description || "",
      thumbnail_type: service.thumbnail_type || "url",
      thumbnail_url: service.thumbnail_url || "",
      is_active: service.is_active,
      display_order: service.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleEditVideo = (service: Service) => {
    setEditingService(service);
    setVideoUrls(service.video_urls || []);
    setIsVideoDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      id: editingService?.id,
    });
  };

  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateVideoMutation.mutate({ id: editingService.id, urls: videoUrls });
    }
  };

  const addVideoUrl = () => {
    if (newVideoUrl && !videoUrls.includes(newVideoUrl)) {
      setVideoUrls([...videoUrls, newVideoUrl]);
      setNewVideoUrl("");
    }
  };

  const removeVideoUrl = (urlToRemove: string) => {
    setVideoUrls(videoUrls.filter(url => url !== urlToRemove));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <AdminLoader label="Loading services..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Manage your services</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="admin-theme max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
              <DialogDescription>
                {editingService ? "Update service details" : "Create a new service"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Wedding Photography"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the service..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Thumbnail Image</Label>
                <ImageUploader
                  value={formData.thumbnail_url}
                  onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
                  folder="services"
                  placeholder="Thumbnail URL or upload"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active (visible on website)</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
                  {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingService ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isVideoDialogOpen} onOpenChange={(open) => { setIsVideoDialogOpen(open); if (!open) setVideoUrls([]); }}>
          <DialogContent className="admin-theme">
            <DialogHeader>
              <DialogTitle>Service Videos</DialogTitle>
              <DialogDescription>
                Add or update video links for {editingService?.title}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleVideoSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Add Video URL (YouTube/Vimeo)</Label>
                <div className="flex gap-2">
                  <Input
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="https://..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addVideoUrl();
                      }
                    }}
                  />
                  <Button type="button" onClick={addVideoUrl} size="sm">Add</Button>
                </div>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                <Label>Video List ({videoUrls.length})</Label>
                {videoUrls.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No videos added yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {videoUrls.map((url, index) => (
                      <li key={index} className="flex items-center justify-between gap-2 bg-muted/50 p-2 rounded-md text-sm">
                        <span className="truncate flex-1">{url}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:bg-destructive/10"
                          onClick={() => removeVideoUrl(url)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={updateVideoMutation.isPending} className="flex-1">
                  {updateVideoMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Video Links
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsVideoDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {services?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No services yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services?.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {service.thumbnail_url ? (
                  <img
                    src={service.thumbnail_url}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Briefcase className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={service.is_active ? "default" : "secondary"}>
                    {service.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{service.title}</CardTitle>
                {service.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={service.is_active}
                    onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: service.id, is_active: checked })}
                  />
                  <span className="text-sm text-muted-foreground">Active</span>
                </div>
                <div className="flex gap-2">
                  <Link to={`/secure-portal-9273/services/${service.id}/photos`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Photos
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => handleEditVideo(service)}>
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this service?")) {
                        deleteMutation.mutate(service.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminServices;
