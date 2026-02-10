import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminThemeProvider from "@/components/admin/AdminThemeProvider";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import React, { Component, ErrorInfo, ReactNode } from "react";

// Simple Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 border-2 border-red-500 rounded bg-red-900/20 text-red-200">
          <h2 className="text-xl font-bold mb-2">Something went wrong!</h2>
          <p className="font-mono text-sm bg-black/50 p-4 rounded">
            {this.state.error?.toString()}
          </p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const AdminLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/admin/login');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

      if (!roleData) {
        await supabase.auth.signOut();
        navigate('/admin/login');
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have admin privileges.",
        });
        return;
      }

      setIsAdmin(true);
      setIsLoading(false);
    };

    checkAdminAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <AdminThemeProvider>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(190,100%,50%)]" />
            <span className="text-[hsl(215,15%,55%)]">Loading admin panel...</span>
          </div>
        </div>
      </AdminThemeProvider>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminThemeProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            {/* Header with glass effect */}
            <header className="h-14 border-b border-[hsl(222,30%,18%)] bg-[hsl(222,47%,8%)]/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-[hsl(215,20%,88%)] hover:text-[hsl(190,100%,50%)] transition-colors" />
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-lg font-bold bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
                    Brotherhood Studio
                  </span>
                  <span className="text-[hsl(215,15%,55%)] text-sm">Admin</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-[hsl(222,30%,25%)] bg-transparent hover:bg-[hsl(190,100%,50%)]/10 hover:border-[hsl(190,100%,50%)]/50 hover:text-[hsl(190,100%,50%)] transition-all"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </header>
            {/* Main content area */}
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminThemeProvider>
  );
};

export default AdminLayout;
