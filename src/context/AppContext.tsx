"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Product, Ingredient, Order, CartItem, Category, Expense, Customer, User, Shift, Role, CurrentUser, OrderType, PaymentMethod, DeliveryPlatform } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  getProducts, getIngredients, getCategories, getUsers, getRoles,
  getOrderTypes, getPaymentMethods, getDeliveryPlatforms, getOrders, getExpenses, getShifts,
  addShift as addShiftDB, updateShift as updateShiftDB
} from "@/lib/database";
import { getSession, logoutLocal } from "@/lib/auth";

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
  activeShift: Shift | null;
  
  startShift: (user: User) => Promise<void>;
  logout: () => void;
  refreshData: () => Promise<void>;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const router = useRouter();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [ingredients, setIngredients] = React.useState<Ingredient[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [orderTypes, setOrderTypes] = React.useState<OrderType[]>([]);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [deliveryPlatforms, setDeliveryPlatforms] = React.useState<DeliveryPlatform[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [currentUser, setCurrentUser] = React.useState<CurrentUser | null>(null);
  const [activeShift, setActiveShift] = React.useState<Shift | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refreshData = React.useCallback(async () => {
    const [p, i, c, u, r, ot, pm, dp, o, e, s] = await Promise.all([
      getProducts(), getIngredients(), getCategories(), getUsers(), getRoles(),
      getOrderTypes(), getPaymentMethods(), getDeliveryPlatforms(), getOrders(), getExpenses(), getShifts()
    ]);
    setProducts(p);
    setIngredients(i);
    setCategories(c);
    setUsers(u);
    setRoles(r);
    setOrderTypes(ot);
    setPaymentMethods(pm);
    setDeliveryPlatforms(dp);
    setOrders(o);
    setExpenses(e);
    setShifts(s);
  }, []);

  React.useEffect(() => {
    const session = getSession();
    if (session) {
        setCurrentUser(session);
    }
    refreshData().then(() => setLoading(false));
  }, [refreshData]);

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

  const startShift = React.useCallback(async (user: User) => {
    const role = roles.find(r => r.id === user.roleId);
    if (role) {
      const userWithRole: CurrentUser = { ...user, role };
      setCurrentUser(userWithRole);

      if (role.permissions.includes('caja')) {
        const newShift: Omit<Shift, 'id'> = {
          userId: user.id,
          userName: user.name,
          startTime: new Date().toISOString(),
          orders: [],
          totalSales: 0,
        };
        const savedShift = await addShiftDB(newShift);
        if (savedShift) {
            setActiveShift(savedShift);
        }
      }
      toast({ title: `Turno iniciado para ${user.name}` });
    } else {
      toast({ title: "Error", description: "No se pudo encontrar el rol para este usuario.", variant: "destructive" });
    }
  }, [roles, toast]);

  const logout = React.useCallback(async () => {
    if (activeShift) {
        const endedShift = { ...activeShift, endTime: new Date().toISOString() };
        await updateShiftDB(endedShift);
        setActiveShift(null);
    }
    logoutLocal();
    setCurrentUser(null);
    router.push('/login');
  }, [activeShift, router]);

  const value = React.useMemo(() => ({
    products, ingredients, categories, orders, expenses, customers, users, roles, shifts, currentUser,
    orderTypes, paymentMethods, deliveryPlatforms, activeShift,
    startShift, logout, refreshData
  }), [
    products, ingredients, categories, orders, expenses, customers, users, roles, shifts, currentUser,
    orderTypes, paymentMethods, deliveryPlatforms, activeShift,
    startShift, logout, refreshData
  ]);

  if (loading) return null;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
