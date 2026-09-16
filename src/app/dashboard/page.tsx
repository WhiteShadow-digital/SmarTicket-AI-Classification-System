"use client";

import { useFirestore, useMemoFirebase } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { Ticket } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowLeft, Layout, Clock, AlertTriangle, CheckCircle2, UserCheck, Hash } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function TicketDashboard() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const ticketsQuery = useMemoFirebase(() => query(collection(firestore, "tickets"), orderBy("createdAt", "desc")), [firestore]);
  const { data: tickets, isLoading } = useCollection<Ticket>(ticketsQuery);

  const handleResolve = async (ticket: Ticket) => {
    if (ticket.status === 'Resolved') return;

    const resolvedAt = new Date();
    const resolutionTimeSeconds = (resolvedAt.getTime() - new Date(ticket.submittedAt).getTime()) / 1000;

    try {
      await updateDoc(doc(firestore, "tickets", ticket.id), {
        status: 'Resolved',
        resolvedAt: resolvedAt.toISOString(),
        resolutionTimeSeconds
      });
      toast({
        title: "Ticket Resolved",
        description: `Resolution time: ${Math.floor(resolutionTimeSeconds / 60)} minutes.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update ticket status.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8 font-body">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon" className="rounded-xl border-border bg-card">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black font-headline tracking-tight text-foreground">Intelligence Hub</h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Multi-Dept Operational Audit Log</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-card border-border font-bold text-xs py-1.5 px-4">{tickets?.length || 0} Records Found</Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-card border-border shadow-xl rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</CardTitle>
              <Layout className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">{tickets?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-xl rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resolved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">
                {tickets?.filter(t => t.status === 'Resolved').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-xl rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avg Response</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">1.2s</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-xl rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Critical</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-foreground">
                {tickets?.filter(t => t.severity === 'Critical').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border shadow-2xl rounded-[2.5rem] bg-card overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground pl-8">ID</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">User & Content</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Departments</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Assigned Staff</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Severity</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Date</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-muted-foreground pr-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Syncing Cross-Dept Data...</TableCell>
                  </TableRow>
                ) : tickets?.map((ticket) => (
                  <TableRow key={ticket.id} className="border-border hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-8">
                      <div className="flex items-center gap-1 text-[10px] font-mono font-black text-muted-foreground">
                        <Hash className="h-2.5 w-2.5" />
                        {ticket.ticketId}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-[10px] font-black text-primary uppercase mb-1">{ticket.userName || 'Anonymous'}</p>
                      <p className="text-sm font-bold truncate text-foreground">{ticket.content}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(ticket.categories || [ticket.category]).map((cat) => (
                          <Badge key={cat} variant="secondary" className="font-black text-[8px] tracking-wider py-0.5 px-2 bg-muted text-foreground border-none">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {(Array.isArray(ticket.assignedStaff) ? ticket.assignedStaff : []).map((staff, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <UserCheck className="h-3 w-3 text-primary/60" />
                            <span className="text-[10px] font-bold text-foreground">{staff}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`
                        font-black text-[9px] tracking-widest py-0.5 px-2 border-none
                        ${ticket.severity === 'Critical' ? 'bg-red-500/10 text-red-600' : ''}
                        ${ticket.severity === 'High' ? 'bg-orange-500/10 text-orange-600' : ''}
                        ${ticket.severity === 'Medium' ? 'bg-blue-500/10 text-blue-600' : ''}
                        ${ticket.severity === 'Low' ? 'bg-green-500/10 text-green-600' : ''}
                      `}>
                        {ticket.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[10px] font-bold text-muted-foreground uppercase">
                      {format(new Date(ticket.createdAt), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      {ticket.status === 'Resolved' ? (
                        <Badge className="bg-green-500/10 text-green-600 border-none font-black text-[9px] uppercase tracking-widest">Resolved</Badge>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-border hover:bg-green-500/10 hover:text-green-600"
                          onClick={() => handleResolve(ticket)}
                        >
                          Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
