
"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Minus, ShoppingBag, CheckCircle, CreditCard, DollarSign, Printer, Send } from "lucide-react";
import type { CartItem } from "@/types";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onClearCart: () => void;
}

export default function Cart({ cart, onUpdateQuantity, onClearCart }: CartProps) {
  const { addOrder } = useAppContext();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [paymentStep, setPaymentStep] = React.useState(1);
  const [paymentMethod, setPaymentMethod] = React.useState<"Efectivo" | "Tarjeta">("Tarjeta");
  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleProcessPayment = React.useCallback(() => {
    setPaymentStep(1);
    setIsModalOpen(true);
  }, []);
  
  const handleConfirmPayment = React.useCallback(() => {
    addOrder(cart, total, paymentMethod, customerName, customerPhone);
    setPaymentStep(3);
  }, [addOrder, cart, total, paymentMethod, customerName, customerPhone]);
  
  const handleCloseAndReset = React.useCallback(() => {
    setIsModalOpen(false);
    onClearCart();
    setCustomerName("");
    setCustomerPhone("");
    setPaymentMethod("Tarjeta");
  }, [onClearCart]);

  return (
    <>
      <Card className="h-full flex flex-col shadow-lg dark:bg-gray-800/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            Pedido Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-[calc(100vh-22rem)]">
            {cart.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                Tu carrito está vacío.
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint="burger food" />
                    <div className="flex-grow">
                      <p className="font-semibold truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-full hover:scale-110 transition-transform" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center font-bold">{item.quantity}</span>
                       <Button variant="outline" size="icon" className="h-7 w-7 rounded-full hover:scale-110 transition-transform" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
        {cart.length > 0 && (
          <CardFooter className="flex-col gap-2 !p-4">
            <Separator className="my-2" />
            <div className="flex justify-between w-full font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Button className="w-full bg-accent hover:bg-accent/90" onClick={handleProcessPayment}>
              Procesar Pago
            </Button>
            <Button variant="destructive" className="w-full" onClick={onClearCart}>
              Vaciar Carrito
            </Button>
          </CardFooter>
        )}
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          {paymentStep === 1 && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Detalles del Pedido</DialogTitle>
                <DialogDescription>
                    Ingresa los datos del cliente y selecciona el método de pago.
                 </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                 <div className="space-y-2">
                    <Label htmlFor="customerName">Nombre del Cliente (Opcional)</Label>
                    <Input id="customerName" placeholder="John Doe" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                  </div>
                <div className="space-y-2">
                    <Label htmlFor="customerPhone">Teléfono del Cliente (Opcional)</Label>
                    <Input id="customerPhone" placeholder="555-123-4567" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                   <Label>Método de Pago</Label>
                    <RadioGroup defaultValue={paymentMethod} onValueChange={(value: "Efectivo" | "Tarjeta") => setPaymentMethod(value)} className="flex gap-4">
                      <Label htmlFor="card" className={cn("flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground w-full", paymentMethod === 'Tarjeta' && 'border-primary')}>
                         <CreditCard className="mb-3 h-6 w-6" /> Tarjeta
                         <RadioGroupItem value="Tarjeta" id="card" className="sr-only"/>
                      </Label>
                      <Label htmlFor="cash" className={cn("flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground w-full", paymentMethod === 'Efectivo' && 'border-primary')}>
                        <DollarSign className="mb-3 h-6 w-6" /> Efectivo
                         <RadioGroupItem value="Efectivo" id="cash" className="sr-only"/>
                      </Label>
                    </RadioGroup>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button onClick={() => setPaymentStep(2)}>Siguiente (${total.toFixed(2)})</Button>
              </DialogFooter>
            </>
          )}
          {paymentStep === 2 && (
             <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">Finalizar Pedido</DialogTitle>
                  <DialogDescription>
                    Verifica los detalles y envía el pedido a la cocina para su preparación.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="p-4 border rounded-md space-y-2 bg-muted/50">
                    <h4 className="font-semibold mb-2 text-center">Resumen del Pedido</h4>
                    <div className="flex justify-between"><span className="text-muted-foreground">Cliente:</span> <strong>{customerName || 'N/A'}</strong></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Teléfono:</span> <strong>{customerPhone || 'N/A'}</strong></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Método:</span> <strong>{paymentMethod}</strong></div>
                    <Separator className="my-2"/>
                    <div className="flex justify-between text-lg"><span className="font-semibold">Total:</span> <strong className="text-primary">${total.toFixed(2)}</strong></div>
                  </div>
                  <Button variant="outline" className="w-full">
                       <Printer className="mr-2 h-4 w-4" />
                       Imprimir Ticket
                  </Button>
                </div>
                 <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
                  <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setPaymentStep(1)}>Atrás</Button>
                  <Button className="bg-accent hover:bg-accent/90 w-full sm:w-auto" onClick={handleConfirmPayment}>
                    <Send className="mr-2 h-4 w-4" />
                    Confirmar y Enviar
                  </Button>
                </DialogFooter>
            </>
          )}
          {paymentStep === 3 && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <CheckCircle className="h-20 w-20 text-green-500 mb-4 animate-in zoom-in-50" />
              <h2 className="text-2xl font-bold mb-2">¡Pedido Enviado!</h2>
              <p className="text-muted-foreground">El pedido ha sido enviado a la cocina.</p>
              <Button className="mt-6 w-full" onClick={handleCloseAndReset}>Hecho</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
