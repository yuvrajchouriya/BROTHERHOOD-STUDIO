import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Plus, Pencil, Trash, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AdminLog {
  id: string;
  admin_id: string;
  action_type: string;
  module: string;
  details: unknown;
  ip_address: string | null;
  created_at: string;
}

const AdminLogs = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Plus className="h-4 w-4 text-green-500" />;
      case 'update': return <Pencil className="h-4 w-4 text-blue-500" />;
      case 'delete': return <Trash className="h-4 w-4 text-red-500" />;
      case 'view': return <Eye className="h-4 w-4 text-gray-500" />;
      default: return <ScrollText className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'view': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Logs</h1>
        <p className="text-muted-foreground">Track all admin activities</p>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <ScrollText className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Activity Logging</h3>
              <p className="text-sm text-muted-foreground mt-1">
                All admin actions (create, update, delete) are automatically logged for security and audit purposes.
                Logs are retained for 90 days.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="h-8 w-8 rounded bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 w-48 rounded bg-muted mb-2" />
                    <div className="h-3 w-24 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action_type)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action_type)}`}>
                          {log.action_type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{log.module}</TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details).slice(0, 50) + '...' : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.ip_address || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(log.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ScrollText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No logs recorded yet</p>
              <p className="text-sm">Admin activities will appear here as they happen</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogs;
