import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const DebugHomeFilm = () => {
    // Fetch home projects with linked film data
    // We use the admin client (implicitly via auth context) so we should see everything
    const { data: debugData, isLoading } = useQuery({
        queryKey: ['debug-home-films'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('home_projects')
                .select(`
          *,
          film:films(*)
        `)
                .eq('category', 'film')
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data;
        },
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Home Film Debugger</CardTitle>
                    <p className="text-muted-foreground">
                        This tool helps diagnose why a film might not be appearing on the home page.
                        <br />
                        For a film to appear, <strong>BOTH</strong> the "Home Project" and the "Original Film" must be visible.
                    </p>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Home Project Title</TableHead>
                                <TableHead>Project Visibility</TableHead>
                                <TableHead>Linked Film</TableHead>
                                <TableHead>Film Visibility</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {debugData?.map((item) => {
                                const isProjectVisible = item.is_visible;
                                const film = item.film;
                                const isFilmVisible = film?.is_visible;

                                let status = "OK";
                                let statusColor = "text-green-500";
                                let StatusIcon = CheckCircle;

                                if (!film) {
                                    status = "CRITICAL: No linked film found (or deleted)";
                                    statusColor = "text-red-500";
                                    StatusIcon = AlertTriangle;
                                } else if (!isProjectVisible) {
                                    status = "Hidden (Project is set to hidden)";
                                    statusColor = "text-yellow-500";
                                    StatusIcon = XCircle;
                                } else if (!isFilmVisible) {
                                    status = "ERROR: Real Film is Hidden! Go to Films and make it visible.";
                                    statusColor = "text-red-500";
                                    StatusIcon = AlertTriangle;
                                }

                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.display_order}</TableCell>
                                        <TableCell className="font-medium">{item.title}</TableCell>
                                        <TableCell>
                                            <Badge variant={isProjectVisible ? "default" : "secondary"}>
                                                {isProjectVisible ? "Visible" : "Hidden"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {film ? (
                                                <span>{film.title}</span>
                                            ) : (
                                                <span className="text-destructive">Missing Link</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {film ? (
                                                <Badge variant={isFilmVisible ? "default" : "destructive"}>
                                                    {isFilmVisible ? "Visible" : "Hidden"}
                                                </Badge>
                                            ) : (
                                                "-"
                                            )}
                                        </TableCell>
                                        <TableCell className={statusColor}>
                                            <div className="flex items-center gap-2">
                                                <StatusIcon className="h-4 w-4" />
                                                {status}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default DebugHomeFilm;
