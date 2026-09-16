"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Mail, UserPlus, LogIn, Chrome, UserCircle } from "lucide-react";
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInAnonymously
} from "firebase/auth";

type AuthMode = "login" | "register";

export function LoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome back!", description: "Successfully signed in to ELSSK." });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Account Created", description: "Your ELSSK account is ready." });
      }
      router.push("/dashboard");
    } catch (error: any) {
      let errorMessage = "Please check your credentials.";
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = mode === "login" 
          ? "Invalid email or password. If you haven't created an account, please use the Register option."
          : "Could not register. Please check your email format and password strength.";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email. Please register first.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      }

      toast({
        variant: "destructive",
        title: mode === "login" ? "Login Failed" : "Registration Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Google Sign-In", description: "Successfully authenticated with Google." });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: error.message,
      });
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      toast({ title: "Guest Access", description: "Signed in as a guest staff member." });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Guest Access Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="text-center pb-2">
        <CardTitle className="font-headline text-2xl text-primary">
          {mode === "login" ? "Staff Login" : "Create Account"}
        </CardTitle>
        <CardDescription className="text-muted-foreground/80">
          {mode === "login" 
            ? "Access your ELSSK dashboard" 
            : "Register a new staff account for ELSSK"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="staff@elssk.com"
                required
                className="pl-10 bg-background/50 border-primary/10 focus:border-primary/30"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="pl-10 bg-background/50 border-primary/10 focus:border-primary/30" 
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-crimson-gradient hover:opacity-90 text-white shadow-lg shadow-primary/20"
          >
            {isLoading ? "Processing..." : mode === "login" ? "Sign In" : "Register Staff"}
            {mode === "login" ? <LogIn className="ml-2 h-4 w-4" /> : <UserPlus className="ml-2 h-4 w-4" />}
          </Button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-transparent px-2 text-muted-foreground font-bold tracking-widest">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            type="button" 
            className="border-border/50 hover:bg-white/50 dark:hover:bg-black/20 text-xs"
            onClick={handleGoogleLogin}
          >
            <Chrome className="mr-2 h-3 w-3 text-primary" />
            Google
          </Button>
          <Button 
            variant="outline" 
            type="button" 
            className="border-border/50 hover:bg-white/50 dark:hover:bg-black/20 text-xs"
            onClick={handleGuestLogin}
            disabled={isLoading}
          >
            <UserCircle className="mr-2 h-3 w-3 text-accent" />
            Guest
          </Button>
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-[10px] font-bold text-primary hover:text-accent transition-colors uppercase tracking-widest"
          >
            {mode === "login" 
              ? "Don't have an account? Register here" 
              : "Already have an account? Sign in"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
