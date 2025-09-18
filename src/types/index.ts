/**
 * @typedef {object} Product
 * @property {string} id - The unique identifier for the product.
 * @property {string} name - The name of the product.
 * @property {number} price - The price of the product when sold individually.
 * @property {number} [comboPrice] - The optional price of the product when sold as a combo.
 * @property {string} category - The category the product belongs to.
 * @property {string} image - The URL for the product's image.
 * @property {number} stock - The current stock level of the product.
 * @property {object[]} ingredients - The list of ingredients required to make the product.
 * @property {string} ingredients.ingredientId - The ID of the ingredient.
 * @property {number} ingredients.quantity - The quantity of the ingredient required.
 */
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

/**
 * @typedef {object} Ingredient
 * @property {string} id - The unique identifier for the ingredient.
 * @property {string} name - The name of the ingredient.
 * @property {number} stock - The current stock level of the ingredient.
 * @property {'g' | 'ml' | 'pcs'} unit - The unit of measurement for the ingredient stock.
 */
export type Ingredient = {
  id: string;
  name:string;
  stock: number;
  unit: 'g' | 'ml' | 'pcs';
};

/**
 * @typedef {object} Category
 * @property {string} id - The unique identifier for the category.
 * @property {string} name - The name of the category.
 */
export type Category = {
  id: string;
  name: string;
};

/**
 * @typedef {object} CartItem
 * @property {string} id - A unique identifier for the cart item instance (e.g., 'prod1-single' or 'prod1-combo').
 * @property {string} productId - The ID of the product in the cart.
 * @property {string} name - The name of the item in the cart (can include modifiers like 'Combo').
 * @property {number} price - The price of a single unit of this cart item.
 * @property {number} quantity - The number of units of this item in the cart.
 * @property {string} image - The URL for the item's image.
 */
export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

/**
 * @typedef {object} OrderType
 * @property {string} id - The unique identifier for the order type.
 * @property {string} name - The name of the order type (e.g., 'Comedor', 'Para Llevar').
 */
export type OrderType = { 
  id: string; 
  name: string 
};

/**
 * @typedef {object} PaymentMethod
 * @property {string} id - The unique identifier for the payment method.
 * @property {string} name - The name of the payment method (e.g., 'Tarjeta', 'Efectivo').
 * @property {boolean} isPlatformPayment - Indicates if this method is handled by a third-party delivery platform.
 */
export type PaymentMethod = { 
  id: string; 
  name: string; 
  isPlatformPayment: boolean 
};

/**
 * @typedef {object} DeliveryPlatform
 * @property {string} id - The unique identifier for the delivery platform.
 * @property {string} name - The name of the delivery platform (e.g., 'Uber', 'Whatsapp').
 * @property {boolean} requiresPlatformPayment - Indicates if orders from this platform must use a platform-specific payment method.
 */
export type DeliveryPlatform = { 
  id: string; 
  name: string; 
  requiresPlatformPayment: boolean 
};

/**
 * @typedef {object} Order
 * @property {string} id - The unique identifier for the order.
 * @property {CartItem[]} items - The list of items included in the order.
 * @property {number} total - The total price of the order.
 * @property {string} timestamp - The ISO 8601 timestamp when the order was created.
 * @property {'Pendiente' | 'Preparando' | 'Listo' | 'Entregado'} status - The current status of the order.
 * @property {string} paymentMethod - The name of the payment method used.
 * @property {string} orderType - The type of the order (e.g., 'Comedor').
 * @property {string} [deliveryPlatform] - The optional delivery platform used for the order.
 * @property {string} [customerName] - The optional name of the customer.
 * @property {string} [customerPhone] - The optional phone number of the customer.
 * @property {number} [prepTime] - The optional time in seconds it took to prepare the order.
 * @property {string} userId - The ID of the user who created the order.
 * @property {string} userName - The name of the user who created the order.
 * @property {string} shiftId - The ID of the shift during which the order was created.
 * @property {string} [transactionId] - The optional ID for the payment transaction.
 */
export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  timestamp: string;
  status: 'Pendiente' | 'Preparando' | 'Listo' | 'Entregado';
  paymentMethod: string;
  orderType: string;
  deliveryPlatform?: string;
  customerName?: string;
  customerPhone?: string;
  prepTime?: number;
  userId: string;
  userName: string;
  shiftId: string;
  transactionId?: string;
};

/**
 * @typedef {object} Expense
 * @property {string} id - The unique identifier for the expense.
 * @property {string} description - A description of the expense.
 * @property {number} amount - The amount of the expense.
 * @property {string} timestamp - The ISO 8601 timestamp when the expense was recorded.
 */
export type Expense = {
  id: string;
  description: string;
  amount: number;
  timestamp: string;
};

/**
 * @typedef {object} Customer
 * @property {string} name - The name of the customer.
 * @property {string} phone - The phone number of the customer.
 */
export type Customer = {
  name: string;
  phone: string;
};

/**
 * @typedef {object} User
 * @property {string} id - The unique identifier for the user.
 * @property {string} name - The name of the user.
 * @property {string} pin - The user's PIN for login.
 * @property {string} roleId - The ID of the role assigned to the user.
 */
export type User = {
  id: string;
  name: string;
  pin: string;
  roleId: string;
};

/**
 * @typedef {object} Role
 * @property {string} id - The unique identifier for the role.
 * @property {string} name - The name of the role (e.g., 'Administrador').
 * @property {string[]} permissions - A list of permissions granted to this role.
 */
export type Role = {
  id: string;
  name: string;
  permissions: string[];
};

/**
 * @typedef {object} Shift
 * @property {string} id - The unique identifier for the shift.
 * @property {string} userId - The ID of the user who worked the shift.
 * @property {string} userName - The name of the user who worked the shift.
 * @property {string} startTime - The ISO 8601 timestamp when the shift started.
 * @property {string} [endTime] - The optional ISO 8601 timestamp when the shift ended.
 * @property {Order[]} orders - A list of orders processed during the shift.
 * @property {number} totalSales - The total sales amount generated during the shift.
 */
export type Shift = {
  id: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime?: string;
  orders: Order[];
  totalSales: number;
};

/**
 * @typedef {object} CurrentUser
 * @description Represents the currently authenticated user, combining their basic user data with their role and permissions.
 * @property {Role} role - The role object associated with the user.
 */
export type CurrentUser = User & {
    role: Role;
};
