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
import { Plus, Pencil, Trash2, Film as FilmIcon, Loader2, Play } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

interface Film {
  id: string;
  title: string;
  category: string | null;
  thumbnail_type: string | null;
  thumbnail_url: string | null;
  youtube_url: string | null;
  location: string | null;
  is_visible: boolean;
  display_order: number;
}

const Films = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFilm, setEditingFilm] = useState<Film | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "Wedding",
    thumbnail_type: "url",
    thumbnail_url: "",
    youtube_url: "",
    location: "",
    is_visible: true,
    display_order: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: films, isLoading } = useQuery({
    queryKey: ['admin-films'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('films')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Film[];
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
          .from('films')
          .update({
            title: data.title,
            category: data.category,
            thumbnail_type: data.thumbnail_type,
            thumbnail_url: data.thumbnail_url || null,
            youtube_url: data.youtube_url || null,
            location: data.location || null,
            is_visible: data.is_visible,
            display_order: data.display_order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('films')
          .insert({
            title: data.title,
            category: data.category,
            thumbnail_type: data.thumbnail_type,
            thumbnail_url: data.thumbnail_url || null,
            youtube_url: data.youtube_url || null,
            location: data.location || null,
            is_visible: data.is_visible,
            display_order: data.display_order,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-films'] });
      queryClient.invalidateQueries({ queryKey: ['home-featured-film'] }); // Invalidate home page
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingFilm ? "Film Updated" : "Film Created",
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
      const { error } = await supabase.from('films').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-films'] });
      queryClient.invalidateQueries({ queryKey: ['home-featured-film'] }); // Invalidate home page
      toast({
        title: "Film Deleted",
        description: "Film has been removed.",
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
        .from('films')
        .update({ is_visible, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-films'] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      category: "Wedding",
      thumbnail_type: "url",
      thumbnail_url: "",
      youtube_url: "",
      location: "",
      is_visible: true,
      display_order: 0,
    });
    setEditingFilm(null);
  };

  const handleEdit = (film: Film) => {
    setEditingFilm(film);
    setFormData({
      title: film.title,
      category: film.category || "Wedding",
      thumbnail_type: film.thumbnail_type || "url",
      thumbnail_url: film.thumbnail_url || "",
      youtube_url: film.youtube_url || "",
      location: film.location || "",
      is_visible: film.is_visible,
      display_order: film.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      id: editingFilm?.id,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <AdminLoader label="Loading films..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Films</h1>
          <p className="text-muted-foreground">Manage wedding films & reels</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Film
            </Button>
          </DialogTrigger>
          <DialogContent className="admin-theme max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingFilm ? "Edit Film" : "Add New Film"}</DialogTitle>
              <DialogDescription>
                {editingFilm ? "Update film details" : "Create a new film entry"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Rahul & Priya Wedding Film"
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
                <Label htmlFor="youtube_url">YouTube URL *</Label>
                <Input
                  id="youtube_url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="space-y-2">
                <Label>Thumbnail Image</Label>
                <ImageUploader
                  value={formData.thumbnail_url}
                  onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
                  folder="films"
                  placeholder="Thumbnail URL or upload"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Udaipur, Rajasthan"
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
                  {editingFilm ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {films?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FilmIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No films yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {films?.map((film) => (
            <Card key={film.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {film.thumbnail_url ? (
                  <img
                    src={film.thumbnail_url}
                    alt={film.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FilmIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {film.youtube_url && (
                  <a
                    href={film.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Play className="h-12 w-12 text-white" />
                  </a>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={film.is_visible ? "default" : "secondary"}>
                    {film.is_visible ? "Visible" : "Hidden"}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{film.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{film.category}</Badge>
                  {film.location && (
                    <Badge variant="outline">{film.location}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={film.is_visible}
                    onCheckedChange={(checked) => toggleVisibleMutation.mutate({ id: film.id, is_visible: checked })}
                  />
                  <span className="text-sm text-muted-foreground">Visible</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(film)} className="flex-1">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this film?")) {
                        deleteMutation.mutate(film.id);
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

export default Films;
