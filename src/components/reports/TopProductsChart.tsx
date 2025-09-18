"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useAppContext } from "@/context/AppContext"

/**
 * @constant chartConfig
 * @description The configuration for the top products chart.
 */
const chartConfig = {
    sold: {
        label: "Unidades Vendidas",
    }
}

/**
 * @component TopProductsChart
 * @description A component that displays a pie chart of the top 5 best-selling products.
 */
export default function TopProductsChart() {
  const { orders, products } = useAppContext();

  const chartData = React.useMemo(() => {
    const productCounts = new Map<string, number>();
    orders.forEach(order => {
        order.items.forEach(item => {
            productCounts.set(item.productId, (productCounts.get(item.productId) || 0) + item.quantity);
        });
    });

    const sortedProducts = [...productCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return sortedProducts.map(([productId, sold], index) => {
        const productInfo = products.find(p => p.id === productId);
        return {
            product: productInfo ? productInfo.name : "Desconocido",
            sold,
            fill: `hsl(var(--chart-${index + 1}))`
        };
    });
  }, [orders, products]);

  const totalSold = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.sold, 0)
  }, [chartData])

  return (
    <Card className="flex flex-col shadow-lg">
      <CardHeader className="items-center pb-0">
        <CardTitle>Productos más Vendidos</CardTitle>
        <CardDescription>Top 5 Histórico</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="sold"
                nameKey="product"
                innerRadius={60}
                strokeWidth={5}
                activeIndex={0}
                activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 10} />
                    <Sector
                      {...props}
                      outerRadius={outerRadius}
                      innerRadius={props.innerRadius! + 4}
                    />
                  </g>
                )}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalSold.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Unidades
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No hay datos de ventas para mostrar.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
