
"use client";

import * as React from "react";
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
import { products as initialProducts, ingredients as initialIngredients } from "@/lib/data";
import type { Product, Ingredient } from "@/types";
import { PlusCircle, Download, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
  category: z.string().min(1, { message: "La categoría es requerida." }),
  price: z.coerce.number().positive({ message: "El precio debe ser un número positivo." }),
  stock: z.coerce.number().int().min(0, { message: "Las existencias no pueden ser negativas." }),
  image: z.string().optional(),
});

const ingredientSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }),
  stock: z.coerce.number().int().min(0, { message: "Las existencias no pueden ser negativas." }),
  unit: z.enum(['g', 'ml', 'pcs'], { required_error: "La unidad es requerida." }),
});

export default function InventoryPage() {
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [ingredients, setIngredients] = React.useState<Ingredient[]>(initialIngredients);

  const [isProductDialogOpen, setIsProductDialogOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const [isIngredientDialogOpen, setIsIngredientDialogOpen] = React.useState(false);
  const [editingIngredient, setEditingIngredient] = React.useState<Ingredient | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingItem, setDeletingItem] = React.useState<{ type: 'product' | 'ingredient'; id: string; name: string } | null>(null);
  
  const productForm = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: '', category: '', price: 0, stock: 0, image: '' },
  });
  
  const ingredientForm = useForm<z.infer<typeof ingredientSchema>>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: { name: '', stock: 0, unit: 'pcs' },
  });

  React.useEffect(() => {
    if (isProductDialogOpen) {
      const defaultValues = editingProduct
        ? {
            name: editingProduct.name,
            category: editingProduct.category,
            price: editingProduct.price,
            stock: editingProduct.stock,
            image: editingProduct.image,
          }
        : { name: '', category: '', price: 0, stock: 0, image: 'https://placehold.co/300x300.png' };
      
      productForm.reset(defaultValues);
      setImagePreview(defaultValues.image);
    } else {
        setImagePreview(null);
    }
  }, [isProductDialogOpen, editingProduct, productForm]);

  React.useEffect(() => {
    if (isIngredientDialogOpen) {
      ingredientForm.reset(editingIngredient ? {
        name: editingIngredient.name,
        stock: editingIngredient.stock,
        unit: editingIngredient.unit,
      } : { name: '', stock: 0, unit: 'pcs' });
    }
  }, [isIngredientDialogOpen, editingIngredient, ingredientForm]);
  
  const handleProductSubmit = (data: z.infer<typeof productSchema>) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...editingProduct, ...data } : p));
    } else {
      const newProduct: Product = {
        id: `prod${Date.now()}`,
        name: data.name,
        category: data.category,
        price: data.price,
        stock: data.stock,
        image: data.image || 'https://placehold.co/300x300.png',
        ingredients: [],
      };
      setProducts(prev => [newProduct, ...prev]);
    }
    setIsProductDialogOpen(false);
  };
  
  const handleIngredientSubmit = (data: z.infer<typeof ingredientSchema>) => {
    if (editingIngredient) {
      setIngredients(prev => prev.map(i => i.id === editingIngredient.id ? { ...editingIngredient, ...data } : i));
    } else {
      const newIngredient: Ingredient = {
        ...data,
        id: `ing${Date.now()}`,
      };
      setIngredients(prev => [newIngredient, ...prev]);
    }
    setIsIngredientDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deletingItem) return;
    if (deletingItem.type === 'product') {
      setProducts(prev => prev.filter(p => p.id !== deletingItem.id));
    } else {
      setIngredients(prev => prev.filter(i => i.id !== deletingItem.id));
    }
    setIsDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  const openProductDialog = (product: Product | null) => {
    setEditingProduct(product);
    setIsProductDialogOpen(true);
  };

  const openIngredientDialog = (ingredient: Ingredient | null) => {
    setEditingIngredient(ingredient);
    setIsIngredientDialogOpen(true);
  };
  
  const openDeleteDialog = (item: { type: 'product' | 'ingredient'; id: string; name: string }) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleExport = (data: (Product | Ingredient)[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify((row as any)[header])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestión de Inventario</h1>
      </div>
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredientes</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <div className="flex justify-end gap-2 mb-4">
             <Button variant="outline" onClick={() => handleExport(products, 'products.csv')}>
               <Download className="mr-2 h-4 w-4" />
               Exportar CSV
             </Button>
            <Button onClick={() => openProductDialog(null)}>
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
                      src={product.image}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                      data-ai-hint="burger food"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell className="flex gap-2">
                     <Button variant="ghost" size="icon" onClick={() => openProductDialog(product)}><Edit className="h-4 w-4"/></Button>
                     <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog({ type: 'product', id: product.id, name: product.name })}><Trash2 className="h-4 w-4"/></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="ingredients">
           <div className="flex justify-end gap-2 mb-4">
             <Button variant="outline" onClick={() => handleExport(ingredients, 'ingredients.csv')}>
               <Download className="mr-2 h-4 w-4" />
               Exportar CSV
             </Button>
            <Button onClick={() => openIngredientDialog(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Ingrediente
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Existencias</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">{ingredient.name}</TableCell>
                  <TableCell>{ingredient.stock}</TableCell>
                  <TableCell>{ingredient.unit}</TableCell>
                  <TableCell className="flex gap-2">
                     <Button variant="ghost" size="icon" onClick={() => openIngredientDialog(ingredient)}><Edit className="h-4 w-4"/></Button>
                     <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog({ type: 'ingredient', id: ingredient.id, name: ingredient.name })}><Trash2 className="h-4 w-4"/></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Producto' : 'Añadir Producto'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Edita los detalles del producto.' : 'Añade un nuevo producto a tu inventario.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...productForm}>
            <form onSubmit={productForm.handleSubmit(handleProductSubmit)} className="space-y-4">
              <FormField
                control={productForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={productForm.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Existencias</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={productForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagen del Producto</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const dataUrl = reader.result as string;
                                field.onChange(dataUrl);
                                setImagePreview(dataUrl);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        {imagePreview && (
                          <Image
                            src={imagePreview}
                            alt="Vista previa del producto"
                            width={100}
                            height={100}
                            className="rounded-md object-cover"
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Ingredient Dialog */}
      <Dialog open={isIngredientDialogOpen} onOpenChange={setIsIngredientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIngredient ? 'Editar Ingrediente' : 'Añadir Ingrediente'}</DialogTitle>
             <DialogDescription>
              {editingIngredient ? 'Edita los detalles del ingrediente.' : 'Añade un nuevo ingrediente a tu inventario.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...ingredientForm}>
            <form onSubmit={ingredientForm.handleSubmit(handleIngredientSubmit)} className="space-y-4">
              <FormField
                control={ingredientForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={ingredientForm.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Existencias</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={ingredientForm.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una unidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="g">Gramos (g)</SelectItem>
                        <SelectItem value="ml">Mililitros (ml)</SelectItem>
                        <SelectItem value="pcs">Piezas (pcs)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsIngredientDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente "{deletingItem?.name}" de tu inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
