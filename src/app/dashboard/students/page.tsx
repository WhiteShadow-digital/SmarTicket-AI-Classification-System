"use client";

import { useState, useMemo } from "react";
import { Student } from "@/lib/data";
import { StudentTable } from "@/components/dashboard/student-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File } from "lucide-react";
import { AddStudentDialog } from "@/components/dashboard/add-student-dialog";
import { useFirebase, useMemoFirebase } from "@/firebase/provider";
import { collection } from "firebase/firestore";
import { useCollection } from "@/firebase/firestore/use-collection";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";


export default function StudentsPage() {
  const { firestore, isUserLoading } = useFirebase();
  const { toast } = useToast();

  const studentsRef = useMemoFirebase(() => collection(firestore, "students"), [firestore]);
  const { data: students, isLoading } = useCollection<Student>(studentsRef);

  const handleAddStudent = (newStudent: Omit<Student, 'id' | 'studentId' | 'avatar' | 'status'>) => {
    const studentId = `25V${Math.floor(Math.random() * 1000)}`;
    const newStudentData: Omit<Student, 'id'> = {
        ...newStudent,
        studentId: studentId,
        avatar: Math.random().toString(36).substring(7),
        status: 'Registered', // Default status
    };

    addDocumentNonBlocking(studentsRef, newStudentData)
      .then(() => {
        toast({
            title: "Student Added",
            description: `${newStudent.name} has been added to the list.`,
        });
      })
      .catch((err) => {
         console.error("Failed to add student", err);
         toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add student. Check console for details.",
         });
      });
  };

  if (isLoading || isUserLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Students</CardTitle>
                <CardDescription>A complete list of all students.</CardDescription>
            </CardHeader>
            <CardContent>
                <div>Loading students...</div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <div>
            <CardTitle>Students</CardTitle>
            <CardDescription>A complete list of all students.</CardDescription>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline">
              <File className="h-4 w-4 mr-2" />
              Export
            </Button>
            <AddStudentDialog onAddStudent={handleAddStudent} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <StudentTable data={students || []} />
      </CardContent>
    </Card>
  );
}
