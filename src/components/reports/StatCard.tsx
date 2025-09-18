"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

/**
 * @typedef {object} StatCardProps
 * @property {string} title - The title of the statistic.
 * @property {string} value - The value of the statistic.
 * @property {LucideIcon} icon - The icon to display.
 * @property {string} [change] - An optional string to display a change in the statistic.
 */
interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: string;
}

/**
 * @component StatCard
 * @description A card component to display a single statistic with a title, value, and icon.
 * @param {StatCardProps} props - Props for the component.
 */
export default function StatCard({ title, value, icon: Icon, change }: StatCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && <p className="text-xs text-muted-foreground">{change}</p>}
      </CardContent>
    </Card>
  );
}
