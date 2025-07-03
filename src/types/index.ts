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

export type Category = {
  id: string;
  name: string;
};

export type CartItem = {
  id: string; // e.g. 'prod1-single' or 'prod1-combo'
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
  status: 'Pendiente' | 'Preparando' | 'Listo' | 'Entregado';
  paymentMethod: 'Efectivo' | 'Tarjeta';
  customerName?: string;
  customerPhone?: string;
  prepTime?: number;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  timestamp: string;
};
