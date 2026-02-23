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
import { Plus, Pencil, Trash2, CreditCard, Loader2, X, Star } from "lucide-react";
import AdminLoader from "@/components/admin/AdminLoader";

interface Plan {
  id: string;
  plan_name: string;
  price: string;
  duration: string | null;
  services: string[];
  bonus_items: string[];
  is_highlighted: boolean;
  is_active: boolean;
  display_order: number;
}

const Plans = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    plan_name: "",
    price: "",
    duration: "",
    services: [] as string[],
    bonus_items: [] as string[],
    is_highlighted: false,
    is_active: true,
    display_order: 0,
  });
  const [newService, setNewService] = useState("");
  const [newBonus, setNewBonus] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Plan[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (data.id) {
        const { error } = await (supabase
          .from('plans') as any)
          .update({
            plan_name: data.plan_name,
            price: data.price,
            duration: data.duration || null,
            services: data.services,
            bonus_items: data.bonus_items,
            is_highlighted: data.is_highlighted,
            is_active: data.is_active,
            display_order: data.display_order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from('plans') as any)
          .insert({
            plan_name: data.plan_name,
            price: data.price,
            duration: data.duration || null,
            services: data.services,
            bonus_items: data.bonus_items,
            is_highlighted: data.is_highlighted,
            is_active: data.is_active,
            display_order: data.display_order,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: editingPlan ? "Plan Updated" : "Plan Created",
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
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      toast({
        title: "Plan Deleted",
        description: "Plan has been removed.",
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
      const { error } = await (supabase
        .from('plans') as any)
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
    },
  });

  const resetForm = () => {
    setFormData({
      plan_name: "",
      price: "",
      duration: "",
      services: [],
      bonus_items: [],
      is_highlighted: false,
      is_active: true,
      display_order: 0,
    });
    setEditingPlan(null);
    setNewService("");
    setNewBonus("");
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      plan_name: plan.plan_name,
      price: plan.price,
      duration: plan.duration || "",
      services: plan.services || [],
      bonus_items: plan.bonus_items || [],
      is_highlighted: plan.is_highlighted,
      is_active: plan.is_active,
      display_order: plan.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      id: editingPlan?.id,
    });
  };

  const addService = () => {
    if (newService.trim()) {
      setFormData({ ...formData, services: [...formData.services, newService.trim()] });
      setNewService("");
    }
  };

  const removeService = (index: number) => {
    setFormData({ ...formData, services: formData.services.filter((_, i) => i !== index) });
  };

  const addBonus = () => {
    if (newBonus.trim()) {
      setFormData({ ...formData, bonus_items: [...formData.bonus_items, newBonus.trim()] });
      setNewBonus("");
    }
  };

  const removeBonus = (index: number) => {
    setFormData({ ...formData, bonus_items: formData.bonus_items.filter((_, i) => i !== index) });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <AdminLoader label="Loading plans..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plans</h1>
          <p className="text-muted-foreground">Manage pricing packages</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="admin-theme max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Edit Plan" : "Add New Plan"}</DialogTitle>
              <DialogDescription>
                {editingPlan ? "Update plan details" : "Create a new pricing plan"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan_name">Plan Name *</Label>
                <Input
                  id="plan_name"
                  value={formData.plan_name}
                  onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                  placeholder="e.g., Premium Package"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g., ₹75,000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 2 Days"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Services</Label>
                <div className="flex gap-2">
                  <Input
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="Add a service"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                  />
                  <Button type="button" onClick={addService} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {formData.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted px-2 py-1 rounded text-sm">
                      <span className="flex-1">{service}</span>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeService(index)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bonus Items</Label>
                <div className="flex gap-2">
                  <Input
                    value={newBonus}
                    onChange={(e) => setNewBonus(e.target.value)}
                    placeholder="Add a bonus"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBonus())}
                  />
                  <Button type="button" onClick={addBonus} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {formData.bonus_items.map((bonus, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted px-2 py-1 rounded text-sm">
                      <span className="flex-1">{bonus}</span>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeBonus(index)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
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
                    checked={formData.is_highlighted}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_highlighted: checked })}
                  />
                  <Label>Highlight</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
                  {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingPlan ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {plans?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No plans yet. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans?.map((plan) => (
            <Card key={plan.id} className={`overflow-hidden ${plan.is_highlighted ? 'border-primary border-2' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {plan.plan_name}
                    {plan.is_highlighted && <Star className="h-4 w-4 text-primary fill-primary" />}
                  </CardTitle>
                  <Badge variant={plan.is_active ? "default" : "secondary"}>
                    {plan.is_active ? "Active" : "Hidden"}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-primary">{plan.price}</div>
                {plan.duration && <p className="text-sm text-muted-foreground">{plan.duration}</p>}
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.services.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Services:</p>
                    <ul className="text-sm space-y-1">
                      {plan.services.slice(0, 3).map((service, i) => (
                        <li key={i}>• {service}</li>
                      ))}
                      {plan.services.length > 3 && (
                        <li className="text-muted-foreground">+{plan.services.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={plan.is_active}
                    onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: plan.id, is_active: checked })}
                  />
                  <span className="text-sm text-muted-foreground">Active</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(plan)} className="flex-1">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this plan?")) {
                        deleteMutation.mutate(plan.id);
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

export default Plans;
