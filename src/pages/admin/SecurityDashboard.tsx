import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle, CheckCircle, Clock, User, Activity, RefreshCw, Eye, EyeOff, Smartphone, Globe, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface LoginAttempt {
    id: string;
    email: string;
    success: boolean;
    failure_reason: string | null;
    user_agent: string | null;
    attempted_at: string;
}

interface ActivityLog {
    created_at: string;
}

interface AllowedIp {
    id: string;
    ip_address: string;
    label: string | null;
    created_at: string;
}

interface SessionInfo {
    email: string;
    lastSignIn: string | null;
    mfaEnabled: boolean;
}

const timeAgo = (iso: string) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const actionColor = (action: string) => {
    if (action.includes("LOGIN")) return "text-green-400";
    if (action.includes("LOGOUT") || action.includes("TIMEOUT")) return "text-amber-400";
    if (action.includes("DELETE")) return "text-red-400";
    return "text-[hsl(190,100%,60%)]";
};

const SecurityDashboard = () => {
    const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [session, setSession] = useState<SessionInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showEmails, setShowEmails] = useState(false);
    // 2FA enrollment state
    const [enrollQr, setEnrollQr] = useState<string | null>(null);
    const [enrollSecret, setEnrollSecret] = useState<string | null>(null);
    const [enrollFactorId, setEnrollFactorId] = useState<string | null>(null);
    const [enrollCode, setEnrollCode] = useState("");
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [allowedIps, setAllowedIps] = useState<AllowedIp[]>([]);
    const [newIp, setNewIp] = useState("");
    const [newIpLabel, setNewIpLabel] = useState("");
    const [isIpLoading, setIsIpLoading] = useState(false);
    const { toast } = useToast();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [attemptsRes, logsRes, sessionRes, mfaRes, ipsRes] = await Promise.all([
                supabase.from("admin_login_attempts").select("*").order("attempted_at", { ascending: false }).limit(25),
                supabase.from("admin_activity_log").select("*").order("created_at", { ascending: false }).limit(25),
                supabase.auth.getSession(),
                supabase.auth.mfa.listFactors(),
                supabase.from("admin_allowed_ips").select("*").order("created_at", { ascending: false }),
            ]);

            if (attemptsRes.data) setLoginAttempts(attemptsRes.data as LoginAttempt[]);
            if (logsRes.data) setActivityLogs(logsRes.data as ActivityLog[]);
            if (ipsRes.data) setAllowedIps(ipsRes.data as AllowedIp[]);

            if (sessionRes.data.session) {
                const totp = mfaRes.data?.totp ?? [];
                setMfaEnabled(totp.length > 0);
                setSession({
                    email: sessionRes.data.session.user.email ?? "",
                    lastSignIn: sessionRes.data.session.user.last_sign_in_at ?? null,
                    mfaEnabled: totp.length > 0,
                });
            }
        } catch (_) {
            toast({ variant: "destructive", title: "Error", description: "Could not load security data." });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const startEnroll2FA = async () => {
        setEnrollLoading(true);
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: "totp",
                issuer: "Brotherhood Studio Admin",
                friendlyName: "Google Authenticator",
            });
            if (error || !data) { toast({ variant: "destructive", title: "Error", description: "Could not start 2FA enrollment. Enable MFA in Supabase Dashboard first." }); return; }
            setEnrollFactorId(data.id);
            setEnrollQr(data.totp.qr_code);
            setEnrollSecret(data.totp.secret);
        } finally {
            setEnrollLoading(false);
        }
    };

    const confirmEnroll = async () => {
        if (!enrollFactorId) return;
        setEnrollLoading(true);
        try {
            const { data: challenge } = await supabase.auth.mfa.challenge({ factorId: enrollFactorId });
            if (!challenge) { toast({ variant: "destructive", title: "Error", description: "Challenge failed." }); return; }
            const { error } = await supabase.auth.mfa.verify({ factorId: enrollFactorId, challengeId: challenge.id, code: enrollCode });
            if (error) { toast({ variant: "destructive", title: "Invalid Code", description: "Wrong code. Please try again." }); return; }
            toast({ title: "2FA Enabled! 🔐", description: "Google Authenticator is now required on every login." });
            setEnrollQr(null); setEnrollSecret(null); setEnrollFactorId(null); setEnrollCode("");
            setMfaEnabled(true);
            fetchData();
        } finally {
            setEnrollLoading(false);
        }
    };

    const failedToday = loginAttempts.filter(a => !a.success && new Date(a.attempted_at).toDateString() === new Date().toDateString()).length;
    const successToday = loginAttempts.filter(a => a.success && new Date(a.attempted_at).toDateString() === new Date().toDateString()).length;

    const addIp = async () => {
        if (!newIp) return;
        setIsIpLoading(true);
        try {
            const { error } = await supabase.from("admin_allowed_ips").insert({
                ip_address: newIp.trim(),
                label: newIpLabel.trim() || null
            });
            if (error) throw error;
            toast({ title: "IP Added", description: "This IP is now whitelisted." });
            setNewIp(""); setNewIpLabel("");
            fetchData();
        } catch (_) {
            toast({ variant: "destructive", title: "Error", description: "Could not add IP." });
        } finally {
            setIsIpLoading(false);
        }
    };

    const deleteIp = async (id: string) => {
        try {
            const { error } = await supabase.from("admin_allowed_ips").delete().eq("id", id);
            if (error) throw error;
            toast({ title: "IP Removed", description: "IP has been deleted from whitelist." });
            fetchData();
        } catch (_) {
            toast({ variant: "destructive", title: "Error", description: "Could not remove IP." });
        }
    };

    const maskEmail = (email: string) => showEmails ? email : email.replace(/(.{2})(.*)(@.*)/, "$1***$3");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(190,100%,50%)] to-[hsl(265,89%,56%)] flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[hsl(215,20%,88%)]">Security Center</h1>
                        <p className="text-xs text-[hsl(215,15%,45%)]">Login attempts, activity logs, 2FA management</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={fetchData}
                    className="border-[hsl(222,30%,25%)] bg-transparent hover:bg-[hsl(190,100%,50%)]/10 hover:text-[hsl(190,100%,50%)] transition-all">
                    <RefreshCw className="h-3.5 w-3.5 mr-2" /> Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Failed Today", value: failedToday, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
                    { label: "Successful Today", value: successToday, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
                    { label: "2FA Status", value: mfaEnabled ? "Enabled" : "Disabled", icon: Smartphone, color: mfaEnabled ? "text-green-400" : "text-red-400", bg: mfaEnabled ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20" },
                    { label: "Session", value: session?.email ? "Active" : "—", icon: User, color: "text-[hsl(190,100%,60%)]", bg: "bg-[hsl(190,100%,50%)]/10 border-[hsl(190,100%,50%)]/20" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <Card key={label} className={`border ${bg} bg-transparent`}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <Icon className={`h-5 w-5 ${color} shrink-0`} />
                            <div>
                                <p className="text-xs text-[hsl(215,15%,45%)]">{label}</p>
                                <p className={`font-bold text-sm ${color}`}>{isLoading ? "—" : value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 2FA Management */}
            <Card className="bg-[hsl(222,47%,9%)] border-[hsl(222,30%,18%)]">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-[hsl(215,20%,88%)] text-base">
                        <Smartphone className="h-4 w-4 text-[hsl(190,100%,50%)]" />
                        Two-Factor Authentication (2FA)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {mfaEnabled ? (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                            <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                            <div>
                                <p className="text-green-300 font-medium text-sm">2FA is Active</p>
                                <p className="text-green-400/70 text-xs mt-0.5">Google Authenticator required on every login. Your account is well-protected.</p>
                            </div>
                        </div>
                    ) : !enrollQr ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                                <div>
                                    <p className="text-amber-300 font-medium text-sm">2FA Not Enabled</p>
                                    <p className="text-amber-400/70 text-xs mt-0.5">Your account is vulnerable without 2FA. Enable it now.</p>
                                </div>
                            </div>
                            <Button onClick={startEnroll2FA} disabled={enrollLoading}
                                className="bg-gradient-to-r from-[hsl(190,100%,50%)] to-[hsl(265,89%,56%)] hover:opacity-90 text-white font-semibold">
                                {enrollLoading ? "Starting..." : "Enable Google Authenticator"}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-[hsl(215,20%,88%)] text-sm font-medium">Scan this QR code with Google Authenticator:</p>
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <div className="p-3 bg-white rounded-xl">
                                    <img src={enrollQr} alt="2FA QR Code" className="w-40 h-40" />
                                </div>
                                <div className="space-y-3 flex-1">
                                    {enrollSecret && (
                                        <div className="p-3 bg-[hsl(222,47%,6%)] rounded-lg border border-[hsl(222,30%,20%)]">
                                            <p className="text-xs text-[hsl(215,15%,45%)] mb-1">Manual Key:</p>
                                            <p className="font-mono text-xs text-[hsl(190,100%,50%)] break-all select-all">{enrollSecret}</p>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <input type="text" inputMode="numeric" placeholder="Enter 6-digit code" value={enrollCode}
                                            onChange={e => setEnrollCode(e.target.value)} maxLength={6}
                                            className="w-full bg-[hsl(222,47%,8%)] border border-[hsl(222,30%,18%)] rounded-md px-3 py-2 text-[hsl(215,20%,88%)] text-center text-xl tracking-[0.4em] focus:border-[hsl(190,100%,50%)] outline-none" />
                                        <Button onClick={confirmEnroll} disabled={enrollLoading || enrollCode.length < 6}
                                            className="w-full bg-gradient-to-r from-[hsl(190,100%,50%)] to-[hsl(265,89%,56%)] hover:opacity-90 text-white font-semibold">
                                            {enrollLoading ? "Confirming..." : "Confirm & Enable 2FA"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Login Attempts */}
                <Card className="bg-[hsl(222,47%,9%)] border-[hsl(222,30%,18%)]">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-[hsl(215,20%,88%)] text-base">
                                <AlertTriangle className="h-4 w-4 text-[hsl(190,100%,50%)]" />
                                Login Attempts
                            </CardTitle>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-[hsl(215,15%,45%)] hover:text-[hsl(215,20%,88%)]" onClick={() => setShowEmails(!showEmails)}>
                                {showEmails ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full bg-[hsl(222,30%,15%)]" />)}</div>
                        ) : loginAttempts.length === 0 ? (
                            <p className="text-center text-[hsl(215,15%,40%)] text-sm py-6">No login attempts recorded yet.</p>
                        ) : (
                            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                                {loginAttempts.map(a => (
                                    <div key={a.id} className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${a.success ? "bg-green-500/5 border-green-500/10" : "bg-red-500/5 border-red-500/10"}`}>
                                        <div className="flex items-center gap-2 min-w-0">
                                            {a.success ? <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0" /> : <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                                            <span className="text-[hsl(215,20%,75%)] truncate">{maskEmail(a.email)}</span>
                                            {a.failure_reason && <Badge variant="outline" className="text-red-400 border-red-500/30 text-[10px] px-1 py-0">{a.failure_reason}</Badge>}
                                        </div>
                                        <span className="text-[hsl(215,15%,40%)] shrink-0 ml-2">{timeAgo(a.attempted_at)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Activity Log */}
                <Card className="bg-[hsl(222,47%,9%)] border-[hsl(222,30%,18%)]">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-[hsl(215,20%,88%)] text-base">
                            <Activity className="h-4 w-4 text-[hsl(190,100%,50%)]" />
                            Admin Activity Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full bg-[hsl(222,30%,15%)]" />)}</div>
                        ) : activityLogs.length === 0 ? (
                            <p className="text-center text-[hsl(215,15%,40%)] text-sm py-6">No activity recorded yet.</p>
                        ) : (
                            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                                {activityLogs.map(l => (
                                    <div key={l.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[hsl(222,30%,12%)] border border-[hsl(222,30%,18%)] text-xs">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Clock className="h-3.5 w-3.5 text-[hsl(215,15%,40%)] shrink-0" />
                                            <span className={`font-medium ${actionColor(l.action)}`}>{l.action}</span>
                                            {l.resource && <span className="text-[hsl(215,15%,50%)] truncate">→ {l.resource}</span>}
                                        </div>
                                        <span className="text-[hsl(215,15%,40%)] shrink-0 ml-2">{timeAgo(l.created_at)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* IP Whitelist Management */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-[hsl(222,47%,9%)] border-[hsl(222,30%,18%)]">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-[hsl(215,20%,88%)] text-base">
                            <Globe className="h-4 w-4 text-[hsl(190,100%,50%)]" />
                            IP Whitelist Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <input type="text" placeholder="IP Address (e.g. 1.2.3.4)" value={newIp}
                                        onChange={e => setNewIp(e.target.value)}
                                        className="w-full bg-[hsl(222,47%,8%)] border border-[hsl(222,30%,18%)] rounded-md px-3 py-2 text-xs text-[hsl(215,20%,88%)] outline-none focus:border-[hsl(190,100%,50%)]" />
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Label (Home, Office)" value={newIpLabel}
                                        onChange={e => setNewIpLabel(e.target.value)}
                                        className="flex-1 bg-[hsl(222,47%,8%)] border border-[hsl(222,30%,18%)] rounded-md px-3 py-2 text-xs text-[hsl(215,20%,88%)] outline-none focus:border-[hsl(190,100%,50%)]" />
                                    <Button onClick={addIp} disabled={isIpLoading || !newIp} size="sm" className="bg-[hsl(190,100%,50%)] hover:bg-[hsl(190,100%,40%)] text-black font-bold h-9">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                {isLoading ? (
                                    <Skeleton className="h-20 w-full bg-[hsl(222,30%,15%)]" />
                                ) : allowedIps.length === 0 ? (
                                    <p className="text-center text-[hsl(215,15%,40%)] text-xs py-4">No IPs whitelisted. Access allowed from any IP.</p>
                                ) : (
                                    allowedIps.map(ip => (
                                        <div key={ip.id} className="flex items-center justify-between p-2 rounded-lg bg-[hsl(222,30%,11%)] border border-[hsl(222,30%,18%)] text-xs">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-[hsl(190,100%,60%)]">{ip.ip_address}</span>
                                                {ip.label && <span className="text-[hsl(215,15%,45%)] text-[10px] bg-[hsl(222,30%,15%)] px-1.5 py-0.5 rounded">{ip.label}</span>}
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400/50 hover:text-red-400 hover:bg-red-400/10" onClick={() => deleteIp(ip.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <p className="text-[10px] text-[hsl(215,15%,35%)] italic"><b>Note:</b> If the whitelist is empty, anyone with credentials can log in. Once you add an IP, only those IPs will be allowed.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Checklist (Moved inside grid) */}
                <Card className="bg-[hsl(222,47%,9%)] border-[hsl(222,30%,18%)]">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-[hsl(215,20%,88%)] text-base">
                            <Shield className="h-4 w-4 text-[hsl(190,100%,50%)]" />
                            Security Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            {[
                                { label: "2FA (TOTP)", done: mfaEnabled, note: mfaEnabled ? "Active" : "Disabled" },
                                { label: "IP Whitelist", done: allowedIps.length > 0, note: allowedIps.length > 0 ? `${allowedIps.length} IPs active` : "Open access" },
                                { label: "CAPTCHA", done: true, note: "Math challenge active" },
                                { label: "Admin URL", done: true, note: "Hidden portal" },
                            ].map(({ label, done, note }) => (
                                <div key={label} className={`flex items-center justify-between p-2 rounded-lg border ${done ? "bg-green-500/5 border-green-500/15" : "bg-red-500/5 border-red-500/15"}`}>
                                    <div className="flex items-center gap-2">
                                        {done ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> : <AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
                                        <span className={`text-xs font-medium ${done ? "text-green-300" : "text-red-300"}`}>{label}</span>
                                    </div>
                                    <span className="text-[10px] text-[hsl(215,15%,45%)]">{note}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Original Checklist hidden or removed to avoid redundancy */}
        </div>
    );
};

export default SecurityDashboard;
