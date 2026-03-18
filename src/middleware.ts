import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // En una arquitectura Client-side con IndexedDB, el middleware de Next.js
  // tiene limitaciones para acceder a localStorage o IndexedDB directamente.
  // La protección de rutas se manejará principalmente en los componentes de las páginas
  // mediante redirecciones del lado del cliente.
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
