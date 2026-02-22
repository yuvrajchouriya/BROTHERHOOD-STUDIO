import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Image, Loader2, ArrowLeft, ZoomIn } from "lucide-react";
import ImageLightbox from "@/components/ImageLightbox";
import MultiImageUploader from "@/components/admin/MultiImageUploader";

interface ServicePhoto {
  id: string;
  service_id: string;
  image_type: string | null;
  image_url: string;
  display_order: number;
}

const ServicePhotos = () => {
  const { id: serviceId } = useParams<{ id: string }>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageUrls, setImageUrls] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  });

  const { data: photos, isLoading } = useQuery({
    queryKey: ['admin-service-photos', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_photos')
        .select('*')
        .eq('service_id', serviceId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as ServicePhoto[];
    },
  });

  const addPhotosMutation = useMutation({
    mutationFn: async (urls: string[]) => {
      const currentMaxOrder = photos?.length || 0;
      const photosToInsert = urls.map((url, index) => ({
        service_id: serviceId!,
        image_type: 'url',
        image_url: url.trim(),
        display_order: currentMaxOrder + index,
      }));

      const { error } = await supabase.from('service_photos').insert(photosToInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-photos', serviceId] });
      setIsDialogOpen(false);
      setImageUrls("");
      toast({
        title: "Photos Added",
        description: "New photos have been added to the service.",
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

  const deletePhotoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('service_photos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-photos', serviceId] });
      toast({
        title: "Photo Deleted",
        description: "Photo has been removed from the service.",
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

  const handleAddPhotos = (e: React.FormEvent) => {
    e.preventDefault();
    const urls = imageUrls.split('\n').filter(url => url.trim());
    if (urls.length === 0) return;
    addPhotosMutation.mutate(urls);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const imageUrlsForLightbox = photos?.map(p => p.image_url) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/secure-portal-9273/services">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{service?.title || "Service"} Photos</h1>
          <p className="text-muted-foreground">Manage photos for this service</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Photos
            </Button>
          </DialogTrigger>
          <DialogContent className="admin-theme">
            <DialogHeader>
              <DialogTitle>Add Photos</DialogTitle>
              <DialogDescription>
                Upload images or add URLs (one per line)
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPhotos} className="space-y-4">
              <MultiImageUploader
                value={imageUrls}
                onChange={setImageUrls}
                folder="service-photos"
                label="Image URLs (one per line)"
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={addPhotosMutation.isPending} className="flex-1">
                  {addPhotosMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Add Photos
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {photos?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Image className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No photos yet. Add some!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {photos?.map((photo, index) => (
            <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={photo.image_url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => openLightbox(index)}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => openLightbox(index)}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    if (confirm("Delete this photo?")) {
                      deletePhotoMutation.mutate(photo.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      <ImageLightbox
        images={imageUrlsForLightbox}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
};

export default ServicePhotos;
