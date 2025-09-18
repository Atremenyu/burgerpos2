import type { Product, Ingredient, Category, User, Role, OrderType, PaymentMethod, DeliveryPlatform } from '@/types';

/**
 * @name categories
 * @description Mock data for product categories.
 * @type {Category[]}
 */
export const categories: Category[] = [
  { id: 'cat1', name: 'Hamburguesas' },
  { id: 'cat2', name: 'Acompañamientos' },
  { id: 'cat3', name: 'Bebidas' },
];

/**
 * @name ingredients
 * @description Mock data for raw ingredients.
 * @type {Ingredient[]}
 */
export const ingredients: Ingredient[] = [
  { id: 'ing1', name: 'Carne de Hamburguesa', stock: 100, unit: 'pcs' },
  { id: 'ing2', name: 'Pan de Hamburguesa', stock: 150, unit: 'pcs' },
  { id: 'ing3', name: 'Loncha de Queso', stock: 200, unit: 'pcs' },
  { id: 'ing4', name: 'Lechuga', stock: 1000, unit: 'g' },
  { id: 'ing5', name: 'Rodaja de Tomate', stock: 500, unit: 'pcs' },
  { id: 'ing6', name: 'Patatas', stock: 5000, unit: 'g' },
  { id: 'ing7', name: 'Sirope de Refresco', stock: 10000, unit: 'ml' },
  { id: 'ing8', name: 'Salsa Especial', stock: 2000, unit: 'ml' },
];

/**
 * @name products
 * @description Mock data for menu products.
 * @type {Product[]}
 */
export const products: Product[] = [
  {
    id: 'prod1',
    name: 'Hamburguesa Clásica',
    price: 8.99,
    comboPrice: 11.99,
    category: 'Hamburguesas',
    image: 'https://placehold.co/300x300.png',
    stock: 50,
    ingredients: [
      { ingredientId: 'ing1', quantity: 1 },
      { ingredientId: 'ing2', quantity: 1 },
      { ingredientId: 'ing3', quantity: 1 },
      { ingredientId: 'ing4', quantity: 20 },
      { ingredientId: 'ing5', quantity: 2 },
    ],
  },
  {
    id: 'prod3',
    name: 'Patatas Fritas',
    price: 3.49,
    category: 'Acompañamientos',
    image: 'https://placehold.co/300x300.png',
    stock: 100,
    ingredients: [{ ingredientId: 'ing6', quantity: 150 }],
  },
  {
    id: 'prod4',
    name: 'Cola',
    price: 1.99,
    category: 'Bebidas',
    image: 'https://placehold.co/300x300.png',
    stock: 200,
    ingredients: [{ ingredientId: 'ing7', quantity: 300 }],
  },
];

/**
 * @name roles
 * @description Mock data for user roles and permissions.
 * @type {Role[]}
 */
export const roles: Role[] = [
    { id: 'role1', name: 'Administrador', permissions: ['caja', 'kitchen', 'inventory', 'reports', 'admin'] },
    { id: 'role2', name: 'Cajero', permissions: ['caja'] },
    { id: 'role3', name: 'Cocinero', permissions: ['kitchen'] },
];

/**
 * @name users
 * @description Mock data for users.
 * @type {User[]}
 */
export const users: User[] = [
  { id: 'user1', name: 'Admin', pin: '1234', roleId: 'role1' },
];

/**
 * @name orderTypes
 * @description Mock data for different types of orders.
 * @type {OrderType[]}
 */
export const orderTypes: OrderType[] = [
    { id: 'ot1', name: 'Comedor' },
    { id: 'ot2', name: 'Para Llevar' },
];

/**
 * @name paymentMethods
 * @description Mock data for accepted payment methods.
 * @type {PaymentMethod[]}
 */
export const paymentMethods: PaymentMethod[] = [
    { id: 'pm1', name: 'Tarjeta', isPlatformPayment: false },
    { id: 'pm2', name: 'Efectivo', isPlatformPayment: false },
    { id: 'pm3', name: 'Transferencia', isPlatformPayment: false },
    { id: 'pm4', name: 'Pago de Plataforma', isPlatformPayment: true },
];

/**
 * @name deliveryPlatforms
 * @description Mock data for delivery platforms.
 * @type {DeliveryPlatform[]}
 */
export const deliveryPlatforms: DeliveryPlatform[] = [
    { id: 'dp1', name: 'Uber', requiresPlatformPayment: true },
    { id: 'dp2', name: 'Didi', requiresPlatformPayment: true },
    { id: 'dp3', name: 'Whatsapp', requiresPlatformPayment: false },
    { id: 'dp4', name: 'Teléfono', requiresPlatformPayment: false },
];
