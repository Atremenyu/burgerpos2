"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const data = [
  { date: "Lun", sales: Math.floor(Math.random() * 1000) + 500 },
  { date: "Mar", sales: Math.floor(Math.random() * 1000) + 500 },
  { date: "Mié", sales: Math.floor(Math.random() * 1000) + 500 },
  { date: "Jue", sales: Math.floor(Math.random() * 1000) + 500 },
  { date: "Vie", sales: Math.floor(Math.random() * 1000) + 500 },
  { date: "Sáb", sales: Math.floor(Math.random() * 1000) + 1000 },
  { date: "Dom", sales: Math.floor(Math.random() * 1000) + 1200 },
]

const chartConfig = {
  sales: {
    label: "Ventas",
    color: "hsl(var(--primary))",
  },
};

export default function SalesChart() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Ventas de esta Semana</CardTitle>
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
                content={<ChartTooltipContent />}
                cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
