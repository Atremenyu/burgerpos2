"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Minus, X, ShoppingBag, CheckCircle, CreditCard, DollarSign } from "lucide-react";
import type { CartItem } from "@/types";
import { cn } from "@/lib/utils";

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
}

export default function Cart({ cart, onUpdateQuantity, onClearCart }: CartProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [paymentStep, setPaymentStep] = React.useState(1);
  const [paymentMethod, setPaymentMethod] = React.useState<"Cash" | "Card">("Card");
  const [customerName, setCustomerName] = React.useState("");

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleProcessPayment = () => {
    setIsModalOpen(true);
    setPaymentStep(1);
  };
  
  const handleConfirmPayment = () => {
    // Here you would typically call an API to process the order
    setPaymentStep(2);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    onClearCart();
    setCustomerName("");
    setPaymentMethod("Card");
  };

  return (
    <>
      <Card className="h-full flex flex-col shadow-lg dark:bg-gray-800/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            Current Order
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-0">
          <ScrollArea className="h-[calc(100vh-22rem)]">
            {cart.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                Your cart is empty.
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {cart.map(item => (
                  <div key={item.productId} className="flex items-center gap-4">
                    <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint="burger food" />
                    <div className="flex-grow">
                      <p className="font-semibold truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-full hover:scale-110 transition-transform" onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center font-bold">{item.quantity}</span>
                       <Button variant="outline" size="icon" className="h-7 w-7 rounded-full hover:scale-110 transition-transform" onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}>
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
              Process Payment
            </Button>
            <Button variant="destructive" className="w-full" onClick={onClearCart}>
              Clear Cart
            </Button>
          </CardFooter>
        )}
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          {paymentStep === 1 && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Confirm Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                 <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name (Optional)</Label>
                    <Input id="customerName" placeholder="John Doe" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                  </div>
                <div className="space-y-2">
                   <Label>Payment Method</Label>
                    <RadioGroup defaultValue={paymentMethod} onValueChange={(value: "Cash" | "Card") => setPaymentMethod(value)} className="flex gap-4">
                      <Label htmlFor="card" className={cn("flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground w-full", paymentMethod === 'Card' && 'border-primary')}>
                         <CreditCard className="mb-3 h-6 w-6" /> Card
                         <RadioGroupItem value="Card" id="card" className="sr-only"/>
                      </Label>
                      <Label htmlFor="cash" className={cn("flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground w-full", paymentMethod === 'Cash' && 'border-primary')}>
                        <DollarSign className="mb-3 h-6 w-6" /> Cash
                         <RadioGroupItem value="Cash" id="cash" className="sr-only"/>
                      </Label>
                    </RadioGroup>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button className="bg-accent hover:bg-accent/90" onClick={handleConfirmPayment}>Pay ${total.toFixed(2)}</Button>
              </DialogFooter>
            </>
          )}
          {paymentStep === 2 && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <CheckCircle className="h-20 w-20 text-green-500 mb-4 animate-in zoom-in-50" />
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground">Your order has been placed.</p>
              <Button className="mt-6 w-full" onClick={handleCloseModal}>Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
