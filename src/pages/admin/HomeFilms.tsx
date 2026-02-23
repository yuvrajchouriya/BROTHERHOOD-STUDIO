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
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, Film, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

interface HomeProject {
    id: string;
    title: string; // Used for alt text or internal name
    video_url: string | null;
    image_url: string | null;
    category: string | null;
    is_visible: boolean;
    display_order: number;
}

const HomeFilms = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<HomeProject | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        video_url: "",
        image_url: "",
        is_visible: true,
    });

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch Home Films (category='film')
    const { data: projects, isLoading } = useQuery({
        queryKey: ['admin-home-films'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('home_projects')
                .select('*')
                .eq('category', 'film')
                .order('display_order', { ascending: true });
            if (error) throw error;
            // Map subtitle to video_url for frontend state
            return data.map((p) => ({
                ...p,
                video_url: p.subtitle
            })) as HomeProject[];
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (data: typeof formData & { id?: string }) => {
            const payload = {
                title: data.title || "Home Film",
                subtitle: data.video_url || null, // Storing URL in subtitle to avoid migration
                image_type: "url",
                image_url: data.image_url || null,
                category: "film",
                film_id: null,
                gallery_id: null,
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
            queryClient.invalidateQueries({ queryKey: ['admin-home-films'] });
            queryClient.invalidateQueries({ queryKey: ['home-featured-film'] });
            setIsDialogOpen(false);
            resetForm();
            toast({
                title: editingProject ? "Updated" : "Created",
                description: "Home Film Image saved successfully.",
            });
        },
        onError: (error) => {
            console.error("Save error:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to save",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('home_projects').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-home-films'] });
            queryClient.invalidateQueries({ queryKey: ['home-featured-film'] });
            toast({
                title: "Deleted",
                description: "Item removed.",
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
            title: "",
            video_url: "",
            image_url: "",
            is_visible: true,
        });
        setEditingProject(null);
    };

    const handleEdit = (project: HomeProject) => {
        setEditingProject(project);
        setFormData({
            title: project.title,
            video_url: project.video_url || "", // This is already mapped from subtitle in useQuery
            image_url: project.image_url || "",
            is_visible: project.is_visible,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate({
            ...formData,
            id: editingProject?.id,
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
                    <h1 className="text-3xl font-bold">Home Films Image</h1>
                    <p className="text-muted-foreground">Upload an image and set a URL for the home page film box.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Image
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="admin-theme max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingProject ? "Edit Image" : "Add Image"}</DialogTitle>
                            <DialogDescription>
                                Upload the image to show in the box.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div className="space-y-2">
                                <Label>Title (Internal use)</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Main Wedding Video"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Upload Image *</Label>
                                <ImageUploader
                                    value={formData.image_url}
                                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                                    folder="home_films"
                                    placeholder="Upload poster image"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Target URL *</Label>
                                <div className="flex items-center space-x-2">
                                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={formData.video_url}
                                        onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                        placeholder="https://youtube.com/..."
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Link where the user goes when clicking the image.</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.is_visible}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                                />
                                <Label>Visible</Label>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={saveMutation.isPending || !formData.image_url} className="flex-1">
                                    {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Save
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

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
                            <div className="absolute top-2 right-2">
                                <Badge variant={project.is_visible ? "default" : "secondary"}>
                                    {project.is_visible ? "Visible" : "Hidden"}
                                </Badge>
                            </div>
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg truncate">{project.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-xs text-muted-foreground truncate">
                                {project.video_url}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(project)} className="flex-1">
                                    <Pencil className="h-4 w-4 mr-2" /> Edit
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                    if (confirm("Delete this?")) deleteMutation.mutate(project.id);
                                }}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default HomeFilms;
