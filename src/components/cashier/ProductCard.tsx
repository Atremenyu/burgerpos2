"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, isCombo: boolean) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  const addToCartButton = (
    <Button
      className="w-full rounded-t-none"
      onClick={() => onAddToCart(product, false)}
      disabled={isOutOfStock}
      size="sm"
    >
      <PlusCircle className="mr-2 h-4 w-4" /> Añadir
    </Button>
  );

  const comboAddToCartButton = (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="w-full rounded-t-none"
          disabled={isOutOfStock}
          size="sm"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" className="justify-start" onClick={() => onAddToCart(product, false)}>
            Sencillo (${product.price.toFixed(2)})
          </Button>
          {product.comboPrice && (
            <Button variant="ghost" className="justify-start" onClick={() => onAddToCart(product, true)}>
              Combo (${product.comboPrice.toFixed(2)})
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );


  return (
    <Card
      className={cn(
        "overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group",
        isOutOfStock && "opacity-50 grayscale"
      )}
    >
      <CardContent className="p-0 text-center">
        <div className="relative">
          <Image
            src={product.image}
            alt={product.name}
            width={300}
            height={300}
            className="object-cover w-full h-32"
            data-ai-hint="burger food"
          />
           {isOutOfStock && <Badge variant="destructive" className="absolute top-2 right-2">Agotado</Badge>}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm truncate">{product.name}</h3>
          <p className="text-muted-foreground text-xs mb-2">{product.category}</p>
          <p className="font-bold text-primary">${product.price.toFixed(2)}</p>
        </div>
        {product.comboPrice ? comboAddToCartButton : addToCartButton}
      </CardContent>
    </Card>
  );
}
