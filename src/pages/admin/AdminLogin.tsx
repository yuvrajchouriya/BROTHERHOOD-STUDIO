import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import "@/styles/admin-theme.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();
        
        if (roleData) {
          navigate('/admin');
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setTimeout(() => {
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('role', 'admin')
            .single()
            .then(({ data: roleData }) => {
              if (roleData) {
                navigate('/admin');
              }
            });
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message,
        });
        return;
      }

      if (data.user) {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'admin')
          .single();

        if (roleError || !roleData) {
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You don't have admin privileges.",
          });
          return;
        }

        toast({
          title: "Welcome Back!",
          description: "Successfully logged in to admin panel.",
        });
        navigate('/admin');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: error.message,
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Account Created!",
          description: "Please login with your credentials.",
        });
        setIsSignUp(false);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="admin-theme min-h-screen flex items-center justify-center bg-[hsl(222,47%,5%)]">
        <div className="admin-mesh-bg fixed inset-0 pointer-events-none opacity-50" />
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(190,100%,50%)] drop-shadow-[0_0_10px_rgba(0,212,255,0.8)]" />
      </div>
    );
  }

  return (
    <div className="admin-theme min-h-screen flex items-center justify-center bg-[hsl(222,47%,5%)] p-4">
      {/* Mesh background */}
      <div className="admin-mesh-bg fixed inset-0 pointer-events-none opacity-50" />
      
      {/* Gradient orbs for ambiance */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-[hsl(190,100%,50%)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(265,89%,56%)]/10 rounded-full blur-3xl pointer-events-none" />
      
      <Card className="relative z-10 w-full max-w-md bg-[hsl(222,47%,10%)]/80 backdrop-blur-xl border-[hsl(222,30%,18%)] shadow-[0_0_40px_rgba(0,212,255,0.1)]">
        <CardHeader className="space-y-1 text-center pb-2">
          {/* Logo Badge */}
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[hsl(190,100%,50%)] to-[hsl(265,89%,56%)] flex items-center justify-center shadow-[0_0_30px_rgba(0,212,255,0.4)]">
              <span className="text-white font-bold text-2xl">BS</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] bg-clip-text text-transparent">
            Admin Panel
          </CardTitle>
          <CardDescription className="text-[hsl(215,15%,55%)]">
            {isSignUp ? "Create Admin Account" : "Login to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[hsl(215,20%,88%)]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@brotherhoodstudio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-[hsl(222,47%,8%)] border-[hsl(222,30%,18%)] text-[hsl(215,20%,88%)] placeholder:text-[hsl(215,15%,35%)] focus:border-[hsl(190,100%,50%)] focus:ring-[hsl(190,100%,50%)]/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[hsl(215,20%,88%)]">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="bg-[hsl(222,47%,8%)] border-[hsl(222,30%,18%)] text-[hsl(215,20%,88%)] placeholder:text-[hsl(215,15%,35%)] focus:border-[hsl(190,100%,50%)] focus:ring-[hsl(190,100%,50%)]/20 pr-10 transition-all"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-[hsl(215,15%,55%)] hover:text-[hsl(190,100%,50%)]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[hsl(190,100%,50%)] to-[hsl(265,89%,56%)] hover:from-[hsl(190,100%,45%)] hover:to-[hsl(265,89%,50%)] text-white font-semibold shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] transition-all duration-300" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Creating Account..." : "Logging in..."}
                </>
              ) : (
                isSignUp ? "Create Account" : "Login"
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-[hsl(215,15%,55%)] hover:text-[hsl(190,100%,50%)]"
            >
              {isSignUp 
                ? "Already have an account? Login" 
                : "Don't have an account? Create one"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
