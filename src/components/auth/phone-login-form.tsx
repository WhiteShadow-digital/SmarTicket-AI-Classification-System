
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  signInAnonymously
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Phone, CheckCircle2, Loader2, Smartphone, AlertCircle, UserCircle } from "lucide-react";
import { useAuth } from "@/firebase";

export function PhoneLoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const recaptchaRef = useRef<HTMLDivElement>(null);
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!auth || !recaptchaRef.current) return;
    
    try {
      const verifier = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: 'invisible',
        callback: () => {
          // ReCAPTCHA solved
        },
        'expired-callback': () => {
          setErrorStatus("ReCAPTCHA expired. Please refresh.");
        }
      });
      
      setRecaptchaVerifier(verifier);

      return () => {
        verifier.clear();
      };
    } catch (err) {
      setErrorStatus("Recaptcha failed to load.");
    }
  }, [auth]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recaptchaVerifier) {
      toast({
        variant: "destructive",
        title: "ReCAPTCHA Error",
        description: "Verifier not ready. Please refresh the page.",
      });
      return;
    }
    
    setIsLoading(true);
    setErrorStatus(null);

    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setConfirmationResult(result);
      toast({
        title: "OTP Sent",
        description: `A code has been sent to ${phoneNumber}.`,
      });
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        setErrorStatus("operation-not-allowed");
      } else {
        toast({
          variant: "destructive",
          title: "Error Sending Code",
          description: error.message || "Failed to send SMS.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;

    setIsLoading(true);
    try {
      await confirmationResult.confirm(verificationCode);
      toast({
        title: "Access Granted",
        description: "Successfully authenticated staff member.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "The code you entered is invalid or has expired.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      toast({
        title: "Demo Access",
        description: "Logged in as a guest staff member.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Demo Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold font-headline">
          {confirmationResult ? "Verify Identity" : "Staff Access"}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {confirmationResult 
            ? `Enter the 6-digit code sent to your device.` 
            : "Enter your registered mobile number to receive a secure access code."}
        </p>
      </div>

      <div ref={recaptchaRef}></div>

      {errorStatus === "operation-not-allowed" && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-3">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="h-4 w-4" />
            SMS Provider Disabled
          </div>
          <div className="space-y-2">
            <p>
              Phone Authentication must be enabled in the Firebase Console:
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-1 opacity-90">
              <li>Go to <strong>Authentication &gt; Sign-in method</strong></li>
              <li>Enable <strong>Phone</strong> and click Save</li>
              <li>Add your current domain to <strong>Authorized Domains</strong></li>
            </ol>
          </div>
          <div className="pt-2">
            <Button 
              variant="outline" 
              className="w-full h-8 text-[10px] border-destructive/30 hover:bg-destructive/10 text-destructive"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              Use Demo Access Instead
            </Button>
          </div>
        </div>
      )}
      
      {!confirmationResult ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+27 82 123 4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="pl-10 bg-muted/30 border-primary/10 h-12 text-base"
              />
            </div>
            <p className="text-[10px] text-muted-foreground italic font-medium">
              Format: +[CountryCode][Number]
            </p>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || (!!errorStatus && errorStatus !== "operation-not-allowed")} 
            className="w-full bg-crimson-gradient h-12 text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Smartphone className="mr-2 h-4 w-4" />}
            Request Access Code
          </Button>
          
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card px-2 text-muted-foreground font-bold tracking-widest">Or</span>
            </div>
          </div>

          <Button 
            type="button"
            variant="ghost"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full h-10 text-muted-foreground hover:text-primary gap-2"
          >
            <UserCircle className="h-4 w-4" />
            Continue with Demo Access
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code (OTP)</Label>
            <div className="relative">
              <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="code"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                required
                className="pl-10 bg-muted/30 tracking-[0.5em] text-center font-bold text-lg h-14"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-crimson-gradient h-12 text-white font-bold shadow-lg shadow-primary/20"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Login"}
          </Button>
          <button
            type="button"
            onClick={() => setConfirmationResult(null)}
            className="w-full text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
          >
            Use different number
          </button>
        </form>
      )}
    </div>
  );
}
