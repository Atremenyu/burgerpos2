"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartTooltipContent } from "@/components/ui/chart";

const data = [
  { date: "Mon", sales: Math.floor(Math.random() * 1000) + 500 },
  { date: "Tue", sales: Math.floor(Math.random() * 1000) + 500 },
  { date: "Wed", sales: Math.floor(Math.random() * 1000) + 500 },
  { date: "Thu", sales: Math.floor(Math.random() * 1000) + 500 },
  { date: "Fri", sales: Math.floor(Math.random() * 1000) + 500 },
  { date: "Sat", sales: Math.floor(Math.random() * 1000) + 1000 },
  { date: "Sun", sales: Math.floor(Math.random() * 1000) + 1200 },
]

export default function SalesChart() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Sales This Week</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
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
            <Tooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
