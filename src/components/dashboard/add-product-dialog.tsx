"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Sparkles, Loader2 } from "lucide-react";
import { collection } from "firebase/firestore";

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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Category, Supplier } from "@/lib/types";
import { generateProductDescription } from "@/ai/flows/generate-product-description";

const formSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  sku: z.string().min(3, "SKU is required"),
  costPrice: z.coerce.number().min(0, "Price must be positive"),
  sellingPrice: z.coerce.number().min(0, "Price must be positive"),
  currentStock: z.coerce.number().min(0, "Stock cannot be negative"),
  reorderLevel: z.coerce.number().min(0, "Reorder level cannot be negative"),
  unitOfMeasure: z.string().min(1, "Unit of measure is required (e.g., ml, bottle)"),
});

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const categoriesQuery = useMemoFirebase(() => collection(firestore, "categories"), [firestore]);
  const suppliersQuery = useMemoFirebase(() => collection(firestore, "suppliers"), [firestore]);
  
  const { data: categories } = useCollection<Category>(categoriesQuery);
  const { data: suppliers } = useCollection<Supplier>(suppliersQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      supplierId: "",
      sku: "",
      costPrice: 0,
      sellingPrice: 0,
      currentStock: 0,
      reorderLevel: 5,
      unitOfMeasure: "unit",
    },
  });

  const handleAiDescription = async () => {
    const name = form.getValues("name");
    const categoryId = form.getValues("categoryId");
    
    if (!name || !categoryId) {
      toast({
        variant: "destructive",
        title: "Missing Info",
        description: "Please enter a product name and select a category first.",
      });
      return;
    }

    const categoryName = categories?.find(c => c.id === categoryId)?.name || "Hair Care";
    
    setIsAiLoading(true);
    try {
      const result = await generateProductDescription({ productName: name, category: categoryName });
      form.setValue("description", result.description);
      toast({
        title: "Magic Applied!",
        description: "AI description generated successfully.",
      });
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      const errorMsg = String(error?.message || error || "").toLowerCase();
      const isQuotaError = errorMsg.includes("429") || 
                           errorMsg.includes("credits") || 
                           errorMsg.includes("too many requests") || 
                           errorMsg.includes("quota") ||
                           errorMsg.includes("billing");

      toast({
        variant: "destructive",
        title: isQuotaError ? "AI Quota Limit" : "AI Generation Failed",
        description: isQuotaError 
          ? "The AI provider has reached its quota or credits are depleted."
          : "Could not generate description. Please try again.",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const productsRef = collection(firestore, "products");
    
    addDocumentNonBlocking(productsRef, values)
      .then(() => {
        toast({
          title: "Product Added",
          description: `${values.name} has been added to your catalog.`,
        });
        form.reset();
        setOpen(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Enter the details for the new product in your inventory.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Volume Boost Shampoo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="VOL-SH-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitOfMeasure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit (e.g. ml, pc)</FormLabel>
                    <FormControl>
                      <Input placeholder="ml" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers?.map((sup) => (
                          <SelectItem key={sup.id} value={sup.id}>
                            {sup.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price (R)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sellingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price (R)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reorderLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Alert Level</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Description (Optional)</FormLabel>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleAiDescription}
                      disabled={isAiLoading}
                      className="h-7 text-[10px] gap-1.5 text-accent hover:text-accent hover:bg-accent/10"
                    >
                      {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      Generate with AI
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea placeholder="Details about product usage..." {...field} className="resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                Save Product
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
