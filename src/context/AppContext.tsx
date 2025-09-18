
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Product, Ingredient, Order, CartItem, Category, Expense, Customer, User, Shift, Role, CurrentUser, OrderType, PaymentMethod, DeliveryPlatform } from "@/types";
import { products as initialProducts, ingredients as initialIngredients, categories as initialCategories, users as initialUsers, roles as initialRoles, orderTypes as initialOrderTypes, paymentMethods as initialPaymentMethods, deliveryPlatforms as initialDeliveryPlatforms } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

/**
 * @typedef {object} AppContextType
 * @description The shape of the application's global context, including all state and action dispatchers.
 *
 * @property {Product[]} products - State for all menu products.
 * @property {Ingredient[]} ingredients - State for all raw ingredients.
 * @property {Category[]} categories - State for all product categories.
 * @property {Order[]} orders - State for all historical and current orders.
 * @property {Expense[]} expenses - State for all recorded expenses.
 * @property {Customer[]} customers - Memoized list of unique customers derived from orders.
 * @property {User[]} users - State for all registered users.
 * @property {Role[]} roles - State for all user roles and permissions.
 * @property {Shift[]} shifts - State for all completed shifts.
 * @property {OrderType[]} orderTypes - State for configurable order types.
 * @property {PaymentMethod[]} paymentMethods - State for configurable payment methods.
 * @property {DeliveryPlatform[]} deliveryPlatforms - State for configurable delivery platforms.
 * @property {CurrentUser | null} currentUser - The currently logged-in user, or null.
 *
 * @property {(product: Omit<Product, 'id' | 'ingredients'>) => void} addProduct - Function to add a new product.
 * @property {(product: Product) => void} updateProduct - Function to update an existing product.
 * @property {(productId: string) => void} deleteProduct - Function to delete a product.
 *
 * @property {(ingredient: Omit<Ingredient, 'id'>) => void} addIngredient - Function to add a new ingredient.
 * @property {(ingredient: Ingredient) => void} updateIngredient - Function to update an existing ingredient.
 * @property {(ingredientId: string) => void} deleteIngredient - Function to delete an ingredient.
 *
 * @property {(category: Omit<Category, 'id'>) => void} addCategory - Function to add a new category.
 * @property {(category: Category) => void} updateCategory - Function to update an existing category.
 * @property {(categoryId: string) => void} deleteCategory - Function to delete a category.
 *
 * @property {(cart: CartItem[], total: number, paymentMethod: string, orderType: string, deliveryPlatform?: string, customerName?: string, customerPhone?: string, transactionId?: string) => void} addOrder - Function to create a new order.
 * @property {(orderId: string, status: Order['status'], prepTime?: number) => void} updateOrderStatus - Function to update the status of an order.
 *
 * @property {(expense: Omit<Expense, 'id' | 'timestamp'>) => void} addExpense - Function to add a new expense.
 * @property {(expenseId: string) => void} deleteExpense - Function to delete an expense.
 *
 * @property {(user: Omit<User, 'id'>) => void} addUser - Function to add a new user.
 * @property {(user: User) => void} updateUser - Function to update an existing user.
 * @property {(userId: string) => boolean} deleteUser - Function to delete a user.
 *
 * @property {(role: Omit<Role, 'id'>) => void} addRole - Function to add a new role.
 * @property {(role: Role) => void} updateRole - Function to update an existing role.
 * @property {(roleId: string) => boolean} deleteRole - Function to delete a role.
 *
 * @property {(item: Omit<OrderType, 'id'>) => void} addOrderType - Function to add a new order type.
 * @property {(item: OrderType) => void} updateOrderType - Function to update an existing order type.
 * @property {(id: string) => boolean} deleteOrderType - Function to delete an order type.
 *
 * @property {(item: Omit<PaymentMethod, 'id'>) => void} addPaymentMethod - Function to add a new payment method.
 * @property {(item: PaymentMethod) => void} updatePaymentMethod - Function to update an existing payment method.
 * @property {(id: string) => boolean} deletePaymentMethod - Function to delete a payment method.
 *
 * @property {(item: Omit<DeliveryPlatform, 'id'>) => void} addDeliveryPlatform - Function to add a new delivery platform.
 * @property {(item: DeliveryPlatform) => void} updateDeliveryPlatform - Function to update an existing delivery platform.
 * @property {(id: string) => boolean} deleteDeliveryPlatform - Function to delete a delivery platform.
 *
 * @property {(userId: string, pin: string) => boolean} login - Function to authenticate a user and start a shift.
 * @property {() => void} logout - Function to log out the current user and end their shift.
 * @property {() => void} endDay - Function to end the day, logging out any active user.
 */
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

  login: (userId: string, pin: string) => boolean;
  logout: () => void;
  endDay: () => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

/**
 * Provides the application's global state to all child components.
 * It encapsulates all business logic and state management for the app.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render.
 */
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
  const [orderTypes, setOrderTypes] = React.useState<OrderType[]>(initialOrderTypes);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>(initialPaymentMethods);
  const [deliveryPlatforms, setDeliveryPlatforms] = React.useState<DeliveryPlatform[]>(initialDeliveryPlatforms);
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
    // State
    products, ingredients, categories, orders, expenses, customers, users, roles, shifts, currentUser,
    orderTypes, paymentMethods, deliveryPlatforms,
    // Product Actions
    addProduct, updateProduct, deleteProduct, 
    // Ingredient Actions
    addIngredient, updateIngredient, deleteIngredient, 
    // Category Actions
    addCategory, updateCategory, deleteCategory,
    // Order Actions
    addOrder, updateOrderStatus,
    // Expense Actions
    addExpense, deleteExpense,
    // User & Role Actions
    addUser, updateUser, deleteUser,
    addRole, updateRole, deleteRole,
    // Settings Actions
    addOrderType, updateOrderType, deleteOrderType,
    addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
    addDeliveryPlatform, updateDeliveryPlatform, deleteDeliveryPlatform,
    // Auth & Shift Actions
    login, logout, endDay,
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
    login, logout, endDay,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * A custom hook to easily access the application's global context.
 * This must be used within a component that is a child of `AppProvider`.
 * @returns {AppContextType} The global context object.
 * @throws {Error} If used outside of an `AppProvider`.
 */
export function useAppContext() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
