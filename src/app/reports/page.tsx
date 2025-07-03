"use client";

import * as React from "react";
import AppShell from "@/components/AppShell";
import StatCard from "@/components/reports/StatCard";
import SalesChart from "@/components/reports/SalesChart";
import TopProductsChart from "@/components/reports/TopProductsChart";
import { DollarSign, ShoppingCart, UtensilsCrossed, Calendar as CalendarIcon, History } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { isWithinInterval, startOfMonth, format, isSameDay, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { Order, Product } from "@/types";

const calculateStats = (ordersToProcess: Order[], products: Product[]) => {
  if (ordersToProcess.length === 0) {
    return {
      totalSales: 0,
      orderCount: 0,
      topProduct: { name: "N/A", units: "0 unidades" },
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

  return { totalSales, orderCount, topProduct };
};

export default function ReportsPage() {
  const { orders, products } = useAppContext();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  const monthlyStats = React.useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthlyOrders = orders.filter(order => isWithinInterval(new Date(order.timestamp), { start: monthStart, end: today }));
    return calculateStats(monthlyOrders, products);
  }, [orders, products]);

  const dailyStats = React.useMemo(() => {
    if (!selectedDate) {
      return calculateStats([], products);
    }
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);
    const dailyOrders = orders.filter(order => isWithinInterval(new Date(order.timestamp), { start: dayStart, end: dayEnd }));
    return calculateStats(dailyOrders, products);
  }, [orders, products, selectedDate]);
  
  const dailyOrders = React.useMemo(() => {
    if (!selectedDate) return [];
    return orders
      .filter(order => isSameDay(new Date(order.timestamp), selectedDate))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [orders, selectedDate]);
  
  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold">Panel de Informes</h1>
        <Tabs defaultValue="daily">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Informe Diario</TabsTrigger>
            <TabsTrigger value="monthly">Resumen Mensual</TabsTrigger>
            <TabsTrigger value="history">Historial de Pedidos</TabsTrigger>
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
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                     <StatCard
                        title="Ventas del Día"
                        value={`$${dailyStats.totalSales.toFixed(2)}`}
                        icon={DollarSign}
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Ventas del Mes"
                value={`$${monthlyStats.totalSales.toFixed(2)}`}
                icon={DollarSign}
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
                                        <TableCell>{order.customerName || 'N/A'}</TableCell>
                                        <TableCell>${order.total.toFixed(2)}</TableCell>
                                        <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">Aún no se han registrado pedidos.</TableCell>
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
    </AppShell>
  );
}
