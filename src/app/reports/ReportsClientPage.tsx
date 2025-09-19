"use client";

import * as React from "react";
import AppShell from "@/components/AppShell";
import StatCard from "@/components/reports/StatCard";
import SalesChart from "@/components/reports/SalesChart";
import TopProductsChart from "@/components/reports/TopProductsChart";
import { DollarSign, ShoppingCart, UtensilsCrossed, Calendar as CalendarIcon, History, Users, FileText, PlusCircle, Trash2, Briefcase, CreditCard, Landmark, Download } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { isWithinInterval, startOfMonth, format, isSameDay, startOfDay, endOfDay, formatDistanceStrict } from "date-fns";
import { es } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { Order, Product, Expense, Customer, Shift } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const expenseSchema = z.object({
  description: z.string().min(1, { message: "La descripción es requerida." }),
  amount: z.coerce.number().positive({ message: "El monto debe ser un número positivo." }),
});

const calculateStats = (ordersToProcess: Order[], products: Product[], expensesToProcess: Expense[]) => {
  const totalExpenses = expensesToProcess.reduce((total, expense) => total + expense.amount, 0);

  if (ordersToProcess.length === 0) {
    return {
      totalSales: 0,
      orderCount: 0,
      topProduct: { name: "N/A", units: "0 unidades" },
      totalExpenses,
    };
  }

  const totalSales = ordersToProcess.reduce((total, order) => total + order.total, 0);
  const orderCount = ordersToProcess.length;

  const productCounts = new Map<string, number>();
  ordersToProcess.forEach(order => {
    order.items.forEach(item => {
      productCounts.set(item.productId, (productCounts.get(item.productId) || 0) + item.quantity);
    });
  });

  let topProduct = { name: "N/A", units: "0 unidades" };
  if (productCounts.size > 0) {
    const topProductId = [...productCounts.entries()].reduce((a, b) => b[1] > a[1] ? b : a)[0];
    const topProductDetails = products.find(p => p.id === topProductId);
    const unitsSold = productCounts.get(topProductId) || 0;
    topProduct = {
      name: topProductDetails ? topProductDetails.name : "Desconocido",
      units: `${unitsSold} unidades vendidas`,
    };
  }

  return { totalSales, orderCount, topProduct, totalExpenses };
};

type CustomerData = {
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  orders: Order[];
};

