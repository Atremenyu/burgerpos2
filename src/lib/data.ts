import type { Product, Ingredient, Order } from '@/types';

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

export const initialOrders: Order[] = [];
