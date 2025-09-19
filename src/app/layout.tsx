import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/ThemeProvider';
import { AppProvider } from '@/context/AppContext';
import {
  getCategories, getProducts, getIngredients, getUsers, getRoles,
  getOrderTypes, getPaymentMethods, getDeliveryPlatforms
} from "@/lib/database";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'OrderFlow',
  description: 'Un sistema POS para hamburguesería',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [
    categories, products, ingredients, users, roles,
    orderTypes, paymentMethods, deliveryPlatforms
  ] = await Promise.all([
    getCategories(),
    getProducts(),
    getIngredients(),
    getUsers(),
    getRoles(),
    getOrderTypes(),
    getPaymentMethods(),
    getDeliveryPlatforms()
  ]);

  const initialData = {
    categories, products, ingredients, users, roles,
    orderTypes, paymentMethods, deliveryPlatforms
  };

  return (
    <html lang="es" suppressHydrationWarning>
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      </head>
      <body className={`${inter.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider initialData={initialData}>
            {children}
            <Toaster />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
