"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Student } from "@/lib/data";
import { Checkbox } from "@/components/ui/checkbox";
import { getPlaceholderImage } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(amount);
};

export const columns: ColumnDef<Student>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Student Name",
    cell: ({ row }) => {
      const student = row.original;
      const avatar = getPlaceholderImage(student.avatar);
      return (
        <div className="flex items-center gap-3">
          <Image
            src={avatar?.imageUrl || `https://picsum.photos/seed/${student.id}/40/40`}
            alt={student.name}
            width={40}
            height={40}
            className="rounded-full object-cover"
            data-ai-hint={avatar?.imageHint}
          />
          <div className="flex flex-col">
            <span className="font-medium">{student.name}</span>
            <span className="text-xs text-muted-foreground">{student.studentId}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "branch",
    header: "Branch",
  },
  {
    accessorKey: "grade",
    header: "Grade",
    cell: ({ row }) => <div className="text-center">{row.getValue("grade")}</div>,
  },
  {
    accessorKey: "subjects",
    header: "Subjects",
    cell: ({ row }) => {
      const subjects = row.original.subjects;
      return (
        <div>
          {subjects.map((subject, index) => (
            <div key={index}>{subject}</div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "Registered" ? "secondary" : "outline"
          }
          className={cn(
            status === 'Registered' && 'bg-green-800/50 text-green-300 border-green-800/60 hover:bg-green-800/60',
            status === 'Pending' && 'text-amber-300 border-amber-800/60'
          )}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(student.studentId)}
            >
              Copy Student ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit Record</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">Delete Record</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
