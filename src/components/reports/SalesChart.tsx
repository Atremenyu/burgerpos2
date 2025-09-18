"use client"

import * as React from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useAppContext } from "@/context/AppContext";
import { format, subDays, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";

/**
 * @constant chartConfig
 * @description The configuration for the sales chart.
 */
const chartConfig = {
  sales: {
    label: "Ventas",
    color: "hsl(var(--primary))",
  },
};

/**
 * @component SalesChart
 * @description A component that displays a bar chart of the sales over the last 7 days.
 */
export default function SalesChart() {
  const { orders } = useAppContext();

  const data = React.useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 6);
    
    const salesByDay = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const formattedDate = format(date, 'yyyy-MM-dd');
        salesByDay.set(formattedDate, 0);
    }
    
    orders.forEach(order => {
        const orderDate = new Date(order.timestamp);
        if (isWithinInterval(orderDate, { start: startDate, end: today })) {
            const formattedDate = format(orderDate, 'yyyy-MM-dd');
            if (salesByDay.has(formattedDate)) {
                salesByDay.set(formattedDate, salesByDay.get(formattedDate)! + order.total);
            }
        }
    });

    const chartData = Array.from(salesByDay.entries())
        .map(([date, sales]) => ({
            date: format(new Date(date), "E", { locale: es }),
            sales: sales,
        }));

    return chartData;
  }, [orders]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Ventas de los Últimos 7 Días</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={data}>
             <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent />}
            />
            <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
