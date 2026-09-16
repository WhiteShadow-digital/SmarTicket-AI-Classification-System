"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Student } from "@/lib/data";
import { generateStudentPerformanceReport } from "@/ai/flows/generate-student-performance-report";
import { generateStudentReport } from "@/ai/flows/generate-student-report";
import { Loader2, Bot, FileText, Banknote } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

type ReportType = "performance" | "financial";

export function GenerateReportDialog({ selectedStudents, allStudents }: { selectedStudents: Student[], allStudents: Student[] }) {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGeneratePerformanceReport = async () => {
    if (selectedStudents.length !== 1) {
      toast({
        variant: "destructive",
        title: "Selection Error",
        description: "Please select exactly one student to generate a performance report.",
      });
      return;
    }
    const student = selectedStudents[0];
    setIsLoading(true);
    setReport(null);
    try {
      const result = await generateStudentPerformanceReport({
        studentName: student.name,
        grades: `Grade: ${student.grade}`,
        attendancePercentage: student.attendance,
        teacherNotes: student.teacherNotes,
      });
      setReport(result.report);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Failed to generate performance report.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFinancialReport = async () => {
    setIsLoading(true);
    setReport(null);
    try {
      const result = await generateStudentReport({
        studentRecords: JSON.stringify(allStudents, null, 2),
      });
      setReport(result.report);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Failed to generate financial report.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setReportType(null);
      setReport(null);
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Bot className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline">AI-Powered Reports</DialogTitle>
          <DialogDescription>
            Generate insightful reports on student performance or financial status.
          </DialogDescription>
        </DialogHeader>
        {!reportType ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setReportType("performance")}>
                <FileText className="h-6 w-6"/>
                <span>Performance Report</span>
                <span className="text-xs text-muted-foreground">(Select 1 student)</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setReportType("financial")}>
                <Banknote className="h-6 w-6" />
                <span>Financial Summary</span>
                <span className="text-xs text-muted-foreground">(Uses all students)</span>
            </Button>
          </div>
        ) : (
          <div>
            <div className="py-4">
              {isLoading && (
                <div className="flex flex-col items-center justify-center gap-4 h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Generating report... this may take a moment.</p>
                </div>
              )}
              {report && (
                <ScrollArea className="h-64 w-full rounded-md border p-4">
                    <pre className="whitespace-pre-wrap text-sm font-mono">{report}</pre>
                </ScrollArea>
              )}
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => { setReport(null); setReportType(null); }}>Back</Button>
                <Button
                    onClick={reportType === 'performance' ? handleGeneratePerformanceReport : handleGenerateFinancialReport}
                    disabled={isLoading}
                    className="bg-accent hover:bg-accent/80"
                >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoading ? 'Generating...' : report ? 'Regenerate' : 'Generate'}
                </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
