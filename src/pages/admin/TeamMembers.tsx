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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, User, Loader2, Briefcase } from "lucide-react";
import AdminLoader from "@/components/admin/AdminLoader";
import { Link } from "react-router-dom";
import ImageUploader from "@/components/admin/ImageUploader";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo_type: string | null;
  photo_url: string | null;
  bio: string | null;
  view_work_enabled: boolean;
  is_visible: boolean;
  display_order: number;
}

const TeamMembers = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    photo_type: "url",
    photo_url: "",
    bio: "",
    view_work_enabled: false,
    is_visible: true,
    display_order: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ['admin-team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as TeamMember[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from('team_members')
          .update({
            name: data.name,
            role: data.role,
            photo_type: data.photo_type,
            photo_url: data.photo_url || null,
            bio: data.bio || null,
            view_work_enabled: data.view_work_enabled,
            is_visible: data.is_visible,
            display_order: data.display_order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('team_members')
          .insert({
            name: data.name,
            role: data.role,
            photo_type: data.photo_type,
            photo_url: data.photo_url || null,
            bio: data.bio || null,
            view_work_enabled: data.view_work_enabled,
            is_visible: data.is_visible,
            display_order: data.display_order,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingMember ? "Member Updated" : "Member Created",
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
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
      toast({
        title: "Member Deleted",
        description: "Team member has been removed.",
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
        .from('team_members')
        .update({ is_visible, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team-members'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      photo_type: "url",
      photo_url: "",
      bio: "",
      view_work_enabled: false,
      is_visible: true,
      display_order: 0,
    });
    setEditingMember(null);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      photo_type: member.photo_type || "url",
      photo_url: member.photo_url || "",
      bio: member.bio || "",
      view_work_enabled: member.view_work_enabled,
      is_visible: member.is_visible,
      display_order: member.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      id: editingMember?.id,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <AdminLoader label="Loading team..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">Manage your team</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="admin-theme max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMember ? "Edit Member" : "Add New Member"}</DialogTitle>
              <DialogDescription>
                {editingMember ? "Update team member details" : "Add a new team member"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Rahul Sharma"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Lead Photographer"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Photo</Label>
                <ImageUploader
                  value={formData.photo_url}
                  onChange={(url) => setFormData({ ...formData, photo_url: url })}
                  folder="team-members"
                  placeholder="Photo URL or upload"
                  previewAspect="square"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Short bio about the team member..."
                  rows={3}
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

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.view_work_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, view_work_enabled: checked })}
                  />
                  <Label>View Work Enabled</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_visible}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                  />
                  <Label>Visible</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
                  {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingMember ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {members?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No team members yet. Add your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members?.map((member) => (
            <Card key={member.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={member.photo_url || undefined} />
                    <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={member.is_visible ? "default" : "secondary"}>
                        {member.is_visible ? "Visible" : "Hidden"}
                      </Badge>
                      {member.view_work_enabled && (
                        <Badge variant="outline">View Work</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {member.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{member.bio}</p>
                )}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={member.is_visible}
                    onCheckedChange={(checked) => toggleVisibleMutation.mutate({ id: member.id, is_visible: checked })}
                  />
                  <span className="text-sm text-muted-foreground">Visible</span>
                </div>
                <div className="flex gap-2">
                  {member.view_work_enabled && (
                    <Link to={`/secure-portal-9273/team/${member.id}/work`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Image className="h-4 w-4 mr-2" />
                        Work
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleEdit(member)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this team member?")) {
                        deleteMutation.mutate(member.id);
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

export default TeamMembers;
