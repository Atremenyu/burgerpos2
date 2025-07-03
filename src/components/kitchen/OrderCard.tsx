"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/types";
import { cn } from "@/lib/utils";
import { Clock, Timer } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: Order["status"], prepTime?: number) => void;
}

const statusStyles = {
  Pendiente: {
    badge: "bg-orange-500 text-white",
    border: "border-orange-500",
  },
  Preparando: {
    badge: "bg-yellow-500 text-black",
    border: "border-yellow-500 animate-pulse",
  },
  Listo: {
    badge: "bg-green-500 text-white",
    border: "border-green-500",
  },
  Entregado: {
    badge: "bg-blue-500 text-white",
    border: "border-gray-500",
  },
};

export default function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const [isAccepting, setIsAccepting] = React.useState(false);
  const [prepTime, setPrepTime] = React.useState('');
  const timeAgo = formatDistanceToNow(new Date(order.timestamp), { addSuffix: true, locale: es });

  const handleNextStatus = () => {
    if (order.status === 'Preparando') {
      onUpdateStatus(order.id, 'Listo');
    } else if (order.status === 'Listo') {
      onUpdateStatus(order.id, 'Entregado');
    }
  };
  
  const handleAcceptOrder = () => {
    const time = parseInt(prepTime, 10);
    if (!isNaN(time) && time > 0) {
        onUpdateStatus(order.id, 'Preparando', time);
        setIsAccepting(false);
        setPrepTime('');
    }
  };

  const renderFooterAction = () => {
    if (order.status === 'Pendiente') {
      return (
        <Dialog open={isAccepting} onOpenChange={setIsAccepting}>
          <DialogTrigger asChild>
            <Button className="w-full" onClick={() => setIsAccepting(true)}>Aceptar Pedido</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Estimar tiempo de preparación</DialogTitle>
              <DialogDescription>
                Introduce el tiempo en minutos que tardará en preparar este pedido.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="prepTime" className="text-left">Tiempo de preparación (minutos)</Label>
              <Input 
                id="prepTime" 
                type="number" 
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="Ej: 15"
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAccepting(false); setPrepTime(''); }}>Cancelar</Button>
              <Button onClick={handleAcceptOrder} disabled={!prepTime || parseInt(prepTime, 10) <= 0}>Confirmar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    if (order.status !== 'Entregado') {
       return (
          <Button className="w-full" onClick={handleNextStatus}>
            {order.status === 'Preparando' ? 'Marcar como Listo' : 'Marcar como Entregado'}
          </Button>
       )
    }

    return null;
  };

  return (
    <Card
      className={cn(
        "shadow-lg flex flex-col transition-all duration-300",
        statusStyles[order.status].border,
        order.status === 'Entregado' && 'opacity-60 grayscale'
      )}
    >
      <CardHeader className="flex-row items-center justify-between p-4">
        <CardTitle className="text-lg">Pedido #{order.id.slice(-4)}</CardTitle>
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
        {order.customerName && <p className="text-sm text-muted-foreground mt-2">Cliente: {order.customerName}</p>}
        {order.status === 'Preparando' && order.prepTime && (
          <div className="flex items-center text-sm text-muted-foreground mt-3 pt-3 border-t">
            <Timer className="h-4 w-4 mr-2 text-primary" />
            <span className="font-semibold">Tiempo estimado: {order.prepTime} min</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 p-4 pt-0">
        <div className="flex items-center text-xs text-muted-foreground w-full">
            <Clock className="h-3 w-3 mr-1" />
            {timeAgo}
        </div>
        {renderFooterAction()}
      </CardFooter>
    </Card>
  );
}
