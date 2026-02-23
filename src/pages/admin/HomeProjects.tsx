import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, Home, Loader2, Image as ImageIcon, Film } from "lucide-react";
import AdminLoader from "@/components/admin/AdminLoader";

interface HomeProject {
  id: string;
  title: string;
  subtitle: string | null;
  image_type: string | null;
  image_url: string | null;
  gallery_id: string | null;
  film_id: string | null;
  category: string | null;
  display_order: number;
  is_visible: boolean;
}

interface Gallery {
  id: string;
  project_name: string;
  thumbnail_url: string | null;
  location: string | null;
}

interface FilmOption {
  id: string;
  title: string;
  thumbnail_url: string | null;
  location: string | null;
}

const HomeProjects = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<HomeProject | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "gallery",
    image_url: "",
    gallery_id: "",
    film_id: "",
    display_order: 0,
    is_visible: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['admin-home-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_projects')
        .select('*')
        .eq('category', 'gallery')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as HomeProject[];
    },
  });

  const { data: galleries } = useQuery({
    queryKey: ['admin-galleries-dropdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('galleries')
        .select('id, project_name, thumbnail_url, location')
        .order('project_name');
      if (error) throw error;
      return data as Gallery[];
    },
  });

  const { data: films } = useQuery({
    queryKey: ['admin-films-dropdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('films')
        .select('id, title, thumbnail_url, location')
        .order('title');
      if (error) throw error;
      return data as FilmOption[];
    },
  });

  // Handle gallery selection
  const handleGalleryChange = (galleryId: string) => {
    const selectedGallery = galleries?.find(g => g.id === galleryId);
    setFormData({
      ...formData,
      gallery_id: galleryId === "none" ? "" : galleryId,
      image_url: selectedGallery?.thumbnail_url || "",
      title: selectedGallery?.project_name || formData.title,
      subtitle: selectedGallery?.location || formData.subtitle
    });
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        title: data.title,
        subtitle: data.subtitle || null,
        image_type: "url",
        image_url: data.image_url || null,
        category: "gallery",
        gallery_id: data.gallery_id || null,
        film_id: null,
        display_order: data.display_order,
        is_visible: data.is_visible,
        updated_at: new Date().toISOString(),
      };

      if (data.id) {
        const { error } = await supabase
          .from('home_projects')
          .update(payload)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('home_projects')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-home-projects'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingProject ? "Gallery Updated" : "Gallery Added",
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
      const { error } = await supabase.from('home_projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-home-projects'] });
      toast({
        title: "Project Deleted",
        description: "Home gallery has been removed.",
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

  const toggleVisibleMutation = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase
        .from('home_projects')
        .update({ is_visible, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-home-projects'] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      category: "gallery",
      image_url: "",
      gallery_id: "",
      film_id: "",
      display_order: 0,
      is_visible: true,
    });
    setEditingProject(null);
  };

  const handleEdit = (project: HomeProject) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      subtitle: project.subtitle || "",
      category: "gallery",
      image_url: project.image_url || "",
      gallery_id: project.gallery_id || "",
      film_id: "",
      display_order: project.display_order,
      is_visible: project.is_visible,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.gallery_id) {
      toast({ variant: "destructive", title: "Error", description: "Please select a gallery" });
      return;
    }

    saveMutation.mutate({
      ...formData,
      id: editingProject?.id,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <AdminLoader label="Loading projects..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Home Page Galleries</h1>
          <p className="text-muted-foreground">Manage the "Stories We've Told" section on your home page</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Home Gallery
            </Button>
          </DialogTrigger>
          <DialogContent className="admin-theme max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Gallery" : "Add Gallery"}</DialogTitle>
              <DialogDescription>
                Select a gallery to feature on the home page
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Gallery Selection */}
              <div className="space-y-2">
                <Label>Select Gallery *</Label>
                <Select
                  value={formData.gallery_id || "none"}
                  onValueChange={handleGalleryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a gallery" />
                  </SelectTrigger>
                  <SelectContent className="admin-theme">
                    <SelectItem value="none">-- Select Gallery --</SelectItem>
                    {galleries?.map((gallery) => (
                      <SelectItem key={gallery.id} value={gallery.id}>
                        {gallery.project_name} {gallery.location ? `(${gallery.location})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">From 'Galleries' section</p>
              </div>

              {/* Preview Image */}
              {formData.image_url && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Title (auto-filled but editable) */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Auto-filled from selection"
                  required
                />
              </div>

              {/* Subtitle (auto-filled but editable) */}
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Location or description"
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
                  checked={formData.is_visible}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                />
                <Label>Visible on website</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
                  {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingProject ? "Update" : "Add to Home"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Home className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No home galleries yet. Add one to feature on your home page!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {project.image_url ? (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant="outline" className="bg-background/80">
                    <ImageIcon className="h-3 w-3 mr-1" /> Gallery
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant={project.is_visible ? "default" : "secondary"}>
                    {project.is_visible ? "Visible" : "Hidden"}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                {project.subtitle && (
                  <p className="text-sm text-muted-foreground">{project.subtitle}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={project.is_visible}
                    onCheckedChange={(checked) => toggleVisibleMutation.mutate({ id: project.id, is_visible: checked })}
                  />
                  <span className="text-sm text-muted-foreground">Visible</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(project)} className="flex-1">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to remove this gallery from home page?")) {
                        deleteMutation.mutate(project.id);
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

export default HomeProjects;
