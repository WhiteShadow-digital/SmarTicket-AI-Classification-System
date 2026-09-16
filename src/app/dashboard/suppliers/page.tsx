"use client";

import { useFirestore, useMemoFirebase } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection } from "firebase/firestore";
import { Supplier } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { AddSupplierDialog } from "@/components/dashboard/add-supplier-dialog";

export default function SuppliersPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");

  const suppliersQuery = useMemoFirebase(() => collection(firestore, "suppliers"), [firestore]);
  const { data: suppliers, isLoading } = useCollection<Supplier>(suppliersQuery);

  const filteredSuppliers = suppliers?.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground">Supplier Directory</h1>
          <p className="text-muted-foreground">Manage your product vendors and their contact information.</p>
        </div>
        <AddSupplierDialog />
      </div>

      <Card className="bg-card border-border shadow-md">
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search by company or contact name..." 
              className="pl-9 bg-background border-input" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading suppliers...</div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border">
                  <TableHead className="text-foreground">Company</TableHead>
                  <TableHead className="text-foreground">Contact Person</TableHead>
                  <TableHead className="text-foreground">Contact Details</TableHead>
                  <TableHead className="text-foreground">Address</TableHead>
                  <TableHead className="text-right text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers?.map((supplier) => (
                  <TableRow key={supplier.id} className="border-border hover:bg-muted/30 transition-colors">
                    <TableCell className="font-semibold text-foreground">{supplier.name}</TableCell>
                    <TableCell className="text-foreground">{supplier.contactPerson}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-accent" />
                          <span>{supplier.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-accent" />
                          <span>{supplier.phoneNumber}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 text-accent flex-shrink-0" />
                        <span className="line-clamp-2">{supplier.address}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="hover:text-accent">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredSuppliers?.length && !isLoading) && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                      No suppliers found. Add your first vendor to get started.
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
