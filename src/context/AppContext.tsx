
"use client";

import * as React from "react";
import type { Product, Ingredient, Order, CartItem, Category, Expense, Customer, Cashier, Shift } from "@/types";
import { products as initialProducts, ingredients as initialIngredients, categories as initialCategories, cashiers as initialCashiers } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

interface AppContextType {
  products: Product[];
  ingredients: Ingredient[];
  categories: Category[];
  orders: Order[];
  expenses: Expense[];
  customers: Customer[];
  cashiers: Cashier[];
  shifts: Shift[];
  activeShift: Shift | null;
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
  addCashier: (name: string, pin: string) => void;
  deleteCashier: (cashierId: string) => boolean;
  login: (cashierId: string, pin: string) => boolean;
  logout: () => void;
  endDay: () => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [ingredients, setIngredients] = React.useState<Ingredient[]>(initialIngredients);
  const [categories, setCategories] = React.useState<Category[]>(initialCategories);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [cashiers, setCashiers] = React.useState<Cashier[]>(initialCashiers);
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [activeShift, setActiveShift] = React.useState<Shift | null>(null);


  const customers = React.useMemo(() => {
    const customerMap = new Map<string, Customer>();
    // Iterate backwards to get the most recent phone number for a customer if it has changed
    for (let i = orders.length - 1; i >= 0; i--) {
        const order = orders[i];
        if (order.customerName) {
            const customerKey = order.customerName.toLowerCase().trim();
            if (customerKey && !customerMap.has(customerKey)) {
                customerMap.set(customerKey, {
                    name: order.customerName,
                    phone: order.customerPhone || '',
                });
            }
        }
    }
    return Array.from(customerMap.values()).sort((a,b) => a.name.localeCompare(b.name));
  }, [orders]);

  const addProduct = React.useCallback((productData: Omit<Product, 'id' | 'ingredients'>) => {
    const newProduct: Product = {
      id: `prod${Date.now()}`,
      ...productData,
      ingredients: [],
    };
    setProducts(prev => [newProduct, ...prev]);
  }, []);

  const updateProduct = React.useCallback((updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  }, []);
  
  const deleteProduct = React.useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  const addIngredient = React.useCallback((ingredientData: Omit<Ingredient, 'id'>) => {
    const newIngredient: Ingredient = {
      id: `ing${Date.now()}`,
      ...ingredientData,
    };
    setIngredients(prev => [newIngredient, ...prev]);
  }, []);
  
  const updateIngredient = React.useCallback((updatedIngredient: Ingredient) => {
    setIngredients(prev => prev.map(i => i.id === updatedIngredient.id ? updatedIngredient : i));
  }, []);

  const deleteIngredient = React.useCallback((ingredientId: string) => {
    setIngredients(prev => prev.filter(i => i.id !== ingredientId));
  }, []);

  const addCategory = React.useCallback((categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      id: `cat${Date.now()}`,
      ...categoryData,
    };
    setCategories(prev => [newCategory, ...prev]);
  }, []);

  const updateCategory = React.useCallback((updatedCategory: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  }, []);
  
  const deleteCategory = React.useCallback((categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  }, []);
  
  const addOrder = React.useCallback((cart: CartItem[], total: number, paymentMethod: "Efectivo" | "Tarjeta", customerName?: string, customerPhone?: string) => {
    if (!activeShift) {
        toast({ title: "Error", description: "No hay un turno activo para registrar el pedido.", variant: "destructive"});
        return;
    }

    const newOrder: Order = {
        id: `ord${Date.now()}`,
        items: cart,
        total,
        timestamp: new Date().toISOString(),
        status: 'Pendiente',
        paymentMethod,
        customerName: customerName && customerName.trim() !== '' ? customerName : undefined,
        customerPhone: customerPhone && customerPhone.trim() !== '' ? customerPhone : undefined,
        cashierId: activeShift.cashierId,
        cashierName: activeShift.cashierName,
        shiftId: activeShift.id,
    };
    setOrders(prev => [newOrder, ...prev]);
    
    setActiveShift(prevShift => {
        if (!prevShift) return null;
        const updatedShift = {
            ...prevShift,
            orders: [...prevShift.orders, newOrder],
            totalSales: prevShift.totalSales + total,
        };
        return updatedShift;
    });

  }, [activeShift, toast]);
  
  const updateOrderStatus = React.useCallback((orderId: string, status: Order["status"], prepTime?: number) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status, ...(prepTime !== undefined && { prepTime }) } : order
      )
    );
  }, []);
  
  const addExpense = React.useCallback((expenseData: Omit<Expense, 'id' | 'timestamp'>) => {
    const newExpense: Expense = {
      id: `exp${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...expenseData,
    };
    setExpenses(prev => [newExpense, ...prev]);
  }, []);

  const deleteExpense = React.useCallback((expenseId: string) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
  }, []);

  const addCashier = React.useCallback((name: string, pin: string) => {
    const newCashier: Cashier = { id: `cashier${Date.now()}`, name, pin };
    setCashiers(prev => [...prev, newCashier]);
  }, []);

  const deleteCashier = React.useCallback((cashierId: string) => {
    const isCashierInUse = shifts.some(shift => shift.cashierId === cashierId) || activeShift?.cashierId === cashierId;
    if (isCashierInUse) {
      return false;
    }
    setCashiers(prev => prev.filter(c => c.id !== cashierId));
    return true;
  }, [shifts, activeShift]);

  const login = React.useCallback((cashierId: string, pin: string): boolean => {
    const cashier = cashiers.find(c => c.id === cashierId);
    if (cashier && cashier.pin === pin) {
        const newShift: Shift = {
            id: `shift${Date.now()}`,
            cashierId: cashier.id,
            cashierName: cashier.name,
            startTime: new Date().toISOString(),
            orders: [],
            totalSales: 0,
        };
        setActiveShift(newShift);
        return true;
    }
    return false;
  }, [cashiers]);

  const logout = React.useCallback(() => {
    if (activeShift) {
        const endedShift = { ...activeShift, endTime: new Date().toISOString() };
        setShifts(prev => [...prev, endedShift]);
        setActiveShift(null);
    }
  }, [activeShift]);
  
  const endDay = React.useCallback(() => {
    if (activeShift) {
        logout();
    }
  }, [activeShift, logout]);

  const value = React.useMemo(() => ({
    products, ingredients, categories, orders, expenses, customers, cashiers, shifts, activeShift,
    addProduct, updateProduct, deleteProduct, 
    addIngredient, updateIngredient, deleteIngredient, 
    addCategory, updateCategory, deleteCategory,
    addOrder, updateOrderStatus,
    addExpense, deleteExpense,
    addCashier, deleteCashier, login, logout, endDay,
  }), [
    products, ingredients, categories, orders, expenses, customers, cashiers, shifts, activeShift,
    addProduct, updateProduct, deleteProduct, 
    addIngredient, updateIngredient, deleteIngredient, 
    addCategory, updateCategory, deleteCategory,
    addOrder, updateOrderStatus,
    addExpense, deleteExpense,
    addCashier, deleteCashier, login, logout, endDay,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
