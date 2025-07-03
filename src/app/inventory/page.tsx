"use client";

import * as React from "react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
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
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { products as initialProducts, ingredients as initialIngredients } from "@/lib/data";
import type { Product, Ingredient } from "@/types";
import { PlusCircle, Download, Edit, Trash2 } from "lucide-react";

export default function InventoryPage() {
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [ingredients, setIngredients] = React.useState<Ingredient[]>(initialIngredients);

  const handleExport = (data: (Product | Ingredient)[], filename: string) => {
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
        {/* Add/Export buttons could be context-sensitive to the active tab */}
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
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Producto
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
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
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell className="flex gap-2">
                     <Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button>
                     <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4"/></Button>
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
            <Button>
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
                     <Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button>
                     <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4"/></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
