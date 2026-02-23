import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Loader2, Phone, Mail, Calendar, MapPin, Trash2, Eye, ExternalLink } from "lucide-react";
import AdminLoader from "@/components/admin/AdminLoader";
import { format } from "date-fns";
import { useState } from "react";

interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  event_type: string | null;
  event_date: string | null;
  location: string | null;
  message: string | null;
  source: string | null;
  status: string;
  created_at: string;
}

const Enquiries = () => {
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: enquiries, isLoading } = useQuery({
    queryKey: ['admin-enquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Enquiry[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('enquiries')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({
        title: "Status Updated",
        description: "Enquiry status has been updated.",
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
      const { error } = await supabase.from('enquiries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({
        title: "Enquiry Deleted",
        description: "Enquiry has been removed.",
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'New': return 'default';
      case 'Contacted': return 'secondary';
      case 'Closed': return 'outline';
      default: return 'default';
    }
  };

  const openWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Hi ${name}, thank you for contacting Brotherhood Studio. We received your enquiry and would love to discuss further.`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <AdminLoader label="Loading enquiries..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enquiries</h1>
        <p className="text-muted-foreground">Manage booking requests</p>
      </div>

      {enquiries?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No enquiries yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {enquiries?.map((enquiry) => (
            <Card key={enquiry.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{enquiry.name}</CardTitle>
                    <Badge variant={getStatusVariant(enquiry.status)}>{enquiry.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={enquiry.status}
                      onValueChange={(value) => updateStatusMutation.mutate({ id: enquiry.id, status: value })}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="admin-theme">
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => setSelectedEnquiry(enquiry)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openWhatsApp(enquiry.phone, enquiry.name)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (confirm("Delete this enquiry?")) {
                          deleteMutation.mutate(enquiry.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{enquiry.phone}</span>
                  </div>
                  {enquiry.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{enquiry.email}</span>
                    </div>
                  )}
                  {enquiry.event_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(enquiry.event_date), 'dd MMM yyyy')}</span>
                    </div>
                  )}
                  {enquiry.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{enquiry.location}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(enquiry.created_at), 'dd MMM yyyy, hh:mm a')}
                  {enquiry.event_type && ` • ${enquiry.event_type}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedEnquiry} onOpenChange={() => setSelectedEnquiry(null)}>
        <DialogContent className="admin-theme">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
            <DialogDescription>
              Full details of the booking request
            </DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{selectedEnquiry.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p>{selectedEnquiry.phone}</p>
                </div>
                {selectedEnquiry.email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{selectedEnquiry.email}</p>
                  </div>
                )}
                {selectedEnquiry.event_type && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Event Type</p>
                    <p>{selectedEnquiry.event_type}</p>
                  </div>
                )}
                {selectedEnquiry.event_date && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Event Date</p>
                    <p>{format(new Date(selectedEnquiry.event_date), 'dd MMM yyyy')}</p>
                  </div>
                )}
                {selectedEnquiry.location && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p>{selectedEnquiry.location}</p>
                  </div>
                )}
              </div>
              {selectedEnquiry.message && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Message</p>
                  <p className="bg-muted p-3 rounded-md">{selectedEnquiry.message}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={() => openWhatsApp(selectedEnquiry.phone, selectedEnquiry.name)} className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" onClick={() => setSelectedEnquiry(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Enquiries;
