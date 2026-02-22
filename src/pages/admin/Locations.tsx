import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Pencil, Trash2, MapPin, Loader2 } from "lucide-react";

interface Location {
  id: string;
  city_name: string;
  google_map_url: string | null;
  status: string;
  display_order: number;
}

const Locations = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    city_name: "",
    google_map_url: "",
    status: "Active",
    display_order: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: locations, isLoading } = useQuery({
    queryKey: ['admin-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Location[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from('locations')
          .update({
            city_name: data.city_name,
            google_map_url: data.google_map_url || null,
            status: data.status,
            display_order: data.display_order,
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('locations')
          .insert({
            city_name: data.city_name,
            google_map_url: data.google_map_url || null,
            status: data.status,
            display_order: data.display_order,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-locations'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingLocation ? "Location Updated" : "Location Created",
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
      const { error } = await supabase.from('locations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-locations'] });
      toast({
        title: "Location Deleted",
        description: "Location has been removed.",
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

  const resetForm = () => {
    setFormData({
      city_name: "",
      google_map_url: "",
      status: "Active",
      display_order: 0,
    });
    setEditingLocation(null);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      city_name: location.city_name,
      google_map_url: location.google_map_url || "",
      status: location.status,
      display_order: location.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      id: editingLocation?.id,
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-muted-foreground">Manage service locations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="admin-theme">
            <DialogHeader>
              <DialogTitle>{editingLocation ? "Edit Location" : "Add New Location"}</DialogTitle>
              <DialogDescription>
                {editingLocation ? "Update location details" : "Add a new service location"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="city_name">City Name *</Label>
                <Input
                  id="city_name"
                  value={formData.city_name}
                  onChange={(e) => setFormData({ ...formData, city_name: e.target.value })}
                  placeholder="e.g., Jaipur"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="google_map_url">Google Map URL or Embed Code</Label>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    Tip: Use 'Share &gt; Embed map' from Google Maps
                  </span>
                </div>
                <Input
                  id="google_map_url"
                  value={formData.google_map_url}
                  onChange={(e) => setFormData({ ...formData, google_map_url: e.target.value })}
                  placeholder="Paste link or iframe code"
                />
              </div>

              {formData.google_map_url && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="aspect-video border border-border/50 rounded overflow-hidden bg-black/5 flex items-center justify-center relative">
                    {(() => {
                      let url = formData.google_map_url;
                      if (!url) return null;

                      if (url.includes('<iframe')) {
                        const srcMatch = url.match(/src="([^"]+)"/);
                        if (srcMatch) url = srcMatch[1];
                      }

                      const apiKey = "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8";
                      const zoomValue = 18; // Use studio zoom for preview

                      let embedUrl = "";
                      if (url.includes('google.com/maps/embed') || url.includes('/embed')) {
                        const baseUrl = url.split('?')[0];
                        const params = new URLSearchParams(url.split('?')[1] || "");

                        if (url.includes('v1/place')) {
                          params.set('zoom', zoomValue.toString());
                          embedUrl = `${baseUrl}?${params.toString()}`;
                        } else {
                          embedUrl = url;
                        }
                      } else {
                        const placeMatch = url.match(/place\/([^/]+)/);
                        const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

                        if (placeMatch) {
                          embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${placeMatch[1]}&zoom=${zoomValue}`;
                        } else if (coordMatch) {
                          embedUrl = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${coordMatch[1]},${coordMatch[2]}&zoom=${zoomValue}`;
                        }
                      }

                      if (embedUrl) {
                        return (
                          <iframe
                            src={embedUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            title="Map Preview"
                          />
                        );
                      }
                      return (
                        <div className="text-[10px] text-muted-foreground p-4 text-center">
                          Initial city view will be used if exact location link is invalid.
                          <br />
                          Make sure to use a valid Google Maps link.
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="admin-theme">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="ComingSoon">Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
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

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
                  {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingLocation ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {locations?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No locations yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations?.map((location) => (
            <Card key={location.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {location.city_name}
                  </CardTitle>
                  <Badge variant={location.status === 'Active' ? 'default' : 'secondary'}>
                    {location.status === 'ComingSoon' ? 'Coming Soon' : location.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {location.google_map_url && (
                  <a
                    href={location.google_map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block truncate"
                  >
                    View on Map
                  </a>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(location)} className="flex-1">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this location?")) {
                        deleteMutation.mutate(location.id);
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

export default Locations;
