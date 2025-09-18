
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
import { Plus, Minus, ShoppingBag, CheckCircle, CreditCard, DollarSign, Printer, Send, Utensils, Package, Smartphone, Landmark } from "lucide-react";
import type { CartItem, Customer, Order, PaymentMethod } from "@/types";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * @typedef {object} CartProps
 * @property {CartItem[]} cart - The list of items currently in the cart.
 * @property {(cartItemId: string, quantity: number) => void} onUpdateQuantity - Callback to update the quantity of a cart item.
 * @property {() => void} onClearCart - Callback to clear all items from the cart.
 */
interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onClearCart: () => void;
}

const paymentMethodIcons: Record<string, React.ElementType> = {
  'Tarjeta': CreditCard,
  'Efectivo': DollarSign,
  'Transferencia': Landmark,
};

const orderTypeIcons: Record<string, React.ElementType> = {
  'Comedor': Utensils,
  'Para Llevar': Package,
};

/**
 * @component Cart
 * @description A component that displays the current cart, handles the payment process, and creates new orders.
 * @param {CartProps} props - Props for the component.
 */
export default function Cart({ cart, onUpdateQuantity, onClearCart }: CartProps) {
  const { addOrder, customers, orderTypes, paymentMethods, deliveryPlatforms } = useAppContext();

  // State for the payment modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [paymentStep, setPaymentStep] = React.useState(1); // 1: Details, 2: Summary, 3: Confirmation

  // State for order details
  const [paymentMethod, setPaymentMethod] = React.useState<string>(paymentMethods.find(p => !p.isPlatformPayment)?.name || '');
  const [orderType, setOrderType] = React.useState<string>(orderTypes[0]?.name || '');
  const [deliveryPlatform, setDeliveryPlatform] = React.useState<string | undefined>();
  const [transactionId, setTransactionId] = React.useState("");

  // State for customer details
  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Customer[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = React.useState(false);


  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  React.useEffect(() => {
    const platform = deliveryPlatforms.find(p => p.name === deliveryPlatform);
    const platformPaymentMethod = paymentMethods.find(p => p.isPlatformPayment);

    if (platform?.requiresPlatformPayment && platformPaymentMethod) {
      setPaymentMethod(platformPaymentMethod.name);
    } else {
      const firstNonPlatformMethod = paymentMethods.find(p => !p.isPlatformPayment);
      if (paymentMethod === platformPaymentMethod?.name) {
        setPaymentMethod(firstNonPlatformMethod?.name || '');
      }
    }
  }, [deliveryPlatform, deliveryPlatforms, paymentMethods, paymentMethod]);


  const handleProcessPayment = React.useCallback(() => {
    setPaymentStep(1);
    setIsModalOpen(true);
  }, []);
  
  const handleConfirmPayment = React.useCallback(() => {
    addOrder(cart, total, paymentMethod, orderType, deliveryPlatform, customerName, customerPhone, transactionId);
    setPaymentStep(3);
  }, [addOrder, cart, total, paymentMethod, orderType, deliveryPlatform, customerName, customerPhone, transactionId]);
  
  const handleCloseAndReset = React.useCallback(() => {
    setIsModalOpen(false);
    onClearCart();
    setCustomerName("");
    setCustomerPhone("");
    setPaymentMethod(paymentMethods.find(p => !p.isPlatformPayment)?.name || '');
    setOrderType(orderTypes[0]?.name || '');
    setDeliveryPlatform(undefined);
    setTransactionId("");
  }, [onClearCart, paymentMethods, orderTypes]);
  
  const handleNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerName(value);

    if (value) {
      const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setIsSuggestionsOpen(true);
    } else {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
    }
  }, [customers]);
  
  const handleSuggestionClick = React.useCallback((customer: Customer) => {
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setIsSuggestionsOpen(false);
  }, []);

  const selectedPlatform = deliveryPlatforms.find(p => p.name === deliveryPlatform);
  const platformPayment = paymentMethods.find(p => p.isPlatformPayment);
  const userSelectablePaymentMethods = paymentMethods.filter(p => !p.isPlatformPayment);

  return (
    <>
      <Card className="h-full flex flex-col shadow-lg dark:bg-gray-800/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            Pedido Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 min-h-0">
          <ScrollArea className="h-full">
            {cart.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground p-8">
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
      
      <Dialog open={isModalOpen} onOpenChange={(isOpen) => { if (!isOpen) { setPaymentStep(1); } setIsModalOpen(isOpen)}}>
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
                 <div className="space-y-2 relative">
                    <Label htmlFor="customerName">Nombre del Cliente (Opcional)</Label>
                    <Input
                      id="customerName"
                      placeholder="John Doe"
                      value={customerName}
                      onChange={handleNameChange}
                      onFocus={() => customerName && setIsSuggestionsOpen(true)}
                      onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 150)}
                      autoComplete="off"
                    />
                    {isSuggestionsOpen && (
                      <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
                        <CardContent className="p-1">
                          {suggestions.length > 0 ? (
                            suggestions.map((customer) => (
                              <button
                                key={customer.name}
                                type="button"
                                className="w-full text-left p-2 text-sm rounded-md hover:bg-accent focus:bg-accent focus:outline-none"
                                onMouseDown={() => handleSuggestionClick(customer)}
                              >
                                <p className="font-medium">{customer.name}</p>
                                {customer.phone && (
                                  <p className="text-xs text-muted-foreground">{customer.phone}</p>
                                )}
                              </button>
                            ))
                          ) : (
                             <div className="p-2 text-center text-sm text-muted-foreground">
                              Se creará un nuevo cliente.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                <div className="space-y-2">
                    <Label htmlFor="customerPhone">Teléfono del Cliente (Opcional)</Label>
                    <Input id="customerPhone" placeholder="555-123-4567" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                </div>

                <div className="space-y-2">
                    <Label>Tipo de Pedido</Label>
                    <RadioGroup value={orderType} onValueChange={(value: string) => {
                        setOrderType(value);
                        if (value !== 'Para Llevar') setDeliveryPlatform(undefined);
                    }} className="grid grid-cols-2 gap-4">
                        {orderTypes.map(ot => {
                          const Icon = orderTypeIcons[ot.name] || Utensils;
                          return (
                            <Label key={ot.id} htmlFor={ot.id} className={cn("flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground w-full", orderType === ot.name && 'border-primary')}>
                                <Icon className="mb-3 h-6 w-6" /> {ot.name}
                                <RadioGroupItem value={ot.name} id={ot.id} className="sr-only"/>
                            </Label>
                          )
                        })}
                    </RadioGroup>
                </div>
                {orderType === 'Para Llevar' && (
                    <div className="space-y-2">
                        <Label htmlFor="deliveryPlatform">Plataforma de Entrega</Label>
                        <Select onValueChange={(value: string) => setDeliveryPlatform(value)} value={deliveryPlatform}>
                            <SelectTrigger id="deliveryPlatform">
                                <SelectValue placeholder="Selecciona una plataforma" />
                            </SelectTrigger>
                            <SelectContent>
                                {deliveryPlatforms.map(dp => (
                                  <SelectItem key={dp.id} value={dp.name}>{dp.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-2">
                   <Label>Método de Pago</Label>
                   {selectedPlatform?.requiresPlatformPayment && platformPayment ? (
                       <div className="flex flex-col items-center justify-center rounded-md border-2 border-primary bg-muted p-4 h-[106px]">
                           <Smartphone className="mb-3 h-6 w-6" />
                           <p className="font-semibold">{platformPayment.name}</p>
                       </div>
                   ) : (
                    <RadioGroup value={paymentMethod} onValueChange={(value: string) => setPaymentMethod(value)} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {userSelectablePaymentMethods.map(pm => {
                        const Icon = paymentMethodIcons[pm.name] || CreditCard;
                        return (
                          <Label key={pm.id} htmlFor={pm.id} className={cn("flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground", paymentMethod === pm.name && 'border-primary')}>
                             <Icon className="mb-3 h-6 w-6" /> {pm.name}
                             <RadioGroupItem value={pm.name} id={pm.id} className="sr-only"/>
                          </Label>
                        )
                      })}
                    </RadioGroup>
                   )}
                </div>
                 {paymentMethod === 'Transferencia' && (
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="transactionId">ID de Transacción</Label>
                      <Input 
                        id="transactionId" 
                        placeholder="Ingresa el SKU o ID" 
                        value={transactionId} 
                        onChange={(e) => setTransactionId(e.target.value)} 
                      />
                    </div>
                  )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button onClick={() => setPaymentStep(2)} disabled={(orderType === 'Para Llevar' && !deliveryPlatform) || (paymentMethod === 'Transferencia' && !transactionId.trim())}>Siguiente (${total.toFixed(2)})</Button>
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
                    <div className="flex justify-between"><span className="text-muted-foreground">Tipo:</span> <strong>{orderType} {orderType === 'Para Llevar' && deliveryPlatform ? `(${deliveryPlatform})` : ''}</strong></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Método:</span> <strong>{paymentMethod}</strong></div>
                    {paymentMethod === 'Transferencia' && transactionId && (
                      <div className="flex justify-between"><span className="text-muted-foreground">ID Trans.:</span> <strong className="truncate">{transactionId}</strong></div>
                    )}
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

    