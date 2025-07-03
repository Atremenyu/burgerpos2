
"use client";

import * as React from "react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProductCard from "@/components/cashier/ProductCard";
import Cart from "@/components/cashier/Cart";
import type { Product, CartItem } from "@/types";
import { LayoutGrid, List, PlusCircle } from "lucide-react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

export default function CashierPage() {
  const { products, categories: allCategories } = useAppContext();
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  
  const categories = ["Todos", ...allCategories.map(c => c.name)];

  const addToCart = React.useCallback((product: Product, isCombo: boolean) => {
    const cartItemId = product.id + (isCombo ? '-combo' : '-single');
    const price = isCombo ? product.comboPrice! : product.price;
    const name = product.name + (isCombo ? ' (Combo)' : '');

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === cartItemId);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { id: cartItemId, productId: product.id, name, price, quantity: 1, image: product.image }];
    });
  }, []);

  const updateQuantity = React.useCallback((cartItemId: string, quantity: number) => {
    setCart(prevCart => {
      if (quantity === 0) {
        return prevCart.filter(item => item.id !== cartItemId);
      }
      return prevCart.map(item =>
        item.id === cartItemId ? { ...item, quantity } : item
      );
    });
  }, []);

  const clearCart = React.useCallback(() => {
    setCart([]);
  }, []);

  const filteredProducts = (category: string) => {
      return category === "Todos" ? products : products.filter(p => p.category === category);
  }

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start h-full">
        <div className="lg:col-span-2 h-full">
          <Card className="h-full shadow-lg dark:bg-gray-800/60">
            <CardContent className="p-4 md:p-6 h-full flex flex-col">
              <Tabs defaultValue="Todos" className="flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <TabsList className="bg-gray-200 dark:bg-gray-900">
                    {categories.map(category => (
                      <TabsTrigger key={category} value={category} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                   <div className="flex items-center gap-2">
                    <Button variant={view === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setView('grid')} aria-label="Vista de cuadrícula">
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button variant={view === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setView('list')} aria-label="Vista de lista">
                        <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {categories.map(category => (
                  <TabsContent key={category} value={category} className="flex-grow overflow-auto">
                    {view === 'grid' ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredProducts(category).map(product => (
                          <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                        ))}
                      </div>
                    ) : (
                       <div className="space-y-2">
                        {filteredProducts(category).map(product => (
                           <div key={product.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 border">
                            <Image
                                src={product.image}
                                alt={product.name}
                                width={56}
                                height={56}
                                className="rounded-md object-cover"
                                data-ai-hint="burger food"
                            />
                            <div className="flex-grow">
                                <p className="font-semibold">{product.name}</p>
                                <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                                {product.comboPrice ? (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => addToCart(product, false)}
                                            disabled={product.stock === 0}
                                        >
                                            Sencillo
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => addToCart(product, true)}
                                            disabled={product.stock === 0}
                                        >
                                            Combo
                                        </Button>
                                    </>
                                    ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => addToCart(product, false)}
                                        disabled={product.stock === 0}
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" /> Añadir
                                    </Button>
                                )}
                            </div>
                        </div>
                        ))}
                      </div>
                    )}
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
