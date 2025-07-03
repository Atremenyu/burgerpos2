
"use client";

import * as React from "react";
import type { Product, Ingredient, Order, CartItem } from "@/types";
import { products as initialProducts, ingredients as initialIngredients, initialOrders } from "@/lib/data";

interface AppContextType {
  products: Product[];
  ingredients: Ingredient[];
  orders: Order[];
  addProduct: (product: Omit<Product, 'id' | 'ingredients'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (ingredientId: string) => void;
  addOrder: (cart: CartItem[], total: number, paymentMethod: "Efectivo" | "Tarjeta", customerName?: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status'], prepTime?: number) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [ingredients, setIngredients] = React.useState<Ingredient[]>(initialIngredients);
  const [orders, setOrders] = React.useState<Order[]>(initialOrders);

  const addProduct = (productData: Omit<Product, 'id' | 'ingredients'>) => {
    const newProduct: Product = {
      id: `prod${Date.now()}`,
      ...productData,
      ingredients: [],
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };
  
  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const addIngredient = (ingredientData: Omit<Ingredient, 'id'>) => {
    const newIngredient: Ingredient = {
      id: `ing${Date.now()}`,
      ...ingredientData,
    };
    setIngredients(prev => [newIngredient, ...prev]);
  };
  
  const updateIngredient = (updatedIngredient: Ingredient) => {
    setIngredients(prev => prev.map(i => i.id === updatedIngredient.id ? updatedIngredient : i));
  };

  const deleteIngredient = (ingredientId: string) => {
    setIngredients(prev => prev.filter(i => i.id !== ingredientId));
  };
  
  const addOrder = (cart: CartItem[], total: number, paymentMethod: "Efectivo" | "Tarjeta", customerName?: string) => {
    const newOrder: Order = {
        id: `ord${Date.now()}`,
        items: cart,
        total,
        timestamp: new Date().toISOString(),
        status: 'Pendiente',
        paymentMethod,
        customerName: customerName && customerName.trim() !== '' ? customerName : undefined
    };
    setOrders(prev => [newOrder, ...prev]);
  };
  
  const updateOrderStatus = (orderId: string, status: Order["status"], prepTime?: number) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status, ...(prepTime && { prepTime }) } : order
      )
    );
  };
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      const randomProduct = initialProducts[Math.floor(Math.random() * initialProducts.length)];
      const newOrder: Order = {
        id: `ord${Date.now()}`,
        items: [{ productId: randomProduct.id, name: randomProduct.name, price: randomProduct.price, quantity: 1, image: randomProduct.image }],
        total: randomProduct.price,
        timestamp: new Date().toISOString(),
        status: 'Pendiente',
        paymentMethod: 'Tarjeta',
        customerName: 'Cliente en Línea'
      };
      setOrders(prev => [newOrder, ...prev]);
    }, 45000); 

    return () => clearInterval(interval);
  }, []);

  const value = {
    products,
    ingredients,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    addOrder,
    updateOrderStatus
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
