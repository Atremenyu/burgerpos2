"use client";

import * as React from "react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProductCard from "@/components/cashier/ProductCard";
import Cart from "@/components/cashier/Cart";
import { products as initialProducts } from "@/lib/data";
import type { Product, CartItem } from "@/types";

export default function CashierPage() {
  const [products] = React.useState<Product[]>(initialProducts);
  const [cart, setCart] = React.useState<CartItem[]>([]);
  
  const categories = ["Todos", ...Array.from(new Set(products.map(p => p.category)))];

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { productId: product.id, name: product.name, price: product.price, quantity: 1, image: product.image }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prevCart => {
      if (quantity === 0) {
        return prevCart.filter(item => item.productId !== productId);
      }
      return prevCart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start h-full">
        <div className="lg:col-span-2 h-full">
          <Card className="h-full shadow-lg dark:bg-gray-800/60">
            <CardContent className="p-4 md:p-6 h-full flex flex-col">
              <Tabs defaultValue="Todos" className="flex-grow flex flex-col">
                <TabsList className="mb-4 bg-gray-200 dark:bg-gray-900">
                  {categories.map(category => (
                    <TabsTrigger key={category} value={category} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {categories.map(category => (
                  <TabsContent key={category} value={category} className="flex-grow overflow-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {(category === "Todos" ? products : products.filter(p => p.category === category)).map(product => (
                        <ProductCard key={product.id} product={product} onAddToCart={() => addToCart(product)} />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 h-full">
           <Cart cart={cart} onUpdateQuantity={updateQuantity} onClearCart={clearCart} />
        </div>
      </div>
    </AppShell>
  );
}
