"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Product, Ingredient, Order, CartItem, Category, Expense, Customer, User, Shift, Role, CurrentUser, OrderType, PaymentMethod, DeliveryPlatform } from "@/types";
import { useToast } from "@/hooks/use-toast";

// This context will now primarily manage UI state and data passed down from server components.
// All database write operations will be handled by Server Actions.

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
  
  // The context is no longer responsible for mutations, only for starting a shift (client-side state).
  startShift: (user: User) => void;
  logout: () => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

interface InitialData {
  products: Product[];
  ingredients: Ingredient[];
  categories: Category[];
  users: User[];
  roles: Role[];
  orderTypes: OrderType[];
  paymentMethods: PaymentMethod[];
  deliveryPlatforms: DeliveryPlatform[];
}

interface AppProviderProps {
  children: React.ReactNode;
  initialData: InitialData;
}

export function AppProvider({ children, initialData }: AppProviderProps) {
  console.log("Initial data received by AppProvider:", initialData);
  const { toast } = useToast();
  const router = useRouter();

  // State is initialized from server-fetched data
  const [products, setProducts] = React.useState<Product[]>(initialData.products);
  const [ingredients, setIngredients] = React.useState<Ingredient[]>(initialData.ingredients);
  const [categories, setCategories] = React.useState<Category[]>(initialData.categories);
  const [users, setUsers] = React.useState<User[]>(initialData.users);
  const [roles, setRoles] = React.useState<Role[]>(initialData.roles);
  const [orderTypes, setOrderTypes] = React.useState<OrderType[]>(initialData.orderTypes);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>(initialData.paymentMethods);
  const [deliveryPlatforms, setDeliveryPlatforms] = React.useState<DeliveryPlatform[]>(initialData.deliveryPlatforms);

  // These states are purely client-side and ephemeral
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
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
  
  // NOTE: All add, update, delete functions for persistent data have been moved to Server Actions.
  // This context will only handle client-side state changes, like adding an item to a temporary cart.

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
    // The actual Supabase signout is a server action. This function clears local shift state.
    if (activeShift) {
        const endedShift = { ...activeShift, endTime: new Date().toISOString() };
        // In a real app, you'd want to persist this shift summary
        setShifts(prev => [...prev, endedShift]);
        setActiveShift(null);
    }
    setCurrentUser(null);
    // Redirect is handled by middleware
    router.push('/login');
  }, [activeShift, router]);

  const value = React.useMemo(() => ({
    products, ingredients, categories, orders, expenses, customers, users, roles, shifts, currentUser,
    orderTypes, paymentMethods, deliveryPlatforms,
    startShift, logout,
  }), [
    products, ingredients, categories, orders, expenses, customers, users, roles, shifts, currentUser,
    orderTypes, paymentMethods, deliveryPlatforms,
    startShift, logout,
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
