
"use client";

import * as React from "react";
import type { Product, Ingredient, Order, CartItem, Category, Expense } from "@/types";
import { products as initialProducts, ingredients as initialIngredients, categories as initialCategories } from "@/lib/data";

interface AppContextType {
  products: Product[];
  ingredients: Ingredient[];
  categories: Category[];
  orders: Order[];
  expenses: Expense[];
  addProduct: (product: Omit<Product, 'id' | 'ingredients'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (ingredientId: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  addOrder: (cart: CartItem[], total: number, paymentMethod: "Efectivo" | "Tarjeta", customerName?: string, customerPhone?: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status'], prepTime?: number) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp'>) => void;
  deleteExpense: (expenseId: string) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [ingredients, setIngredients] = React.useState<Ingredient[]>(initialIngredients);
  const [categories, setCategories] = React.useState<Category[]>(initialCategories);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);

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

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      id: `cat${Date.now()}`,
      ...categoryData,
    };
    setCategories(prev => [newCategory, ...prev]);
  };

  const updateCategory = (updatedCategory: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  };
  
  const deleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };
  
  const addOrder = (cart: CartItem[], total: number, paymentMethod: "Efectivo" | "Tarjeta", customerName?: string, customerPhone?: string) => {
    const newOrder: Order = {
        id: `ord${Date.now()}`,
        items: cart,
        total,
        timestamp: new Date().toISOString(),
        status: 'Pendiente',
        paymentMethod,
        customerName: customerName && customerName.trim() !== '' ? customerName : undefined,
        customerPhone: customerPhone && customerPhone.trim() !== '' ? customerPhone : undefined
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
  
  const addExpense = (expenseData: Omit<Expense, 'id' | 'timestamp'>) => {
    const newExpense: Expense = {
      id: `exp${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...expenseData,
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
  };

  const value = {
    products,
    ingredients,
    categories,
    orders,
    expenses,
    addProduct,
    updateProduct,
    deleteProduct,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    addCategory,
    updateCategory,
    deleteCategory,
    addOrder,
    updateOrderStatus,
    addExpense,
    deleteExpense,
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
