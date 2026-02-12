// CHRONOS INFINITY - Auth Layout
// Nested layout for authentication pages
// Note: <html>/<body> are in the root layout. ClerkProvider wraps in root layout.

import type { ReactNode } from 'react';

export const metadata = {
  title: 'CHRONOS INFINITY - Autenticación',
  description: 'Inicio de sesión y registro seguro',
};

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen">
      {children}
    </main>
  );
}
