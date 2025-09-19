
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Product, Ingredient, Order, CartItem, Category, Expense, Customer, User, Shift, Role, CurrentUser, OrderType, PaymentMethod, DeliveryPlatform } from "@/types";
import {
  getCategories, getProducts, getIngredients, getUsers, getRoles, getOrderTypes, getPaymentMethods, getDeliveryPlatforms,
  addUser as dbAddUser, updateUser as dbUpdateUser, deleteUser as dbDeleteUser,
  addRole as dbAddRole, updateRole as dbUpdateRole, deleteRole as dbDeleteRole,
} from "@/lib/database";
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
  orderTypes: OrderType[];
  paymentMethods: PaymentMethod[];
  deliveryPlatforms: DeliveryPlatform[];
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
  
  addOrder: (cart: CartItem[], total: number, paymentMethod: Order['paymentMethod'], orderType: Order['orderType'], deliveryPlatform: Order['deliveryPlatform'], customerName?: string, customerPhone?: string, transactionId?: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status'], prepTime?: number) => void;
  
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp'>) => void;
  deleteExpense: (expenseId: string) => void;
  
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => boolean;
  
  addRole: (role: Omit<Role, 'id'>) => void;
  updateRole: (role: Role) => void;
  deleteRole: (roleId: string) => boolean;
  
  addOrderType: (item: Omit<OrderType, 'id'>) => void;
  updateOrderType: (item: OrderType) => void;
  deleteOrderType: (id: string) => boolean;
  
  addPaymentMethod: (item: Omit<PaymentMethod, 'id'>) => void;
  updatePaymentMethod: (item: PaymentMethod) => void;
  deletePaymentMethod: (id: string) => boolean;

  addDeliveryPlatform: (item: Omit<DeliveryPlatform, 'id'>) => void;
  updateDeliveryPlatform: (item: DeliveryPlatform) => void;
  deleteDeliveryPlatform: (id: string) => boolean;

  setCurrentUser: (user: CurrentUser | null) => void;
  startShift: (user: User) => void;
  logout: () => void;
  endDay: () => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const router = useRouter();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [ingredients, setIngredients] = React.useState<Ingredient[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [orderTypes, setOrderTypes] = React.useState<OrderType[]>([]);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [deliveryPlatforms, setDeliveryPlatforms] = React.useState<DeliveryPlatform[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      setCategories(await getCategories());
      setProducts(await getProducts());
      setIngredients(await getIngredients());
      setUsers(await getUsers());
      setRoles(await getRoles());
      setOrderTypes(await getOrderTypes());
      setPaymentMethods(await getPaymentMethods());
      setDeliveryPlatforms(await getDeliveryPlatforms());
    };
    fetchData();
  }, []);
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
  
  const addOrder = React.useCallback((cart: CartItem[], total: number, paymentMethod: Order['paymentMethod'], orderType: Order['orderType'], deliveryPlatform?: Order['deliveryPlatform'], customerName?: string, customerPhone?: string, transactionId?: string) => {
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
        transactionId: paymentMethod === 'Transferencia' ? transactionId : undefined,
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

  const addUser = React.useCallback(async (userData: Omit<User, 'id'>) => {
    const newUser = await dbAddUser(userData);
    if (newUser) {
      setUsers(prev => [...prev, newUser]);
    }
  }, []);

  const updateUser = React.useCallback(async (updatedUser: User) => {
    const result = await dbUpdateUser(updatedUser);
    if (result) {
      setUsers(prev => prev.map(u => u.id === result.id ? result : u));
    }
  }, []);

  const deleteUser = React.useCallback(async (userId: string): Promise<boolean> => {
    // We should add a check here to see if the user is in use in any shifts before deleting.
    // This is a simplified version for now.
    const success = await dbDeleteUser(userId);
    if (success) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
    return success;
  }, []);
  
  const addRole = React.useCallback(async (roleData: Omit<Role, 'id'>) => {
    const newRole = await dbAddRole(roleData);
    if (newRole) {
      setRoles(prev => [...prev, newRole]);
    }
  }, []);
  
  const updateRole = React.useCallback(async (updatedRole: Role) => {
    const result = await dbUpdateRole(updatedRole);
    if (result) {
      setRoles(prev => prev.map(r => r.id === result.id ? result : r));
    }
  }, []);

  const deleteRole = React.useCallback(async (roleId: string): Promise<boolean> => {
    const isRoleInUse = users.some(u => u.roleId === roleId);
    if (isRoleInUse) {
      toast({ title: "Error", description: "No se puede eliminar un rol que está asignado a uno o más usuarios.", variant: "destructive" });
      return false;
    }
    const success = await dbDeleteRole(roleId);
    if (success) {
      setRoles(prev => prev.filter(r => r.id !== roleId));
    }
    return success;
  }, [users, toast]);
  
  // Settings Management
  const addOrderType = React.useCallback((data: Omit<OrderType, 'id'>) => {
    setOrderTypes(prev => [...prev, { id: `ot${Date.now()}`, ...data }]);
  }, []);
  const updateOrderType = React.useCallback((updated: OrderType) => {
    setOrderTypes(prev => prev.map(item => item.id === updated.id ? updated : item));
  }, []);
  const deleteOrderType = React.useCallback((id: string) => {
    const itemToDelete = orderTypes.find(ot => ot.id === id);
    if (!itemToDelete) return false;
    const isInUse = orders.some(o => o.orderType === itemToDelete.name);
    if(isInUse) {
      toast({ title: "Error", description: "Este tipo de pedido está en uso y no se puede eliminar.", variant: "destructive"});
      return false;
    }
    setOrderTypes(prev => prev.filter(item => item.id !== id));
    return true;
  }, [orders, orderTypes, toast]);

  const addPaymentMethod = React.useCallback((data: Omit<PaymentMethod, 'id'>) => {
    setPaymentMethods(prev => [...prev, { id: `pm${Date.now()}`, ...data }]);
  }, []);
  const updatePaymentMethod = React.useCallback((updated: PaymentMethod) => {
    setPaymentMethods(prev => prev.map(item => item.id === updated.id ? updated : item));
  }, []);
  const deletePaymentMethod = React.useCallback((id: string) => {
    const itemToDelete = paymentMethods.find(pm => pm.id === id);
    if (!itemToDelete) return false;
    const isInUse = orders.some(o => o.paymentMethod === itemToDelete.name);
    if(isInUse) {
      toast({ title: "Error", description: "Este método de pago está en uso y no se puede eliminar.", variant: "destructive"});
      return false;
    }
    setPaymentMethods(prev => prev.filter(item => item.id !== id));
    return true;
  }, [orders, paymentMethods, toast]);

  const addDeliveryPlatform = React.useCallback((data: Omit<DeliveryPlatform, 'id'>) => {
    setDeliveryPlatforms(prev => [...prev, { id: `dp${Date.now()}`, ...data }]);
  }, []);
  const updateDeliveryPlatform = React.useCallback((updated: DeliveryPlatform) => {
    setDeliveryPlatforms(prev => prev.map(item => item.id === updated.id ? updated : item));
  }, []);
  const deleteDeliveryPlatform = React.useCallback((id: string) => {
    const itemToDelete = deliveryPlatforms.find(dp => dp.id === id);
    if (!itemToDelete) return false;
    const isInUse = orders.some(o => o.deliveryPlatform === itemToDelete.name);
    if(isInUse) {
      toast({ title: "Error", description: "Esta plataforma de delivery está en uso y no se puede eliminar.", variant: "destructive"});
      return false;
    }
    setDeliveryPlatforms(prev => prev.filter(item => item.id !== id));
    return true;
  }, [orders, deliveryPlatforms, toast]);

  const startShift = React.useCallback((user: User) => {
    const role = roles.find(r => r.id === user.roleId);
    if (role) {
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
      toast({ title: `Turno iniciado para ${user.name}` });
    } else {
      toast({ title: "Error", description: "No se pudo encontrar el rol para este usuario.", variant: "destructive" });
    }
  }, [roles, toast]);

  const logout = React.useCallback(() => {
    // This will be handled by Supabase Auth signout action
    // For now, it just clears local state
    if (activeShift) {
        const endedShift = { ...activeShift, endTime: new Date().toISOString() };
        setShifts(prev => [...prev, endedShift]);
        setActiveShift(null);
    }
    setCurrentUser(null);
    // The redirect will be handled by middleware or page logic
  }, [activeShift]);

  const endDay = React.useCallback(() => {
    if (currentUser) {
        logout();
    }
  }, [currentUser, logout]);

  const value = React.useMemo(() => ({
    products, ingredients, categories, orders, expenses, customers, users, roles, shifts, currentUser,
    orderTypes, paymentMethods, deliveryPlatforms,
    addProduct, updateProduct, deleteProduct, 
    addIngredient, updateIngredient, deleteIngredient, 
    addCategory, updateCategory, deleteCategory,
    addOrder, updateOrderStatus,
    addExpense, deleteExpense,
    addUser, updateUser, deleteUser,
    addRole, updateRole, deleteRole,
    addOrderType, updateOrderType, deleteOrderType,
    addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
    addDeliveryPlatform, updateDeliveryPlatform, deleteDeliveryPlatform,
    setCurrentUser, startShift, logout, endDay,
  }), [
    products, ingredients, categories, orders, expenses, customers, users, roles, shifts, currentUser,
    orderTypes, paymentMethods, deliveryPlatforms,
    addProduct, updateProduct, deleteProduct, 
    addIngredient, updateIngredient, deleteIngredient, 
    addCategory, updateCategory, deleteCategory,
    addOrder, updateOrderStatus,
    addExpense, deleteExpense,
    addUser, updateUser, deleteUser,
    addRole, updateRole, deleteRole,
    addOrderType, updateOrderType, deleteOrderType,
    addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
    addDeliveryPlatform, updateDeliveryPlatform, deleteDeliveryPlatform,
    startShift, logout, endDay,
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
