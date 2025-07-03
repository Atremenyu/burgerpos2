
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
  paymentMethod: 'Efectivo' | 'Tarjeta' | 'Pago de Plataforma' | 'Transferencia';
  orderType: 'Comedor' | 'Para Llevar';
  deliveryPlatform?: 'Uber' | 'Didi' | 'Whatsapp' | 'Teléfono';
  customerName?: string;
  customerPhone?: string;
  prepTime?: number;
  userId: string;
  userName: string;
  shiftId: string;
  transactionId?: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  timestamp: string;
};

export type Customer = {
  name: string;
  phone: string;
};

export type User = {
  id: string;
  name: string;
  pin: string;
  roleId: string;
};

export type Role = {
  id: string;
  name: string;
  permissions: string[];
};

export type Shift = {
  id: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime?: string;
  orders: Order[];
  totalSales: number;
};

export type CurrentUser = User & {
    role: Role;
};
