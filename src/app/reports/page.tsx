
"use client";

import * as React from "react";
import AppShell from "@/components/AppShell";
import StatCard from "@/components/reports/StatCard";
import SalesChart from "@/components/reports/SalesChart";
import TopProductsChart from "@/components/reports/TopProductsChart";
import { DollarSign, ShoppingCart, UtensilsCrossed, Calendar as CalendarIcon, History, Users, FileText, PlusCircle, Trash2, Briefcase } from "lucide-react";
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

export default function ReportsPage() {
  const { orders, products, expenses, addExpense, deleteExpense, shifts, currentUser } = useAppContext();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerData | null>(null);

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingItem, setDeletingItem] = React.useState<{ type: 'expense'; id: string; name: string } | null>(null);

  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { description: '', amount: 0 },
  });

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
    const customerMap = new Map<string, { name: string; phone: string; orders: Order[] }>();

    orders.forEach(order => {
        if (order.customerName || order.customerPhone) {
            const customerKey = `${order.customerName || ''}-${order.customerPhone || ''}`;
            if (!customerMap.has(customerKey)) {
                customerMap.set(customerKey, {
                    name: order.customerName || 'N/A',
                    phone: order.customerPhone || 'N/A',
                    orders: []
                });
            }
            customerMap.get(customerKey)!.orders.push(order);
        }
    });

    return Array.from(customerMap.values()).map(c => ({
        ...c,
        orderCount: c.orders.length,
        totalSpent: c.orders.reduce((sum, o) => sum + o.total, 0)
    })).sort((a,b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const handleExpenseSubmit = React.useCallback((data: z.infer<typeof expenseSchema>) => {
    addExpense(data);
    setIsExpenseDialogOpen(false);
    expenseForm.reset();
  }, [addExpense, expenseForm]);

  const handleDeleteConfirm = React.useCallback(() => {
    if (!deletingItem) return;
    if (deletingItem.type === 'expense') {
      deleteExpense(deletingItem.id);
    }
    setIsDeleteDialogOpen(false);
    setDeletingItem(null);
  }, [deletingItem, deleteExpense]);
  
  const openDeleteDialog = React.useCallback((item: { type: 'expense'; id: string; name: string }) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  }, []);
  
  if (!currentUser?.role.permissions.includes('reports')) {
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
          <TabsList className="grid w-full grid-cols-6">
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
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
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
                    <CardHeader>
                        <CardTitle>Pedidos del {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : ''}</CardTitle>
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <div className="grid gap-8 lg:grid-cols-2 mt-8">
              <SalesChart />
              <TopProductsChart />
            </div>
          </TabsContent>

          <TabsContent value="shifts" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Historial de Turnos</CardTitle>
                    <CardDescription>Resumen de todos los turnos de usuario completados.</CardDescription>
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
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Registro de Gastos</CardTitle>
                  <CardDescription>Añade y gestiona los gastos de tu negocio.</CardDescription>
                </div>
                <Button onClick={() => setIsExpenseDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Gasto
                </Button>
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
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog({ type: 'expense', id: expense.id, name: expense.description })}>
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
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Historial Completo</CardTitle>
                    <CardDescription>Todos los pedidos registrados en el sistema.</CardDescription>
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
                                        <TableCell>${order.total.toFixed(2)}</TableCell>
                                        <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">Aún no se han registrado pedidos.</TableCell>
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Base de Datos de Clientes</CardTitle>
                <CardDescription>Visualiza todos tus clientes y su historial de pedidos.</CardDescription>
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
                      {customers.length > 0 ? customers.map(customer => (
                        <TableRow key={`${customer.name}-${customer.phone}`}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>{customer.orderCount}</TableCell>
                          <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(customer)}>
                              Ver Pedidos
                            </Button>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">No hay clientes registrados.</TableCell>
                        </TableRow>
                      )}
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
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCustomer?.orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                      <TableCell>{format(new Date(order.timestamp), 'PPp', { locale: es })}</TableCell>
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
          <Form {...expenseForm}>
            <form onSubmit={expenseForm.handleSubmit(handleExpenseSubmit)} className="space-y-4 py-4">
              <FormField
                control={expenseForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl><Input {...field} placeholder="Ej: Compra de carne" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={expenseForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} placeholder="Ej: 50.00" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar Gasto</Button>
              </DialogFooter>
            </form>
          </Form>
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
            <AlertDialogAction onClick={handleDeleteConfirm}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
