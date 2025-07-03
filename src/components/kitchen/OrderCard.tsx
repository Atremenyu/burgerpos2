"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/types";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: Order["status"]) => void;
}

const statusStyles = {
  Preparing: {
    badge: "bg-yellow-500 text-black",
    border: "border-yellow-500 animate-pulse",
  },
  Ready: {
    badge: "bg-green-500 text-white",
    border: "border-green-500",
  },
  Delivered: {
    badge: "bg-blue-500 text-white",
    border: "border-gray-500",
  },
};

export default function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const timeAgo = formatDistanceToNow(new Date(order.timestamp), { addSuffix: true });

  const handleNextStatus = () => {
    if (order.status === 'Preparing') {
      onUpdateStatus(order.id, 'Ready');
    } else if (order.status === 'Ready') {
      onUpdateStatus(order.id, 'Delivered');
    }
  };

  return (
    <Card
      className={cn(
        "shadow-lg flex flex-col transition-all duration-300",
        statusStyles[order.status].border,
        order.status === 'Delivered' && 'opacity-60 grayscale'
      )}
    >
      <CardHeader className="flex-row items-center justify-between p-4">
        <CardTitle className="text-lg">Order #{order.id.slice(-4)}</CardTitle>
        <Badge className={cn(statusStyles[order.status].badge)}>{order.status}</Badge>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <div className="space-y-2 text-sm">
          {order.items.map(item => (
            <div key={item.productId} className="flex justify-between">
              <span>{item.quantity} x {item.name}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <Separator className="my-3"/>
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
        {order.customerName && <p className="text-sm text-muted-foreground mt-2">Customer: {order.customerName}</p>}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 p-4 pt-0">
        <div className="flex items-center text-xs text-muted-foreground w-full">
            <Clock className="h-3 w-3 mr-1" />
            {timeAgo}
        </div>
        {order.status !== 'Delivered' && (
          <Button className="w-full" onClick={handleNextStatus}>
            {order.status === 'Preparing' ? 'Mark as Ready' : 'Mark as Delivered'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
