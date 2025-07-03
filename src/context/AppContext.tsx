
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Product, Ingredient, Order, CartItem, Category, Expense, Customer, User, Shift, Role, CurrentUser } from "@/types";
import { products as initialProducts, ingredients as initialIngredients, categories as initialCategories, users as initialUsers, roles as initialRoles } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

interface AppContextType {
  products: Product[];
  ingredients: Ingredient[];
  categories: Category[];
  orders: Order[];
  expenses: Expense[];
  customers: Customer[];
  users: User[];
  roles: Role[];
  shifts: Shift[];
  currentUser: CurrentUser | null;
  addProduct: (product: Omit<Product, 'id' | 'ingredients'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (ingredientId: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  addOrder: (cart: CartItem[], total: number, paymentMethod: "Efectivo" | "Tarjeta", orderType: Order['orderType'], deliveryPlatform: Order['deliveryPlatform'], customerName?: string, customerPhone?: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status'], prepTime?: number) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp'>) => void;
  deleteExpense: (expenseId: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => boolean;
  addRole: (role: Omit<Role, 'id'>) => void;
  updateRole: (role: Role) => void;
  deleteRole: (roleId: string) => boolean;
  login: (userId: string, pin: string) => boolean;
  logout: () => void;
  endDay: () => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const router = useRouter();
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [ingredients, setIngredients] = React.useState<Ingredient[]>(initialIngredients);
  const [categories, setCategories] = React.useState<Category[]>(initialCategories);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [users, setUsers] = React.useState<User[]>(initialUsers);
  const [roles, setRoles] = React.useState<Role[]>(initialRoles);
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [currentUser, setCurrentUser] = React.useState<CurrentUser | null>(null);
  const [activeShift, setActiveShift] = React.useState<Shift | null>(null);


  const customers = React.useMemo(() => {
    const customerMap = new Map<string, Customer>();
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
  
  const addOrder = React.useCallback((cart: CartItem[], total: number, paymentMethod: "Efectivo" | "Tarjeta", orderType: Order['orderType'], deliveryPlatform?: Order['deliveryPlatform'], customerName?: string, customerPhone?: string) => {
    if (!currentUser || !activeShift) {
        toast({ title: "Error", description: "No hay un turno de caja activo para registrar el pedido.", variant: "destructive"});
        return;
    }

    const newOrder: Order = {
        id: `ord${Date.now()}`,
        items: cart,
        total,
        timestamp: new Date().toISOString(),
        status: 'Pendiente',
        paymentMethod,
        orderType,
        deliveryPlatform: orderType === 'Para Llevar' ? deliveryPlatform : undefined,
        customerName: customerName && customerName.trim() !== '' ? customerName : undefined,
        customerPhone: customerPhone && customerPhone.trim() !== '' ? customerPhone : undefined,
        userId: currentUser.id,
        userName: currentUser.name,
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

  }, [currentUser, activeShift, toast]);
  
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

  const addUser = React.useCallback((userData: Omit<User, 'id'>) => {
    const newUser: User = { id: `user${Date.now()}`, ...userData };
    setUsers(prev => [...prev, newUser]);
  }, []);

  const updateUser = React.useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  }, []);

  const deleteUser = React.useCallback((userId: string) => {
    const isUserInUse = shifts.some(shift => shift.userId === userId);
    if (isUserInUse) return false;
    setUsers(prev => prev.filter(u => u.id !== userId));
    return true;
  }, [shifts]);
  
  const addRole = React.useCallback((roleData: Omit<Role, 'id'>) => {
    const newRole: Role = { id: `role${Date.now()}`, ...roleData };
    setRoles(prev => [...prev, newRole]);
  }, []);
  
  const updateRole = React.useCallback((updatedRole: Role) => {
    setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
  }, []);

  const deleteRole = React.useCallback((roleId: string) => {
    const isRoleInUse = users.some(u => u.roleId === roleId);
    if (isRoleInUse) return false;
    setRoles(prev => prev.filter(r => r.id !== roleId));
    return true;
  }, [users]);


  const login = React.useCallback((userId: string, pin: string): boolean => {
    const user = users.find(u => u.id === userId);
    const role = roles.find(r => r.id === user?.roleId);

    if (user && user.pin === pin && role) {
        const userWithRole: CurrentUser = { ...user, role };
        setCurrentUser(userWithRole);
        
        if (role.permissions.includes('caja')) {
            const newShift: Shift = {
                id: `shift${Date.now()}`,
                userId: user.id,
                userName: user.name,
                startTime: new Date().toISOString(),
                orders: [],
                totalSales: 0,
            };
            setActiveShift(newShift);
        }
        return true;
    }
    return false;
  }, [users, roles]);

  const logout = React.useCallback(() => {
    if (activeShift) {
        const endedShift = { ...activeShift, endTime: new Date().toISOString() };
        setShifts(prev => [...prev, endedShift]);
        setActiveShift(null);
    }
    setCurrentUser(null);
    router.push('/');
  }, [activeShift, router]);
  
  const endDay = React.useCallback(() => {
    if (currentUser) {
        logout();
    }
  }, [currentUser, logout]);

  const value = React.useMemo(() => ({
    products, ingredients, categories, orders, expenses, customers, users, roles, shifts, currentUser,
    addProduct, updateProduct, deleteProduct, 
    addIngredient, updateIngredient, deleteIngredient, 
    addCategory, updateCategory, deleteCategory,
    addOrder, updateOrderStatus,
    addExpense, deleteExpense,
    addUser, updateUser, deleteUser,
    addRole, updateRole, deleteRole,
    login, logout, endDay,
  }), [
    products, ingredients, categories, orders, expenses, customers, users, roles, shifts, currentUser,
    addProduct, updateProduct, deleteProduct, 
    addIngredient, updateIngredient, deleteIngredient, 
    addCategory, updateCategory, deleteCategory,
    addOrder, updateOrderStatus,
    addExpense, deleteExpense,
    addUser, updateUser, deleteUser,
    addRole, updateRole, deleteRole,
    login, logout, endDay,
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
