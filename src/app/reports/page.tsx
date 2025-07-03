"use client";

import * as React from "react";
import AppShell from "@/components/AppShell";
import StatCard from "@/components/reports/StatCard";
import SalesChart from "@/components/reports/SalesChart";
import TopProductsChart from "@/components/reports/TopProductsChart";
import { DollarSign, ShoppingCart, UtensilsCrossed } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { isToday } from "date-fns";

export default function ReportsPage() {
  const { orders, products } = useAppContext();

  const todaysOrders = React.useMemo(() => {
    return orders.filter(order => isToday(new Date(order.timestamp)));
  }, [orders]);

  const salesToday = React.useMemo(() => {
    return todaysOrders.reduce((total, order) => total + order.total, 0);
  }, [todaysOrders]);

  const topProduct = React.useMemo(() => {
    if (todaysOrders.length === 0) {
      return { name: "N/A", units: "0 unidades vendidas hoy" };
    }

    const productCounts = new Map<string, number>();
    todaysOrders.forEach(order => {
      order.items.forEach(item => {
        productCounts.set(item.productId, (productCounts.get(item.productId) || 0) + item.quantity);
      });
    });

    if (productCounts.size === 0) {
      return { name: "N/A", units: "0 unidades vendidas hoy" };
    }

    const topProductId = [...productCounts.entries()].reduce((a, b) => b[1] > a[1] ? b : a)[0];
    const topProductDetails = products.find(p => p.id === topProductId);
    const unitsSold = productCounts.get(topProductId) || 0;

    return {
      name: topProductDetails ? topProductDetails.name : "Producto Desconocido",
      units: `${unitsSold} unidades vendidas hoy`
    };
  }, [todaysOrders, products]);

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold">Panel de Informes</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
                title="Ventas de Hoy"
                value={`$${salesToday.toFixed(2)}`}
                icon={DollarSign}
            />
             <StatCard
                title="Pedidos de Hoy"
                value={todaysOrders.length.toString()}
                icon={ShoppingCart}
            />
             <StatCard
                title="Producto más Vendido (Hoy)"
                value={topProduct.name}
                icon={UtensilsCrossed}
                change={topProduct.units}
            />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
            <SalesChart />
            <TopProductsChart />
        </div>
      </div>
    </AppShell>
  );
}
