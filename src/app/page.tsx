"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bot, Send, ShieldCheck, Sparkles, RefreshCcw, Layout, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { processTicket, type ProcessTicketOutput } from "@/ai/flows/process-ticket-flow";
import { useFirestore } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const STAFF_POOL: Record<string, string[]> = {
  'IT': ['John Tech', 'Sarah SysAdmin', 'Mike Dev'],
  'HR': ['Emily People', 'David Culture'],
  'Finance': ['Robert Audit', 'Jessica Payroll'],
  'Operations': ['Alice Ops', 'Mark Facilities']
};

export default function TicketSystemPage() {
  const [userName, setUserName] = useState("");
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessTicketOutput | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !userName.trim()) return;

    setIsProcessing(true);
    setResult(null);
    const submittedAt = new Date();

    try {
      const aiResult = await processTicket({ content });
      const processedAt = new Date();
      const responseTimeSeconds = (processedAt.getTime() - submittedAt.getTime()) / 1000;
      
      const allDepts = [aiResult.primaryDepartment, ...(aiResult.secondaryDepartments || [])];
      
      const assignedStaff: string[] = [];
      allDepts.forEach(cat => {
        const deptPool = STAFF_POOL[cat as keyof typeof STAFF_POOL] || ['System Agent'];
        const picked = deptPool[Math.floor(Math.random() * deptPool.length)];
        if (!assignedStaff.includes(picked)) {
          assignedStaff.push(picked);
        }
      });

      const ticketId = `TIC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setResult(aiResult);

      await addDoc(collection(firestore, "tickets"), {
        ticketId,
        userName,
        content,
        tone: aiResult.tone,
        severity: aiResult.severity,
        categories: allDepts,
        department: aiResult.primaryDepartment,
        assignedStaff,
        templateStyle: aiResult.summary,
        aiResponse: aiResult.response,
        confidenceScore: aiResult.confidence,
        status: "Open",
        submittedAt: submittedAt.toISOString(),
        processedAt: processedAt.toISOString(),
        responseTimeSeconds,
        createdAt: submittedAt.toISOString(),
      });

      toast({
        title: `TICKET AUTHORIZED: ${ticketId}`,
        description: `Deployment to ${aiResult.primaryDepartment} engaged.`,
      });
    } catch (error: any) {
      console.error("Ticket Processing Error:", error);
      const errorMsg = String(error?.message || error || "").toLowerCase();
      const isQuotaError = errorMsg.includes("429") || 
                           errorMsg.includes("credits") || 
                           errorMsg.includes("too many requests") || 
                           errorMsg.includes("quota") ||
                           errorMsg.includes("billing");
      
      toast({
        variant: "destructive",
        title: isQuotaError ? "NEURAL OVERLOAD" : "SYSTEM FAILURE",
        description: isQuotaError 
          ? "AI processing limits reached. Manual intervention required."
          : `Protocol Error: ${error?.message || "Internal failure. Retry mission."}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 p3-angled-box -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto mb-16 flex items-center justify-between relative z-10">
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-4"
        >
          <div className="bg-primary p-3 p3-angled-box shadow-[0_0_20px_rgba(0,229,255,0.5)]">
            <ShieldCheck className="h-8 w-8 text-black" />
          </div>
          <div>
            <h1 className="text-4xl font-black font-headline italic tracking-tighter text-primary p3-text-shadow">SMART TICKET</h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.5em] font-black text-white/40">NEURAL HUB</span>
              <div className="h-[1px] w-20 bg-primary/30" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-6"
        >
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">SYSTEM STATUS</span>
            <span className="text-xl font-black text-white p3-text-shadow">{isOnline ? "OPERATIONAL" : "OFFLINE"}</span>
          </div>
          <Button 
            variant="outline" 
            className="h-14 px-8 p3-nav-skew bg-primary text-black font-black italic uppercase border-none hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,229,255,0.3)]"
            onClick={() => router.push("/dashboard")}
          >
            <div className="p3-nav-skew-content flex items-center gap-2">
              <Layout className="h-5 w-5" />
              INTELLIGENCE HUB
            </div>
          </Button>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-12 relative z-10">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lg:col-span-7"
        >
          <Card className="bg-card/40 backdrop-blur-2xl border-2 border-primary/30 p3-glow-border rounded-none relative overflow-hidden">
            {/* Top Right Corner Decor */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 p3-angled-box" />
            
            <CardHeader className="p-10 border-b border-primary/20">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-6 w-1 bg-primary" />
                <CardTitle className="text-2xl font-black font-headline italic text-primary uppercase">Mission Briefing</CardTitle>
              </div>
              <CardDescription className="text-white/60 font-medium tracking-tight">Enter the parameters of your operational complaint.</CardDescription>
            </CardHeader>
            <CardContent className="p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">OPERATOR SIGNATURE</Label>
                  <div className="relative p3-nav-skew">
                    <Input
                      placeholder="Input staff identifier..."
                      className="p3-nav-skew-content h-14 bg-white/5 border-primary/30 text-lg font-bold placeholder:text-white/20 focus:border-primary transition-all rounded-none"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">DATA CONTENT</Label>
                  <Textarea
                    placeholder="Describe the anomaly..."
                    className="min-h-[220px] bg-white/5 border-2 border-primary/20 p-8 text-xl font-bold placeholder:text-white/20 resize-none transition-all focus:border-primary rounded-none"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isProcessing || !content || !userName} 
                  className="w-full h-20 bg-primary hover:bg-white text-black font-black text-2xl p3-nav-skew shadow-[0_10px_30px_rgba(0,229,255,0.4)] transition-all group overflow-hidden"
                >
                  <div className="p3-nav-skew-content flex items-center justify-center gap-4 group-hover:scale-110 transition-transform">
                    {isProcessing ? <RefreshCcw className="h-8 w-8 animate-spin" /> : <Send className="h-8 w-8" />}
                    EXECUTE ANALYSIS
                  </div>
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {!result && !isProcessing && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="h-full flex flex-col items-center justify-center p-12 text-center bg-white/5 border-2 border-dashed border-primary/20 group"
              >
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="bg-primary/10 p-10 rounded-full mb-8"
                >
                  <Bot className="h-20 w-20 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                </motion.div>
                <h3 className="text-2xl font-black font-headline italic text-white/40 uppercase mb-2 tracking-widest">Awaiting Input</h3>
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-primary/40">S-Rank Neural Scan Standby</p>
              </motion.div>
            )}

            {isProcessing && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, rotateY: 90 }} 
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                className="h-full flex flex-col items-center justify-center p-12 text-center bg-primary/10 border-4 border-primary shadow-[0_0_50px_rgba(0,229,255,0.2)]"
              >
                <div className="relative mb-12">
                  <Sparkles className="h-32 w-32 text-primary animate-pulse" />
                  <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute -inset-6 border-4 border-dashed border-primary rounded-full"
                  />
                </div>
                <h3 className="text-4xl font-black font-headline italic text-primary uppercase mb-4 animate-bounce">DECODING...</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white animate-pulse">Eliminating Speculation</p>
              </motion.div>
            )}

            {result && !isProcessing && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 100, rotate: 5 }} 
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                className="space-y-6"
              >
                <div className="bg-primary text-black p-10 shadow-[0_20px_60px_rgba(0,229,255,0.5)] relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0px, #000 20px, transparent 20px, transparent 40px)' }} />
                  
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between border-b-4 border-black pb-4">
                      <h3 className="text-5xl font-black font-headline italic tracking-tighter uppercase leading-none">RESULTS</h3>
                      <Badge className="bg-black text-primary font-black px-4 py-2 text-lg">RANK S</Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-6 w-6" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">TARGET SECTOR</span>
                      </div>
                      <div className="text-4xl font-black font-headline italic uppercase border-l-8 border-black pl-6">
                        {result.primaryDepartment}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-black/10 p-4">
                        <span className="text-[8px] font-black uppercase block mb-1">SEVERITY</span>
                        <span className="text-xl font-black italic">{result.severity}</span>
                      </div>
                      <div className="bg-black/10 p-4">
                        <span className="text-[8px] font-black uppercase block mb-1">TONE</span>
                        <span className="text-xl font-black italic">{result.tone}</span>
                      </div>
                    </div>

                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-black text-primary p-8 border-l-8 border-white italic font-bold text-lg leading-tight"
                    >
                      "{result.response}"
                    </motion.div>

                    <Button 
                      variant="ghost" 
                      className="w-full h-14 bg-black/10 hover:bg-black/20 text-black font-black uppercase italic tracking-widest text-sm" 
                      onClick={() => {
                        setContent("");
                        setResult(null);
                      }}
                    >
                      <RefreshCcw className="h-4 w-4 mr-3" /> RETRY MISSION
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
