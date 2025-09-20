"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { addExpenseAction, deleteExpenseAction } from "./actions";

const expenseSchema = z.object({
  description: z.string().min(1, { message: "La descripción es requerida." }),
  amount: z.coerce.number().positive({ message: "El monto debe ser un número positivo." }),
});

const calculateStats = (ordersToProcess: Order[], products: Product[], expensesToProcess: Expense[]) => {
  const totalExpenses = expensesToProcess.reduce((total, expense) => total + expense.amount, 0);
  if (ordersToProcess.length === 0) return { totalSales: 0, orderCount: 0, topProduct: { name: "N/A", units: "0 unidades" }, totalExpenses };
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
    topProduct = { name: topProductDetails ? topProductDetails.name : "Desconocido", units: `${unitsSold} unidades vendidas` };
  }
  return { totalSales, orderCount, topProduct, totalExpenses };
};

type CustomerData = { name: string; phone: string; orderCount: number; totalSpent: number; orders: Order[]; };

export default function ReportsClientPage() {
  const { orders, products, expenses, shifts, currentUser } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerData | null>(null);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingItem, setDeletingItem] = React.useState<{ type: 'expense'; id: string; name: string } | null>(null);
  const [adminUser, setAdminUser] = React.useState<SupabaseUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  const monthlyStats = React.useMemo(() => calculateStats(orders.filter(o => isWithinInterval(new Date(o.timestamp), { start: startOfMonth(new Date()), end: new Date() })), products, expenses.filter(e => isWithinInterval(new Date(e.timestamp), { start: startOfMonth(new Date()), end: new Date() }))), [orders, products, expenses]);
  const dailyStats = React.useMemo(() => selectedDate ? calculateStats(orders.filter(o => isSameDay(new Date(o.timestamp), selectedDate)), products, expenses.filter(e => isSameDay(new Date(e.timestamp), selectedDate))) : calculateStats([], [], []), [orders, products, expenses, selectedDate]);
  const dailyOrders = React.useMemo(() => selectedDate ? orders.filter(o => isSameDay(new Date(o.timestamp), selectedDate)).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [], [orders, selectedDate]);
  const customers = React.useMemo(() => { /* ... customer calculation logic ... */ return []; }, [orders]);

  const handleExpenseSubmit = async (data: z.infer<typeof expenseSchema>) => {
    setIsSubmitting(true);
    try {
      await addExpenseAction(data);
      toast({ title: "Gasto añadido" });
      setIsExpenseDialogOpen(false);
      expenseForm.reset();
      router.refresh();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    try {
      await deleteExpenseAction(deletingItem.id);
      toast({ title: "Gasto eliminado" });
      router.refresh();
    } catch (error: any) {
      toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
      setIsSubmitting(false);
    }
  };

  const hasPermission = React.useMemo(() => {
    if (adminUser) return true;
    return currentUser?.role?.permissions?.includes('reports') ?? false;
  }, [currentUser, adminUser]);

  if (isCheckingAuth) return <AppShell><div>Loading...</div></AppShell>;

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

          <TabsContent value="expenses" className="mt-6">
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Registro de Gastos</CardTitle>
                  <CardDescription>Añade y gestiona los gastos de tu negocio.</CardDescription>
                </div>
                <Button onClick={() => setIsExpenseDialogOpen(true)} className="w-full sm:w-auto">
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
                      {[...expenses].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(expense => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">{expense.description}</TableCell>
                          <TableCell>${expense.amount.toFixed(2)}</TableCell>
                          <TableCell>{format(new Date(expense.timestamp), 'PPp', { locale: es })}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setDeletingItem({ type: 'expense', id: expense.id, name: expense.description }); setIsDeleteDialogOpen(true); }}>
                              <Trash2 className="h-4 w-4" />
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
          {/* Other tabs content... */}
        </Tabs>
      </div>

      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Gasto</DialogTitle>
            <DialogDescription>Registra un nuevo gasto para tu negocio.</DialogDescription>
          </DialogHeader>
          <Form {...expenseForm}>
            <form onSubmit={expenseForm.handleSubmit(handleExpenseSubmit)} className="space-y-4 py-4">
              <FormField control={expenseForm.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descripción</FormLabel><FormControl><Input {...field} placeholder="Ej: Compra de carne" /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={expenseForm.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>Monto</FormLabel><FormControl><Input type="number" step="0.01" {...field} placeholder="Ej: 50.00" /></FormControl><FormMessage /></FormItem>
              )}/>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsExpenseDialogOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>Guardar Gasto</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente "{deletingItem?.name}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isSubmitting}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
