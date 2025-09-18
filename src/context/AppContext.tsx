
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Product, Ingredient, Order, CartItem, Category, Expense, Customer, User, Shift, Role, CurrentUser, OrderType, PaymentMethod, DeliveryPlatform } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

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
  const [currentUser, setCurrentUser] = React.useState<CurrentUser | null>(null);
  const [activeShift, setActiveShift] = React.useState<Shift | null>(null);

  React.useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [
          { data: productsData, error: productsError },
          { data: ingredientsData, error: ingredientsError },
          { data: categoriesData, error: categoriesError },
          { data: usersData, error: usersError },
          { data: rolesData, error: rolesError },
          { data: orderTypesData, error: orderTypesError },
          { data: paymentMethodsData, error: paymentMethodsError },
          { data: deliveryPlatformsData, error: deliveryPlatformsError },
        ] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('ingredients').select('*'),
          supabase.from('categories').select('*'),
          supabase.from('users').select('*'),
          supabase.from('roles').select('*'),
          supabase.from('order_types').select('*'),
          supabase.from('payment_methods').select('*'),
          supabase.from('delivery_platforms').select('*'),
        ]);

        if (productsError) throw productsError;
        if (ingredientsError) throw ingredientsError;
        if (categoriesError) throw categoriesError;
        if (usersError) throw usersError;
        if (rolesError) throw rolesError;
        if (orderTypesError) throw orderTypesError;
        if (paymentMethodsError) throw paymentMethodsError;
        if (deliveryPlatformsError) throw deliveryPlatformsError;

        setProducts(productsData || []);
        setIngredients(ingredientsData || []);
        setCategories(categoriesData || []);
        setUsers(usersData || []);
        setRoles(rolesData || []);
        setOrderTypes(orderTypesData || []);
        setPaymentMethods(paymentMethodsData || []);
        setDeliveryPlatforms(deliveryPlatformsData || []);

      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({
          title: "Error de Carga",
          description: "No se pudieron cargar los datos iniciales. Por favor, recargue la página.",
          variant: "destructive",
        });
      }
    };

    fetchInitialData();
  }, [toast]);

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

  const addProduct = React.useCallback(async (productData: Omit<Product, 'id' | 'ingredients'>) => {
    const { data, error } = await supabase.from('products').insert([productData]).select();
    if (error) {
      toast({ title: "Error", description: "No se pudo añadir el producto.", variant: "destructive" });
      console.error(error);
    } else if (data) {
      setProducts(prev => [data[0], ...prev]);
      toast({ title: "Éxito", description: "Producto añadido." });
    }
  }, [toast]);

  const updateProduct = React.useCallback(async (updatedProduct: Product) => {
    const { data, error } = await supabase.from('products').update(updatedProduct).eq('id', updatedProduct.id).select();
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar el producto.", variant: "destructive" });
      console.error(error);
    } else if (data) {
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? data[0] : p));
      toast({ title: "Éxito", description: "Producto actualizado." });
    }
  }, [toast]);
  
  const deleteProduct = React.useCallback(async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar el producto.", variant: "destructive" });
      console.error(error);
    } else {
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast({ title: "Éxito", description: "Producto eliminado." });
    }
  }, [toast]);

  const addIngredient = React.useCallback(async (ingredientData: Omit<Ingredient, 'id'>) => {
    const { data, error } = await supabase.from('ingredients').insert([ingredientData]).select();
    if (error) {
      toast({ title: "Error", description: "No se pudo añadir el ingrediente.", variant: "destructive" });
      console.error(error);
    } else if (data) {
      setIngredients(prev => [data[0], ...prev]);
      toast({ title: "Éxito", description: "Ingrediente añadido." });
    }
  }, [toast]);
  
  const updateIngredient = React.useCallback(async (updatedIngredient: Ingredient) => {
    const { data, error } = await supabase.from('ingredients').update(updatedIngredient).eq('id', updatedIngredient.id).select();
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar el ingrediente.", variant: "destructive" });
      console.error(error);
    } else if (data) {
      setIngredients(prev => prev.map(i => i.id === updatedIngredient.id ? data[0] : i));
      toast({ title: "Éxito", description: "Ingrediente actualizado." });
    }
  }, [toast]);

  const deleteIngredient = React.useCallback(async (ingredientId: string) => {
    const { error } = await supabase.from('ingredients').delete().eq('id', ingredientId);
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar el ingrediente.", variant: "destructive" });
      console.error(error);
    } else {
      setIngredients(prev => prev.filter(i => i.id !== ingredientId));
      toast({ title: "Éxito", description: "Ingrediente eliminado." });
    }
  }, [toast]);

  const addCategory = React.useCallback(async (categoryData: Omit<Category, 'id'>) => {
    const { data, error } = await supabase.from('categories').insert([categoryData]).select();
    if (error) {
      toast({ title: "Error", description: "No se pudo añadir la categoría.", variant: "destructive" });
      console.error(error);
    } else if (data) {
      setCategories(prev => [data[0], ...prev]);
      toast({ title: "Éxito", description: "Categoría añadida." });
    }
  }, [toast]);

  const updateCategory = React.useCallback(async (updatedCategory: Category) => {
    const { data, error } = await supabase.from('categories').update(updatedCategory).eq('id', updatedCategory.id).select();
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar la categoría.", variant: "destructive" });
      console.error(error);
    } else if (data) {
      setCategories(prev => prev.map(c => c.id === updatedCategory.id ? data[0] : c));
      toast({ title: "Éxito", description: "Categoría actualizada." });
    }
  }, [toast]);
  
  const deleteCategory = React.useCallback(async (categoryId: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar la categoría.", variant: "destructive" });
      console.error(error);
    } else {
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      toast({ title: "Éxito", description: "Categoría eliminada." });
    }
  }, [toast]);
  
  const addOrder = React.useCallback(async (cart: CartItem[], total: number, paymentMethod: Order['paymentMethod'], orderType: Order['orderType'], deliveryPlatform?: Order['deliveryPlatform'], customerName?: string, customerPhone?: string, transactionId?: string) => {
    if (!currentUser || !activeShift) {
        toast({ title: "Error", description: "No hay un turno de caja activo para registrar el pedido.", variant: "destructive"});
        return;
    }

    const newOrderData = {
        items: cart,
        total,
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
    
    const { data, error } = await supabase.from('orders').insert([newOrderData]).select();

    if (error) {
      toast({ title: "Error", description: "No se pudo crear el pedido.", variant: "destructive" });
      console.error(error);
    } else if (data) {
      const newOrder = data[0];
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
      toast({ title: "Éxito", description: "Pedido creado." });
    }
  }, [currentUser, activeShift, toast]);
  
  const updateOrderStatus = React.useCallback(async (orderId: string, status: Order["status"], prepTime?: number) => {
    const updateData: { status: Order["status"]; prepTime?: number } = { status };
    if (prepTime !== undefined) {
      updateData.prepTime = prepTime;
    }
    const { data, error } = await supabase.from('orders').update(updateData).eq('id', orderId).select();

    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar el estado del pedido.", variant: "destructive" });
      console.error(error);
    } else if (data) {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? data[0] : order
        )
      );
      toast({ title: "Éxito", description: "Estado del pedido actualizado." });
    }
  }, [toast]);
  
  const addExpense = React.useCallback(async (expenseData: Omit<Expense, 'id' | 'timestamp'>) => {
    const { data, error } = await supabase.from('expenses').insert([expenseData]).select();
    if (error) {
      toast({ title: "Error", description: "No se pudo añadir el gasto.", variant: "destructive" });
      console.error(error);
    } else if (data) {
      setExpenses(prev => [data[0], ...prev]);
      toast({ title: "Éxito", description: "Gasto añadido." });
    }
  }, [toast]);

  const deleteExpense = React.useCallback(async (expenseId: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar el gasto.", variant: "destructive" });
      console.error(error);
    } else {
      setExpenses(prev => prev.filter(e => e.id !== expenseId));
      toast({ title: "Éxito", description: "Gasto eliminado." });
    }
  }, [toast]);

  const addUser = React.useCallback(async (userData: Omit<User, 'id'>) => {
    const { data, error } = await supabase.from('users').insert([userData]).select();
    if (error) {
      toast({ title: "Error", description: "No se pudo añadir el usuario.", variant: "destructive" });
      console.error(error);
    } else if (data) {
      setUsers(prev => [...prev, data[0]]);
      toast({ title: "Éxito", description: "Usuario añadido." });
    }
  }, [toast]);

  const updateUser = React.useCallback(async (updatedUser: User) => {
    const { data, error } = await supabase.from('users').update(updatedUser).eq('id', updatedUser.id).select();
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar el usuario.", variant: "destructive" });
      console.error(error);
    } else if (data) {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? data[0] : u));
      toast({ title: "Éxito", description: "Usuario actualizado." });
    }
  }, [toast]);

  const deleteUser = React.useCallback(async (userId: string) => {
    const isUserInUse = shifts.some(shift => shift.userId === userId);
    if (isUserInUse) {
      toast({ title: "Error", description: "Este usuario está en uso y no se puede eliminar.", variant: "destructive" });
      return false;
    }
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar el usuario.", variant: "destructive" });
      console.error(error);
      return false;
    } else {
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({ title: "Éxito", description: "Usuario eliminado." });
      return true;
    }
  }, [shifts, toast]);
  
  const addRole = React.useCallback(async (roleData: Omit<Role, 'id'>) => {
    const { data, error } = await supabase.from('roles').insert([roleData]).select();
    if (error) {
      toast({ title: "Error", description: "No se pudo añadir el rol.", variant: "destructive" });
      console.error(error);
    } else if (data) {
      setRoles(prev => [...prev, data[0]]);
      toast({ title: "Éxito", description: "Rol añadido." });
    }
  }, [toast]);
  
  const updateRole = React.useCallback(async (updatedRole: Role) => {
    const { data, error } = await supabase.from('roles').update(updatedRole).eq('id', updatedRole.id).select();
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar el rol.", variant: "destructive" });
      console.error(error);
    } else if (data) {
      setRoles(prev => prev.map(r => r.id === updatedRole.id ? data[0] : r));
      toast({ title: "Éxito", description: "Rol actualizado." });
    }
  }, [toast]);

  const deleteRole = React.useCallback(async (roleId: string) => {
    const isRoleInUse = users.some(u => u.roleId === roleId);
    if (isRoleInUse) {
      toast({ title: "Error", description: "Este rol está en uso y no se puede eliminar.", variant: "destructive" });
      return false;
    }
    const { error } = await supabase.from('roles').delete().eq('id', roleId);
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar el rol.", variant: "destructive" });
      console.error(error);
      return false;
    } else {
      setRoles(prev => prev.filter(r => r.id !== roleId));
      toast({ title: "Éxito", description: "Rol eliminado." });
      return true;
    }
  }, [users, toast]);
  
  // Settings Management
  const addOrderType = React.useCallback(async (data: Omit<OrderType, 'id'>) => {
    const { data: newData, error } = await supabase.from('order_types').insert([data]).select();
    if (error) {
      toast({ title: "Error", description: "No se pudo añadir el tipo de pedido.", variant: "destructive" });
    } else if (newData) {
      setOrderTypes(prev => [...prev, newData[0]]);
      toast({ title: "Éxito", description: "Tipo de pedido añadido." });
    }
  }, [toast]);
  const updateOrderType = React.useCallback(async (updated: OrderType) => {
    const { data, error } = await supabase.from('order_types').update(updated).eq('id', updated.id).select();
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar el tipo de pedido.", variant: "destructive" });
    } else if (data) {
      setOrderTypes(prev => prev.map(item => item.id === updated.id ? data[0] : item));
      toast({ title: "Éxito", description: "Tipo de pedido actualizado." });
    }
  }, [toast]);
  const deleteOrderType = React.useCallback(async (id: string) => {
    const itemToDelete = orderTypes.find(ot => ot.id === id);
    if (!itemToDelete) return false;
    const isInUse = orders.some(o => o.orderType === itemToDelete.name);
    if (isInUse) {
      toast({ title: "Error", description: "Este tipo de pedido está en uso y no se puede eliminar.", variant: "destructive" });
      return false;
    }
    const { error } = await supabase.from('order_types').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar el tipo de pedido.", variant: "destructive" });
      return false;
    }
    setOrderTypes(prev => prev.filter(item => item.id !== id));
    toast({ title: "Éxito", description: "Tipo de pedido eliminado." });
    return true;
  }, [orders, orderTypes, toast]);

  const addPaymentMethod = React.useCallback(async (data: Omit<PaymentMethod, 'id'>) => {
    const { data: newData, error } = await supabase.from('payment_methods').insert([data]).select();
    if (error) {
      toast({ title: "Error", description: "No se pudo añadir el método de pago.", variant: "destructive" });
    } else if (newData) {
      setPaymentMethods(prev => [...prev, newData[0]]);
      toast({ title: "Éxito", description: "Método de pago añadido." });
    }
  }, [toast]);
  const updatePaymentMethod = React.useCallback(async (updated: PaymentMethod) => {
    const { data, error } = await supabase.from('payment_methods').update(updated).eq('id', updated.id).select();
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar el método de pago.", variant: "destructive" });
    } else if (data) {
      setPaymentMethods(prev => prev.map(item => item.id === updated.id ? data[0] : item));
      toast({ title: "Éxito", description: "Método de pago actualizado." });
    }
  }, [toast]);
  const deletePaymentMethod = React.useCallback(async (id: string) => {
    const itemToDelete = paymentMethods.find(pm => pm.id === id);
    if (!itemToDelete) return false;
    const isInUse = orders.some(o => o.paymentMethod === itemToDelete.name);
    if (isInUse) {
      toast({ title: "Error", description: "Este método de pago está en uso y no se puede eliminar.", variant: "destructive" });
      return false;
    }
    const { error } = await supabase.from('payment_methods').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar el método de pago.", variant: "destructive" });
      return false;
    }
    setPaymentMethods(prev => prev.filter(item => item.id !== id));
    toast({ title: "Éxito", description: "Método de pago eliminado." });
    return true;
  }, [orders, paymentMethods, toast]);

  const addDeliveryPlatform = React.useCallback(async (data: Omit<DeliveryPlatform, 'id'>) => {
    const { data: newData, error } = await supabase.from('delivery_platforms').insert([data]).select();
    if (error) {
      toast({ title: "Error", description: "No se pudo añadir la plataforma de delivery.", variant: "destructive" });
    } else if (newData) {
      setDeliveryPlatforms(prev => [...prev, newData[0]]);
      toast({ title: "Éxito", description: "Plataforma de delivery añadida." });
    }
  }, [toast]);
  const updateDeliveryPlatform = React.useCallback(async (updated: DeliveryPlatform) => {
    const { data, error } = await supabase.from('delivery_platforms').update(updated).eq('id', updated.id).select();
    if (error) {
      toast({ title: "Error", description: "No se pudo actualizar la plataforma de delivery.", variant: "destructive" });
    } else if (data) {
      setDeliveryPlatforms(prev => prev.map(item => item.id === updated.id ? data[0] : item));
      toast({ title: "Éxito", description: "Plataforma de delivery actualizada." });
    }
  }, [toast]);
  const deleteDeliveryPlatform = React.useCallback(async (id: string) => {
    const itemToDelete = deliveryPlatforms.find(dp => dp.id === id);
    if (!itemToDelete) return false;
    const isInUse = orders.some(o => o.deliveryPlatform === itemToDelete.name);
    if (isInUse) {
      toast({ title: "Error", description: "Esta plataforma de delivery está en uso y no se puede eliminar.", variant: "destructive" });
      return false;
    }
    const { error } = await supabase.from('delivery_platforms').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar la plataforma de delivery.", variant: "destructive" });
      return false;
    }
    setDeliveryPlatforms(prev => prev.filter(item => item.id !== id));
    toast({ title: "Éxito", description: "Plataforma de delivery eliminada." });
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

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
