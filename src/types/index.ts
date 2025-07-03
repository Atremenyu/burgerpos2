export type Product = {
  id: string;
  name: string;
  price: number;
  comboPrice?: number;
  category: string;
  image: string;
  stock: number;
  ingredients: { ingredientId: string; quantity: number }[];
};

export type Ingredient = {
  id: string;
  name:string;
  stock: number;
  unit: 'g' | 'ml' | 'pcs';
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  timestamp: string;
  status: 'Preparando' | 'Listo' | 'Entregado';
  paymentMethod: 'Efectivo' | 'Tarjeta';
  customerName?: string;
  customerPhone?: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  timestamp: string;
};
