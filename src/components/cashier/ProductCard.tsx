"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, isCombo: boolean) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;

  return (
    <Card
      className={cn(
        "overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group flex flex-col",
        isOutOfStock && "opacity-50 grayscale"
      )}
    >
      <CardContent className="p-0 text-center flex-grow flex flex-col">
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
        <div className="p-3 flex-grow">
          <h3 className="font-semibold text-sm truncate">{product.name}</h3>
          <p className="text-muted-foreground text-xs mb-2">{product.category}</p>
          <p className="font-bold text-primary">${product.price.toFixed(2)}</p>
        </div>
        <div className="p-2 border-t mt-auto">
          {product.comboPrice ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => onAddToCart(product, false)}
                disabled={isOutOfStock}
              >
                Sencillo
              </Button>
              <Button
                size="sm"
                className="w-full"
                onClick={() => onAddToCart(product, true)}
                disabled={isOutOfStock}
              >
                Combo
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={() => onAddToCart(product, false)}
              disabled={isOutOfStock}
              size="sm"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
