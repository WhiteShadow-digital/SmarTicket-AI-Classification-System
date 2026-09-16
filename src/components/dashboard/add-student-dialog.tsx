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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { Student } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

interface AddStudentDialogProps {
  onAddStudent: (student: Omit<Student, 'id' | 'studentId' | 'avatar' | 'status'>) => void;
}

export function AddStudentDialog({ onAddStudent }: AddStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [grade, setGrade] = useState<number | ''>('');
  const [fees, setFees] = useState<number | ''>('');
  const [paid, setPaid] = useState<number | ''>('');
  const [discount, setDiscount] = useState<number | ''>(0);
  const [subjects, setSubjects] = useState('');
  const [attendance, setAttendance] = useState<number | ''>('');
  const [teacherNotes, setTeacherNotes] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !branch || grade === '' || fees === '' || paid === '' || attendance === '') {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please fill in all required fields.",
        });
        return;
    }
    
    onAddStudent({
      name,
      branch,
      grade: Number(grade),
      fees: Number(fees),
      paid: Number(paid),
      discount: Number(discount || 0),
      subjects: subjects.split(',').map(s => s.trim()),
      attendance: Number(attendance),
      teacherNotes,
    });

    // Reset form
    setName('');
    setBranch('');
    setGrade('');
    setFees('');
    setPaid('');
    setDiscount(0);
    setSubjects('');
    setAttendance('');
    setTeacherNotes('');

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter the details of the new student below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                Name
                </Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="branch" className="text-right">
                Branch
                </Label>
                <Input id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="grade" className="text-right">
                Grade
                </Label>
                <Input id="grade" type="number" value={grade} onChange={(e) => setGrade(e.target.value === '' ? '' : Number(e.target.value))} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subjects" className="text-right">
                Subjects
                </Label>
                <Input id="subjects" value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="e.g. Maths, Science" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fees" className="text-right">
                Fees
                </Label>
                <Input id="fees" type="number" value={fees} onChange={(e) => setFees(e.target.value === '' ? '' : Number(e.target.value))} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paid" className="text-right">
                Paid
                </Label>
                <Input id="paid" type="number" value={paid} onChange={(e) => setPaid(e.target.value === '' ? '' : Number(e.target.value))} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discount" className="text-right">
                Discount
                </Label>
                <Input id="discount" type="number" value={discount} onChange={(e) => setDiscount(e.target.value === '' ? '' : Number(e.target.value))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="attendance" className="text-right">
                Attendance %
                </Label>
                <Input id="attendance" type="number" value={attendance} onChange={(e) => setAttendance(e.target.value === '' ? '' : Number(e.target.value))} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                Notes
                </Label>
                <Input id="notes" value={teacherNotes} onChange={(e) => setTeacherNotes(e.target.value)} className="col-span-3" />
            </div>
            </div>
            <DialogFooter>
            <Button type="submit">Add Student</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
