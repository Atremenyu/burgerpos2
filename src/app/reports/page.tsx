"use client";

import AppShell from "@/components/AppShell";
import StatCard from "@/components/reports/StatCard";
import SalesChart from "@/components/reports/SalesChart";
import TopProductsChart from "@/components/reports/TopProductsChart";
import { DollarSign, ShoppingCart, UtensilsCrossed } from "lucide-react";

export default function ReportsPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold">Panel de Informes</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
                title="Ventas de Hoy"
                value="$1,250.00"
                icon={DollarSign}
                change="+5.2% desde ayer"
            />
             <StatCard
                title="Pedidos Totales"
                value="124"
                icon={ShoppingCart}
                change="+10 pedidos desde ayer"
            />
             <StatCard
                title="Producto más Vendido"
                value="Hamburguesa Clásica"
                icon={UtensilsCrossed}
                change="78 unidades vendidas hoy"
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
