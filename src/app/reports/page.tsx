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
        <h1 className="text-3xl font-bold">Reports Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
                title="Today's Sales"
                value="$1,250.00"
                icon={DollarSign}
                change="+5.2% from yesterday"
            />
             <StatCard
                title="Total Orders"
                value="124"
                icon={ShoppingCart}
                change="+10 orders from yesterday"
            />
             <StatCard
                title="Top Selling Item"
                value="Classic Burger"
                icon={UtensilsCrossed}
                change="78 units sold today"
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
