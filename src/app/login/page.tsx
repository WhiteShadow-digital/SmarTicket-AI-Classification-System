"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneLoginForm } from "@/components/auth/phone-login-form";
import { Scissors, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isUserLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router, isMounted]);

  if (!isMounted || isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Scissors className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="absolute top-8 left-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="bg-crimson-gradient p-3 rounded-2xl shadow-xl shadow-primary/20">
            <Scissors className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black font-headline tracking-tighter text-primary">ELSSK System</h1>
        </div>

        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden">
          <PhoneLoginForm />
        </div>
        
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
          Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}