export default function ReportsClientPage() {
  const { orders, products, expenses, shifts, currentUser, customers: allCustomers } = useAppContext();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerData | null>(null);

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingItem, setDeletingItem] = React.useState<{ type: 'expense'; id: string; name: string } | null>(null);

  const [adminUser, setAdminUser] = React.useState<SupabaseUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  React.useEffect(() => {
    const supabase = createClient();
    const getAdminUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAdminUser(user);
      setIsCheckingAuth(false);
    }
    getAdminUser();
  }, []);

  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { description: '', amount: 0 },
  });

  const handleExport = React.useCallback((data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
          title: "Sin datos para exportar",
          description: "La tabla seleccionada está vacía.",
          variant: "destructive",
      });
      return;
    }
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify((row as any)[header])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [toast]);

  const monthlyStats = React.useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthlyOrders = orders.filter(order => isWithinInterval(new Date(order.timestamp), { start: monthStart, end: today }));
    const monthlyExpenses = expenses.filter(expense => isWithinInterval(new Date(expense.timestamp), { start: monthStart, end: today }));
    return calculateStats(monthlyOrders, products, monthlyExpenses);
  }, [orders, products, expenses]);

  const dailyStats = React.useMemo(() => {
    if (!selectedDate) {
      return calculateStats([], products, []);
    }
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);
    const dailyOrders = orders.filter(order => isWithinInterval(new Date(order.timestamp), { start: dayStart, end: dayEnd }));
    const dailyExpenses = expenses.filter(expense => isWithinInterval(new Date(expense.timestamp), { start: dayStart, end: dayEnd }));
    return calculateStats(dailyOrders, products, dailyExpenses);
  }, [orders, products, expenses, selectedDate]);

  const dailyOrders = React.useMemo(() => {
    if (!selectedDate) return [];
    return orders
      .filter(order => isSameDay(new Date(order.timestamp), selectedDate))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [orders, selectedDate]);

  const customers = React.useMemo(() => {
    const customerMap = new Map<string, { name: string; phones: Set<string>; orders: Order[] }>();

    orders.forEach(order => {
        if (order.customerName) {
            const customerKey = order.customerName.toLowerCase().trim();
            if (!customerMap.has(customerKey)) {
                customerMap.set(customerKey, {
                    name: order.customerName,
                    phones: new Set<string>(),
                    orders: []
                });
            }
            const customerEntry = customerMap.get(customerKey)!;
            customerEntry.orders.push(order);
            if (order.customerPhone) {
                customerEntry.phones.add(order.customerPhone);
            }
        }
    });

    return Array.from(customerMap.values()).map(c => ({
        ...c,
        phone: [...c.phones].join(', '),
        orderCount: c.orders.length,
        totalSpent: c.orders.reduce((sum, o) => sum + o.total, 0)
    })).sort((a,b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const hasPermission = React.useMemo(() => {
    if (adminUser) return true;
    if (currentUser) return currentUser.role?.permissions?.includes('reports') ?? false;
    return false;
  }, [currentUser, adminUser]);

  if (isCheckingAuth) {
    return <AppShell><div>Loading...</div></AppShell>;
  }

  if (!hasPermission) {
    return (
        <AppShell>
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-2xl font-bold">Acceso Denegado</h1>
                <p className="text-muted-foreground">No tienes permiso para acceder a esta sección.</p>
            </div>
        </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold">Panel de Informes</h1>
        <Tabs defaultValue="daily">
          <TabsList className="grid w-full grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="daily">Informe Diario</TabsTrigger>
            <TabsTrigger value="monthly">Resumen Mensual</TabsTrigger>
            <TabsTrigger value="shifts">Turnos</TabsTrigger>
            <TabsTrigger value="expenses">Gastos</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-6">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
               <div className="lg:col-span-1">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CalendarIcon className="h-5 w-5"/> Seleccionar Fecha</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md"
                            locale={es}
                            disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                        />
                    </CardContent>
                 </Card>
               </div>
               <div className="lg:col-span-2 space-y-8">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                     <StatCard
                        title="Ventas del Día"
                        value={`$${dailyStats.totalSales.toFixed(2)}`}
                        icon={DollarSign}
                    />
                    <StatCard
                        title="Gastos del Día"
                        value={`$${dailyStats.totalExpenses.toFixed(2)}`}
                        icon={FileText}
                    />
                    <StatCard
                        title="Pedidos del Día"
                        value={dailyStats.orderCount.toString()}
                        icon={ShoppingCart}
                    />
                </div>
                 <Card>
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle>Pedidos del {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : ''}</CardTitle>
                        <Button variant="outline" onClick={() => handleExport(dailyOrders, `pedidos_diarios_${selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'export'}.csv`)} disabled={!selectedDate || dailyOrders.length === 0} className="w-full sm:w-auto">
                           <Download className="mr-2 h-4 w-4" /> Exportar CSV
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pedido</TableHead>
                                        <TableHead>Hora</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dailyOrders.length > 0 ? dailyOrders.map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                                            <TableCell>{format(new Date(order.timestamp), 'p', { locale: es })}</TableCell>
                                            <TableCell>${order.total.toFixed(2)}</TableCell>
                                            <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">No hay pedidos para la fecha seleccionada.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                 </Card>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="mt-6">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Ventas del Mes"
                value={`$${monthlyStats.totalSales.toFixed(2)}`}
                icon={DollarSign}
              />
               <StatCard
                title="Gastos del Mes"
                value={`$${monthlyStats.totalExpenses.toFixed(2)}`}
                icon={FileText}
              />
              <StatCard
                title="Pedidos del Mes"
                value={monthlyStats.orderCount.toString()}
                icon={ShoppingCart}
              />
              <StatCard
                title="Producto más Vendido (Mes)"
                value={monthlyStats.topProduct.name}
                icon={UtensilsCrossed}
                change={monthlyStats.topProduct.units}
              />
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mt-8">
              <SalesChart />
              <TopProductsChart />
            </div>
          </TabsContent>

          <TabsContent value="shifts" className="mt-6">
            <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Historial de Turnos</CardTitle>
                        <CardDescription>Resumen de todos los turnos de usuario completados.</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => handleExport(shifts, 'turnos.csv')} className="w-full sm:w-auto">
                       <Download className="mr-2 h-4 w-4" /> Exportar CSV
                    </Button>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px]">
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Inicio</TableHead>
                                    <TableHead>Fin</TableHead>
                                    <TableHead>Duración</TableHead>
                                    <TableHead>Ventas Totales</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {shifts.length > 0 ? [...shifts].sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()).map(shift => (
                                     <TableRow key={shift.id}>
                                        <TableCell className="font-medium">{shift.userName}</TableCell>
                                        <TableCell>{format(new Date(shift.startTime), 'P', { locale: es })}</TableCell>
                                        <TableCell>{format(new Date(shift.startTime), 'p', { locale: es })}</TableCell>
                                        <TableCell>{shift.endTime ? format(new Date(shift.endTime), 'p', { locale: es }) : 'En curso'}</TableCell>
                                        <TableCell>{shift.endTime ? formatDistanceStrict(new Date(shift.endTime), new Date(shift.startTime), { locale: es, unit: 'minute' }) : '-'}</TableCell>
                                        <TableCell>${shift.totalSales.toFixed(2)}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">No hay turnos completados.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="expenses" className="mt-6">
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Registro de Gastos</CardTitle>
                  <CardDescription>Añade y gestiona los gastos de tu negocio.</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={() => handleExport(expenses, 'gastos.csv')} className="w-full sm:w-auto">
                       <Download className="mr-2 h-4 w-4" /> Exportar CSV
                    </Button>
                    <Button onClick={() => setIsExpenseDialogOpen(true)} className="w-full sm:w-auto">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Añadir Gasto
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.length > 0 ? [...expenses].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(expense => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">{expense.description}</TableCell>
                          <TableCell>${expense.amount.toFixed(2)}</TableCell>
                          <TableCell>{format(new Date(expense.timestamp), 'PPp', { locale: es })}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {}}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">No hay gastos registrados.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Historial Completo</CardTitle>
                        <CardDescription>Todos los pedidos registrados en el sistema.</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => handleExport(orders, 'historial_pedidos.csv')} className="w-full sm:w-auto">
                       <Download className="mr-2 h-4 w-4" /> Exportar CSV
                    </Button>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px]">
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Pedido</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Método</TableHead>
                                    <TableHead>Transacción</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.length > 0 ? [...orders].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(order => (
                                     <TableRow key={order.id}>
                                        <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                                        <TableCell>{format(new Date(order.timestamp), 'PPp', { locale: es })}</TableCell>
                                        <TableCell>{order.userName}</TableCell>
                                        <TableCell>{order.customerName || 'N/A'}</TableCell>
                                        <TableCell>
                                            {order.orderType}
                                            {order.deliveryPlatform && (
                                                <span className="text-muted-foreground text-xs block">
                                                    ({order.deliveryPlatform})
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{order.paymentMethod}</TableCell>
                                        <TableCell className="truncate max-w-[100px]">{order.transactionId || 'N/A'}</TableCell>
                                        <TableCell>${order.total.toFixed(2)}</TableCell>
                                        <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center">Aún no se han registrado pedidos.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Base de Datos de Clientes</CardTitle>
                    <CardDescription>Visualiza todos tus clientes y su historial de pedidos.</CardDescription>
                </div>
                <Button variant="outline" onClick={() => handleExport(customers, 'clientes.csv')} className="w-full sm:w-auto">
                    <Download className="mr-2 h-4 w-4" /> Exportar CSV
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Pedidos Totales</TableHead>
                        <TableHead>Gasto Total</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map(customer => (
                        <TableRow key={customer.name}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>{customer.orderCount}</TableCell>
                          <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(customer as CustomerData)}>
                              Ver Pedidos
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedCustomer} onOpenChange={(isOpen) => { if (!isOpen) { setSelectedCustomer(null); } }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Historial de Pedidos de {selectedCustomer?.name}</DialogTitle>
            <DialogDescription>
              Revisa todos los pedidos realizados por este cliente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCustomer?.orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                      <TableCell>{format(new Date(order.timestamp), 'PPp', { locale: es })}</TableCell>
                      <TableCell>
                        {order.orderType}
                        {order.deliveryPlatform && (
                            <span className="text-muted-foreground text-xs block">
                                ({order.deliveryPlatform})
                            </span>
                        )}
                      </TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCustomer(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Gasto</DialogTitle>
            <DialogDescription>
              Registra un nuevo gasto para tu negocio.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente "{deletingItem?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
