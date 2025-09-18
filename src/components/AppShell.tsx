
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  ShoppingCart,
  ChefHat,
  Boxes,
  BarChart2,
  Moon,
  Sun,
  LogOut,
  UserCircle,
  Lock,
} from "lucide-react";
import { useTheme } from "next-themes";
import * as React from 'react';
import { useAppContext } from "@/context/AppContext";

/**
 * @constant allNavLinks
 * @description An array of all possible navigation links in the application, including their paths, labels, icons, and required permissions.
 */
const allNavLinks = [
  { href: "/", label: "Caja", icon: ShoppingCart, permission: 'caja' },
  { href: "/kitchen", label: "Cocina", icon: ChefHat, permission: 'kitchen' },
  { href: "/inventory", label: "Inventario", icon: Boxes, permission: 'inventory' },
  { href: "/reports", label: "Informes", icon: BarChart2, permission: 'reports' },
  { href: "/admin", label: "Admin", icon: Lock, permission: 'admin' },
];

/**
 * @component AppShell
 * @description The main layout shell for the application. It includes the header, navigation (desktop and mobile), and the main content area.
 * @param {object} props - Props for the component.
 * @param {React.ReactNode} props.children - The page content to be rendered within the shell.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { currentUser, logout } = useAppContext();

  const navLinks = React.useMemo(() => {
    if (!currentUser) return [];
    return allNavLinks.filter(link => currentUser.role.permissions.includes(link.permission));
  }, [currentUser]);

  const NavContent = () => (
    <nav className="flex flex-col md:flex-row items-center gap-4 text-sm font-medium">
      {navLinks.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
            pathname === href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
          <span className="md:inline">{label}</span>
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 22c5.523 0 10-4.477 10-10H2c0 5.523 4.477 10 10 10Z"/><path d="M16 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M12 2v2"/><path d="M12 12a6 6 0 0 0-6 6"/><path d="M18 12a6 6 0 0 1-6 6"/></svg>
            <span className="font-bold text-lg">OrderFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
             {currentUser && <NavContent />}
             <div className="flex items-center gap-4">
              {currentUser && (
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <UserCircle className="h-5 w-5 text-primary"/>
                  <span>{currentUser.name} ({currentUser.role.name})</span>
                  <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8">
                    <LogOut className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Cambiar tema</span>
              </Button>
            </div>
          </div>
          <div className="md:hidden">
             {currentUser && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Toggle navigation</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <div className="flex flex-col gap-4 p-4">
                      <NavContent />
                       {currentUser && (
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-2 font-medium">
                            <UserCircle className="h-5 w-5 text-primary"/>
                            <span>{currentUser.name}</span>
                          </div>
                          <Button variant="ghost" onClick={logout}>
                            Cerrar Sesión <LogOut className="ml-2 h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                       <div className="pt-4 border-t">
                         <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        >
                          {theme === 'dark' ? <Sun className="mr-2 h-5 w-5"/> : <Moon className="mr-2 h-5 w-5" />}
                          Cambiar Tema
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
             )}
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
        {children}
      </main>
    </div>
  );
}
