import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Film, Loader2, Play } from "lucide-react";
import AdminLoader from "@/components/admin/AdminLoader";

interface ServiceGallery {
  id: string;
  service_id: string;
  gallery_id: string;
  description: string | null;
  display_order: number;
  gallery?: {
    id: string;
    project_name: string;
    thumbnail_url: string | null;
    location: string | null;
  };
}

interface ServiceFilm {
  id: string;
  service_id: string;
  film_id: string;
  description: string | null;
  display_order: number;
  film?: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    youtube_url: string | null;
    location: string | null;
  };
}

interface Gallery {
  id: string;
  project_name: string;
  thumbnail_url: string | null;
}

interface FilmOption {
  id: string;
  title: string;
  thumbnail_url: string | null;
}

const ServiceContent = () => {
  const { id: serviceId } = useParams<{ id: string }>();
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);
  const [isFilmDialogOpen, setIsFilmDialogOpen] = useState(false);
  const [galleryFormData, setGalleryFormData] = useState({
    gallery_id: "",
    description: "",
    display_order: 0,
  });
  const [filmFormData, setFilmFormData] = useState({
    film_id: "",
    description: "",
    display_order: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch service details
  const { data: service } = useQuery({
    queryKey: ['admin-service', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!serviceId,
  });

  // Fetch service galleries
  const { data: serviceGalleries, isLoading: galleriesLoading } = useQuery({
    queryKey: ['admin-service-galleries', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_galleries')
        .select(`
          *,
          gallery:galleries(id, project_name, thumbnail_url, location)
        `)
        .eq('service_id', serviceId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as ServiceGallery[];
    },
    enabled: !!serviceId,
  });

  // Fetch service films
  const { data: serviceFilms, isLoading: filmsLoading } = useQuery({
    queryKey: ['admin-service-films', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_films')
        .select(`
          *,
          film:films(id, title, thumbnail_url, youtube_url, location)
        `)
        .eq('service_id', serviceId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as ServiceFilm[];
    },
    enabled: !!serviceId,
  });

  // Fetch all galleries for dropdown
  const { data: allGalleries } = useQuery({
    queryKey: ['admin-galleries-dropdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('galleries')
        .select('id, project_name, thumbnail_url')
        .order('project_name');
      if (error) throw error;
      return data as Gallery[];
    },
  });

  // Fetch all films for dropdown
  const { data: allFilms } = useQuery({
    queryKey: ['admin-films-dropdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('films')
        .select('id, title, thumbnail_url')
        .order('title');
      if (error) throw error;
      return data as FilmOption[];
    },
  });

  // Add gallery mutation
  const addGalleryMutation = useMutation({
    mutationFn: async (data: typeof galleryFormData) => {
      const { error } = await (supabase
        .from('service_galleries') as any)
        .insert({
          service_id: serviceId,
          gallery_id: data.gallery_id,
          description: data.description || null,
          display_order: data.display_order,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-galleries', serviceId] });
      setIsGalleryDialogOpen(false);
      setGalleryFormData({ gallery_id: "", description: "", display_order: 0 });
      toast({ title: "Gallery Added", description: "Gallery linked to service successfully." });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      toast({ variant: "destructive", title: "Error", description: message });
    },
  });

  // Add film mutation
  const addFilmMutation = useMutation({
    mutationFn: async (data: typeof filmFormData) => {
      const { error } = await (supabase
        .from('service_films') as any)
        .insert({
          service_id: serviceId,
          film_id: data.film_id,
          description: data.description || null,
          display_order: data.display_order,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-films', serviceId] });
      setIsFilmDialogOpen(false);
      setFilmFormData({ film_id: "", description: "", display_order: 0 });
      toast({ title: "Film Added", description: "Film linked to service successfully." });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      toast({ variant: "destructive", title: "Error", description: message });
    },
  });

  // Delete gallery mutation
  const deleteGalleryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('service_galleries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-galleries', serviceId] });
      toast({ title: "Gallery Removed" });
    },
  });

  // Delete film mutation
  const deleteFilmMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('service_films').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-films', serviceId] });
      toast({ title: "Film Removed" });
    },
  });

  const handleAddGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryFormData.gallery_id) {
      toast({ variant: "destructive", title: "Error", description: "Please select a gallery" });
      return;
    }
    addGalleryMutation.mutate(galleryFormData);
  };

  const handleAddFilm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filmFormData.film_id) {
      toast({ variant: "destructive", title: "Error", description: "Please select a film" });
      return;
    }
    addFilmMutation.mutate(filmFormData);
  };

  if (!service) {
    return (
      <div className="flex items-center justify-center h-64">
        <AdminLoader label="Loading service..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/secure-portal-9273/services">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{service.title}</h1>
          <p className="text-muted-foreground">Service content manage करें - Galleries & Films</p>
        </div>
      </div>

      <Tabs defaultValue="galleries" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="galleries" className="gap-2">
            <Image className="h-4 w-4" />
            Galleries ({serviceGalleries?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="films" className="gap-2">
            <Film className="h-4 w-4" />
            Films ({serviceFilms?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Galleries Tab */}
        <TabsContent value="galleries" className="space-y-4">
          <div className="flex justify-end">
            {/* Add Gallery Button Removed as per request */}
          </div>

          {/* Dialog removed/commented out */}

          <Dialog open={isGalleryDialogOpen} onOpenChange={setIsGalleryDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Gallery
              </Button>
            </DialogTrigger>
            <DialogContent className="admin-theme">
              <DialogHeader>
                <DialogTitle>Add Gallery to Service</DialogTitle>
                <DialogDescription>
                  Existing galleries में से select करें
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddGallery} className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Gallery *</Label>
                  <Select
                    value={galleryFormData.gallery_id || "none"}
                    onValueChange={(value) => setGalleryFormData({ ...galleryFormData, gallery_id: value === "none" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a gallery" />
                    </SelectTrigger>
                    <SelectContent className="admin-theme">
                      <SelectItem value="none">-- Select Gallery --</SelectItem>
                      {allGalleries?.map((gallery) => (
                        <SelectItem key={gallery.id} value={gallery.id}>
                          {gallery.project_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={galleryFormData.description}
                    onChange={(e) => setGalleryFormData({ ...galleryFormData, description: e.target.value })}
                    placeholder="इस gallery के बारे में कुछ लिखें..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={galleryFormData.display_order}
                    onChange={(e) => setGalleryFormData({ ...galleryFormData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={addGalleryMutation.isPending} className="flex-1">
                    {addGalleryMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Add Gallery
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsGalleryDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>


          {galleriesLoading ? (
            <div className="flex items-center justify-center h-32">
              <AdminLoader size="sm" label="Loading galleries..." />
            </div>
          ) : serviceGalleries?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Image className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No galleries added yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {serviceGalleries?.map((sg) => (
                <Card key={sg.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {sg.gallery?.thumbnail_url ? (
                      <img src={sg.gallery.thumbnail_url} alt={sg.gallery?.project_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{sg.gallery?.project_name}</CardTitle>
                    {sg.gallery?.location && (
                      <Badge variant="outline">{sg.gallery.location}</Badge>
                    )}
                    {sg.description && (
                      <p className="text-sm text-muted-foreground mt-2">{sg.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Remove this gallery from service?")) {
                          deleteGalleryMutation.mutate(sg.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive mr-2" />
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Films Tab */}
        <TabsContent value="films" className="space-y-4">
          <div className="flex justify-end">

            <Dialog open={isFilmDialogOpen} onOpenChange={setIsFilmDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Film
                </Button>
              </DialogTrigger>
              <DialogContent className="admin-theme">
                <DialogHeader>
                  <DialogTitle>Add Film to Service</DialogTitle>
                  <DialogDescription>
                    Existing films में से select करें
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddFilm} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Film *</Label>
                    <Select
                      value={filmFormData.film_id || "none"}
                      onValueChange={(value) => setFilmFormData({ ...filmFormData, film_id: value === "none" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a film" />
                      </SelectTrigger>
                      <SelectContent className="admin-theme">
                        <SelectItem value="none">-- Select Film --</SelectItem>
                        {allFilms?.map((film) => (
                          <SelectItem key={film.id} value={film.id}>
                            {film.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                      value={filmFormData.description}
                      onChange={(e) => setFilmFormData({ ...filmFormData, description: e.target.value })}
                      placeholder="इस film के बारे में कुछ लिखें..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Display Order</Label>
                    <Input
                      type="number"
                      value={filmFormData.display_order}
                      onChange={(e) => setFilmFormData({ ...filmFormData, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={addFilmMutation.isPending} className="flex-1">
                      {addFilmMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Add Film
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsFilmDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

          </div>

          {filmsLoading ? (
            <div className="flex items-center justify-center h-32">
              <AdminLoader size="sm" label="Loading films..." />
            </div>
          ) : serviceFilms?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Film className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No films added yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {serviceFilms?.map((sf) => (
                <Card key={sf.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    {sf.film?.thumbnail_url ? (
                      <img src={sf.film.thumbnail_url} alt={sf.film?.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {sf.film?.youtube_url && (
                      <a
                        href={sf.film.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Play className="h-12 w-12 text-white" />
                      </a>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{sf.film?.title}</CardTitle>
                    {sf.film?.location && (
                      <Badge variant="outline">{sf.film.location}</Badge>
                    )}
                    {sf.description && (
                      <p className="text-sm text-muted-foreground mt-2">{sf.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Remove this film from service?")) {
                          deleteFilmMutation.mutate(sf.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive mr-2" />
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceContent;
