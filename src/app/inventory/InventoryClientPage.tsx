"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Product, Ingredient, Category } from "@/types";
import { PlusCircle, Download, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppContext } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { addProductAction, updateProductAction, deleteProductAction, addIngredientAction, updateIngredientAction, deleteIngredientAction, addCategoryAction, updateCategoryAction, deleteCategoryAction } from "./actions";

const productSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
  category: z.string().min(1, { message: "La categoría es requerida." }),
  price: z.coerce.number().positive({ message: "El precio debe ser un número positivo." }),
  comboPrice: z.coerce.number().positive().optional().or(z.literal('')),
  stock: z.coerce.number().int().min(0, { message: "Las existencias no pueden ser negativas." }),
  image: z.string().optional(),
});

const ingredientSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
  stock: z.coerce.number().int().min(0, { message: "Las existencias no pueden ser negativas." }),
  unit: z.enum(['g', 'ml', 'pcs'], { required_error: "La unidad es requerida." }),
});

const categorySchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
});

export default function InventoryClientPage() {
  const {
    products,
    ingredients,
    categories,
    currentUser,
  } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();
  const [adminUser, setAdminUser] = React.useState<SupabaseUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  React.useEffect(() => {
    const supabase = createClient();
    const getAdminUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAdminUser(user);
      setIsCheckingAuth(false);
    }
    getAdminUser();
  }, []);

  const [isProductDialogOpen, setIsProductDialogOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const [isIngredientDialogOpen, setIsIngredientDialogOpen] = React.useState(false);
  const [editingIngredient, setEditingIngredient] = React.useState<Ingredient | null>(null);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingItem, setDeletingItem] = React.useState<{ type: 'product' | 'ingredient' | 'category'; id: string; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
  });

  const ingredientForm = useForm<z.infer<typeof ingredientSchema>>({
    resolver: zodResolver(ingredientSchema),
  });

  const categoryForm = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
  });

  React.useEffect(() => {
    if (isProductDialogOpen) {
      const defaultValues = editingProduct
        ? { ...editingProduct, comboPrice: editingProduct.comboPrice || '' }
        : { name: '', category: '', price: 0, comboPrice: '', stock: 0, image: 'https://placehold.co/300x300.png' };
      productForm.reset(defaultValues);
      setImagePreview(defaultValues.image || null);
    } else {
        setEditingProduct(null);
    }
  }, [isProductDialogOpen, editingProduct, productForm]);

  React.useEffect(() => {
    if (isIngredientDialogOpen) {
      ingredientForm.reset(editingIngredient || { name: '', stock: 0, unit: 'pcs' });
    } else {
      setEditingIngredient(null);
    }
  }, [isIngredientDialogOpen, editingIngredient, ingredientForm]);

  React.useEffect(() => {
    if (isCategoryDialogOpen) {
      categoryForm.reset(editingCategory || { name: '' });
    } else {
      setEditingCategory(null);
    }
  }, [isCategoryDialogOpen, editingCategory, categoryForm]);

  const handleProductSubmit = async (data: z.infer<typeof productSchema>) => {
    setIsSubmitting(true);
    try {
      const productData = {
        ...data,
        comboPrice: data.comboPrice ? Number(data.comboPrice) : undefined,
        image: data.image || 'https://placehold.co/300x300.png',
      };
      if (editingProduct) {
        await updateProductAction({ ...editingProduct, ...productData });
      } else {
        await addProductAction(productData);
      }
      toast({ title: `Producto ${editingProduct ? 'actualizado' : 'añadido'}` });
      setIsProductDialogOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIngredientSubmit = async (data: z.infer<typeof ingredientSchema>) => {
    setIsSubmitting(true);
    try {
      if (editingIngredient) {
        await updateIngredientAction({ ...editingIngredient, ...data });
      } else {
        await addIngredientAction(data);
      }
      toast({ title: `Ingrediente ${editingIngredient ? 'actualizado' : 'añadido'}` });
      setIsIngredientDialogOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySubmit = async (data: z.infer<typeof categorySchema>) => {
    setIsSubmitting(true);
    try {
      const isDuplicate = categories.some(
        c => c.name.toLowerCase() === data.name.toLowerCase() && c.id !== editingCategory?.id
      );
      if (isDuplicate) throw new Error("Ya existe una categoría con este nombre.");

      if (editingCategory) {
        await updateCategoryAction({ ...editingCategory, ...data });
      } else {
        await addCategoryAction(data);
      }
      toast({ title: `Categoría ${editingCategory ? 'actualizada' : 'añadida'}` });
      setIsCategoryDialogOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    try {
      if (deletingItem.type === 'product') {
        await deleteProductAction(deletingItem.id);
      } else if (deletingItem.type === 'ingredient') {
        await deleteIngredientAction(deletingItem.id);
      } else if (deletingItem.type === 'category') {
        const isCategoryInUse = products.some(p => p.category === deletingItem.name);
        if (isCategoryInUse) throw new Error("No se puede eliminar la categoría porque está siendo utilizada por uno o más productos.");
        await deleteCategoryAction(deletingItem.id);
      }
      toast({ title: "Elemento eliminado" });
      router.refresh();
    } catch (error: any) {
      toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = React.useCallback((item: { type: 'product' | 'ingredient' | 'category'; id: string; name: string }) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  }, []);

  const hasPermission = React.useMemo(() => {
    if (adminUser) return true;
    if (currentUser) return currentUser.role?.permissions?.includes('inventory') ?? false;
    return false;
  }, [currentUser, adminUser]);

  if (isCheckingAuth) {
    return <AppShell><div>Loading...</div></AppShell>;
  }

  if (!hasPermission) {
    return (
        <AppShell>
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-2xl font-bold">Acceso Denegado</h1>
                <p className="text-muted-foreground">No tienes permiso para acceder a esta sección.</p>
            </div>
        </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestión de Inventario</h1>
      </div>
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-1 gap-1.5 sm:grid-cols-3">
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredientes</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <div className="flex justify-end gap-2 mb-4">
            <Button onClick={() => setIsProductDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Producto
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Existencias</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image
                      src={product.image || 'https://placehold.co/40x40.png'}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell className="flex gap-2">
                     <Button variant="ghost" size="icon" onClick={() => {setEditingProduct(product); setIsProductDialogOpen(true);}}><Edit className="h-4 w-4"/></Button>
                     <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog({ type: 'product', id: product.id, name: product.name })}><Trash2 className="h-4 w-4"/></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        {/* Other TabsContent would go here */}
      </Tabs>
       {/* Dialogs go here */}
    </AppShell>
  );
}
