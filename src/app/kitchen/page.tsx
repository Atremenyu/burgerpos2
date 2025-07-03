
"use client";

import * as React from "react";
import AppShell from "@/components/AppShell";
import OrderCard from "@/components/kitchen/OrderCard";
import type { Order } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";

export default function KitchenPage() {
  const { orders, updateOrderStatus } = useAppContext();

  const pendingOrders = orders.filter(o => o.status === 'Pendiente');
  const preparingOrders = orders.filter(o => o.status === 'Preparando');
  const readyOrders = orders.filter(o => o.status === 'Listo');
  const deliveredOrders = orders.filter(o => o.status === 'Entregado');

  return (
    <AppShell>
      <div className="flex flex-col h-full">
        <h1 className="text-3xl font-bold mb-6">Sistema de Pantalla de Cocina</h1>
        <Tabs defaultValue="pending" className="flex-grow">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pendiente ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="preparing">Preparando ({preparingOrders.length})</TabsTrigger>
            <TabsTrigger value="ready">Listo ({readyOrders.length})</TabsTrigger>
            <TabsTrigger value="delivered">Entregado ({deliveredOrders.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {pendingOrders.map(order => (
                   <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <OrderCard order={order} onUpdateStatus={updateOrderStatus} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
          <TabsContent value="preparing" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {preparingOrders.map(order => (
                   <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <OrderCard order={order} onUpdateStatus={updateOrderStatus} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
          <TabsContent value="ready" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
               <AnimatePresence>
                {readyOrders.map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <OrderCard order={order} onUpdateStatus={updateOrderStatus} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
          <TabsContent value="delivered" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
               <AnimatePresence>
                {deliveredOrders.map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <OrderCard order={order} onUpdateStatus={updateOrderStatus} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
