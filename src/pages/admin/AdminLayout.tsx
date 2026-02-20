import { useEffect, useState, useCallback, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminThemeProvider from "@/components/admin/AdminThemeProvider";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, Clock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import React, { Component, ErrorInfo, ReactNode } from "react";

const SESSION_TIMEOUT_MS = 15 * 60 * 1000;  // 15 minutes
const WARNING_AT_MS = 13 * 60 * 1000;        // warn at 13 min

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("Admin error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 border-2 border-red-500 rounded bg-red-900/20 text-red-200">
          <h2 className="text-xl font-bold mb-2">Something went wrong!</h2>
          <p className="font-mono text-sm bg-black/50 p-4 rounded">{this.state.error?.toString()}</p>
          <button className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white" onClick={() => this.setState({ hasError: false })}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AdminLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(SESSION_TIMEOUT_MS / 1000);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Refs for timers (stable across re-renders)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const hasWarnedRef = useRef(false);

  // Log activity to DB
  const logActivity = useCallback(async (action: string, resource?: string, details?: Record<string, unknown>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase.from("admin_activity_log").insert({
        admin_id: session.user.id,
        admin_email: session.user.email,
        action,
        resource: resource || null,
        details: details || null,
        user_agent: navigator.userAgent.substring(0, 200),
      });
    } catch (_) { /* non-blocking */ }
  }, []);

  const doLogout = useCallback(async (reason: "manual" | "timeout") => {
    if (reason === "timeout") {
      await logActivity("SESSION_TIMEOUT");
    } else {
      await logActivity("LOGOUT");
    }
    await supabase.auth.signOut();
    if (reason === "timeout") {
      toast({ variant: "destructive", title: "Session Expired", description: "You've been logged out due to 15 minutes of inactivity." });
    }
    navigate("/admin/login");
  }, [logActivity, navigate, toast]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    hasWarnedRef.current = false;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    // Warning at 13 min
    warningRef.current = setTimeout(() => {
      if (!hasWarnedRef.current) {
        hasWarnedRef.current = true;
        toast({ title: "⚠️ Session Expiring", description: "You'll be logged out in 2 minutes due to inactivity. Move your mouse to stay logged in.", });
      }
    }, WARNING_AT_MS);

    // Logout at 15 min
    timeoutRef.current = setTimeout(() => {
      doLogout("timeout");
    }, SESSION_TIMEOUT_MS);
  }, [doLogout, toast]);

  // Activity listeners
  useEffect(() => {
    if (!isAdmin) return;

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    const handleActivity = () => resetTimer();
    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));

    // Countdown interval
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = Math.max(0, Math.ceil((SESSION_TIMEOUT_MS - elapsed) / 1000));
      setSessionSecondsLeft(remaining);
    }, 1000);

    resetTimer(); // start timer

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAdmin, resetTimer]);

  // Auth check
  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }

      const { data: roleData } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", session.user.id).eq("role", "admin").single();

      if (!roleData) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        toast({ variant: "destructive", title: "Access Denied", description: "You don't have admin privileges." });
        return;
      }

      setAdminEmail(session.user.email ?? null);
      setIsAdmin(true);
      setIsLoading(false);
      logActivity("SESSION_START");
    };

    checkAdminAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/admin/login");
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast, logActivity]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const timerColor = sessionSecondsLeft < 120
    ? "text-red-400"
    : sessionSecondsLeft < 300
      ? "text-amber-400"
      : "text-[hsl(215,15%,45%)]";

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

  if (!isAdmin) return null;

  return (
    <AdminThemeProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="h-14 border-b border-[hsl(222,30%,18%)] bg-[hsl(222,47%,8%)]/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-[hsl(215,20%,88%)] hover:text-[hsl(190,100%,50%)] transition-colors" />
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-lg font-bold bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">Brotherhood Studio</span>
                  <span className="text-[hsl(215,15%,55%)] text-sm">Admin</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Session timer */}
                <div className={`hidden sm:flex items-center gap-1.5 text-xs ${timerColor} transition-colors`} title="Session expires after 15 min inactivity">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-mono">{formatTimer(sessionSecondsLeft)}</span>
                </div>

                {/* Admin email badge */}
                {adminEmail && (
                  <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-[hsl(190,100%,50%)]/10 border border-[hsl(190,100%,50%)]/20">
                    <Shield className="h-3 w-3 text-[hsl(190,100%,50%)]" />
                    <span className="text-xs text-[hsl(215,20%,70%)] max-w-[140px] truncate">{adminEmail}</span>
                  </div>
                )}

                <Button variant="outline" size="sm" onClick={() => doLogout("manual")}
                  className="border-[hsl(222,30%,25%)] bg-transparent hover:bg-[hsl(190,100%,50%)]/10 hover:border-[hsl(190,100%,50%)]/50 hover:text-[hsl(190,100%,50%)] transition-all">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              <ErrorBoundary>
                <Outlet context={{ logActivity }} />
              </ErrorBoundary>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminThemeProvider>
  );
};

export default AdminLayout;
