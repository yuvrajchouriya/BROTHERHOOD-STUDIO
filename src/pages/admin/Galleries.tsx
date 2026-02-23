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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Image, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import ImageUploader from "@/components/admin/ImageUploader";

interface Gallery {
  id: string;
  project_name: string;
  story_text: string | null;
  location: string | null;
  category: string | null;
  thumbnail_type: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  display_order: number;
}

const Galleries = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [formData, setFormData] = useState({
    project_name: "",
    story_text: "",
    location: "",
    category: "Wedding",
    thumbnail_type: "url",
    thumbnail_url: "",
    is_active: true,
    display_order: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: galleries, isLoading } = useQuery({
    queryKey: ['admin-galleries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('galleries')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Gallery[];
    },
  });

  // Fetch services for category dropdown
  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, title')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from('galleries')
          .update({
            project_name: data.project_name,
            story_text: data.story_text || null,
            location: data.location || null,
            category: data.category,
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
          .from('galleries')
          .insert({
            project_name: data.project_name,
            story_text: data.story_text || null,
            location: data.location || null,
            category: data.category,
            thumbnail_type: data.thumbnail_type,
            thumbnail_url: data.thumbnail_url || null,
            is_active: data.is_active,
            display_order: data.display_order,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-galleries'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingGallery ? "Gallery Updated" : "Gallery Created",
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('galleries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-galleries'] });
      toast({
        title: "Gallery Deleted",
        description: "Gallery has been removed.",
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
        .from('galleries')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-galleries'] });
    },
  });

  const resetForm = () => {
    setFormData({
      project_name: "",
      story_text: "",
      location: "",
      category: "Wedding",
      thumbnail_type: "url",
      thumbnail_url: "",
      is_active: true,
      display_order: 0,
    });
    setEditingGallery(null);
  };

  const handleEdit = (gallery: Gallery) => {
    setEditingGallery(gallery);
    setFormData({
      project_name: gallery.project_name,
      story_text: gallery.story_text || "",
      location: gallery.location || "",
      category: gallery.category || "Wedding",
      thumbnail_type: gallery.thumbnail_type || "url",
      thumbnail_url: gallery.thumbnail_url || "",
      is_active: gallery.is_active,
      display_order: gallery.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      id: editingGallery?.id,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <AdminLoader label="Loading galleries..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Galleries</h1>
          <p className="text-muted-foreground">Manage wedding & pre-wedding galleries</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Gallery
            </Button>
          </DialogTrigger>
          <DialogContent className="admin-theme max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGallery ? "Edit Gallery" : "Add New Gallery"}</DialogTitle>
              <DialogDescription>
                {editingGallery ? "Update gallery details" : "Create a new gallery project"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project_name">Project Name *</Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  placeholder="e.g., Rahul & Priya"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="admin-theme">
                    {services?.map((service) => (
                      <SelectItem key={service.id} value={service.title}>
                        {service.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Jaipur, Rajasthan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="story_text">Story Text</Label>
                <Textarea
                  id="story_text"
                  value={formData.story_text}
                  onChange={(e) => setFormData({ ...formData, story_text: e.target.value })}
                  placeholder="Write the couple's story..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Thumbnail Image</Label>
                <ImageUploader
                  value={formData.thumbnail_url}
                  onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
                  folder="galleries"
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
                  {editingGallery ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {galleries?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Image className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No galleries yet. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {galleries?.map((gallery) => (
            <Card key={gallery.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {gallery.thumbnail_url ? (
                  <img
                    src={gallery.thumbnail_url}
                    alt={gallery.project_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={gallery.is_active ? "default" : "secondary"}>
                    {gallery.is_active ? "Active" : "Hidden"}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{gallery.project_name}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{gallery.category}</Badge>
                  {gallery.location && (
                    <Badge variant="outline">{gallery.location}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={gallery.is_active}
                    onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: gallery.id, is_active: checked })}
                  />
                  <span className="text-sm text-muted-foreground">Visible</span>
                </div>
                <div className="flex gap-2">
                  <Link to={`/secure-portal-9273/galleries/${gallery.id}/photos`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Image className="h-4 w-4 mr-2" />
                      Photos
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(gallery)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this gallery?")) {
                        deleteMutation.mutate(gallery.id);
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

export default Galleries;
