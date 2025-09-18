
"use client";

import * as React from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/types";
import { BellRing, Check, Clock, Flame, AlarmClock, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const NOTIFICATION_SOUND_URL = "https://actions.google.com/sounds/v1/alarms/dinner_bell_triangle.ogg";

/**
 * @constant statusConfig
 * @description Configuration for the display of different order statuses, including icons, colors, and labels.
 */
const statusConfig: Record<Order['status'], { icon: React.ElementType; color: string; label: string }> = {
    Pendiente: { icon: Clock, color: "bg-orange-500", label: "Pendiente" },
    Preparando: { icon: Flame, color: "bg-yellow-500", label: "Preparando" },
    Listo: { icon: Check, color: "bg-green-500", label: "Listo" },
    Entregado: { icon: Check, color: "bg-gray-500", label: "Entregado" },
};

/**
 * @component OrderStatusTracker
 * @description A component that displays a real-time list of active orders and their statuses.
 * It plays a notification sound when an order's status changes to "Listo".
 */
export default function OrderStatusTracker() {
    const { orders, updateOrderStatus } = useAppContext();
    const prevOrdersRef = React.useRef<Order[]>([]);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    const activeOrders = React.useMemo(() => {
        return orders
            .filter(o => o.status !== 'Entregado')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10); // Show last 10 active orders
    }, [orders]);

    React.useEffect(() => {
        // Initialize the audio element once on the client.
        if (typeof window !== "undefined" && !audioRef.current) {
            audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
            audioRef.current.preload = "auto";
        }
    }, []);

    React.useEffect(() => {
        const prevOrdersMap = new Map(prevOrdersRef.current.map(o => [o.id, o.status]));

        activeOrders.forEach(order => {
            const prevStatus = prevOrdersMap.get(order.id);
            // Check if the order was not 'Listo' before and now it is.
            if (prevStatus && prevStatus !== 'Listo' && order.status === 'Listo') {
                audioRef.current?.play().catch(err => console.error("Failed to play notification sound:", err));
            }
        });

        // Update previous orders ref for the next render.
        prevOrdersRef.current = orders;
    }, [orders, activeOrders]);

    return (
        <Card className="shadow-lg dark:bg-gray-800/60">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BellRing className="h-6 w-6" />
                    Estado de Pedidos
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-72">
                    {activeOrders.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                            No hay pedidos activos.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeOrders.map((order) => {
                                const config = statusConfig[order.status];
                                const Icon = config.icon;
                                return (
                                    <div key={order.id} className="flex items-center gap-4">
                                        <div className="flex-grow">
                                            <p className="font-semibold">Pedido #{order.id.slice(-4)}</p>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                              <span>{formatDistanceToNow(new Date(order.timestamp), { addSuffix: true, locale: es })}</span>
                                              {order.prepTime && order.status === 'Preparando' && (
                                                  <>
                                                      <Separator orientation="vertical" className="h-3 bg-border" />
                                                      <span className="flex items-center gap-1"><AlarmClock className="h-3 w-3" /> {order.prepTime} min</span>
                                                  </>
                                              )}
                                            </div>
                                        </div>
                                        <div className="flex items-center shrink-0 gap-2">
                                            <Badge className={cn("text-white", config.color)}>
                                                <Icon className="mr-1 h-3 w-3" />
                                                {config.label}
                                            </Badge>
                                             {order.status === 'Listo' && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-full text-green-500 hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-900"
                                                    onClick={() => updateOrderStatus(order.id, 'Entregado')}
                                                    aria-label="Marcar como entregado"
                                                >
                                                    <CheckCheck className="h-5 w-5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
