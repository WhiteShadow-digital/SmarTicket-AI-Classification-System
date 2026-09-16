"use client";

import { useFirestore, useMemoFirebase } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, doc } from "firebase/firestore";
import { Product, Category } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Package2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddProductDialog } from "@/components/dashboard/add-product-dialog";
import { AddCategoryDialog } from "@/components/dashboard/add-category-dialog";
import { StockTransactionDialog } from "@/components/dashboard/stock-transaction-dialog";
import { useState, useEffect } from "react";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function InventoryPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const productsQuery = useMemoFirebase(() => collection(firestore, "products"), [firestore]);
  const categoriesQuery = useMemoFirebase(() => collection(firestore, "categories"), [firestore]);
  
  const { data: products, isLoading } = useCollection<Product>(productsQuery);
  const { data: categories } = useCollection<Category>(categoriesQuery);

  const getCategoryName = (id: string) => {
    return categories?.find(c => c.id === id)?.name || "Uncategorized";
  };

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    if (!isMounted) return "...";
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    const productRef = doc(firestore, "products", productId);
    deleteDocumentNonBlocking(productRef);
    toast({
      title: "Product Removed",
      description: `${productName} has been deleted from your catalog.`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight text-foreground">Product Catalog</h1>
          <p className="text-sm text-muted-foreground">Manage and track your salon's stock levels.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AddCategoryDialog />
          <AddProductDialog />
        </div>
      </div>

      <Card className="bg-card border-border shadow-md">
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-9 bg-background border-input h-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="border-border hover:bg-muted h-10 hidden sm:flex">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 md:p-6 md:pt-0">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <Package2 className="h-12 w-12 animate-pulse opacity-20" />
              <span>Loading your catalog...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border">
                    <TableHead className="text-foreground">Product</TableHead>
                    <TableHead className="text-foreground hidden md:table-cell">SKU</TableHead>
                    <TableHead className="text-foreground">Stock</TableHead>
                    <TableHead className="text-foreground hidden sm:table-cell">Price</TableHead>
                    <TableHead className="text-right text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts?.map((product) => (
                    <TableRow key={product.id} className="border-border hover:bg-muted/30 transition-colors">
                      <TableCell className="max-w-[150px] sm:max-w-none">
                        <div className="font-semibold text-sm sm:text-base text-foreground truncate">{product.name}</div>
                        <div className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-accent">{getCategoryName(product.categoryId)}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground hidden md:table-cell">{product.sku}</TableCell>
                      <TableCell>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="font-bold text-sm sm:text-base text-foreground">{product.currentStock}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{product.unitOfMeasure}</span>
                          {product.currentStock <= product.reorderLevel && (
                            <Badge variant="destructive" className="text-[8px] h-3 px-1 leading-none w-fit">LOW</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground/80 hidden sm:table-cell text-sm">
                        {formatCurrency(product.sellingPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <StockTransactionDialog product={product} />
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="w-[90vw] max-w-md rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete <strong>{product.name}</strong>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteProduct(product.id, product.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!filteredProducts?.length && !isLoading) && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}