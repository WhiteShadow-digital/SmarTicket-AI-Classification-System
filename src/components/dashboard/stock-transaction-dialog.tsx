
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRightLeft, Info, HelpCircle } from "lucide-react";
import { doc, collection } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFirestore } from "@/firebase";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const formSchema = z.object({
  transactionType: z.enum(["Receive Stock", "Product Usage", "Return to Supplier", "Damage/Loss"]),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  notes: z.string().optional(),
});

interface StockTransactionDialogProps {
  product: Product;
}

export function StockTransactionDialog({ product }: StockTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionType: "Product Usage",
      quantity: 1,
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const isDeduction = values.transactionType !== "Receive Stock";
    const adjustment = isDeduction ? -values.quantity : values.quantity;
    const newStock = product.currentStock + adjustment;

    if (newStock < 0) {
      toast({
        variant: "destructive",
        title: "Insufficient Stock",
        description: `Cannot use ${values.quantity} ${product.unitOfMeasure}. Only ${product.currentStock} available.`,
      });
      return;
    }

    const transactionData = {
      productId: product.id,
      productName: product.name,
      transactionType: values.transactionType,
      quantity: adjustment,
      transactionDate: new Date().toISOString(),
      staffId: "admin",
      staffEmail: "manager@salonsync.local",
      notes: values.notes,
    };

    const transactionsRef = collection(firestore, "stock_transactions");
    addDocumentNonBlocking(transactionsRef, transactionData);

    const productRef = doc(firestore, "products", product.id);
    updateDocumentNonBlocking(productRef, {
      currentStock: newStock
    });

    toast({
      title: "Stock Level Updated",
      description: `${values.transactionType} for ${product.name} has been synchronized.`,
    });
    
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-accent hover:bg-accent/10 font-bold group">
          <ArrowRightLeft className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
          Update Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="font-headline">Quick Stock Update</DialogTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Adjust stock levels for salon usage or inventory replenishment.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <DialogDescription className="font-medium">
            Currently: <span className="font-black text-foreground">{product.currentStock} {product.unitOfMeasure}</span> for <strong>{product.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="transactionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Transaction Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 border-2 focus:ring-accent">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Product Usage">Product Usage (Use in Salon)</SelectItem>
                      <SelectItem value="Receive Stock">Receive Stock (Restock)</SelectItem>
                      <SelectItem value="Damage/Loss">Damage/Loss</SelectItem>
                      <SelectItem value="Return to Supplier">Return to Supplier</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                    Determines if stock is added or removed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Quantity ({product.unitOfMeasure})</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} className="h-12 text-lg font-black border-2 focus:border-accent" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Contextual Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Treatment for Room 4" {...field} className="h-12 border-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black h-12 rounded-xl shadow-lg shadow-accent/20">
                Confirm & Synchronize
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
