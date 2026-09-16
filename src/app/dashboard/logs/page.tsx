"use client";

import { useFirestore, useMemoFirebase } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, orderBy } from "firebase/firestore";
import { StockTransaction } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function LogsPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const logsQuery = useMemoFirebase(() => 
    query(collection(firestore, "stock_transactions"), orderBy("transactionDate", "desc")), 
  [firestore]);
  
  const { data: logs, isLoading } = useCollection<StockTransaction>(logsQuery);

  const filteredLogs = logs?.filter(log => 
    (log as any).productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.transactionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "Receive Stock": return "bg-green-500/10 text-green-600 border-green-200";
      case "Product Usage": return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "Damage/Loss": return "bg-red-500/10 text-red-600 border-red-200";
      case "Return to Supplier": return "bg-amber-500/10 text-amber-600 border-amber-200";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground">Transaction Audit Log</h1>
        <p className="text-muted-foreground">Detailed history of all stock movements for total accountability.</p>
      </div>

      <Card className="bg-card border-border shadow-md">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
            <CardTitle className="text-lg font-headline flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Full Ledger
            </CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Filter logs by product or type..." 
                className="pl-9 bg-background border-input" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            Records are sorted by most recent first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-24 text-center text-muted-foreground animate-pulse">
              Retrieving audit history...
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border">
                  <TableHead className="text-foreground">Date & Time</TableHead>
                  <TableHead className="text-foreground">Product</TableHead>
                  <TableHead className="text-foreground">Transaction Type</TableHead>
                  <TableHead className="text-right text-foreground">Quantity Change</TableHead>
                  <TableHead className="text-foreground">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs?.map((log) => (
                  <TableRow key={log.id} className="border-border hover:bg-muted/30 transition-colors">
                    <TableCell className="whitespace-nowrap font-mono text-xs">
                      {isMounted ? format(new Date(log.transactionDate), "dd MMM yyyy, HH:mm") : "..."}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {(log as any).productName || "Product"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTransactionColor(log.transactionType)}>
                        {log.transactionType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`flex items-center justify-end gap-1 font-bold ${log.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {log.quantity > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {log.quantity > 0 ? '+' : ''}{log.quantity}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground italic">
                      {log.notes || "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredLogs?.length && !isLoading) && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                      No matching transaction logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
