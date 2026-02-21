import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, Shield, AlertTriangle, Clock, Lock, Smartphone } from "lucide-react";
import "@/styles/admin-theme.css";

const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const MAX_ATTEMPTS = 3;
const LOCKOUT_KEY = "admin_lockout";
const ATTEMPTS_KEY = "admin_attempts";

interface LockoutData {
  count: number;
  lockedUntil: number | null;
  lastEmail: string;
}

const getLockoutData = (): LockoutData => {
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* ignore */ }
  return { count: 0, lockedUntil: null, lastEmail: "" };
};

const saveLockoutData = (data: LockoutData) => {
  localStorage.setItem(LOCKOUT_KEY, JSON.stringify(data));
};

const resetLockout = () => localStorage.removeItem(LOCKOUT_KEY);

type LoginStep = "credentials" | "totp" | "enroll-totp";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [step, setStep] = useState<LoginStep>("credentials");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [lockoutData, setLockoutData] = useState<LockoutData>(getLockoutData());
  const [secondsLeft, setSecondsLeft] = useState(0);

  // CAPTCHA & IP Security
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState<number | null>(null);
  const [userCaptcha, setUserCaptcha] = useState("");
  const [clientIp, setClientIp] = useState<string | null>(null);

  // For TOTP enrollment (first-time setup)
  const [enrollSecret, setEnrollSecret] = useState<string | null>(null);
  const [enrollQr, setEnrollQr] = useState<string | null>(null);
  const [enrollFactorId, setEnrollFactorId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const generateCaptcha = useCallback(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion(`${a} + ${b}`);
    setCaptchaAnswer(a + b);
    setUserCaptcha("");
  }, []);

  // Lockout countdown
  useEffect(() => {
    if (!lockoutData.lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockoutData.lockedUntil! - Date.now()) / 1000);
      if (remaining <= 0) {
        resetLockout();
        setLockoutData({ count: 0, lockedUntil: null, lastEmail: "" });
        setSecondsLeft(0);
      } else {
        setSecondsLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutData.lockedUntil]);

  // Check existing session & setup security
  useEffect(() => {
    const setup = async () => {
      // Fetch IP
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        setClientIp(data.ip);
      } catch (_) { /* ignore */ }

      generateCaptcha();

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roleData } = await supabase
          .from("user_roles").select("role")
          .eq("user_id", session.user.id).eq("role", "admin").single();
        if (roleData) navigate("/secure-portal-9273");
      }
      setIsCheckingAuth(false);
    };
    setup();
  }, [navigate, generateCaptcha]);

  // Log login attempt to DB
  const logAttempt = useCallback(async (attemptEmail: string, success: boolean, reason?: string) => {
    try {
      await supabase.from("admin_login_attempts").insert({
        email: attemptEmail,
        success,
        failure_reason: reason || null,
        ip_address: null, // Can't get real IP from browser
        user_agent: navigator.userAgent.substring(0, 200),
      });
    } catch (_) { /* non-blocking */ }
  }, []);

  const isLockedOut = async (attemptEmail?: string): Promise<boolean> => {
    // Check localStorage first for immediate feedback
    const d = lockoutData;
    if (d.lockedUntil && Date.now() < d.lockedUntil) {
      return true;
    }

    // Check database for global lockout
    try {
      const { data, error } = await supabase
        .from("admin_lockouts")
        .select("locked_until")
        .or(`email.eq.${attemptEmail || email},ip_address.eq.${clientIp}`)
        .gt("locked_until", new Date().toISOString())
        .maybeSingle();

      if (data && !error) {
        const lockedUntil = new Date(data.locked_until).getTime();
        setLockoutData(prev => ({ ...prev, lockedUntil }));
        setSecondsLeft(Math.ceil((lockedUntil - Date.now()) / 1000));
        return true;
      }
    } catch (_) { /* fallback to local only */ }

    // If we're here and was previously "locked" in local storage but time passed
    if (d.lockedUntil && Date.now() >= d.lockedUntil) {
      resetLockout();
      setLockoutData({ count: 0, lockedUntil: null, lastEmail: "" });
    }

    return false;
  };

  const recordFailedAttempt = async (attemptEmail: string) => {
    const current = getLockoutData();
    const newCount = current.lastEmail === attemptEmail ? current.count + 1 : 1;
    let lockedUntil: number | null = null;

    if (newCount >= MAX_ATTEMPTS) {
      lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      // Sync to Database for global lockout
      try {
        await supabase.from("admin_lockouts").insert({
          email: attemptEmail,
          ip_address: clientIp,
          locked_until: new Date(lockedUntil).toISOString()
        });
      } catch (_) { /* ignore */ }
    }

    const updated: LockoutData = { count: newCount, lockedUntil, lastEmail: attemptEmail };
    saveLockoutData(updated);
    setLockoutData(updated);
    if (lockedUntil) {
      setSecondsLeft(Math.ceil(LOCKOUT_DURATION_MS / 1000));
    }
    return newCount;
  };

  // ── Step 1: Email + Password ──────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await isLockedOut(email)) return;

    // Check CAPTCHA
    if (parseInt(userCaptcha) !== captchaAnswer) {
      toast({ variant: "destructive", title: "CAPTCHA Failed", description: "Incorrect answer. Please try again." });
      generateCaptcha();
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        const failCount = await recordFailedAttempt(email);
        await logAttempt(email, false, "invalid_credentials");
        generateCaptcha(); // Reset CAPTCHA on failure
        const remaining = MAX_ATTEMPTS - failCount;
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: remaining > 0
            ? `Invalid credentials. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
            : "Account locked for 30 minutes due to too many failed attempts.",
        });
        return;
      }

      if (!data.user) {
        toast({ variant: "destructive", title: "Login Failed", description: "Unexpected error. Please try again." });
        return;
      }

      // Check admin role
      const { data: roleData } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", data.user.id).eq("role", "admin").single();

      if (!roleData) {
        await supabase.auth.signOut();
        recordFailedAttempt(email);
        await logAttempt(email, false, "not_admin");
        generateCaptcha();
        toast({ variant: "destructive", title: "Access Denied", description: "Invalid credentials or insufficient privileges." });
        return;
      }

      // ── IP Whitelist Check ──
      const { data: allowedIps } = await supabase.from("admin_allowed_ips").select("ip_address");
      if (allowedIps && allowedIps.length > 0) {
        const isAllowed = allowedIps.some(item => item.ip_address === clientIp);
        if (!isAllowed) {
          await supabase.auth.signOut();
          await logAttempt(email, false, `ip_blocked:${clientIp || "unknown"}`);
          generateCaptcha();
          toast({
            variant: "destructive",
            title: "Security Block",
            description: `Your IP (${clientIp || "Unknown"}) is not whitelisted for admin access.`
          });
          return;
        }
      }

      // Check MFA status
      const { data: mfaData } = await supabase.auth.mfa.listFactors();
      const totpFactors = mfaData?.totp ?? [];

      if (totpFactors.length > 0) {
        // MFA enrolled — initiate challenge
        const factor = totpFactors[0];
        setFactorId(factor.id);
        const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId: factor.id });
        if (challengeErr || !challengeData) {
          toast({ variant: "destructive", title: "2FA Error", description: "Could not initiate 2FA challenge." });
          await supabase.auth.signOut();
          return;
        }
        setChallengeId(challengeData.id);
        setStep("totp");
        toast({ title: "2FA Required", description: "Enter the code from your Authenticator app." });
      } else {
        // No MFA enrolled yet — go to enrollment flow
        const { data: enrollData, error: enrollErr } = await supabase.auth.mfa.enroll({ factorType: "totp", issuer: "Brotherhood Studio Admin", friendlyName: "Google Authenticator" });
        if (enrollErr || !enrollData) {
          // MFA enrollment failed (maybe MFA not enabled in Supabase Dashboard) — allow login without MFA
          await logAttempt(email, true);
          resetLockout();
          setLockoutData({ count: 0, lockedUntil: null, lastEmail: "" });
          navigate("/secure-portal-9273");
          return;
        }
        setEnrollFactorId(enrollData.id);
        setEnrollSecret(enrollData.totp.secret);
        setEnrollQr(enrollData.totp.qr_code);
        setStep("enroll-totp");
        toast({ title: "Setup 2FA", description: "Scan the QR code with Google Authenticator then enter the code." });
      }
    } catch (_) {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verify TOTP ───────────────────────────────────────────────
  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || !challengeId) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code: totpCode.replace(/\s/g, "") });
      if (error) {
        await recordFailedAttempt(email);
        await logAttempt(email, false, "invalid_totp");
        toast({ variant: "destructive", title: "Invalid Code", description: "Incorrect 2FA code. Please try again." });
        setTotpCode("");
        return;
      }
      await logAttempt(email, true);
      resetLockout();
      setLockoutData({ count: 0, lockedUntil: null, lastEmail: "" });
      navigate("/secure-portal-9273");
    } catch (_) {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 3: Enroll TOTP (first time) ─────────────────────────────────
  const handleEnrollTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollFactorId) return;
    setIsLoading(true);
    try {
      const { data: challengeData, error: challErr } = await supabase.auth.mfa.challenge({ factorId: enrollFactorId });
      if (challErr || !challengeData) {
        toast({ variant: "destructive", title: "Error", description: "Could not start enrollment challenge." });
        return;
      }
      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId: enrollFactorId, challengeId: challengeData.id, code: totpCode.replace(/\s/g, "")
      });
      if (verifyErr) {
        toast({ variant: "destructive", title: "Invalid Code", description: "Wrong code. Make sure the QR is scanned correctly." });
        setTotpCode("");
        return;
      }
      await logAttempt(email, true);
      resetLockout();
      toast({ title: "2FA Enabled! 🔐", description: "Google Authenticator is now required for every login." });
      navigate("/secure-portal-9273");
    } catch (_) {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (isCheckingAuth) {
    return (
      <div className="admin-theme min-h-screen flex items-center justify-center bg-[hsl(222,47%,5%)]">
        <div className="admin-mesh-bg fixed inset-0 pointer-events-none opacity-50" />
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(190,100%,50%)] drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
      </div>
    );
  }

  const locked = lockoutData.lockedUntil !== null && Date.now() < lockoutData.lockedUntil;

  return (
    <div className="admin-theme min-h-screen flex items-center justify-center bg-[hsl(222,47%,5%)] p-4">
      {/* Mesh background */}
      <div className="admin-mesh-bg fixed inset-0 pointer-events-none opacity-50" />
      {/* Orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-[hsl(190,100%,50%)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(265,89%,56%)]/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="relative z-10 w-full max-w-md bg-[hsl(222,47%,10%)]/80 backdrop-blur-xl border-[hsl(222,30%,18%)] shadow-[0_0_40px_rgba(0,212,255,0.1)]">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[hsl(190,100%,50%)] to-[hsl(265,89%,56%)] flex items-center justify-center shadow-[0_0_30px_rgba(0,212,255,0.4)]">
              {step === "credentials" ? <Shield className="h-8 w-8 text-white" /> : step === "totp" ? <Smartphone className="h-8 w-8 text-white" /> : <Lock className="h-8 w-8 text-white" />}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
            {step === "credentials" ? "Secure Admin Portal" : step === "totp" ? "2FA Verification" : "Enable 2FA — First Time Setup"}
          </CardTitle>
          <CardDescription className="text-[hsl(215,15%,55%)]">
            {step === "credentials" ? "Authorised personnel only" : step === "totp" ? "Enter the code from your Authenticator app" : "Scan QR with Google Authenticator, then enter the code"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* ── LOCKOUT STATE ── */}
          {locked && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-950/40 border border-red-500/30 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
              <div>
                <p className="text-red-300 font-medium text-sm">Account Locked</p>
                <p className="text-red-400/70 text-xs mt-0.5">Too many failed attempts. Try again in <span className="font-mono font-bold text-red-300">{formatTime(secondsLeft)}</span></p>
              </div>
            </div>
          )}

          {/* Attempts warning */}
          {!locked && lockoutData.count > 0 && lockoutData.lastEmail === email && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-950/30 border border-amber-500/20 mb-4">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <p className="text-amber-300 text-xs">{MAX_ATTEMPTS - lockoutData.count} attempt{MAX_ATTEMPTS - lockoutData.count === 1 ? "" : "s"} remaining before 30-minute lockout.</p>
            </div>
          )}

          {/* ── STEP 1: CREDENTIALS ── */}
          {step === "credentials" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[hsl(215,20%,88%)]">Email</Label>
                <Input
                  id="email" type="email" placeholder="admin@brotherhoodstudio.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required disabled={isLoading || locked}
                  className="bg-[hsl(222,47%,8%)] border-[hsl(222,30%,18%)] text-[hsl(215,20%,88%)] placeholder:text-[hsl(215,15%,35%)] focus:border-[hsl(190,100%,50%)] focus:ring-[hsl(190,100%,50%)]/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[hsl(215,20%,88%)]">Password</Label>
                <div className="relative">
                  <Input
                    id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    required disabled={isLoading || locked} minLength={8}
                    className="bg-[hsl(222,47%,8%)] border-[hsl(222,30%,18%)] text-[hsl(215,20%,88%)] placeholder:text-[hsl(215,15%,35%)] focus:border-[hsl(190,100%,50%)] focus:ring-[hsl(190,100%,50%)]/20 pr-10 transition-all"
                  />
                  <Button type="button" variant="ghost" size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-[hsl(215,15%,55%)] hover:text-[hsl(190,100%,50%)]"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* CAPTCHA */}
              <div className="space-y-2">
                <Label htmlFor="captcha" className="text-[hsl(215,20%,88%)]">Security Challenge: {captchaQuestion} = ?</Label>
                <div className="relative">
                  <Input
                    id="captcha" type="number" placeholder="Result"
                    value={userCaptcha} onChange={(e) => setUserCaptcha(e.target.value)}
                    required disabled={isLoading || locked}
                    className="bg-[hsl(222,47%,8%)] border-[hsl(222,30%,18%)] text-[hsl(215,20%,88%)] focus:border-[hsl(190,100%,50%)] transition-all"
                  />
                  <Shield className="absolute right-3 top-2.5 h-4 w-4 text-[hsl(215,15%,35%)]" />
                </div>
              </div>

              <Button type="submit" disabled={isLoading || locked}
                className="w-full bg-gradient-to-r from-[hsl(190,100%,50%)] to-[hsl(265,89%,56%)] hover:opacity-90 text-white font-semibold shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] transition-all duration-300">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : locked ? <><Clock className="mr-2 h-4 w-4" />Locked — {formatTime(secondsLeft)}</> : "Login"}
              </Button>
            </form>
          )}

          {/* ── STEP 2: TOTP VERIFY ── */}
          {step === "totp" && (
            <form onSubmit={handleVerifyTotp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totp" className="text-[hsl(215,20%,88%)]">Authenticator Code</Label>
                <Input
                  id="totp" type="text" inputMode="numeric" pattern="[0-9 ]*"
                  placeholder="000 000" value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)} maxLength={7}
                  required disabled={isLoading}
                  className="bg-[hsl(222,47%,8%)] border-[hsl(222,30%,18%)] text-[hsl(215,20%,88%)] text-center text-2xl tracking-[0.5em] placeholder:text-[hsl(215,15%,35%)] focus:border-[hsl(190,100%,50%)] transition-all"
                  autoFocus autoComplete="one-time-code"
                />
                <p className="text-xs text-[hsl(215,15%,45%)] text-center">Open Google Authenticator → Brotherhood Studio Admin</p>
              </div>
              <Button type="submit" disabled={isLoading || totpCode.replace(/\s/g, "").length < 6}
                className="w-full bg-gradient-to-r from-[hsl(190,100%,50%)] to-[hsl(265,89%,56%)] hover:opacity-90 text-white font-semibold transition-all duration-300">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : "Verify Code"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => { setStep("credentials"); setTotpCode(""); }}
                className="w-full text-[hsl(215,15%,45%)] hover:text-[hsl(215,20%,88%)] text-sm">
                ← Back to Login
              </Button>
            </form>
          )}

          {/* ── STEP 3: TOTP ENROLL ── */}
          {step === "enroll-totp" && (
            <form onSubmit={handleEnrollTotp} className="space-y-4">
              {enrollQr && (
                <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl">
                  <img src={enrollQr} alt="QR Code for Google Authenticator" className="w-48 h-48" />
                  <p className="text-xs text-gray-500 text-center">Scan with Google Authenticator</p>
                </div>
              )}
              {enrollSecret && (
                <div className="p-3 bg-[hsl(222,47%,6%)] rounded-lg border border-[hsl(222,30%,20%)]">
                  <p className="text-xs text-[hsl(215,15%,45%)] mb-1">Manual Entry Key:</p>
                  <p className="font-mono text-xs text-[hsl(190,100%,50%)] break-all select-all">{enrollSecret}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="enroll-code" className="text-[hsl(215,20%,88%)]">Enter the 6-digit code to confirm</Label>
                <Input
                  id="enroll-code" type="text" inputMode="numeric" pattern="[0-9 ]*"
                  placeholder="000 000" value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)} maxLength={7}
                  required disabled={isLoading}
                  className="bg-[hsl(222,47%,8%)] border-[hsl(222,30%,18%)] text-[hsl(215,20%,88%)] text-center text-2xl tracking-[0.5em] placeholder:text-[hsl(215,15%,35%)] focus:border-[hsl(190,100%,50%)] transition-all"
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={isLoading || totpCode.replace(/\s/g, "").length < 6}
                className="w-full bg-gradient-to-r from-[hsl(190,100%,50%)] to-[hsl(265,89%,56%)] hover:opacity-90 text-white font-semibold transition-all">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enabling...</> : "Enable 2FA & Enter"}
              </Button>
            </form>
          )}

          {/* Security note */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[hsl(215,15%,35%)]">
            <Shield className="h-3 w-3" />
            <span>Protected by multi-layer security</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
