"use client";

import { useMemo, useState, useEffect } from "react";
import { useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { collection, query, orderBy, addDoc, limit } from "firebase/firestore";
import { Ticket, WeeklyInsight } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { 
  TrendingUp, 
  MessageSquare, 
  Clock,
  Sparkles,
  Loader2,
  Activity,
  BrainCircuit,
  AlertCircle,
  Trophy,
  RefreshCw,
  Filter,
  Printer,
  FileJson,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  subWeeks, 
  isSameWeek, 
  startOfWeek, 
  eachWeekOfInterval, 
  format,
  subDays,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  eachMonthOfInterval,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { generateWeeklyInsights } from "@/ai/flows/generate-weekly-insights";
import { generateDepartmentSummary, type DepartmentSummaryOutput } from "@/ai/flows/generate-department-summary";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const DEPT_COLORS = {
  'IT': '#3b82f6',
  'HR': '#a855f7',
  'Finance': '#10b981',
  'Operations': '#f97316'
};

const SEVERITY_COLORS = {
  'Critical': '#ef4444',
  'High': '#f97316',
  'Medium': '#3b82f6',
  'Low': '#10b981'
};

export default function ReportsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [trendView, setTrendView] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [deptSummary, setDeptSummary] = useState<DepartmentSummaryOutput | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const ticketsQuery = useMemoFirebase(() => 
    query(collection(firestore, "tickets"), orderBy("createdAt", "desc")), 
  [firestore]);

  const insightsQuery = useMemoFirebase(() => 
    query(collection(firestore, "weekly_insights"), orderBy("generatedAt", "desc"), limit(1)),
  [firestore]);

  const { data: rawTickets, isLoading: isTicketsLoading } = useCollection<Ticket>(ticketsQuery);
  const { data: insights } = useCollection<WeeklyInsight>(insightsQuery);

  const tickets = useMemo(() => {
    if (!rawTickets) return [];
    if (selectedDept === "all") return rawTickets;
    return rawTickets.filter(t => 
      t.department === selectedDept || 
      (Array.isArray(t.categories) && t.categories.includes(selectedDept as any))
    );
  }, [rawTickets, selectedDept]);

  const latestInsight = insights?.[0];

  const handleGenerateInsights = async () => {
    if (!tickets || tickets.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data Found",
        description: "Submit tickets for this view to enable AI analysis.",
      });
      return;
    }
    
    setIsGeneratingInsights(true);
    try {
      if (selectedDept === "all") {
        const totalTickets = tickets.length;
        const categoryCounts: Record<string, number> = {};
        const severityCounts: Record<string, number> = {};
        let totalResponseTime = 0;

        tickets.forEach(t => {
          const cats = Array.isArray(t.categories) ? t.categories : [t.department];
          cats.forEach(c => {
            if (c) categoryCounts[c] = (categoryCounts[c] || 0) + 1;
          });
          severityCounts[t.severity] = (severityCounts[t.severity] || 0) + 1;
          totalResponseTime += t.responseTimeSeconds || 1.2;
        });

        const avgResponseTime = totalResponseTime / totalTickets;
        const recentTicketsSample = tickets.slice(0, 50).map(t => ({
          category: (Array.isArray(t.categories) ? t.categories : [t.department]).join(' & '),
          content: t.content
        }));

        const result = await generateWeeklyInsights({
          totalTickets,
          categoryDistribution: categoryCounts,
          severityDistribution: severityCounts,
          avgResponseTime,
          timeRange: "Live Operational Summary",
          recentTickets: recentTicketsSample
        });

        await addDoc(collection(firestore, "weekly_insights"), {
          generatedAt: new Date().toISOString(),
          totalTickets,
          summary: result.summary,
          trends: result.trends,
          concerns: result.concerns,
          recommendations: result.recommendations,
          recurringIssuesByDept: result.recurringIssuesByDept,
          efficiencyScore: result.efficiencyScore,
        });

        toast({
          title: "Global Analysis Complete",
          description: "All departmental patterns synchronized.",
        });
      } else {
        const result = await generateDepartmentSummary({
          department: selectedDept,
          ticketCount: tickets.length,
          avgResponseTime: tickets.reduce((a, b) => a + (b.responseTimeSeconds || 1.2), 0) / (tickets.length || 1),
          recentTickets: tickets.slice(0, 10).map(t => ({
            content: t.content,
            severity: t.severity,
            status: t.status
          }))
        });
        setDeptSummary(result);
        toast({
          title: "Department Audit Ready",
          description: `Customized strategy for ${selectedDept} generated.`,
        });
      }
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      const errorMsg = String(error?.message || error || "").toLowerCase();
      const isQuotaError = errorMsg.includes("429") || 
                           errorMsg.includes("credits") || 
                           errorMsg.includes("too many requests") || 
                           errorMsg.includes("quota") ||
                           errorMsg.includes("billing");
      
      toast({
        variant: "destructive",
        title: isQuotaError ? "AI Quota Limit" : "Analysis Failed",
        description: isQuotaError 
          ? "The AI provider has reached its quota or credits are depleted."
          : "The AI service is currently processing high volumes. Try again shortly.",
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const downloadReport = (formatType: 'json' | 'txt') => {
    if (!tickets) return;
    
    const reportData = {
      generatedAt: new Date().toISOString(),
      department: selectedDept,
      totalTickets: tickets.length,
      metrics: {
        avgResponse: tickets.reduce((a, b) => a + (b.responseTimeSeconds || 1.2), 0) / (tickets.length || 1),
        criticalCount: tickets.filter(t => t.severity === 'Critical').length,
        resolutionRate: (tickets.filter(t => t.status === 'Resolved').length / (tickets.length || 1) * 100).toFixed(1) + '%'
      },
      recentActivity: tickets.slice(0, 20).map(t => ({
        id: t.ticketId,
        date: t.createdAt,
        content: t.content,
        severity: t.severity
      }))
    };

    const content = formatType === 'json' 
      ? JSON.stringify(reportData, null, 2)
      : `SMARTTICKET AUDIT REPORT\nGenerated: ${reportData.generatedAt}\nDept: ${selectedDept}\n\nMetrics:\nTotal: ${reportData.totalTickets}\nAvg Latency: ${reportData.metrics.avgResponse}s\nResolution: ${reportData.metrics.resolutionRate}\n\nRecent Tickets:\n` + 
        reportData.recentActivity.map(t => `- [${t.id}] ${t.severity}: ${t.content}`).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartticket-report-${selectedDept}-${format(new Date(), 'yyyy-MM-dd')}.${formatType}`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Report Downloaded", description: `Structured ${formatType.toUpperCase()} file generated.` });
  };

  const metrics = useMemo(() => {
    if (!tickets) return null;

    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'Open').length;
    const resolved = tickets.filter(t => t.status === 'Resolved').length;
    const critical = tickets.filter(t => t.severity === 'Critical').length;
    
    const responseTimes = tickets.map(t => t.responseTimeSeconds || 1.2);
    const avgResponse = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / total : 1.2;

    const dailyTrend = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date()
    }).map(date => ({
      name: format(date, "MMM d"),
      tickets: tickets.filter(t => isSameDay(new Date(t.createdAt), date)).length
    }));

    const dataStartDate = tickets.length > 0 
      ? startOfWeek(new Date(tickets[tickets.length - 1].createdAt))
      : startOfWeek(subWeeks(new Date(), 2));
    
    const weeklyTrend = eachWeekOfInterval({
      start: dataStartDate,
      end: new Date()
    }).map((date, index) => ({
      name: `Week ${index + 1}`,
      tickets: tickets.filter(t => isSameWeek(new Date(t.createdAt), date)).length,
      fullDate: format(date, "MMM d")
    }));

    const monthlyTrend = eachMonthOfInterval({
      start: startOfYear(new Date()),
      end: new Date()
    }).map(date => ({
      name: format(date, "MMM"),
      tickets: tickets.filter(t => isSameMonth(new Date(t.createdAt), date)).length
    }));

    const categories = Object.entries(
      tickets.reduce((acc, t) => {
        const cats = Array.isArray(t.categories) ? t.categories : [t.department];
        cats.forEach(c => {
          if (c) acc[c] = (acc[c] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    const severities = Object.entries(
      tickets.reduce((acc, t) => {
        acc[t.severity] = (acc[t.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, count]) => ({ name, count }));

    return {
      total, open, resolved, critical, 
      avgResponse,
      dailyTrend, weeklyTrend, monthlyTrend,
      categories, severities
    };
  }, [tickets]);

  if (isTicketsLoading || !metrics) {
    return (
      <div className="flex h-[60vh] items-center justify-center flex-col gap-4 text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="font-headline font-bold uppercase tracking-widest text-[10px]">Syncing Enterprise Data...</p>
      </div>
    );
  }

  const activeTrendData = trendView === 'daily' ? metrics.dailyTrend : trendView === 'weekly' ? metrics.weeklyTrend : metrics.monthlyTrend;

  return (
    <div className="flex flex-col gap-8 pb-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight text-foreground">Intelligence Reports</h1>
          <p className="text-sm text-muted-foreground font-medium italic">Strategic Operational Data Export.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <Select value={selectedDept} onValueChange={setSelectedDept}>
             <SelectTrigger className="w-[180px] bg-card border-border rounded-xl font-bold h-10">
               <Filter className="h-4 w-4 mr-2 opacity-50" />
               <SelectValue placeholder="Department" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">Global (All Depts)</SelectItem>
               <SelectItem value="IT">Information Tech</SelectItem>
               <SelectItem value="HR">Human Resources</SelectItem>
               <SelectItem value="Finance">Finance & Payroll</SelectItem>
               <SelectItem value="Operations">Facilities & Ops</SelectItem>
             </SelectContent>
           </Select>

           <div className="flex items-center gap-1">
             <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-card border-border" onClick={() => downloadReport('json')}>
               <FileJson className="h-4 w-4" />
             </Button>
             <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-card border-border" onClick={() => window.print()}>
               <Printer className="h-4 w-4" />
             </Button>
           </div>
           
           <Button 
             size="sm" 
             className="h-10 rounded-xl font-black bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
             onClick={handleGenerateInsights}
             disabled={isGeneratingInsights}
           >
             {isGeneratingInsights ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BrainCircuit className="h-4 w-4 mr-2" />}
             Run Performance Audit
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Volume', value: metrics.total, icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active', value: metrics.open, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Avg Latency', value: `${metrics.avgResponse.toFixed(1)}s`, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Critical Risk', value: metrics.critical, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border shadow-xl rounded-3xl overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
              <div className={`${stat.bg} p-2 rounded-xl`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedDept === "all" && (
        <Card className="border-border shadow-2xl rounded-[2.5rem] bg-gradient-to-br from-background to-primary/5 overflow-hidden border-l-8 border-l-primary min-h-[400px]">
          {latestInsight ? (
            <>
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-headline text-2xl font-black text-primary uppercase tracking-tight">Global Weekly Summary</CardTitle>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Generated: {format(new Date(latestInsight.generatedAt), "MMM d, HH:mm")}</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-3xl cursor-pointer hover:bg-primary/20 transition-colors" onClick={handleGenerateInsights}>
                    {isGeneratingInsights ? <Loader2 className="h-8 w-8 text-primary animate-spin" /> : <RefreshCw className="h-8 w-8 text-primary" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-8">
                <div className="p-6 bg-card rounded-2xl border border-border shadow-sm">
                  <p className="text-base font-bold text-foreground leading-relaxed italic">
                    "{latestInsight.summary}"
                  </p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {latestInsight.recurringIssuesByDept && Object.entries(latestInsight.recurringIssuesByDept).map(([dept, issues]) => (
                    <div key={dept} className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {dept} recurring
                      </h4>
                      <div className="space-y-2">
                        {issues.map((issue, idx) => (
                          <div key={idx} className="p-3 bg-muted/50 rounded-xl text-[11px] font-bold text-muted-foreground border border-border/50">
                            {issue}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" /> Positive Trends
                    </h4>
                    <ul className="space-y-2">
                      {latestInsight.trends.map((t, i) => (
                        <li key={i} className="text-xs font-bold text-foreground flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-emerald-500" /> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                      <AlertCircle className="h-3 w-3" /> Red Flags
                    </h4>
                    <ul className="space-y-2">
                      {latestInsight.concerns.map((t, i) => (
                        <li key={i} className="text-xs font-bold text-foreground flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-red-500" /> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Strategic Priority</h4>
                    <p className="text-xs font-black text-foreground">
                      {latestInsight.recommendations[0]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-6 p-12 text-center">
              <div className="bg-primary/10 p-6 rounded-full">
                <BrainCircuit className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black font-headline uppercase text-foreground">Pending Weekly Analysis</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  Click the button below to generate a comprehensive strategic summary based on your current operational data.
                </p>
              </div>
              <Button 
                onClick={handleGenerateInsights} 
                disabled={isGeneratingInsights}
                className="rounded-2xl h-12 px-8 font-black bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.05] transition-transform"
              >
                {isGeneratingInsights ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Sparkles className="h-5 w-5 mr-3" />}
                Generate Weekly Insights
              </Button>
            </div>
          )}
        </Card>
      )}

      {selectedDept !== "all" && (
        <Card className="border-border shadow-2xl rounded-[2.5rem] bg-gradient-to-br from-background to-primary/5 overflow-hidden border-l-8 border-l-primary min-h-[400px]">
          {deptSummary ? (
            <>
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-headline text-2xl font-black text-primary uppercase tracking-tight">{selectedDept} Performance Audit</CardTitle>
                    <Badge className={`mt-2 font-black text-[9px] uppercase tracking-[0.2em] ${
                      deptSummary.riskLevel === 'Critical' ? 'bg-red-500' :
                      deptSummary.riskLevel === 'High' ? 'bg-orange-500' :
                      deptSummary.riskLevel === 'Moderate' ? 'bg-blue-500' : 'bg-green-500'
                    } text-white border-none`}>
                      {deptSummary.riskLevel} Risk Profile
                    </Badge>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-3xl cursor-pointer hover:bg-primary/20 transition-colors" onClick={handleGenerateInsights}>
                    {isGeneratingInsights ? <Loader2 className="h-8 w-8 text-primary animate-spin" /> : <RefreshCw className="h-8 w-8 text-primary" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                      <Activity className="h-3 w-3" /> Executive Outlook
                    </h4>
                    <p className="text-sm font-bold text-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4">
                      "{deptSummary.executiveSummary}"
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" /> Recurring Friction Points
                    </h4>
                    <div className="space-y-2">
                      {deptSummary.topPainPoints.map((point, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-card/50 rounded-2xl border border-border shadow-sm">
                          <span className="text-[10px] font-black text-primary">0{i+1}</span>
                          <p className="text-xs font-bold text-foreground">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10 flex flex-col justify-center text-center">
                  <Trophy className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Strategic Priority #1</h4>
                  <p className="text-xl font-black text-foreground leading-tight">
                    {deptSummary.strategicPriority}
                  </p>
                  <div className="mt-6 pt-6 border-t border-primary/10">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Target Resolution Window: 72 Hours</p>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-6 p-12 text-center">
              <div className="bg-primary/10 p-6 rounded-full">
                <Activity className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black font-headline uppercase text-foreground">Pending {selectedDept} Audit</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  Analyze performance metrics specifically for the {selectedDept} department to identify risks and priorities.
                </p>
              </div>
              <Button 
                onClick={handleGenerateInsights} 
                disabled={isGeneratingInsights}
                className="rounded-2xl h-12 px-8 font-black bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.05] transition-transform"
              >
                {isGeneratingInsights ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Sparkles className="h-5 w-5 mr-3" />}
                Run Department Audit
              </Button>
            </div>
          )}
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-8 border-border shadow-xl rounded-[2.5rem] bg-card overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="font-headline text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Growth Trend: {selectedDept.toUpperCase()}
              </CardTitle>
              <Tabs defaultValue="weekly" value={trendView} onValueChange={(v) => setTrendView(v as any)}>
                <TabsList className="bg-muted rounded-xl no-print">
                  <TabsTrigger value="daily" className="text-[10px] font-black uppercase">Daily</TabsTrigger>
                  <TabsTrigger value="weekly" className="text-[10px] font-black uppercase">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly" className="text-[10px] font-black uppercase">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-8 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} fontWeight="bold" stroke="currentColor" />
                <YAxis fontSize={10} axisLine={false} tickLine={false} stroke="currentColor" />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tickets" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--card))' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-border shadow-xl rounded-[2.5rem] bg-card overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="font-headline text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Impact Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.severities}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} fontWeight="bold" stroke="currentColor" />
                <YAxis fontSize={10} axisLine={false} tickLine={false} stroke="currentColor" />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={50}>
                  {metrics.severities.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name as keyof typeof SEVERITY_COLORS] || '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-xl rounded-[2.5rem] bg-card overflow-hidden">
        <CardHeader className="p-8">
          <CardTitle className="font-headline text-lg">Detailed Audit Trail: {selectedDept.toUpperCase()}</CardTitle>
          <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Latest {tickets.length} operational records</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-border">
                <TableHead className="pl-8 font-black text-[10px] uppercase">ID</TableHead>
                <TableHead className="font-black text-[10px] uppercase">Issue Summary</TableHead>
                <TableHead className="font-black text-[10px] uppercase">Severity</TableHead>
                <TableHead className="font-black text-[10px] uppercase">Status</TableHead>
                <TableHead className="pr-8 text-right font-black text-[10px] uppercase">Latency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.slice(0, 10).map((t) => (
                <TableRow key={t.id} className="border-border">
                  <TableCell className="pl-8 font-mono text-[10px] font-bold text-muted-foreground">{t.ticketId}</TableCell>
                  <TableCell className="max-w-md font-bold truncate">{t.content}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-black text-[8px] uppercase ${
                      t.severity === 'Critical' ? 'text-red-500 border-red-500/20' : 'text-muted-foreground'
                    }`}>
                      {t.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`font-black text-[8px] uppercase ${
                      t.status === 'Resolved' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'
                    } border-none`}>
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-8 text-right font-mono text-[10px] font-bold">
                    {t.resolutionTimeSeconds ? `${(t.resolutionTimeSeconds / 60).toFixed(0)}m` : `${(t.responseTimeSeconds || 1.2).toFixed(1)}s (AI)`}
                  </TableCell>
                </TableRow>
              ))}
              {tickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground font-bold uppercase text-[10px] tracking-widest italic">
                    No records found for this department.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
